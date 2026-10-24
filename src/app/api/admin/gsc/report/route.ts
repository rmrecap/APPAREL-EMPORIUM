import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { getGSCAuth, GSC_SITE_URL, APP_BASE_URL } from '@/lib/gsc-auth';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authResult = await requireAuth();
        if (!authResult.ok) {
            return authResult.response;
        }

        const allowedRoles = ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'];
        if (!allowedRoles.includes(authResult.user.role)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const daysParam = parseInt(searchParams.get('days') || '28', 10);
        const days = [7, 28, 90].includes(daysParam) ? daysParam : 28;

        const { auth, clientEmail, siteUrl } = await getGSCAuth();
        const searchconsole = google.searchconsole({ version: 'v1', auth });

        // Calculate date window (GSC data is typically available with a 2-day latency)
        const today = new Date();
        const endDateObj = new Date(today);
        endDateObj.setDate(today.getDate() - 2);

        const startDateObj = new Date(endDateObj);
        startDateObj.setDate(endDateObj.getDate() - days);

        const endDate = endDateObj.toISOString().split('T')[0];
        const startDate = startDateObj.toISOString().split('T')[0];

        // 1. Overall Trend by Date
        const trendPromise = searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['date'],
                rowLimit: 100,
            },
        }).catch(err => {
            console.error('[GSC API] Trend query error:', err.message);
            return { data: { rows: [] } };
        });

        // 2. Top Queries
        const queriesPromise = searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['query'],
                rowLimit: 50,
            },
        }).catch(err => {
            console.error('[GSC API] Queries query error:', err.message);
            return { data: { rows: [] } };
        });

        // 3. Top Pages
        const pagesPromise = searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['page'],
                rowLimit: 50,
            },
        }).catch(err => {
            console.error('[GSC API] Pages query error:', err.message);
            return { data: { rows: [] } };
        });

        // 4. Countries
        const countriesPromise = searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['country'],
                rowLimit: 30,
            },
        }).catch(err => {
            console.error('[GSC API] Countries query error:', err.message);
            return { data: { rows: [] } };
        });

        // 5. Device Breakdown
        const devicesPromise = searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['device'],
            },
        }).catch(err => {
            console.error('[GSC API] Devices query error:', err.message);
            return { data: { rows: [] } };
        });

        // 6. Sitemap Status
        const sitemapPromise = searchconsole.sitemaps.get({
            siteUrl,
            feedpath: `${APP_BASE_URL}/sitemap.xml`,
        }).catch(err => {
            console.warn('[GSC API] Sitemap check notice:', err.message);
            return { data: null };
        });

        const [trendRes, queriesRes, pagesRes, countriesRes, devicesRes, sitemapRes] = await Promise.all([
            trendPromise,
            queriesPromise,
            pagesPromise,
            countriesPromise,
            devicesPromise,
            sitemapPromise,
        ]);

        const trendRows = trendRes.data?.rows || [];
        const queryRows = queriesRes.data?.rows || [];
        const pageRows = pagesRes.data?.rows || [];
        const countryRows = countriesRes.data?.rows || [];
        const deviceRows = devicesRes.data?.rows || [];

        // Aggregate KPI overview
        let totalClicks = 0;
        let totalImpressions = 0;
        let sumPosition = 0;

        trendRows.forEach((r: any) => {
            totalClicks += r.clicks || 0;
            totalImpressions += r.impressions || 0;
            sumPosition += (r.position || 0) * (r.impressions || 1);
        });

        const overallCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const averagePosition = totalImpressions > 0 ? sumPosition / totalImpressions : 0;

        return NextResponse.json({
            success: true,
            siteUrl,
            clientEmail,
            dateRange: {
                days,
                startDate,
                endDate,
            },
            overview: {
                totalClicks,
                totalImpressions,
                overallCtr: parseFloat(overallCtr.toFixed(2)),
                averagePosition: parseFloat(averagePosition.toFixed(1)),
            },
            trends: trendRows.map((r: any) => ({
                date: r.keys?.[0],
                clicks: r.clicks || 0,
                impressions: r.impressions || 0,
                ctr: parseFloat(((r.ctr || 0) * 100).toFixed(2)),
                position: parseFloat((r.position || 0).toFixed(1)),
            })),
            topQueries: queryRows.map((r: any) => ({
                query: r.keys?.[0] || 'Unknown',
                clicks: r.clicks || 0,
                impressions: r.impressions || 0,
                ctr: parseFloat(((r.ctr || 0) * 100).toFixed(2)),
                position: parseFloat((r.position || 0).toFixed(1)),
            })),
            topPages: pageRows.map((r: any) => ({
                page: r.keys?.[0] || '',
                clicks: r.clicks || 0,
                impressions: r.impressions || 0,
                ctr: parseFloat(((r.ctr || 0) * 100).toFixed(2)),
                position: parseFloat((r.position || 0).toFixed(1)),
            })),
            topCountries: countryRows.map((r: any) => ({
                countryCode: (r.keys?.[0] || 'ZZ').toUpperCase(),
                clicks: r.clicks || 0,
                impressions: r.impressions || 0,
                ctr: parseFloat(((r.ctr || 0) * 100).toFixed(2)),
                position: parseFloat((r.position || 0).toFixed(1)),
            })),
            devices: deviceRows.map((r: any) => ({
                device: r.keys?.[0] || 'DESKTOP',
                clicks: r.clicks || 0,
                impressions: r.impressions || 0,
                ctr: parseFloat(((r.ctr || 0) * 100).toFixed(2)),
                position: parseFloat((r.position || 0).toFixed(1)),
            })),
            sitemap: sitemapRes?.data ? {
                path: sitemapRes.data.path,
                lastSubmitted: sitemapRes.data.lastSubmitted,
                isPending: sitemapRes.data.isPending,
                errors: sitemapRes.data.errors,
                warnings: sitemapRes.data.warnings,
            } : null,
        });

    } catch (error: any) {
        console.error('[GSC Report API Error]', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch Google Search Console report',
            },
            { status: 500 }
        );
    }
}
