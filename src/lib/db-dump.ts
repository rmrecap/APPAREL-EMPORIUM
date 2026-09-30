import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

export interface DatabaseDumpResult {
    sqlFilePath: string;
    sqlFileName: string;
    sizeBytes: number;
    dbProvider: 'sqlite' | 'postgresql' | 'mysql' | 'unknown';
    sqliteDbFilePath?: string;
    dumpMethod: 'pg_dump' | 'mysqldump' | 'prisma_exporter';
    recordCounts: Record<string, number>;
}

/**
 * Formats a value safely for standard SQL INSERT statements.
 */
function formatSqlValue(val: any): string {
    if (val === null || val === undefined) {
        return 'NULL';
    }
    if (typeof val === 'boolean') {
        return val ? '1' : '0';
    }
    if (typeof val === 'number') {
        return Number.isFinite(val) ? String(val) : 'NULL';
    }
    if (val instanceof Date) {
        return `'${val.toISOString()}'`;
    }
    if (typeof val === 'object') {
        return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    }
    // String
    const str = String(val);
    return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Exports all database records into standard SQL INSERT statements using Prisma ORM.
 * Fully database-agnostic (works on SQLite, PostgreSQL, and MySQL).
 */
export async function exportDatabaseUsingPrisma(outputPath: string): Promise<{
    sizeBytes: number;
    recordCounts: Record<string, number>;
}> {
    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

    const write = async (chunk: string) => {
        if (!writeStream.write(chunk)) {
            await new Promise<void>((resolve) => writeStream.once('drain', () => resolve()));
        }
    };

    const timestamp = new Date().toISOString();
    await write(`-- ====================================================================\n`);
    await write(`-- Apparel Emporium (aelbd.net) Automated SQL Database Dump\n`);
    await write(`-- Generated at: ${timestamp}\n`);
    await write(`-- Engine: Prisma ORM Universal Database Exporter\n`);
    await write(`-- ====================================================================\n\n`);
    await write(`BEGIN TRANSACTION;\n\n`);

    const recordCounts: Record<string, number> = {};

    // Ordered sequence to respect foreign-key constraints
    const tables: Array<{ name: string; query: () => Promise<any[]> }> = [
        { name: 'User', query: () => prisma.user.findMany() },
        { name: 'Category', query: () => prisma.category.findMany() },
        { name: 'Product', query: () => prisma.product.findMany() },
        { name: 'BlogPost', query: () => prisma.blogPost.findMany() },
        { name: 'ContactInquiry', query: () => prisma.contactInquiry.findMany() },
        { name: 'SiteSetting', query: () => prisma.siteSetting.findMany() },
        { name: 'RFQ', query: () => prisma.rFQ.findMany() },
        { name: 'MenuItem', query: () => prisma.menuItem.findMany() },
        { name: 'MediaFile', query: () => prisma.mediaFile.findMany() },
        { name: 'ActivityLog', query: () => prisma.activityLog.findMany({ take: 5000, orderBy: { createdAt: 'desc' } }) },
        { name: 'Notification', query: () => prisma.notification.findMany() },
        { name: 'Redirect', query: () => prisma.redirect.findMany() },
        { name: 'PopupBanner', query: () => prisma.popupBanner.findMany() },
        { name: 'EmailLog', query: () => prisma.emailLog.findMany({ take: 2000, orderBy: { createdAt: 'desc' } }) },
        { name: 'CustomForm', query: () => prisma.customForm.findMany() },
        { name: 'FormSubmission', query: () => prisma.formSubmission.findMany() },
        { name: 'DeliveryUpdate', query: () => prisma.deliveryUpdate.findMany() },
        { name: 'TelegramVideo', query: () => prisma.telegramVideo.findMany() },
    ];

    // Clear existing records in reverse dependency order for safe restoration
    await write(`-- Clear existing records before inserting dump (in reverse foreign-key order)\n`);
    const reverseTables = [...tables].reverse();
    for (const t of reverseTables) {
        await write(`DELETE FROM "${t.name}";\n`);
    }
    await write(`\n`);

    for (const table of tables) {
        try {
            const rows = await table.query();
            recordCounts[table.name] = rows.length;

            if (rows.length === 0) {
                await write(`-- Table: ${table.name} (0 records)\n\n`);
                continue;
            }

            await write(`-- --------------------------------------------------\n`);
            await write(`-- Table: ${table.name} (${rows.length} records)\n`);
            await write(`-- --------------------------------------------------\n`);

            for (const row of rows) {
                const keys = Object.keys(row);
                const columns = keys.map((k) => `"${k}"`).join(', ');
                const values = keys.map((k) => formatSqlValue(row[k])).join(', ');
                await write(`INSERT INTO "${table.name}" (${columns}) VALUES (${values});\n`);
            }
            await write(`\n`);
        } catch (err: any) {
            console.error(`Error exporting table ${table.name}:`, err?.message || err);
            await write(`-- Error exporting table ${table.name}: ${err?.message || 'Unknown error'}\n\n`);
        }
    }

    await write(`COMMIT;\n`);
    await write(`-- End of Dump\n`);

    await new Promise((resolve) => writeStream.end(resolve));

    const stat = fs.statSync(outputPath);
    return {
        sizeBytes: stat.size,
        recordCounts,
    };
}

/**
 * Creates a comprehensive SQL dump of the application database.
 * Auto-detects whether the app is using PostgreSQL, MySQL, or SQLite.
 * Uses native CLI dumpers (pg_dump/mysqldump) when available, and smoothly
 * falls back to Prisma query exporter.
 */
export async function generateDatabaseDump(targetDirectory: string): Promise<DatabaseDumpResult> {
    if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory, { recursive: true });
    }

    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const sqlFileName = `backup_db_${dateStr}.sql`;
    const sqlFilePath = path.join(targetDirectory, sqlFileName);

    const dbUrl = process.env.DATABASE_URL || '';
    let dbProvider: 'sqlite' | 'postgresql' | 'mysql' | 'unknown' = 'sqlite';

    if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
        dbProvider = 'postgresql';
    } else if (dbUrl.startsWith('mysql://')) {
        dbProvider = 'mysql';
    } else if (dbUrl.startsWith('file:') || dbUrl.includes('.db')) {
        dbProvider = 'sqlite';
    }

    let dumpMethod: 'pg_dump' | 'mysqldump' | 'prisma_exporter' = 'prisma_exporter';
    let recordCounts: Record<string, number> = {};

    // 1. Try PostgreSQL native dump
    if (dbProvider === 'postgresql') {
        try {
            await execAsync(`pg_dump --version`);
            await execAsync(
                `pg_dump "${dbUrl}" --clean --if-exists --no-owner --no-privileges -f "${sqlFilePath}"`,
                { timeout: 60000 }
            );
            dumpMethod = 'pg_dump';
        } catch (pgErr) {
            console.warn('[DB_DUMP] pg_dump failed or not installed, falling back to Prisma exporter:', pgErr);
        }
    }

    // 2. Try MySQL native dump
    if (dbProvider === 'mysql') {
        try {
            await execAsync(`mysqldump --version`);
            // Attempt mysqldump if credentials parseable
            const parsed = new URL(dbUrl);
            const user = parsed.username;
            const password = parsed.password;
            const host = parsed.hostname;
            const port = parsed.port || '3306';
            const database = parsed.pathname.replace(/^\//, '');

            const passArg = password ? `-p"${password}"` : '';
            await execAsync(
                `mysqldump -h "${host}" -P "${port}" -u "${user}" ${passArg} "${database}" > "${sqlFilePath}"`,
                { timeout: 60000 }
            );
            dumpMethod = 'mysqldump';
        } catch (myErr) {
            console.warn('[DB_DUMP] mysqldump failed or not installed, falling back to Prisma exporter:', myErr);
        }
    }

    // 3. Fallback to Prisma universal exporter (or native SQLite export)
    if (dumpMethod === 'prisma_exporter') {
        const result = await exportDatabaseUsingPrisma(sqlFilePath);
        recordCounts = result.recordCounts;
    }

    // Check for local SQLite binary database file
    let sqliteDbFilePath: string | undefined;
    const standardSqlitePath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(standardSqlitePath)) {
        sqliteDbFilePath = standardSqlitePath;
    }

    const stat = fs.statSync(sqlFilePath);

    return {
        sqlFilePath,
        sqlFileName,
        sizeBytes: stat.size,
        dbProvider,
        sqliteDbFilePath,
        dumpMethod,
        recordCounts,
    };
}
