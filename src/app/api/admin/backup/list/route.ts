import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { listDriveBackups, isGoogleDriveConfigured } from '@/lib/gdrive';
import { getLastBackupInfo } from '@/lib/backup-service';
import { getLastRestoreInfo } from '@/lib/restore-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/backup/list
 * Returns list of all available .zip backups from Google Drive.
 * Includes file name, file ID, creation timestamp, and file size.
 */
export async function GET(req: NextRequest) {
    const auth = await requireAuth();
    if (!auth.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(auth.user.role)) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized: Administrative privileges required.' },
            { status: 403 }
        );
    }

    try {
        const config = isGoogleDriveConfigured();
        if (!config.configured) {
            return NextResponse.json({
                success: true,
                configured: false,
                missingKeys: config.missingKeys,
                message: 'Google Drive is not configured.',
                backups: [],
                totalBackups: 0,
            });
        }

        const driveResult = await listDriveBackups();
        const lastBackupLocal = await getLastBackupInfo();
        const lastRestoreLocal = await getLastRestoreInfo();

        return NextResponse.json({
            success: true,
            configured: true,
            folderId: driveResult.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || null,
            totalBackups: driveResult.totalBackups,
            backups: driveResult.backups,
            lastBackup: lastBackupLocal || (driveResult.backups.length > 0 ? driveResult.backups[0] : null),
            lastRestore: lastRestoreLocal,
        });
    } catch (error: any) {
        console.error('[BACKUP_LIST_ERROR]', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to retrieve backups from Google Drive.',
            },
            { status: 500 }
        );
    }
}
