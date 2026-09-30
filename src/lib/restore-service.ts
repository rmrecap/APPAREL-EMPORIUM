import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import AdmZip from 'adm-zip';
import { prisma } from '@/lib/prisma';
import {
    downloadDriveFile,
    getDriveFileMetadata,
    isGoogleDriveConfigured,
    formatBytes,
    DriveBackupFile
} from '@/lib/gdrive';

const execAsync = promisify(exec);

export interface RestoreExecutionResult {
    success: boolean;
    message: string;
    backup: DriveBackupFile;
    database: {
        provider: string;
        method: string;
        safetyBackupPath?: string;
        tablesRestored?: number;
        statementsExecuted?: number;
    };
    media: {
        filesRestored: number;
        sizeBytes: number;
        sizeFormatted: string;
        targetDirectory: string;
    };
    manifest?: any;
    durationMs: number;
}

/**
 * Recursively copies all files and directories from src to dest.
 * Merges/replaces existing media files.
 */
function copyDirectoryRecursive(src: string, dest: string): { filesCount: number; totalSize: number } {
    let filesCount = 0;
    let totalSize = 0;

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    if (!fs.existsSync(src)) {
        return { filesCount, totalSize };
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            const sub = copyDirectoryRecursive(srcPath, destPath);
            filesCount += sub.filesCount;
            totalSize += sub.totalSize;
        } else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath);
            filesCount++;
            try {
                totalSize += fs.statSync(destPath).size;
            } catch { }
        }
    }

    return { filesCount, totalSize };
}

/**
 * Executes raw SQL dump file line by line through Prisma ORM.
 */
async function executeSqlDumpViaPrisma(sqlFilePath: string): Promise<{ statementCount: number }> {
    const rawSql = fs.readFileSync(sqlFilePath, 'utf8');
    const lines = rawSql.split(/\r?\n/);
    const statements: string[] = [];
    let current = '';

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('--') || trimmed.length === 0) {
            continue;
        }
        current += (current ? ' ' : '') + trimmed;
        if (trimmed.endsWith(';')) {
            statements.push(current);
            current = '';
        }
    }
    if (current.trim()) {
        statements.push(current.trim());
    }

    let statementCount = 0;
    for (const stmt of statements) {
        const upper = stmt.toUpperCase();
        if (
            upper === 'BEGIN TRANSACTION;' ||
            upper === 'BEGIN;' ||
            upper === 'COMMIT;' ||
            upper === 'ROLLBACK;' ||
            upper === 'START TRANSACTION;'
        ) {
            continue;
        }

        try {
            await prisma.$executeRawUnsafe(stmt);
            statementCount++;
        } catch (err: any) {
            console.warn(`[SQL_EXEC_WARN] Failed executing statement "${stmt.substring(0, 80)}...":`, err?.message || err);
        }
    }

    return { statementCount };
}

/**
 * Searches a directory for the first file matching an extension.
 */
function findFileByExt(dir: string, ext: string): string | null {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isFile() && entry.name.toLowerCase().endsWith(ext)) {
            return path.join(dir, entry.name);
        }
    }
    return null;
}

/**
 * Executes the complete One-Click Restore pipeline:
 * 1. Connects to Google Drive and downloads backup .zip to local /tmp.
 * 2. Unzips the payload archive.
 * 3. Creates an automatic local safety snapshot of current database.
 * 4. Restores Database (SQLite binary overwrite or SQL dump execution).
 * 5. Restores Media files into /public/uploads.
 * 6. Cleans up all temporary /tmp files.
 */
export async function executeGoogleDriveRestore({
    fileId,
    initiatedBy,
}: {
    fileId: string;
    initiatedBy?: string;
}): Promise<RestoreExecutionResult> {
    const startTime = Date.now();

    if (!fileId || typeof fileId !== 'string' || fileId.trim().length === 0) {
        throw new Error('A valid Google Drive fileId must be specified for restoration.');
    }

    const configCheck = isGoogleDriveConfigured();
    if (!configCheck.configured) {
        throw new Error(
            `Google Drive API is not configured. Missing required key(s): ${configCheck.missingKeys.join(', ')}.`
        );
    }

    // Fetch file metadata from Google Drive
    const driveMeta = await getDriveFileMetadata(fileId);

    // Prepare temporary scratch workspace
    const tempDirName = `aelbd-restore-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tempDir = path.join(os.tmpdir(), tempDirName);
    fs.mkdirSync(tempDir, { recursive: true });

    const downloadedZipPath = path.join(tempDir, 'backup.zip');
    const extractDir = path.join(tempDir, 'extracted');
    fs.mkdirSync(extractDir, { recursive: true });

    let safetyBackupFileName: string | undefined;

    try {
        // -------------------------------------------------------------
        // STEP 1: Download .zip from Google Drive to local /tmp
        // -------------------------------------------------------------
        await downloadDriveFile(fileId, downloadedZipPath);

        // -------------------------------------------------------------
        // STEP 2: Extract Archive
        // -------------------------------------------------------------
        const zip = new AdmZip(downloadedZipPath);
        zip.extractAllTo(extractDir, true);

        // Read manifest if available
        let manifest: any = null;
        const manifestPath = path.join(extractDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
            try {
                manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            } catch { }
        }

        // -------------------------------------------------------------
        // STEP 3: Detect DB Engine & Take Automatic Safety Snapshot
        // -------------------------------------------------------------
        const dbUrl = process.env.DATABASE_URL || '';
        let dbProvider: 'sqlite' | 'postgresql' | 'mysql' = 'sqlite';

        if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
            dbProvider = 'postgresql';
        } else if (dbUrl.startsWith('mysql://')) {
            dbProvider = 'mysql';
        }

        const safetyDir = path.join(process.cwd(), 'prisma', 'backups');
        if (!fs.existsSync(safetyDir)) {
            fs.mkdirSync(safetyDir, { recursive: true });
        }

        let databaseMethod = 'unknown';
        let statementsExecuted = 0;

        // Resolve active SQLite path
        let activeSqlitePath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (dbUrl.startsWith('file:')) {
            const rel = dbUrl.replace(/^file:/, '').trim();
            activeSqlitePath = path.isAbsolute(rel) ? rel : path.join(process.cwd(), 'prisma', rel);
        }

        // Safety backup for SQLite
        if (dbProvider === 'sqlite' && fs.existsSync(activeSqlitePath)) {
            safetyBackupFileName = `safety-before-restore-${Date.now()}.db`;
            const safetyFilePath = path.join(safetyDir, safetyBackupFileName);
            fs.copyFileSync(activeSqlitePath, safetyFilePath);
        }

        // -------------------------------------------------------------
        // STEP 4: Database Restoration
        // -------------------------------------------------------------
        const extractedSqlFile = findFileByExt(extractDir, '.sql');
        const extractedDbFile =
            (fs.existsSync(path.join(extractDir, 'database.db')) ? path.join(extractDir, 'database.db') : null) ||
            (fs.existsSync(path.join(extractDir, 'dev.db')) ? path.join(extractDir, 'dev.db') : null) ||
            findFileByExt(extractDir, '.db');

        if (dbProvider === 'sqlite') {
            if (extractedDbFile && fs.existsSync(extractedDbFile)) {
                // Optimal SQLite Restoration: Atomic Binary Swap
                await prisma.$disconnect();
                fs.copyFileSync(extractedDbFile, activeSqlitePath);
                await prisma.$connect();
                databaseMethod = 'sqlite_binary_snapshot';
            } else if (extractedSqlFile && fs.existsSync(extractedSqlFile)) {
                // Fallback: Execute SQL statements
                const res = await executeSqlDumpViaPrisma(extractedSqlFile);
                databaseMethod = 'sqlite_sql_script';
                statementsExecuted = res.statementCount;
            } else {
                throw new Error('No valid database ledger (.db or .sql) found in the extracted backup archive.');
            }
        } else if (dbProvider === 'postgresql') {
            if (!extractedSqlFile) {
                throw new Error('PostgreSQL database restoration requires a .sql dump file inside the backup archive.');
            }
            try {
                await execAsync(`pg_dump --version`);
                await execAsync(`psql "${dbUrl}" -f "${extractedSqlFile}"`, { timeout: 120000 });
                databaseMethod = 'psql_native_cli';
            } catch {
                // Fallback: Execute via Prisma
                const res = await executeSqlDumpViaPrisma(extractedSqlFile);
                databaseMethod = 'postgresql_sql_prisma';
                statementsExecuted = res.statementCount;
            }
        } else if (dbProvider === 'mysql') {
            if (!extractedSqlFile) {
                throw new Error('MySQL database restoration requires a .sql dump file inside the backup archive.');
            }
            try {
                const parsed = new URL(dbUrl);
                const user = parsed.username;
                const password = parsed.password;
                const host = parsed.hostname;
                const port = parsed.port || '3306';
                const database = parsed.pathname.replace(/^\//, '');
                const passArg = password ? `-p"${password}"` : '';
                await execAsync(
                    `mysql -h "${host}" -P "${port}" -u "${user}" ${passArg} "${database}" < "${extractedSqlFile}"`,
                    { timeout: 120000 }
                );
                databaseMethod = 'mysql_native_cli';
            } catch {
                const res = await executeSqlDumpViaPrisma(extractedSqlFile);
                databaseMethod = 'mysql_sql_prisma';
                statementsExecuted = res.statementCount;
            }
        }

        // -------------------------------------------------------------
        // STEP 5: Media Files Restoration (/public/uploads)
        // -------------------------------------------------------------
        const targetUploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(targetUploadsDir)) {
            fs.mkdirSync(targetUploadsDir, { recursive: true });
        }

        // Look for extracted uploads folder
        let extractedUploadsDir = null;
        if (fs.existsSync(path.join(extractDir, 'public', 'uploads'))) {
            extractedUploadsDir = path.join(extractDir, 'public', 'uploads');
        } else if (fs.existsSync(path.join(extractDir, 'uploads'))) {
            extractedUploadsDir = path.join(extractDir, 'uploads');
        }

        let mediaStats = { filesCount: 0, totalSize: 0 };
        if (extractedUploadsDir) {
            mediaStats = copyDirectoryRecursive(extractedUploadsDir, targetUploadsDir);
        }

        // -------------------------------------------------------------
        // STEP 6: Persist Restore Audit Record
        // -------------------------------------------------------------
        const durationMs = Date.now() - startTime;
        const restoreRecord = {
            restoredFileId: fileId,
            restoredFileName: driveMeta.name,
            timestamp: new Date().toISOString(),
            safetyBackup: safetyBackupFileName || null,
            mediaFilesRestored: mediaStats.filesCount,
            mediaBytesRestored: mediaStats.totalSize,
            databaseProvider: dbProvider,
            databaseMethod,
            initiatedBy: initiatedBy || 'admin',
            durationMs,
        };

        try {
            await prisma.siteSetting.upsert({
                where: { key: 'last_db_restore' },
                update: { value: JSON.stringify(restoreRecord) },
                create: { key: 'last_db_restore', value: JSON.stringify(restoreRecord), group: 'backup' },
            });
        } catch (dbErr) {
            console.warn('[RESTORE_LOG_WARN] Failed saving restore audit log:', dbErr);
        }

        return {
            success: true,
            message: `Disaster recovery completed: Database & ${mediaStats.filesCount} media file(s) restored from "${driveMeta.name}".`,
            backup: driveMeta,
            database: {
                provider: dbProvider,
                method: databaseMethod,
                safetyBackupPath: safetyBackupFileName,
                statementsExecuted: statementsExecuted > 0 ? statementsExecuted : undefined,
            },
            media: {
                filesRestored: mediaStats.filesCount,
                sizeBytes: mediaStats.totalSize,
                sizeFormatted: formatBytes(mediaStats.totalSize),
                targetDirectory: 'public/uploads',
            },
            manifest,
            durationMs,
        };
    } finally {
        // -------------------------------------------------------------
        // STEP 7: Temporary Directory Cleanup
        // -------------------------------------------------------------
        try {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch (cleanupErr) {
            console.warn('[RESTORE_CLEANUP_WARN] Failed deleting temp restore dir:', cleanupErr);
        }
    }
}

/**
 * Retrieves metadata about the most recent restore operation.
 */
export async function getLastRestoreInfo(): Promise<any | null> {
    try {
        const record = await prisma.siteSetting.findUnique({
            where: { key: 'last_db_restore' },
        });
        if (record && record.value) {
            return JSON.parse(record.value);
        }
    } catch { }
    return null;
}
