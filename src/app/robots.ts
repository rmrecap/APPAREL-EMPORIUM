import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

    try {
        const customSetting = await prisma.setting.findUnique({
            where: { key: 'seo_custom_robots' },
        });

        if (customSetting?.value?.trim()) {
            const lines = customSetting.value.split('\n').map((l) => l.trim()).filter(Boolean);
            const rules: Array<{ userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] }> = [];
            let currentRule: { userAgent: string[]; allow: string[]; disallow: string[] } | null = null;
            let sitemapUrl: string = `${baseUrl}/sitemap.xml`;

            for (const line of lines) {
                if (line.startsWith('#')) continue;
                const [rawKey, ...valParts] = line.split(':');
                if (!rawKey || valParts.length === 0) continue;
                const key = rawKey.trim().toLowerCase();
                const val = valParts.join(':').trim();

                if (key === 'user-agent') {
                    if (currentRule && (currentRule.allow.length > 0 || currentRule.disallow.length > 0)) {
                        rules.push(currentRule);
                    }
                    currentRule = { userAgent: [val], allow: [], disallow: [] };
                } else if (key === 'allow' && currentRule) {
                    currentRule.allow.push(val);
                } else if (key === 'disallow' && currentRule) {
                    currentRule.disallow.push(val);
                } else if (key === 'sitemap') {
                    sitemapUrl = val;
                }
            }
            if (currentRule && (currentRule.allow.length > 0 || currentRule.disallow.length > 0)) {
                rules.push(currentRule);
            }

            if (rules.length > 0) {
                return {
                    rules,
                    sitemap: sitemapUrl,
                    host: baseUrl.replace(/^https?:\/\//, ''),
                };
            }
        }
    } catch (e) {
        console.error('Error reading custom robots.txt from database:', e);
    }

    // Default safe production robots rules
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/executive-portal-aelbd/',
                    '/executive-login',
                    '/buyer-portal/',
                    '/compare',
                    '/api/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl.replace(/^https?:\/\//, ''),
    };
}
