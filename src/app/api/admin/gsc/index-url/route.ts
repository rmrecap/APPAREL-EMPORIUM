import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { getGSCAuth, GSC_SITE_URL, APP_BASE_URL } from '@/lib/gsc-auth';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const authResult = await requireAuth();
        if (!authResult.ok) {
            return authResult.response;
        }

        const allowedRoles = ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'];
        if (!allowedRoles.includes(authResult.user.role)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        let body: any = {};
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const { action = 'index', url, urls } = body;
        const { auth, siteUrl } = await getGSCAuth();

        // ── SITEMAP RESUBMIT ──────────────────────────────────────
        if (action === 'sitemap') {
            const searchconsole = google.searchconsole({ version: 'v1', auth });
            const sitemapFeedpath = `${APP_BASE_URL}/sitemap.xml`;

            await searchconsole.sitemaps.submit({
                siteUrl,
                feedpath: sitemapFeedpath,
            });

            const statusRes = await searchconsole.sitemaps.get({
                siteUrl,
                feedpath: sitemapFeedpath,
            }).catch(() => null);

            return NextResponse.json({
                success: true,
                message: 'Sitemap submitted to Google Search Console successfully',
                feedpath: sitemapFeedpath,
                sitemapStatus: statusRes?.data || null,
                timestamp: new Date().toISOString(),
            });
        }

        // ── BATCH INDEXING ────────────────────────────────────────
        if (action === 'batch_index' && Array.isArray(urls)) {
            const indexing = google.indexing({ version: 'v3', auth });
            const results: any[] = [];

            for (const rawUrl of urls) {
                let targetUrl = rawUrl.trim();
                if (targetUrl.startsWith('/')) {
                    targetUrl = `${APP_BASE_URL}${targetUrl}`;
                }

                try {
                    const res = await indexing.urlNotifications.publish({
                        requestBody: {
                            url: targetUrl,
                            type: 'URL_UPDATED',
                        },
                    });
                    results.push({
                        url: targetUrl,
                        status: 'SUCCESS',
                        statusCode: res.status,
                        notifyTime: res.data.urlNotificationMetadata?.latestUpdate?.notifyTime || new Date().toISOString(),
                    });
                } catch (err: any) {
                    results.push({
                        url: targetUrl,
                        status: 'ERROR',
                        error: err.message,
                    });
                }
            }

            return NextResponse.json({
                success: true,
                action: 'batch_index',
                total: urls.length,
                results,
                timestamp: new Date().toISOString(),
            });
        }

        // ── SINGLE URL INDEXING ───────────────────────────────────
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'A valid url is required for indexing' }, { status: 400 });
        }

        let targetUrl = url.trim();
        if (targetUrl.startsWith('/')) {
            targetUrl = `${APP_BASE_URL}${targetUrl}`;
        }

        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            return NextResponse.json({ error: 'URL must start with http:// or https://' }, { status: 400 });
        }

        const indexing = google.indexing({ version: 'v3', auth });

        const notifyRes = await indexing.urlNotifications.publish({
            requestBody: {
                url: targetUrl,
                type: 'URL_UPDATED',
            },
        });

        return NextResponse.json({
            success: true,
            action: 'index',
            url: targetUrl,
            status: notifyRes.status,
            metadata: notifyRes.data.urlNotificationMetadata?.latestUpdate || null,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('[GSC Index API Error]', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to process indexing request',
            },
            { status: 500 }
        );
    }
}
