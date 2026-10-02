import geoip from 'geoip-lite';

export interface GeoLocationInfo {
    country: string;
    countryCode: string;
    city: string;
    ip: string;
}

export interface ClientDeviceInfo {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
}

export interface TrafficSourceInfo {
    source: 'direct' | 'organic' | 'social' | 'referral';
    sourcePlatform: string;
}

// ISO Alpha-2 to English Country Name Map
const COUNTRY_NAMES: Record<string, string> = {
    BD: 'Bangladesh',
    US: 'United States',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    IT: 'Italy',
    ES: 'Spain',
    CA: 'Canada',
    AU: 'Australia',
    NL: 'Netherlands',
    SE: 'Sweden',
    DK: 'Denmark',
    NO: 'Norway',
    PL: 'Poland',
    BE: 'Belgium',
    CH: 'Switzerland',
    AT: 'Austria',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    IN: 'India',
    PK: 'Pakistan',
    CN: 'China',
    JP: 'Japan',
    KR: 'South Korea',
    SG: 'Singapore',
    MY: 'Malaysia',
    TR: 'Turkey',
    BR: 'Brazil',
    ZA: 'South Africa',
    RU: 'Russia',
    MX: 'Mexico',
};

export function resolveGeoLocation(req: Request): GeoLocationInfo {
    // 1. Check Cloudflare / CDN headers
    const cfCountry = req.headers.get('cf-ipcountry');
    const cfCity = req.headers.get('cf-ipcity');

    // 2. Extract client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    let rawIp = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';

    // Normalize IP
    let cleanIp = rawIp.replace(/^::ffff:/, '').trim();

    // Check for local loopback or private ranges
    const isPrivate = 
        cleanIp === '127.0.0.1' || 
        cleanIp === '::1' || 
        cleanIp === 'localhost' || 
        cleanIp.startsWith('192.168.') || 
        cleanIp.startsWith('10.') || 
        cleanIp.startsWith('172.16.');

    if (isPrivate) {
        return {
            country: 'Bangladesh',
            countryCode: 'BD',
            city: 'Dhaka',
            ip: cleanIp
        };
    }

    // 3. Check GeoIP lookup
    try {
        const geo = geoip.lookup(cleanIp);
        if (geo) {
            const countryCode = geo.country || cfCountry || 'US';
            const countryName = COUNTRY_NAMES[countryCode] || countryCode;
            const city = geo.city || cfCity || 'Unknown City';
            return {
                country: countryName,
                countryCode: countryCode.toUpperCase(),
                city: city,
                ip: cleanIp
            };
        }
    } catch (e) {
        console.warn('GeoIP lookup warning:', e);
    }

    if (cfCountry) {
        return {
            country: COUNTRY_NAMES[cfCountry.toUpperCase()] || cfCountry,
            countryCode: cfCountry.toUpperCase(),
            city: cfCity || 'Unknown City',
            ip: cleanIp
        };
    }

    return {
        country: 'Global Visitor',
        countryCode: 'UN',
        city: 'International',
        ip: cleanIp
    };
}

export function parseUserAgent(uaString: string | null): ClientDeviceInfo {
    const ua = uaString || '';
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(ua)) {
        deviceType = 'mobile';
    }

    let browser = 'Other';
    if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
    else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
    else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
    else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

    let os = 'Other';
    if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { deviceType, browser, os };
}

export function classifyTrafficSource(referrerUrl: string | null, host: string | null): TrafficSourceInfo {
    if (!referrerUrl || referrerUrl === 'direct' || referrerUrl.trim() === '') {
        return { source: 'direct', sourcePlatform: 'Direct / Bookmarks' };
    }

    try {
        const refUrl = new URL(referrerUrl);
        const refHost = refUrl.hostname.toLowerCase();

        // Check if internal referral
        if (host && (refHost === host.toLowerCase() || refHost.includes(host.toLowerCase()))) {
            return { source: 'direct', sourcePlatform: 'Internal Navigation' };
        }

        // Search Engines (Organic)
        if (refHost.includes('google.')) return { source: 'organic', sourcePlatform: 'Google Search' };
        if (refHost.includes('bing.')) return { source: 'organic', sourcePlatform: 'Microsoft Bing' };
        if (refHost.includes('yahoo.')) return { source: 'organic', sourcePlatform: 'Yahoo' };
        if (refHost.includes('duckduckgo.')) return { source: 'organic', sourcePlatform: 'DuckDuckGo' };
        if (refHost.includes('baidu.')) return { source: 'organic', sourcePlatform: 'Baidu' };
        if (refHost.includes('yandex.')) return { source: 'organic', sourcePlatform: 'Yandex' };

        // Social Media
        if (refHost.includes('facebook.') || refHost.includes('fb.me')) return { source: 'social', sourcePlatform: 'Facebook' };
        if (refHost.includes('instagram.')) return { source: 'social', sourcePlatform: 'Instagram' };
        if (refHost.includes('linkedin.') || refHost.includes('lnkd.in')) return { source: 'social', sourcePlatform: 'LinkedIn' };
        if (refHost.includes('twitter.') || refHost.includes('t.co') || refHost.includes('x.com')) return { source: 'social', sourcePlatform: 'X (Twitter)' };
        if (refHost.includes('tiktok.')) return { source: 'social', sourcePlatform: 'TikTok' };
        if (refHost.includes('pinterest.')) return { source: 'social', sourcePlatform: 'Pinterest' };
        if (refHost.includes('youtube.')) return { source: 'social', sourcePlatform: 'YouTube' };
        if (refHost.includes('whatsapp.')) return { source: 'social', sourcePlatform: 'WhatsApp' };

        // External Referral
        return { source: 'referral', sourcePlatform: refHost.replace(/^www\./, '') };
    } catch (e) {
        return { source: 'referral', sourcePlatform: 'External Web' };
    }
}
