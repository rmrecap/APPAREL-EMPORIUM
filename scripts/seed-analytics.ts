import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COUNTRIES = [
    { country: 'United States', countryCode: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'Miami'] },
    { country: 'Germany', countryCode: 'DE', cities: ['Berlin', 'Frankfurt', 'Munich', 'Hamburg'] },
    { country: 'United Kingdom', countryCode: 'GB', cities: ['London', 'Manchester', 'Birmingham'] },
    { country: 'France', countryCode: 'FR', cities: ['Paris', 'Lyon', 'Marseille'] },
    { country: 'Australia', countryCode: 'AU', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
    { country: 'Canada', countryCode: 'CA', cities: ['Toronto', 'Vancouver', 'Montreal'] },
    { country: 'United Arab Emirates', countryCode: 'AE', cities: ['Dubai', 'Abu Dhabi'] },
    { country: 'Netherlands', countryCode: 'NL', cities: ['Amsterdam', 'Rotterdam'] },
    { country: 'Bangladesh', countryCode: 'BD', cities: ['Dhaka', 'Chittagong'] },
];

const PAGES = [
    { path: '/', title: 'Apparel Emporium | Garments Sourcing Partner' },
    { path: '/products', title: 'Export Ready Products | Apparel Emporium' },
    { path: '/products/premium-pique-polo', title: '100% Combed Cotton Pique Polo Shirt' },
    { path: '/products/classic-crew-neck-tshirt', title: 'Heavyweight Cotton Crewneck T-Shirt' },
    { path: '/products/stretch-denim-jeans', title: 'Comfort Stretch 12oz Denim Jeans' },
    { path: '/products/french-terry-hoodie', title: '320 GSM French Terry Pullover Hoodie' },
    { path: '/request-quote', title: 'Request Bulk Garments Sourcing Quote' },
    { path: '/about', title: 'About Apparel Emporium & Compliance' },
    { path: '/contact', title: 'Contact Merchandising Team' },
    { path: '/blog', title: 'Industry Insights & RMG Sourcing Trends' },
];

const SOURCES = [
    { source: 'organic', platform: 'Google Search' },
    { source: 'organic', platform: 'Google Search' },
    { source: 'direct', platform: 'Direct / Bookmarks' },
    { source: 'social', platform: 'LinkedIn' },
    { source: 'social', platform: 'Facebook' },
    { source: 'social', platform: 'Instagram' },
    { source: 'referral', platform: 'garmentsexportdirectory.com' },
];

const BROWSERS = ['Google Chrome', 'Safari', 'Firefox', 'Microsoft Edge'];
const DEVICES = ['desktop', 'desktop', 'mobile', 'mobile', 'tablet'];
const OS_LIST = ['Windows 10/11', 'macOS', 'iOS', 'Android'];

async function seed() {
    const existing = await prisma.trafficLog.count();
    if (existing > 10) {
        console.log(`TrafficLog already contains ${existing} records. Skipping seed.`);
        return;
    }

    console.log('Seeding initial realistic traffic analytics...');
    const now = Date.now();
    const records = [];

    // Generate ~150 visitors over the last 14 days
    for (let i = 0; i < 150; i++) {
        const daysAgo = Math.random() * 12;
        const eventTime = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000);
        const visitorId = `vis_${Math.random().toString(36).substring(2, 10)}`;
        const sessionId = `sess_${Math.random().toString(36).substring(2, 10)}`;

        const geo = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const city = geo.cities[Math.floor(Math.random() * geo.cities.length)];
        const src = SOURCES[Math.floor(Math.random() * SOURCES.length)];
        const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
        const browser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)];
        const os = OS_LIST[Math.floor(Math.random() * OS_LIST.length)];

        // Each visitor views 1 to 4 pages
        const pageViewsCount = Math.floor(Math.random() * 3) + 1;
        for (let p = 0; p < pageViewsCount; p++) {
            const page = PAGES[Math.floor(Math.random() * PAGES.length)];
            const pvTime = new Date(eventTime.getTime() + p * 45000);

            records.push({
                visitorId,
                sessionId,
                eventType: 'pageview',
                pagePath: page.path,
                pageTitle: page.title,
                source: src.source,
                sourcePlatform: src.platform,
                country: geo.country,
                countryCode: geo.countryCode,
                city,
                deviceType: device,
                browser,
                os,
                screenResolution: device === 'mobile' ? '390x844' : '1920x1080',
                duration: Math.floor(Math.random() * 120) + 15,
                createdAt: pvTime
            });

            // Occasional interactive click
            if (Math.random() > 0.6) {
                const clickTypes = ['rfq_click', 'product_click', 'whatsapp_click', 'catalog_download'];
                const clickType = clickTypes[Math.floor(Math.random() * clickTypes.length)];
                records.push({
                    visitorId,
                    sessionId,
                    eventType: clickType,
                    pagePath: page.path,
                    pageTitle: page.title,
                    source: src.source,
                    sourcePlatform: src.platform,
                    targetUrl: clickType === 'rfq_click' ? '/request-quote' : page.path,
                    country: geo.country,
                    countryCode: geo.countryCode,
                    city,
                    deviceType: device,
                    browser,
                    os,
                    createdAt: new Date(pvTime.getTime() + 15000)
                });
            }
        }
    }

    // Add 2 very recent active sessions (in the last 2 minutes) for the Real-time Monitor
    const recentVis1 = `vis_live_1`;
    const recentSess1 = `sess_live_1`;
    records.push({
        visitorId: recentVis1,
        sessionId: recentSess1,
        eventType: 'pageview',
        pagePath: '/products/premium-pique-polo',
        pageTitle: '100% Combed Cotton Pique Polo Shirt',
        source: 'organic',
        sourcePlatform: 'Google Search',
        country: 'United States',
        countryCode: 'US',
        city: 'New York',
        deviceType: 'desktop',
        browser: 'Google Chrome',
        os: 'macOS',
        createdAt: new Date(now - 45 * 1000)
    });

    const recentVis2 = `vis_live_2`;
    const recentSess2 = `sess_live_2`;
    records.push({
        visitorId: recentVis2,
        sessionId: recentSess2,
        eventType: 'pageview',
        pagePath: '/request-quote',
        pageTitle: 'Request Bulk Garments Sourcing Quote',
        source: 'direct',
        sourcePlatform: 'Direct / Bookmarks',
        country: 'Germany',
        countryCode: 'DE',
        city: 'Frankfurt',
        deviceType: 'desktop',
        browser: 'Firefox',
        os: 'Windows 10/11',
        createdAt: new Date(now - 90 * 1000)
    });

    await prisma.trafficLog.createMany({ data: records });
    console.log(`Successfully seeded ${records.length} analytics traffic records!`);
}

seed().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
