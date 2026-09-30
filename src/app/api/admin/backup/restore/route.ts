import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { executeGoogleDriveRestore, getLastRestoreInfo } from '@/lib/restore-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for restoration pipeline

/**
 * GET /api/admin/backup/restore
 * Returns details about the last restored backup snapshot.
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
        const lastRestore = await getLastRestoreInfo();
        return NextResponse.json({
            success: true,
            lastRestore,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch restore details.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/backup/restore
 * Executes One-Click Disaster Recovery Restore:
 * Body: { fileId: string }
 * 1. Downloads backup .zip from Google Drive to /tmp.
 * 2. Extracts .sql dump, database ledger, and /public/uploads.
 * 3. Creates an automatic safety backup of current active database.
 * 4. Executes database restoration (atomic overwrite or SQL execution).
 * 5. Restores media assets into /public/uploads.
 * 6. Deletes temporary files from /tmp.
 */
export async function POST(req: NextRequest) {
    const auth = await requireAuth();
    if (!auth.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(auth.user.role)) {
        return NextResponse.json(
            {
                success: false,
                error: 'Forbidden: Super Administrator or Developer privileges required to perform database restoration.',
            },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const { fileId } = body;

        if (!fileId || typeof fileId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Missing or invalid "fileId" parameter.' },
                { status: 400 }
            );
        }

        const result = await executeGoogleDriveRestore({
            fileId,
            initiatedBy: auth.user.email,
        });

        return NextResponse.json({
            success: true,
            message: result.message,
            backup: result.backup,
            database: result.database,
            media: result.media,
            manifest: result.manifest,
            durationMs: result.durationMs,
        });
    } catch (error: any) {
        console.error('[BACKUP_RESTORE_ERROR]', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'An unexpected error occurred during database restoration.',
            },
            { status: 500 }
        );
    }
}
