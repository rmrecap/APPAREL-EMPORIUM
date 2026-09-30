import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import { prisma } from '@/lib/prisma';
import { generateDatabaseDump } from '@/lib/db-dump';
import {
    isGoogleDriveConfigured,
    uploadBackupToDrive,
    cleanOldBackupsFromDrive,
    getLatestBackupStatus
} from '@/lib/gdrive';

export interface BackupExecutionResult {
    success: boolean;
    backupFile: {
        id: string;
        name: string;
        sizeBytes: number;
        sizeFormatted: string;
        webViewLink: string | null;
        createdTime: string;
    };
    cleanup: {
        deletedCount: number;
        deletedFiles: Array<{ id: string; name: string; modifiedTime?: string }>;
        cutoffDate: string;
    };
    database: {
        provider: string;
        dumpMethod: string;
        dumpSizeBytes: number;
        recordCounts: Record<string, number>;
    };
    manifest: {
        timestamp: string;
        uploadsFileCount: number;
        uploadsSizeBytes: number;
    };
    durationMs: number;
}

function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFolderStats(dirPath: string): { count: number; size: number } {
    let count = 0;
    let size = 0;

    function traverse(currentDir: string) {
        if (!fs.existsSync(currentDir)) return;
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                traverse(fullPath);
            } else if (entry.isFile()) {
                count++;
                try {
                    size += fs.statSync(fullPath).size;
                } catch { }
            }
        }
    }

    traverse(dirPath);
    return { count, size };
}

/**
 * Executes a full backup pipeline and transfers it directly to Google Drive.
 * 1. Exports database dump (PostgreSQL, MySQL, or SQLite / Prisma exporter).
 * 2. Compresses /public/uploads + DB dump + manifest into a single .zip file.
 * 3. Streams upload to target Google Drive folder.
 * 4. Runs 7-day auto-cleanup to delete older backups from Google Drive.
 * 5. Cleans up all local temporary files (/tmp) to preserve disk space.
 */
export async function executeGoogleDriveBackup(): Promise<BackupExecutionResult> {
    const startTime = Date.now();

    // Verify Google Drive configuration first
    const configCheck = isGoogleDriveConfigured();
    if (!configCheck.configured) {
        throw new Error(
            `Google Drive API is not configured. Missing required environment variable(s): ${configCheck.missingKeys.join(', ')}. ` +
            `Please configure them in your .env.local file.`
        );
    }

    // Prepare temporary isolated directory in OS tmpdir
    const tempDirName = `aelbd-backup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tempDir = path.join(os.tmpdir(), tempDirName);
    fs.mkdirSync(tempDir, { recursive: true });

    let zipFilePath = '';

    try {
        // -------------------------------------------------------------
        // STEP 1: Generate Database Dump (SQL + SQLite ledger if exists)
        // -------------------------------------------------------------
        const dumpResult = await generateDatabaseDump(tempDir);

        // -------------------------------------------------------------
        // STEP 2: Compress Database Dump + Uploads into a .zip file
        // -------------------------------------------------------------
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        const zipFileName = `aelbd_backup_${dateStr}.zip`;
        zipFilePath = path.join(tempDir, zipFileName);

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const uploadStats = getFolderStats(uploadsDir);

        // Manifest file for backup transparency
        const manifestData = {
            site: 'Apparel Emporium (aelbd.net)',
            backupTimestamp: new Date().toISOString(),
            database: {
                provider: dumpResult.dbProvider,
                dumpMethod: dumpResult.dumpMethod,
                sqlFile: dumpResult.sqlFileName,
                sizeBytes: dumpResult.sizeBytes,
                recordCounts: dumpResult.recordCounts,
            },
            uploads: {
                directory: 'public/uploads',
                fileCount: uploadStats.count,
                totalSizeBytes: uploadStats.size,
            },
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
            }
        };

        const manifestPath = path.join(tempDir, 'manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');

        // Create Zip Archive using archiver
        await new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', {
                zlib: { level: 6 } // optimal balance between speed and compression
            });

            output.on('close', () => resolve());
            archive.on('error', (err: any) => reject(err));

            archive.pipe(output);

            // 1. Add SQL Dump
            archive.file(dumpResult.sqlFilePath, { name: dumpResult.sqlFileName });

            // 2. Add raw SQLite .db file if it exists
            if (dumpResult.sqliteDbFilePath && fs.existsSync(dumpResult.sqliteDbFilePath)) {
                archive.file(dumpResult.sqliteDbFilePath, { name: 'database.db' });
            }

            // 3. Add Manifest
            archive.file(manifestPath, { name: 'manifest.json' });

            // 4. Add /public/uploads directory
            if (fs.existsSync(uploadsDir)) {
                archive.directory(uploadsDir, 'public/uploads');
            }

            archive.finalize();
        });

        const zipStat = fs.statSync(zipFilePath);

        // -------------------------------------------------------------
        // STEP 3: Stream Upload to Google Drive
        // -------------------------------------------------------------
        const uploadedDriveFile = await uploadBackupToDrive({
            filePath: zipFilePath,
            fileName: zipFileName,
            mimeType: 'application/zip',
            folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
        });

        // -------------------------------------------------------------
        // STEP 4: Auto-Cleanup Old Backups (>7 days) on Google Drive
        // -------------------------------------------------------------
        const cleanupResult = await cleanOldBackupsFromDrive(
            process.env.GOOGLE_DRIVE_FOLDER_ID,
            7 // 7-day retention rule
        );

        // -------------------------------------------------------------
        // STEP 5: Persist Last Backup Metadata in Database
        // -------------------------------------------------------------
        const backupRecord = {
            id: uploadedDriveFile.id,
            fileName: uploadedDriveFile.name,
            sizeBytes: zipStat.size,
            sizeFormatted: formatBytes(zipStat.size),
            webViewLink: uploadedDriveFile.webViewLink,
            timestamp: new Date().toISOString(),
            dbDumpMethod: dumpResult.dumpMethod,
            cleanupCount: cleanupResult.deletedCount,
        };

        try {
            await prisma.siteSetting.upsert({
                where: { key: 'last_gdrive_backup' },
                update: {
                    value: JSON.stringify(backupRecord),
                },
                create: {
                    key: 'last_gdrive_backup',
                    value: JSON.stringify(backupRecord),
                    group: 'backup',
                },
            });
        } catch (dbErr) {
            console.warn('[BACKUP_DB_LOG] Could not save backup setting to DB:', dbErr);
        }

        const durationMs = Date.now() - startTime;

        return {
            success: true,
            backupFile: {
                id: uploadedDriveFile.id,
                name: uploadedDriveFile.name,
                sizeBytes: zipStat.size,
                sizeFormatted: formatBytes(zipStat.size),
                webViewLink: uploadedDriveFile.webViewLink,
                createdTime: uploadedDriveFile.createdTime || new Date().toISOString(),
            },
            cleanup: cleanupResult,
            database: {
                provider: dumpResult.dbProvider,
                dumpMethod: dumpResult.dumpMethod,
                dumpSizeBytes: dumpResult.sizeBytes,
                recordCounts: dumpResult.recordCounts,
            },
            manifest: {
                timestamp: manifestData.backupTimestamp,
                uploadsFileCount: uploadStats.count,
                uploadsSizeBytes: uploadStats.size,
            },
            durationMs,
        };
    } finally {
        // -------------------------------------------------------------
        // STEP 6: Temporary File Cleanup on Server Disk
        // -------------------------------------------------------------
        try {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch (cleanupErr) {
            console.error('[TEMP_CLEANUP_ERROR] Failed cleaning temporary backup folder:', cleanupErr);
        }
    }
}

/**
 * Retrieves the stored metadata of the last successful backup.
 */
export async function getLastBackupInfo(): Promise<any | null> {
    try {
        const record = await prisma.siteSetting.findUnique({
            where: { key: 'last_gdrive_backup' },
        });

        if (record && record.value) {
            return JSON.parse(record.value);
        }
    } catch { }

    return null;
}
