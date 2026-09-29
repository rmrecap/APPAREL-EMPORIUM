const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed,
                });
            });
        });

        req.on('error', (err) => reject(err));

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('=== DEFENSIVE API SECURITY HARDENING VERIFICATION ===\n');
    let passed = 0;
    let failed = 0;

    async function test(name, method, path, expectedStatus, validator = null, body = null) {
        try {
            const res = await makeRequest(method, path, body);
            const statusMatch = res.status === expectedStatus;
            let customCheck = true;
            let checkMsg = '';

            if (validator) {
                const checkRes = validator(res);
                if (checkRes !== true) {
                    customCheck = false;
                    checkMsg = ` (${checkRes})`;
                }
            }

            if (statusMatch && customCheck) {
                console.log(`\x1b[32m[PASS]\x1b[0m ${name} -> HTTP ${res.status}`);
                passed++;
            } else {
                console.log(`\x1b[31m[FAIL]\x1b[0m ${name} -> Expected ${expectedStatus}, got ${res.status}${checkMsg}`);
                failed++;
            }
        } catch (err) {
            console.log(`\x1b[31m[ERROR]\x1b[0m ${name} -> ${err.message}`);
            failed++;
        }
    }

    console.log('--- 1. In-Handler Authorization Guards (Unauthenticated Access Rejected) ---');
    await test('GET /api/users (User list)', 'GET', '/api/users', 401);
    await test('POST /api/users (User create)', 'POST', '/api/users', 401, null, { name: 'attacker' });
    await test('PUT /api/users/fake-id (User edit)', 'PUT', '/api/users/fake-id', 401, null, { name: 'attacker' });
    await test('DELETE /api/users/fake-id (User delete)', 'DELETE', '/api/users/fake-id', 401);
    await test('GET /api/rfq (Buyer RFQs view)', 'GET', '/api/rfq', 401);
    await test('POST /api/settings (Site settings update)', 'POST', '/api/settings', 401, null, { key: 'test', value: '123' });
    await test('POST /api/products (Product create)', 'POST', '/api/products', 401, null, { name: 'hacked' });
    await test('PUT /api/products/fake-id (Product edit)', 'PUT', '/api/products/fake-id', 401, null, { name: 'hacked' });
    await test('DELETE /api/products/fake-id (Product delete)', 'DELETE', '/api/products/fake-id', 401);
    await test('POST /api/categories (Category create)', 'POST', '/api/categories', 401, null, { name: 'hacked' });
    await test('PUT /api/categories/fake-id (Category edit)', 'PUT', '/api/categories/fake-id', 401, null, { name: 'hacked' });
    await test('DELETE /api/categories/fake-id (Category delete)', 'DELETE', '/api/categories/fake-id', 401);
    await test('POST /api/blog (Blog post create)', 'POST', '/api/blog', 401, null, { title: 'spam' });
    await test('PATCH /api/blog/fake-slug (Blog post update)', 'PATCH', '/api/blog/fake-slug', 401, null, { title: 'spam' });
    await test('DELETE /api/blog/fake-slug (Blog post delete)', 'DELETE', '/api/blog/fake-slug', 401);
    await test('GET /api/contact (Contact inquiries list)', 'GET', '/api/contact', 401);
    await test('POST /api/upload (Media upload)', 'POST', '/api/upload', 401);
    await test('GET /api/media (Media list)', 'GET', '/api/media', 401);
    await test('GET /api/activity-log (Audit logs)', 'GET', '/api/activity-log', 401);
    await test('GET /api/backup (Database dump)', 'GET', '/api/backup', 401);
    await test('POST /api/backup (Database restore)', 'POST', '/api/backup', 401);
    await test('GET /api/popups?admin=true (Admin popups list)', 'GET', '/api/popups?admin=true', 401);
    await test('POST /api/popups (Popup create)', 'POST', '/api/popups', 401, null, { name: 'spam' });
    await test('POST /api/email/send (Email dispatch)', 'POST', '/api/email/send', 401, null, { to: 'victim@test.com' });
    await test('POST /api/email/test (SMTP verify)', 'POST', '/api/email/test', 401, null, { to: 'test@test.com' });
    await test('GET /api/forms (Forms admin list)', 'GET', '/api/forms', 401);
    await test('POST /api/forms (Form create)', 'POST', '/api/forms', 401, null, { name: 'phish' });
    await test('GET /api/forms/fake-id/submissions (Submissions view)', 'GET', '/api/forms/fake-id/submissions', 401);
    await test('POST /api/delivery-feed (Delivery create without auth/key)', 'POST', '/api/delivery-feed', 401, null, { title: 'fake' });
    await test('PUT /api/delivery-feed/fake-id (Delivery edit without auth/key)', 'PUT', '/api/delivery-feed/fake-id', 401, null, { title: 'fake' });
    await test('DELETE /api/delivery-feed/fake-id (Delivery delete without auth/key)', 'DELETE', '/api/delivery-feed/fake-id', 401);
    await test('GET /api/telegram/webhook (Telegram admin info/sync)', 'GET', '/api/telegram/webhook', 401);
    await test('POST /api/videos (Video sync/add mutation)', 'POST', '/api/videos', 401, null, { action: 'sync' });
    await test('POST /api/update (System rebuild / command trigger)', 'POST', '/api/update', 401, null, { action: 'restart' });
    await test('GET /api/update (Git and system version probe)', 'GET', '/api/update', 401);

    console.log('\n--- 2. Data Partitioning & Safe Projections (Public Responses) ---');
    await test('GET /api/products (Public catalog active products only)', 'GET', '/api/products', 200, (res) => {
        if (!res.body || !Array.isArray(res.body.products)) return 'No products array';
        return true;
    });

    await test('GET /api/categories (Public categories)', 'GET', '/api/categories', 200, (res) => {
        if (!Array.isArray(res.body)) return 'Not an array of categories';
        return true;
    });

    await test('GET /api/blog (Public blog posts omit author email)', 'GET', '/api/blog', 200, (res) => {
        if (!res.body || !Array.isArray(res.body.posts)) return 'No posts array';
        for (const post of res.body.posts) {
            if (post.author && post.author.email) {
                return `Leaked author email: ${post.author.email}`;
            }
        }
        return true;
    });

    await test('GET /api/settings (Public settings filter out sensitive secrets)', 'GET', '/api/settings', 200, (res) => {
        if (!res.body || !res.body.settings) return 'No settings object';
        const settings = res.body.settings;
        if (settings.api_external_key || settings.smtp_password || settings.telegram_bot_token) {
            return 'Sensitive keys leaked in public settings response';
        }
        return true;
    });

    await test('GET /api/popups (Public popups view)', 'GET', '/api/popups', 200, (res) => {
        if (!res.body || !Array.isArray(res.body.popups)) return 'No popups array';
        return true;
    });

    console.log(`\n========================================`);
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log(`========================================\n`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
