/**
 * Google Search Console & Web Search Indexing API Submission Script
 * Uses Service Account credentials from gsc-key.json
 */
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function main() {
    console.log('====================================================');
    console.log('   AELBD.NET - GSC & INSTANT INDEXING SUBMISSION    ');
    console.log('====================================================');

    const keyPath = path.resolve(__dirname, '../gsc-key.json');
    if (!fs.existsSync(keyPath)) {
        console.error('ERROR: gsc-key.json not found at:', keyPath);
        process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: keyPath,
        scopes: [
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/indexing',
        ],
    });

    const authClient = await auth.getClient();
    console.log(`[AUTH] Authenticated as: ${authClient.email}`);

    // ── 1. Submit sitemap to Google Search Console ─────────────────────────
    console.log('\n[STEP 1] Submitting sitemap to Google Search Console API...');
    const searchconsole = google.searchconsole({ version: 'v1', auth });
    const siteUrl = 'sc-domain:aelbd.net';
    const sitemapFeedpath = 'https://aelbd.net/sitemap.xml';

    try {
        console.log(`Submitting sitemap "${sitemapFeedpath}" to property "${siteUrl}"...`);
        await searchconsole.sitemaps.submit({
            siteUrl,
            feedpath: sitemapFeedpath,
        });
        console.log('✓ SUCCESS: sitemap.xml submitted successfully to GSC!');
    } catch (err) {
        console.error('Notice on GSC sitemap submit:', err.message);
    }

    // Verify current sitemaps status
    try {
        const sitemapsRes = await searchconsole.sitemaps.get({
            siteUrl,
            feedpath: sitemapFeedpath,
        });
        console.log('✓ Current Sitemap Status:', {
            path: sitemapsRes.data.path,
            lastSubmitted: sitemapsRes.data.lastSubmitted,
            isPending: sitemapsRes.data.isPending,
            errors: sitemapsRes.data.errors,
            warnings: sitemapsRes.data.warnings,
        });
    } catch (err) {
        console.log('Status retrieval note:', err.message);
    }

    // ── 2. Trigger Instant Indexing API for Priority URLs ─────────────────
    console.log('\n[STEP 2] Submitting Priority URLs to Google Web Search Indexing API...');
    const indexing = google.indexing({ version: 'v3', auth });

    const priorityUrls = [
        'https://aelbd.net/',
        'https://aelbd.net/products',
        'https://aelbd.net/about',
        'https://aelbd.net/contact',
        'https://aelbd.net/request-quote',
        'https://aelbd.net/products/woven',
        'https://aelbd.net/products/knitwear',
        'https://aelbd.net/products/sweater',
        'https://aelbd.net/blog/bsci-vs-sedex-compliance-standards-guide',
    ];

    let successCount = 0;
    let failCount = 0;

    for (const url of priorityUrls) {
        try {
            console.log(`Publishing indexing notification for: ${url}`);
            const res = await indexing.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: 'URL_UPDATED',
                },
            });
            console.log(`  ✓ OK (${res.status}): Notification logged at ${res.data.urlNotificationMetadata?.latestUpdate?.notifyTime || new Date().toISOString()}`);
            successCount++;
        } catch (err) {
            console.error(`  ✕ Error notifying ${url}:`, err.message);
            failCount++;
        }
    }

    console.log('\n====================================================');
    console.log(`INDEXING RUN COMPLETE: ${successCount} published, ${failCount} failed`);
    console.log('====================================================');
}

main().catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
});
