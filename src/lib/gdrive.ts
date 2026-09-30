import { google, drive_v3 } from 'googleapis';
import fs from 'fs';
import path from 'path';

export interface DriveBackupFile {
    id: string;
    name: string;
    size: number;
    sizeFormatted: string;
    createdTime: string;
    modifiedTime?: string;
    webViewLink?: string | null;
}

/**
 * Format raw byte size into human readable string (KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Checks if the necessary Google Drive environment variables are configured.
 */
export function isGoogleDriveConfigured(): {
    configured: boolean;
    mode?: 'oauth2' | 'service_account';
    missingKeys: string[];
} {
    const hasServiceAccountJson = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
    const hasServiceAccountFile = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_FILE);

    if (hasServiceAccountJson || hasServiceAccountFile) {
        return {
            configured: true,
            mode: 'service_account',
            missingKeys: [],
        };
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    const missingKeys: string[] = [];
    if (!clientId) missingKeys.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missingKeys.push('GOOGLE_CLIENT_SECRET');
    if (!refreshToken) missingKeys.push('GOOGLE_DRIVE_REFRESH_TOKEN');

    if (missingKeys.length === 0) {
        return {
            configured: true,
            mode: 'oauth2',
            missingKeys: [],
        };
    }

    return {
        configured: false,
        missingKeys,
    };
}

/**
 * Initializes and returns an authenticated Google Drive API client (v3).
 * Supports both OAuth2 (Refresh Token) and Service Account credentials.
 */
export function getGoogleDriveClient(): drive_v3.Drive {
    // 1. Check Service Account Key JSON / File
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
        let auth;
        if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
            auth = new google.auth.GoogleAuth({
                keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE,
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/drive.file',
                ],
            });
        } else {
            let credentials;
            try {
                const raw = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON || '').trim();
                const jsonStr = raw.startsWith('{')
                    ? raw
                    : Buffer.from(raw, 'base64').toString('utf-8');
                credentials = JSON.parse(jsonStr);
            } catch (err: any) {
                throw new Error(
                    `Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY_JSON: ${err.message}. Provide valid JSON or base64 JSON.`
                );
            }

            auth = new google.auth.GoogleAuth({
                credentials,
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/drive.file',
                ],
            });
        }

        return google.drive({ version: 'v3', auth });
    }

    // 2. Check OAuth2 Credentials
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        const missing = [];
        if (!clientId) missing.push('GOOGLE_CLIENT_ID');
        if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
        if (!refreshToken) missing.push('GOOGLE_DRIVE_REFRESH_TOKEN');

        throw new Error(
            `Google Drive is not configured. Missing environment variables: ${missing.join(', ')}. ` +
            `Alternatively, provide GOOGLE_SERVICE_ACCOUNT_KEY_JSON.`
        );
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Uploads a file stream directly to Google Drive.
 * If GOOGLE_DRIVE_FOLDER_ID is set (or folderId passed), the file is saved inside that directory.
 */
export async function uploadBackupToDrive({
    filePath,
    fileName,
    mimeType = 'application/zip',
    folderId,
}: {
    filePath: string;
    fileName: string;
    mimeType?: string;
    folderId?: string;
}): Promise<{
    id: string;
    name: string;
    size: number;
    webViewLink: string | null;
    createdTime: string | null;
}> {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Target backup file does not exist on disk: ${filePath}`);
    }

    const drive = getGoogleDriveClient();
    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    const requestBody: drive_v3.Schema$File = {
        name: fileName,
        description: `Automated Full Backup for Apparel Emporium (aelbd.net) generated on ${new Date().toISOString()}`,
    };

    if (targetFolderId && targetFolderId.trim().length > 0) {
        requestBody.parents = [targetFolderId.trim()];
    }

    const fileSize = fs.statSync(filePath).size;
    const fileStream = fs.createReadStream(filePath);

    const response = await drive.files.create({
        requestBody,
        media: {
            mimeType,
            body: fileStream,
        },
        fields: 'id, name, webViewLink, webContentLink, size, createdTime, modifiedTime',
    });

    const file = response.data;
    if (!file.id) {
        throw new Error('Google Drive API did not return a valid file ID.');
    }

    return {
        id: file.id,
        name: file.name || fileName,
        size: file.size ? Number(file.size) : fileSize,
        webViewLink: file.webViewLink || null,
        createdTime: file.createdTime || new Date().toISOString(),
    };
}

/**
 * Queries Google Drive to return a list of all available .zip backup files.
 * Ordered by creation timestamp descending (newest first).
 */
export async function listDriveBackups(folderId?: string): Promise<{
    configured: boolean;
    folderId?: string;
    totalBackups: number;
    backups: DriveBackupFile[];
}> {
    const config = isGoogleDriveConfigured();
    if (!config.configured) {
        return {
            configured: false,
            totalBackups: 0,
            backups: [],
        };
    }

    const drive = getGoogleDriveClient();
    const targetFolderId = (folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim();

    let q = `trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
    if (targetFolderId) {
        q += ` and '${targetFolderId}' in parents`;
    }

    const res = await drive.files.list({
        q,
        fields: 'files(id, name, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'createdTime desc',
        pageSize: 100,
    });

    const rawFiles = res.data.files || [];
    // Filter to .zip files or files containing backup in name
    const backupFiles = rawFiles.filter(f =>
        (f.name && f.name.toLowerCase().endsWith('.zip')) ||
        (f.name && f.name.toLowerCase().includes('backup'))
    );

    const backups: DriveBackupFile[] = backupFiles.map(file => {
        const sizeNum = file.size ? Number(file.size) : 0;
        return {
            id: file.id || '',
            name: file.name || 'unnamed_backup.zip',
            size: sizeNum,
            sizeFormatted: formatBytes(sizeNum),
            createdTime: file.createdTime || file.modifiedTime || new Date().toISOString(),
            modifiedTime: file.modifiedTime || undefined,
            webViewLink: file.webViewLink || null,
        };
    });

    return {
        configured: true,
        folderId: targetFolderId || undefined,
        totalBackups: backups.length,
        backups,
    };
}

/**
 * Retrieves file metadata from Google Drive by file ID.
 */
export async function getDriveFileMetadata(fileId: string): Promise<DriveBackupFile> {
    const drive = getGoogleDriveClient();
    const res = await drive.files.get({
        fileId,
        fields: 'id, name, size, createdTime, modifiedTime, webViewLink',
    });
    const file = res.data;
    const sizeNum = file.size ? Number(file.size) : 0;
    return {
        id: file.id || fileId,
        name: file.name || 'unnamed_backup.zip',
        size: sizeNum,
        sizeFormatted: formatBytes(sizeNum),
        createdTime: file.createdTime || file.modifiedTime || new Date().toISOString(),
        modifiedTime: file.modifiedTime || undefined,
        webViewLink: file.webViewLink || null,
    };
}

/**
 * Downloads a backup file from Google Drive directly to a local disk path.
 * Uses streams to support arbitrarily large database & media archives.
 */
export async function downloadDriveFile(
    fileId: string,
    destFilePath: string
): Promise<{ filePath: string; sizeBytes: number }> {
    const drive = getGoogleDriveClient();
    const dir = path.dirname(destFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    await new Promise<void>((resolve, reject) => {
        const destStream = fs.createWriteStream(destFilePath);
        (res.data as any)
            .on('error', (err: any) => {
                destStream.close();
                reject(err);
            })
            .pipe(destStream)
            .on('finish', () => resolve())
            .on('error', (err: any) => {
                reject(err);
            });
    });

    const stat = fs.statSync(destFilePath);
    return { filePath: destFilePath, sizeBytes: stat.size };
}

/**
 * Auto-cleanup rule:
 * Queries the target Google Drive backup folder for files older than retentionDays (default 7 days).
 * Automatically deletes them to maintain space and avoid duplication.
 */
export async function cleanOldBackupsFromDrive(
    folderId?: string,
    retentionDays: number = 7
): Promise<{
    deletedCount: number;
    deletedFiles: Array<{ id: string; name: string; modifiedTime?: string }>;
    cutoffDate: string;
}> {
    const drive = getGoogleDriveClient();
    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffIso = cutoffDate.toISOString();

    // Query for backups older than retentionDays
    // Exclude folders and trashed files
    let q = `trashed = false and modifiedTime < '${cutoffIso}' and mimeType != 'application/vnd.google-apps.folder'`;
    if (targetFolderId && targetFolderId.trim().length > 0) {
        q += ` and '${targetFolderId.trim()}' in parents`;
    }

    const listRes = await drive.files.list({
        q,
        fields: 'files(id, name, modifiedTime, size)',
        pageSize: 100,
        orderBy: 'modifiedTime asc',
    });

    const filesToDelete = listRes.data.files || [];
    const deletedFiles: Array<{ id: string; name: string; modifiedTime?: string }> = [];

    for (const file of filesToDelete) {
        if (!file.id) continue;
        try {
            await drive.files.delete({ fileId: file.id });
            deletedFiles.push({
                id: file.id,
                name: file.name || 'unnamed_backup',
                modifiedTime: file.modifiedTime || undefined,
            });
        } catch (err: any) {
            console.error(`[GDRIVE_CLEANUP_ERROR] Failed deleting file ${file.name} (${file.id}):`, err?.message || err);
        }
    }

    return {
        deletedCount: deletedFiles.length,
        deletedFiles,
        cutoffDate: cutoffIso,
    };
}

/**
 * Retrieves latest backup status and folder metadata from Google Drive.
 */
export async function getLatestBackupStatus(folderId?: string): Promise<{
    hasConfig: boolean;
    folderId?: string;
    totalBackups: number;
    latestBackup: {
        id: string;
        name: string;
        size: number;
        createdTime: string;
        webViewLink: string | null;
    } | null;
}> {
    const config = isGoogleDriveConfigured();
    if (!config.configured) {
        return {
            hasConfig: false,
            totalBackups: 0,
            latestBackup: null,
        };
    }

    try {
        const drive = getGoogleDriveClient();
        const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

        let q = `trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
        if (targetFolderId && targetFolderId.trim().length > 0) {
            q += ` and '${targetFolderId.trim()}' in parents`;
        }

        const res = await drive.files.list({
            q,
            fields: 'files(id, name, size, createdTime, modifiedTime, webViewLink)',
            orderBy: 'createdTime desc',
            pageSize: 50,
        });

        const files = res.data.files || [];
        const latest = files[0];

        return {
            hasConfig: true,
            folderId: targetFolderId,
            totalBackups: files.length,
            latestBackup: latest && latest.id ? {
                id: latest.id,
                name: latest.name || 'backup.zip',
                size: latest.size ? Number(latest.size) : 0,
                createdTime: latest.createdTime || latest.modifiedTime || new Date().toISOString(),
                webViewLink: latest.webViewLink || null,
            } : null,
        };
    } catch (err: any) {
        console.error('[GDRIVE_STATUS_ERROR] Failed to query Google Drive:', err?.message || err);
        return {
            hasConfig: true,
            folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
            totalBackups: 0,
            latestBackup: null,
        };
    }
}
