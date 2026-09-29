import { NextRequest } from 'next/server';
import { prisma } from './prisma';

/**
 * Known valid keys for external publishing & AI Studio tools
 */
const DEFAULT_AUTHORIZED_KEYS = [
    'ae_1y7wso8ijykx7rbc',
    'ael_secret_key_2026_xyz'
];

/**
 * Extracts API key / Secret key from all possible headers and request body
 */
export function extractApiKey(req: NextRequest, body?: any): string {
    const headerKey =
        req.headers.get('x-api-key') ||
        req.headers.get('x-secret-key') ||
        req.headers.get('secret-key') ||
        req.headers.get('api-key') ||
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
        req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

    const keyInBody =
        body?.secretKey ||
        body?.apiKey ||
        body?.['x-api-key'] ||
        body?.['x-secret-key'] ||
        body?.token;

    return (headerKey || keyInBody || '').trim();
}

/**
 * Verifies if the provided key is authorized
 */
export async function verifyApiKey(key: string): Promise<boolean> {
    if (!key) return false;

    const trimmedKey = key.trim();

    // 1. Check against hardcoded trusted fallback keys
    if (DEFAULT_AUTHORIZED_KEYS.includes(trimmedKey)) {
        return true;
    }

    // 2. Check against environment variables
    const envKeys = [
        process.env.EXTERNAL_API_KEY,
        process.env.AELBD_API_KEY,
        process.env.AEL_API_SECRET,
        process.env.API_SECRET_KEY,
    ].filter(Boolean) as string[];

    if (envKeys.some(k => k.trim() === trimmedKey)) {
        return true;
    }

    // 3. Check dynamic database setting
    try {
        const dbSetting = await prisma.siteSetting.findUnique({
            where: { key: 'api_external_key' },
        });
        if (dbSetting && dbSetting.value && dbSetting.value.trim() === trimmedKey) {
            return true;
        }
    } catch {
        // Fall back gracefully if database is unreachable
    }

    return false;
}
