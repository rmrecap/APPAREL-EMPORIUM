const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function testConnection() {
    const keyPath = path.resolve(__dirname, '../gsc-key.json');
    if (!fs.existsSync(keyPath)) {
        console.error('ERROR: gsc-key.json not found at:', keyPath);
        process.exit(1);
    }

    console.log('Loading Service Account credentials from:', keyPath);
    const auth = new google.auth.GoogleAuth({
        keyFile: keyPath,
        scopes: [
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/indexing',
        ],
    });

    const authClient = await auth.getClient();
    console.log('✓ Successfully authenticated as:', authClient.email);

    // 1. Search Console API
    console.log('\n--- 1. Testing Google Search Console API ---');
    const searchconsole = google.searchconsole({ version: 'v1', auth });

    try {
        const sitesRes = await searchconsole.sites.list();
        console.log('Sites found in Search Console:');
        if (sitesRes.data.siteEntry && sitesRes.data.siteEntry.length > 0) {
            sitesRes.data.siteEntry.forEach((entry) => {
                console.log(`  - URL: ${entry.siteUrl} | Permission Level: ${entry.permissionLevel}`);
            });
        } else {
            console.log('  No verified sites returned by sites.list(). Checking direct properties...');
        }
    } catch (err) {
        console.error('Error listing sites:', err.message);
    }

    const testProperties = ['sc-domain:aelbd.net', 'https://aelbd.net/', 'https://www.aelbd.net/'];
    for (const prop of testProperties) {
        try {
            console.log(`Testing query on property: "${prop}"...`);
            const sitemapsRes = await searchconsole.sitemaps.list({ siteUrl: prop });
            console.log(`  ✓ Successfully accessed property "${prop}". Sitemaps found: ${sitemapsRes.data.sitemap?.length || 0}`);
            if (sitemapsRes.data.sitemap) {
                sitemapsRes.data.sitemap.forEach(s => console.log(`     - Path: ${s.path}, Last Submitted: ${s.lastSubmitted}`));
            }
        } catch (err) {
            console.log(`  - Property "${prop}": ${err.message}`);
        }
    }

    // 2. Indexing API
    console.log('\n--- 2. Testing Web Search Indexing API ---');
    const indexing = google.indexing({ version: 'v3', auth });
    try {
        const testUrl = 'https://aelbd.net/';
        console.log(`Testing Indexing API metadata status for: ${testUrl}...`);
        const metadataRes = await indexing.urlNotifications.getMetadata({
            url: testUrl,
        });
        console.log('  ✓ Indexing API Metadata Response:', JSON.stringify(metadataRes.data, null, 2));
    } catch (err) {
        console.log(`  Indexing API status info: ${err.message}`);
    }

    console.log('\n✓ Diagnostic complete.');
}

testConnection().catch((err) => {
    console.error('Fatal error during test:', err);
    process.exit(1);
});
