import { google } from 'googleapis';
import { getGSCAuth, APP_BASE_URL } from './gsc-auth';

export interface GSCReportResult {
    success: boolean;
    siteUrl: string;
    clientEmail: string;
    dateRange: {
        days: number;
        startDate: string;
        endDate: string;
    };
    overview: {
        totalClicks: number;
        totalImpressions: number;
        overallCtr: number;
        averagePosition: number;
    };
    trends: Array<{
        date: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    topQueries: Array<{
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    topPages: Array<{
        page: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    topCountries: Array<{
        countryCode: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    devices: Array<{
        device: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
    sitemap: {
        path: string;
        lastSubmitted?: string | null;
        isPending?: boolean | null;
        errors?: number | string | null;
        warnings?: number | string | null;
    } | null;
}

/**
 * Fetches comprehensive Google Search Console report data for a given date range.
 */
export async function getGSCReport(days: number = 28): Promise<GSCReportResult> {
    const validDays = [7, 28, 90].includes(days) ? days : 28;
    const { auth, clientEmail, siteUrl } = await getGSCAuth();
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // GSC reports data with a ~2 day processing lag
    const today = new Date();
    const endDateObj = new Date(today);
    endDateObj.setDate(today.getDate() - 2);

    const startDateObj = new Date(endDateObj);
    startDateObj.setDate(endDateObj.getDate() - validDays);

    const endDate = endDateObj.toISOString().split('T')[0];
    const startDate = startDateObj.toISOString().split('T')[0];

    // 1. Trends by Date
    const trendPromise = searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: ['date'],
            rowLimit: 100,
        },
    }).catch(err => {
        console.error('[GSC Service] Trend query notice:', err.message);
        return { data: { rows: [] } };
    });

    // 2. Top Search Queries
    const queriesPromise = searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: ['query'],
            rowLimit: 50,
        },
    }).catch(err => {
        console.error('[GSC Service] Queries query notice:', err.message);
        return { data: { rows: [] } };
    });

    // 3. Top Search Landing Pages
    const pagesPromise = searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: ['page'],
            rowLimit: 50,
        },
    }).catch(err => {
        console.error('[GSC Service] Pages query notice:', err.message);
        return { data: { rows: [] } };
    });

    // 4. Geographical breakdown
    const countriesPromise = searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: ['country'],
            rowLimit: 30,
        },
    }).catch(err => {
        console.error('[GSC Service] Countries query notice:', err.message);
        return { data: { rows: [] } };
    });

    // 5. Device distribution
    const devicesPromise = searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: ['device'],
        },
    }).catch(err => {
        console.error('[GSC Service] Devices query notice:', err.message);
        return { data: { rows: [] } };
    });

    // 6. Current sitemap index status
    const sitemapPromise = searchconsole.sitemaps.get({
        siteUrl,
        feedpath: `${APP_BASE_URL}/sitemap.xml`,
    }).catch(err => {
        console.warn('[GSC Service] Sitemap query notice:', err.message);
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

    // Aggregate summary KPI totals
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

    return {
        success: true,
        siteUrl,
        clientEmail,
        dateRange: {
            days: validDays,
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
            date: r.keys?.[0] || '',
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
            path: sitemapRes.data.path || `${APP_BASE_URL}/sitemap.xml`,
            lastSubmitted: sitemapRes.data.lastSubmitted || undefined,
            isPending: typeof sitemapRes.data.isPending === 'boolean' ? sitemapRes.data.isPending : undefined,
            errors: sitemapRes.data.errors ? Number(sitemapRes.data.errors) : 0,
            warnings: sitemapRes.data.warnings ? Number(sitemapRes.data.warnings) : 0,
        } : null,
    };
}

/**
 * Publishes a single URL update to Google Web Search Indexing API v3.
 */
export async function indexSingleUrl(url: string) {
    if (!url || typeof url !== 'string') {
        throw new Error('A valid url is required for indexing');
    }

    let targetUrl = url.trim();
    if (targetUrl.startsWith('/')) {
        targetUrl = `${APP_BASE_URL}${targetUrl}`;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
    }

    const { auth } = await getGSCAuth();
    const indexing = google.indexing({ version: 'v3', auth });

    const notifyRes = await indexing.urlNotifications.publish({
        requestBody: {
            url: targetUrl,
            type: 'URL_UPDATED',
        },
    });

    return {
        success: true,
        action: 'index',
        url: targetUrl,
        statusCode: notifyRes.status,
        metadata: notifyRes.data.urlNotificationMetadata?.latestUpdate || null,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Submits a batch of URLs to Google Web Search Indexing API v3.
 */
export async function batchIndexUrls(urls: string[]) {
    if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error('An array of URLs is required for batch indexing');
    }

    const { auth } = await getGSCAuth();
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

    return {
        success: true,
        action: 'batch_index',
        total: urls.length,
        results,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Submits the primary sitemap to Google Search Console API.
 */
export async function submitSitemapToGSC() {
    const { auth, siteUrl } = await getGSCAuth();
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

    return {
        success: true,
        message: 'Sitemap submitted to Google Search Console successfully',
        feedpath: sitemapFeedpath,
        sitemapStatus: statusRes?.data || null,
        timestamp: new Date().toISOString(),
    };
}
