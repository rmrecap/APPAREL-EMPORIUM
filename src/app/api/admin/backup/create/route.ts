import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { isGoogleDriveConfigured, getLatestBackupStatus } from '@/lib/gdrive';
import { executeGoogleDriveBackup, getLastBackupInfo } from '@/lib/backup-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for large database and media payloads

/**
 * Validates request authorization:
 * Allows authenticated admin users (DEVELOPER, SUPER_ADMIN, ADMIN)
 * OR automated cron triggers with valid CRON_SECRET / API_SECRET_KEY.
 */
async function authorizeRequest(req: NextRequest): Promise<{ authorized: boolean; reason?: string; isCron?: boolean; userEmail?: string }> {
    // 1. Check Cron / Webhook Secret Authorization Header
    const authHeader = req.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET || process.env.API_SECRET_KEY || process.env.AEL_API_SECRET;

    if (cronSecret && authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token === cronSecret) {
            return { authorized: true, isCron: true };
        }
    }

    // 2. Check query secret fallback
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get('secret');
    if (cronSecret && querySecret && querySecret === cronSecret) {
        return { authorized: true, isCron: true };
    }

    // 3. Check Vercel Cron header (must also match CRON_SECRET if set)
    const isVercelCron = req.headers.get('x-vercel-cron');
    if (isVercelCron) {
        if (!process.env.CRON_SECRET || authHeader === `Bearer ${process.env.CRON_SECRET}`) {
            return { authorized: true, isCron: true };
        }
    }

    // 4. Check NextAuth Admin Session
    const auth = await requireAuth();
    if (auth.ok) {
        const role = auth.user.role;
        if (['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(role)) {
            return { authorized: true, isCron: false, userEmail: auth.user.email };
        }
        return { authorized: false, reason: 'Forbidden: Insufficient administrative privileges.' };
    }

    return { authorized: false, reason: 'Unauthorized: Authentication required.' };
}

/**
 * GET /api/admin/backup/create
 * Returns current backup status and details of the last backup.
 */
export async function GET(req: NextRequest) {
    const auth = await authorizeRequest(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.reason }, { status: 401 });
    }

    try {
        const config = isGoogleDriveConfigured();
        const lastBackupLocal = await getLastBackupInfo();

        let driveStats = null;
        if (config.configured) {
            try {
                driveStats = await getLatestBackupStatus();
            } catch (err: any) {
                console.warn('[GDRIVE_STATUS_WARN] Could not retrieve drive live status:', err?.message || err);
            }
        }

        return NextResponse.json({
            success: true,
            status: {
                isConfigured: config.configured,
                authMode: config.mode || null,
                missingKeys: config.missingKeys,
                folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || null,
                lastBackup: lastBackupLocal || driveStats?.latestBackup || null,
                liveDrive: driveStats
                    ? {
                          totalBackups: driveStats.totalBackups,
                          latestFile: driveStats.latestBackup,
                      }
                    : null,
            },
        });
    } catch (error: any) {
        console.error('[BACKUP_CREATE_STATUS_ERROR]', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to check backup status.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/backup/create
 * Generates a full system backup and streams it to Google Drive:
 * 1. Takes PostgreSQL/MySQL/SQLite database dump using Prisma/DB CLI into a .sql file.
 * 2. Compresses /public/uploads (media files) and the .sql file into a timestamped .zip.
 * 3. Uploads the .zip archive to designated Google Drive folder.
 * 4. Auto-Cleanup: Deletes backups older than 7 days from Google Drive.
 * 5. Cleans up temporary local /tmp files immediately after upload.
 */
export async function POST(req: NextRequest) {
    const auth = await authorizeRequest(req);
    if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.reason }, { status: 401 });
    }

    try {
        const result = await executeGoogleDriveBackup();

        return NextResponse.json({
            success: true,
            message: 'Backup successfully generated and uploaded to Google Drive.',
            triggeredBy: auth.isCron ? 'cron' : auth.userEmail || 'manual_admin',
            backup: result.backupFile,
            cleanup: result.cleanup,
            database: result.database,
            manifest: result.manifest,
            durationMs: result.durationMs,
        });
    } catch (error: any) {
        console.error('[BACKUP_CREATE_ERROR]', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'An unexpected error occurred during Google Drive backup.',
            },
            { status: 500 }
        );
    }
}
