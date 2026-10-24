import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export const GSC_SITE_URL = 'sc-domain:aelbd.net';
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

/**
 * Robust Google Service Account Auth Resolver
 * Supports:
 * 1. process.env.GSC_CREDENTIALS (JSON string)
 * 2. process.env.GSC_CREDENTIALS_BASE64 (Base64 encoded JSON)
 * 3. process.env.GOOGLE_APPLICATION_CREDENTIALS (path to key file)
 * 4. Local file fallback: ./gsc-key.json in project root
 * 5. Host-wide fallback: C:\keys\gsc-key.json
 */
export async function getGSCAuth() {
    let credentials: any = null;

    // 1. Raw JSON string in environment variable
    if (process.env.GSC_CREDENTIALS) {
        try {
            credentials = typeof process.env.GSC_CREDENTIALS === 'string'
                ? JSON.parse(process.env.GSC_CREDENTIALS)
                : process.env.GSC_CREDENTIALS;
        } catch (e: any) {
            console.warn('[GSC Auth] Failed to parse GSC_CREDENTIALS environment variable:', e.message);
        }
    }

    // 2. Base64 encoded JSON string
    if (!credentials && process.env.GSC_CREDENTIALS_BASE64) {
        try {
            const decoded = Buffer.from(process.env.GSC_CREDENTIALS_BASE64, 'base64').toString('utf8');
            credentials = JSON.parse(decoded);
        } catch (e: any) {
            console.warn('[GSC Auth] Failed to parse GSC_CREDENTIALS_BASE64:', e.message);
        }
    }

    // 3. File path in GOOGLE_APPLICATION_CREDENTIALS
    if (!credentials && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (fs.existsSync(credPath)) {
            try {
                credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
            } catch (e: any) {
                console.warn('[GSC Auth] Failed to read GOOGLE_APPLICATION_CREDENTIALS file:', e.message);
            }
        }
    }

    // 4. Local project root key file (development & Hostinger deployment fallback)
    if (!credentials) {
        const localPath = path.join(process.cwd(), 'gsc-key.json');
        if (fs.existsSync(localPath)) {
            try {
                credentials = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            } catch (e: any) {
                console.warn('[GSC Auth] Failed to read local gsc-key.json:', e.message);
            }
        }
    }

    // 5. Host-wide Windows fallback
    if (!credentials) {
        const globalPath = 'C:\\keys\\gsc-key.json';
        if (fs.existsSync(globalPath)) {
            try {
                credentials = JSON.parse(fs.readFileSync(globalPath, 'utf8'));
            } catch (e: any) {
                console.warn('[GSC Auth] Failed to read C:\\keys\\gsc-key.json:', e.message);
            }
        }
    }

    if (!credentials) {
        throw new Error('Google Search Console credentials not configured. Please set GSC_CREDENTIALS environment variable or provide gsc-key.json.');
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/indexing',
        ],
    });

    return {
        auth,
        clientEmail: credentials.client_email || 'aelbd-seo-agent@aelbd-console.iam.gserviceaccount.com',
        siteUrl: GSC_SITE_URL,
    };
}
