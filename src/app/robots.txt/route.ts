import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

    let customRobots = '';
    try {
        const customSetting = await prisma.siteSetting.findUnique({
            where: { key: 'seo_custom_robots' },
        });
        if (customSetting?.value?.trim()) {
            customRobots = customSetting.value.trim();
        }
    } catch (e) {
        console.error('Error fetching custom robots setting:', e);
    }

    if (customRobots) {
        if (!customRobots.includes('Content-Signal:')) {
            customRobots = `Content-Signal: search=yes, ai-train=no\n\n` + customRobots;
        }
        return new NextResponse(customRobots, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    }

    const content = `# Robots.txt for Apparel Emporium (https://aelbd.net)
Content-Signal: search=yes, ai-train=no

User-agent: *
Allow: /
Disallow: /executive-portal-aelbd/
Disallow: /executive-login
Disallow: /buyer-portal/
Disallow: /compare
Disallow: /api/
Disallow: /*?q=*
Disallow: /*?product=*
Disallow: /*?page=*

Host: ${baseUrl.replace(/^https?:\/\//, '')}
Sitemap: ${baseUrl}/sitemap.xml
`;

    return new NextResponse(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}

