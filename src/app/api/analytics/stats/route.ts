import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const auth = await requireAuth();
        if (!auth.ok) {
            return auth.response;
        }

        const allowedRoles = ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'VIEWER'];
        if (!allowedRoles.includes(auth.user.role)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient privileges to view analytics' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '7d';

        const now = new Date();
        let startDate = new Date();

        if (range === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (range === '30d') {
            startDate.setDate(now.getDate() - 30);
        } else if (range === 'all') {
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        } else {
            // default 7d
            startDate.setDate(now.getDate() - 7);
        }

        // Realtime window (5m and 15m)
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

        // Fetch logs within selected range
        const [
            totalCount,
            active5mLogs,
            active15mLogs,
            recentLogs,
            rangeLogs
        ] = await Promise.all([
            prisma.trafficLog.count(),
            prisma.trafficLog.findMany({
                where: { createdAt: { gte: fiveMinAgo } },
                select: { sessionId: true, visitorId: true }
            }),
            prisma.trafficLog.findMany({
                where: { createdAt: { gte: fifteenMinAgo } },
                select: { sessionId: true, visitorId: true }
            }),
            prisma.trafficLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 12,
                select: {
                    id: true,
                    eventType: true,
                    pagePath: true,
                    country: true,
                    countryCode: true,
                    city: true,
                    browser: true,
                    deviceType: true,
                    sourcePlatform: true,
                    createdAt: true
                }
            }),
            prisma.trafficLog.findMany({
                where: { createdAt: { gte: startDate } },
                select: {
                    id: true,
                    visitorId: true,
                    sessionId: true,
                    eventType: true,
                    pagePath: true,
                    pageTitle: true,
                    source: true,
                    sourcePlatform: true,
                    targetUrl: true,
                    country: true,
                    countryCode: true,
                    city: true,
                    deviceType: true,
                    browser: true,
                    os: true,
                    createdAt: true
                }
            })
        ]);

        // Realtime stats
        const activeUsers5m = new Set(active5mLogs.map(l => l.sessionId)).size;
        const activeUsers15m = new Set(active15mLogs.map(l => l.sessionId)).size;

        // Process range data
        const totalPageviews = rangeLogs.filter(l => l.eventType === 'pageview').length;
        const totalClicks = rangeLogs.filter(l => l.eventType !== 'pageview').length;
        const uniqueVisitorsSet = new Set(rangeLogs.map(l => l.visitorId));
        const uniqueSessionsSet = new Set(rangeLogs.map(l => l.sessionId));
        const uniqueVisitors = uniqueVisitorsSet.size;
        const totalSessions = uniqueSessionsSet.size;

        // Bounce rate & session metrics
        const sessionEventCounts: Record<string, number> = {};
        rangeLogs.forEach(l => {
            sessionEventCounts[l.sessionId] = (sessionEventCounts[l.sessionId] || 0) + 1;
        });
        const singleEventSessions = Object.values(sessionEventCounts).filter(c => c === 1).length;
        const bounceRate = totalSessions > 0 ? Math.round((singleEventSessions / totalSessions) * 100) : 0;
        const pagesPerSession = totalSessions > 0 ? Number((totalPageviews / totalSessions).toFixed(1)) : 0;

        // Country distribution
        const countryMap: Record<string, { country: string; code: string; views: number; visitors: Set<string> }> = {};
        const cityMap: Record<string, { city: string; country: string; code: string; count: number }> = {};

        rangeLogs.forEach(l => {
            const code = l.countryCode || 'UN';
            const countryName = l.country || 'Unknown';
            if (!countryMap[code]) {
                countryMap[code] = { country: countryName, code, views: 0, visitors: new Set() };
            }
            countryMap[code].views += 1;
            countryMap[code].visitors.add(l.visitorId);

            if (l.city && l.city !== 'Unknown City' && l.city !== 'Unknown') {
                const cityKey = `${l.city}_${code}`;
                if (!cityMap[cityKey]) {
                    cityMap[cityKey] = { city: l.city, country: countryName, code, count: 0 };
                }
                cityMap[cityKey].count += 1;
            }
        });

        const totalGeoViews = Object.values(countryMap).reduce((acc, c) => acc + c.views, 0) || 1;
        const topCountries = Object.values(countryMap)
            .map(c => ({
                country: c.country,
                code: c.code,
                views: c.views,
                visitors: c.visitors.size,
                percentage: Math.round((c.views / totalGeoViews) * 100)
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        const topCities = Object.values(cityMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // Traffic sources breakdown
        const sourceCounts: Record<string, number> = { direct: 0, organic: 0, social: 0, referral: 0 };
        const platformCounts: Record<string, number> = {};

        rangeLogs.forEach(l => {
            const src = l.source || 'direct';
            sourceCounts[src] = (sourceCounts[src] || 0) + 1;

            const plat = l.sourcePlatform || 'Direct';
            platformCounts[plat] = (platformCounts[plat] || 0) + 1;
        });

        const totalSourceEvents = rangeLogs.length || 1;
        const trafficSources = [
            { name: 'Organic Search', key: 'organic', count: sourceCounts.organic || 0, percentage: Math.round(((sourceCounts.organic || 0) / totalSourceEvents) * 100), color: '#10B981' },
            { name: 'Direct Traffic', key: 'direct', count: sourceCounts.direct || 0, percentage: Math.round(((sourceCounts.direct || 0) / totalSourceEvents) * 100), color: '#3B82F6' },
            { name: 'Social Media', key: 'social', count: sourceCounts.social || 0, percentage: Math.round(((sourceCounts.social || 0) / totalSourceEvents) * 100), color: '#8B5CF6' },
            { name: 'Referral', key: 'referral', count: sourceCounts.referral || 0, percentage: Math.round(((sourceCounts.referral || 0) / totalSourceEvents) * 100), color: '#F59E0B' },
        ];

        const topPlatforms = Object.entries(platformCounts)
            .map(([platform, count]) => ({ platform, count, percentage: Math.round((count / totalSourceEvents) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        // Top Pages
        const pageMap: Record<string, { path: string; title: string; views: number; visitors: Set<string> }> = {};
        rangeLogs.filter(l => l.eventType === 'pageview').forEach(l => {
            const p = l.pagePath || '/';
            if (!pageMap[p]) {
                pageMap[p] = { path: p, title: l.pageTitle || p, views: 0, visitors: new Set() };
            }
            pageMap[p].views += 1;
            pageMap[p].visitors.add(l.visitorId);
        });

        const topPages = Object.values(pageMap)
            .map(p => ({
                path: p.path,
                title: p.title,
                views: p.views,
                uniqueVisitors: p.visitors.size
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // User Journey & Interactions
        const journeyEvents = rangeLogs.filter(l => l.eventType !== 'pageview');
        const interactionTypes: Record<string, number> = {};
        journeyEvents.forEach(l => {
            const type = l.eventType;
            interactionTypes[type] = (interactionTypes[type] || 0) + 1;
        });

        const userJourney = Object.entries(interactionTypes)
            .map(([event, count]) => ({
                event: event.replace(/_/g, ' ').toUpperCase(),
                count,
                percentage: Math.round((count / (journeyEvents.length || 1)) * 100)
            }))
            .sort((a, b) => b.count - a.count);

        // Devices, Browsers, and OS
        const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
        const browserCounts: Record<string, number> = {};
        const osCounts: Record<string, number> = {};

        rangeLogs.forEach(l => {
            const dev = (l.deviceType || 'desktop').toLowerCase();
            if (dev.includes('mobile')) deviceCounts.mobile = (deviceCounts.mobile || 0) + 1;
            else if (dev.includes('tablet')) deviceCounts.tablet = (deviceCounts.tablet || 0) + 1;
            else deviceCounts.desktop = (deviceCounts.desktop || 0) + 1;

            const br = l.browser || 'Chrome';
            browserCounts[br] = (browserCounts[br] || 0) + 1;

            const opSys = l.os || 'Windows';
            osCounts[opSys] = (osCounts[opSys] || 0) + 1;
        });

        const devices = [
            { name: 'Desktop', count: deviceCounts.desktop, percentage: Math.round((deviceCounts.desktop / totalSourceEvents) * 100) },
            { name: 'Mobile', count: deviceCounts.mobile, percentage: Math.round((deviceCounts.mobile / totalSourceEvents) * 100) },
            { name: 'Tablet', count: deviceCounts.tablet, percentage: Math.round((deviceCounts.tablet / totalSourceEvents) * 100) },
        ];

        const topBrowsers = Object.entries(browserCounts)
            .map(([browser, count]) => ({ browser, count, percentage: Math.round((count / totalSourceEvents) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topOS = Object.entries(osCounts)
            .map(([os, count]) => ({ os, count, percentage: Math.round((count / totalSourceEvents) * 100) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Timeline (Hourly if today, daily otherwise)
        const timelineMap: Record<string, { label: string; views: number; visitors: Set<string> }> = {};

        if (range === 'today') {
            for (let i = 0; i <= now.getHours(); i++) {
                const hourKey = `${String(i).padStart(2, '0')}:00`;
                timelineMap[hourKey] = { label: hourKey, views: 0, visitors: new Set() };
            }
            rangeLogs.forEach(l => {
                const d = new Date(l.createdAt);
                const hourKey = `${String(d.getHours()).padStart(2, '0')}:00`;
                if (timelineMap[hourKey]) {
                    timelineMap[hourKey].views += 1;
                    timelineMap[hourKey].visitors.add(l.visitorId);
                }
            });
        } else {
            // Days
            const daysCount = range === '30d' ? 30 : 7;
            for (let i = daysCount - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const dayKey = d.toISOString().split('T')[0];
                const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                timelineMap[dayKey] = { label: dayLabel, views: 0, visitors: new Set() };
            }
            rangeLogs.forEach(l => {
                const dayKey = new Date(l.createdAt).toISOString().split('T')[0];
                if (timelineMap[dayKey]) {
                    timelineMap[dayKey].views += 1;
                    timelineMap[dayKey].visitors.add(l.visitorId);
                }
            });
        }

        const timeline = Object.values(timelineMap).map(t => ({
            label: t.label,
            views: t.views,
            visitors: t.visitors.size
        }));

        return NextResponse.json({
            success: true,
            range,
            totalDatabaseRecords: totalCount,
            realtime: {
                activeUsers5m: Math.max(activeUsers5m, 1),
                activeUsers15m: Math.max(activeUsers15m, 1),
                recentEvents: recentLogs
            },
            overview: {
                pageviews: totalPageviews,
                uniqueVisitors,
                totalSessions,
                totalClicks,
                bounceRate,
                pagesPerSession
            },
            geography: {
                topCountries,
                topCities
            },
            sources: {
                categories: trafficSources,
                topPlatforms
            },
            topPages,
            userJourney,
            technology: {
                devices,
                browsers: topBrowsers,
                os: topOS
            },
            timeline
        });

    } catch (error: any) {
        console.error('Analytics stats error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
    }
}
