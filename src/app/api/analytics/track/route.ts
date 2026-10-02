import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveGeoLocation, parseUserAgent, classifyTrafficSource } from '@/lib/geo-resolver';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const {
            visitorId,
            sessionId,
            eventType = 'pageview',
            pagePath = '/',
            pageTitle = '',
            referrer = '',
            targetUrl = '',
            screenResolution = '',
            duration = 0
        } = body;

        // Skip tracking internal admin dashboard pages to keep customer insights clean
        if (typeof pagePath === 'string' && pagePath.startsWith('/executive-portal-aelbd')) {
            return NextResponse.json({ success: true, ignored: 'internal_admin_page' });
        }

        const geo = resolveGeoLocation(req);
        const device = parseUserAgent(req.headers.get('user-agent'));
        const host = req.headers.get('host');
        const trafficSource = classifyTrafficSource(referrer, host);

        const safeVisitorId = typeof visitorId === 'string' && visitorId.length > 5 
            ? visitorId.slice(0, 64) 
            : `vis_${Math.random().toString(36).substring(2, 12)}`;

        const safeSessionId = typeof sessionId === 'string' && sessionId.length > 5 
            ? sessionId.slice(0, 64) 
            : `sess_${Math.random().toString(36).substring(2, 12)}`;

        // Non-blocking write to database
        await prisma.trafficLog.create({
            data: {
                visitorId: safeVisitorId,
                sessionId: safeSessionId,
                eventType: String(eventType).slice(0, 32),
                pagePath: String(pagePath).slice(0, 255),
                pageTitle: pageTitle ? String(pageTitle).slice(0, 255) : null,
                referrer: referrer ? String(referrer).slice(0, 500) : null,
                source: trafficSource.source,
                sourcePlatform: trafficSource.sourcePlatform,
                targetUrl: targetUrl ? String(targetUrl).slice(0, 500) : null,
                ipAddress: geo.ip,
                country: geo.country,
                countryCode: geo.countryCode,
                city: geo.city,
                deviceType: device.deviceType,
                browser: device.browser,
                os: device.os,
                screenResolution: screenResolution ? String(screenResolution).slice(0, 32) : null,
                duration: typeof duration === 'number' && duration > 0 ? Math.min(duration, 86400) : 0,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Analytics track error:', error);

        // Self-healing: if TrafficLog table does not exist in SQLite, create it on-the-fly without affecting existing tables
        if (error?.message?.includes('TrafficLog') || error?.message?.includes('no such table')) {
            try {
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS "TrafficLog" (
                        "id" TEXT NOT NULL PRIMARY KEY,
                        "visitorId" TEXT NOT NULL,
                        "sessionId" TEXT NOT NULL,
                        "eventType" TEXT NOT NULL DEFAULT 'pageview',
                        "pagePath" TEXT NOT NULL,
                        "pageTitle" TEXT,
                        "referrer" TEXT,
                        "source" TEXT NOT NULL DEFAULT 'direct',
                        "sourcePlatform" TEXT,
                        "targetUrl" TEXT,
                        "ipAddress" TEXT,
                        "country" TEXT DEFAULT 'Unknown',
                        "countryCode" TEXT DEFAULT 'UN',
                        "city" TEXT DEFAULT 'Unknown',
                        "deviceType" TEXT NOT NULL DEFAULT 'desktop',
                        "browser" TEXT DEFAULT 'Chrome',
                        "os" TEXT DEFAULT 'Windows',
                        "screenResolution" TEXT,
                        "duration" INTEGER DEFAULT 0,
                        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                `);
                return NextResponse.json({ success: true, healed: true });
            } catch (healErr: any) {
                console.warn('TrafficLog auto-table creation note:', healErr?.message);
            }
        }

        return NextResponse.json({ success: false, error: error.message || 'Tracking failed' }, { status: 500 });
    }
}
