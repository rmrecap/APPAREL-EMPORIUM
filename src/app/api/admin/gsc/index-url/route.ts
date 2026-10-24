import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { indexSingleUrl, batchIndexUrls, submitSitemapToGSC } from '@/lib/gsc-service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
        const secretKey = req.headers.get('x-ael-secret');
        const validKey = process.env.EXTERNAL_API_KEY || 'ae_1y7wso8ijykx7rbc';
        const validSecret = process.env.AEL_API_SECRET || process.env.API_SECRET_KEY || 'ael_secret_key_2026_xyz';

        const isApiKeyAuthorized = (apiKey && apiKey === validKey) || (secretKey && secretKey === validSecret);

        if (!isApiKeyAuthorized) {
            const authResult = await requireAuth();
            if (!authResult.ok) {
                return authResult.response;
            }

            const allowedRoles = ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'];
            if (!allowedRoles.includes(authResult.user.role)) {
                return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
            }
        }

        let body: any = {};
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const { action = 'index', url, urls } = body;

        // 1. Sitemap submission
        if (action === 'sitemap') {
            const result = await submitSitemapToGSC();
            return NextResponse.json(result);
        }

        // 2. Batch indexing
        if (action === 'batch_index' && Array.isArray(urls)) {
            const result = await batchIndexUrls(urls);
            return NextResponse.json(result);
        }

        // 3. Single URL indexing
        const result = await indexSingleUrl(url);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[Admin GSC Index API Error]', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to process indexing request',
            },
            { status: 500 }
        );
    }
}
