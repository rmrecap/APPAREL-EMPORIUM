const http = require('http');
const https = require('https');

const BASE_URL = process.env.VERIFY_URL || 'https://aelbd.net';
const client = BASE_URL.startsWith('https') ? https : http;

const ENDPOINTS = [
  // 1. Core Public Routes & Canonical SEO
  { path: '/', expectedStatus: 200, label: 'Homepage (LCP & Unified H1)' },
  { path: '/products', expectedStatus: 200, label: 'Product Catalog' },
  { path: '/about', expectedStatus: 200, label: 'Company Profile' },
  { path: '/contact', expectedStatus: 200, label: 'Contact Page' },
  { path: '/robots.txt', expectedStatus: 200, label: 'Robots.txt Crawl Control' },
  { path: '/sitemap.xml', expectedStatus: 200, label: 'Dynamic XML Sitemap' },

  // 2. In-Handler Security Guard Verifications (Unauthenticated Requests MUST reject)
  { path: '/api/users', expectedStatus: 401, label: 'Security: /api/users Guard' },
  { path: '/api/rfq', expectedStatus: 401, label: 'Security: /api/rfq Guard' },
  { path: '/api/backup', expectedStatus: 401, label: 'Security: /api/backup Guard' },
  { path: '/api/activity-log', expectedStatus: 401, label: 'Security: /api/activity-log Guard' },

  // 3. Public Filtered API Projections
  { path: '/api/products', expectedStatus: 200, label: 'Public Product Feed' },
  { path: '/api/settings', expectedStatus: 200, label: 'Public Settings (Secrets Filtered)' },
];

async function verifyEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint.path}`;
    client.get(url, (res) => {
      const passed = res.statusCode === endpoint.expectedStatus;
      const statusSymbol = passed ? '✓ [PASS]' : '✗ [FAIL]';
      console.log(`${statusSymbol} ${endpoint.label.padEnd(42)} | Expected: ${endpoint.expectedStatus} | Got: ${res.statusCode}`);
      resolve(passed);
    }).on('error', (err) => {
      console.log(`✗ [ERROR] ${endpoint.label.padEnd(42)} | ${err.message}`);
      resolve(false);
    });
  });
}

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(` POST-DEPLOYMENT SMOKE TEST: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let totalPassed = 0;
  for (const endpoint of ENDPOINTS) {
    const passed = await verifyEndpoint(endpoint);
    if (passed) totalPassed++;
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`SUMMARY: ${totalPassed} / ${ENDPOINTS.length} Passed`);
  console.log(`======================================================\n`);

  if (totalPassed !== ENDPOINTS.length) {
    process.exit(1);
  }
}

runAudit();
