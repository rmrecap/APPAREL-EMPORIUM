const http = require('http');

const BASE_URL = 'http://localhost:3000';

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      }
    }, (res) => {
      let bodyStr = '';
      res.on('data', chunk => bodyStr += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(bodyStr); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: json || bodyStr });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTING INPUT VALIDATION & RATE LIMITING ---\n');
  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${title}`);
      passed++;
    } else {
      console.log(`✗ [FAIL] ${title} - ${extra}`);
    }
  }

  const testIp = '198.51.100.' + Math.floor(Math.random() * 200 + 10);
  const ipHeaders = { 'x-forwarded-for': testIp };

  // 1. Contact validation: invalid email
  const c1 = await post('/api/contact', {
    name: 'John Doe',
    email: 'not-an-email',
    message: 'Hello, I want to inquire about knitwear production.'
  }, ipHeaders);
  assert('Contact: Reject invalid email', c1.status === 400, `Got: ${c1.status}`);

  // 2. Contact validation: message too short
  const c2 = await post('/api/contact', {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hi'
  }, ipHeaders);
  assert('Contact: Reject short message (<10 chars)', c2.status === 400, `Got: ${c2.status}`);

  // 3. Contact validation: valid submission
  const c3 = await post('/api/contact', {
    name: 'Valid Buyer',
    email: 'valid.buyer@example.com',
    company: 'Apparel Global Ltd',
    phone: '+1 555-0199',
    message: 'We are looking for bulk polo t-shirts in 100% combed cotton.'
  }, ipHeaders);
  assert('Contact: Accept valid submission', c3.status === 200 && c3.body.success === true, `Got: ${c3.status}`);

  // 4. RFQ validation: invalid quantity
  const r1 = await post('/api/rfq', {
    buyerName: 'Jane Smith',
    buyerEmail: 'jane@buyer.com',
    quantity: 'invalid-number'
  }, ipHeaders);
  assert('RFQ: Reject non-numeric quantity', r1.status === 400, `Got: ${r1.status}`);

  // 5. RFQ validation: negative quantity
  const r2 = await post('/api/rfq', {
    buyerName: 'Jane Smith',
    buyerEmail: 'jane@buyer.com',
    quantity: -50
  }, ipHeaders);
  assert('RFQ: Reject negative quantity', r2.status === 400, `Got: ${r2.status}`);

  // 6. RFQ validation: valid RFQ
  const r3 = await post('/api/rfq', {
    buyerName: 'Jane Smith',
    buyerEmail: 'jane.smith@corporate-buyer.com',
    buyerCompany: 'Nordic Retail Group',
    buyerCountry: 'Sweden',
    buyerPhone: '+46 8 123 456',
    quantity: 2500,
    targetPrice: '$4.50 / pc',
    specialRequirements: 'Enzyme wash, individual polybags, Oeko-Tex certification.'
  }, ipHeaders);
  assert('RFQ: Accept valid RFQ', r3.status === 200 && r3.body.success === true, `Got: ${r3.status}`);

  // 7. Rate Limiter: Send 5 rapid requests from dedicated test IP
  const rateLimitIp = '203.0.113.' + Math.floor(Math.random() * 200 + 10);
  const rlHeaders = { 'x-forwarded-for': rateLimitIp };

  console.log(`\nTesting Rate Limiting on IP: ${rateLimitIp}`);
  let lastStatus = 0;
  for (let i = 1; i <= 6; i++) {
    const res = await post('/api/contact', {
      name: `Rate Limit Test ${i}`,
      email: `test${i}@test.com`,
      message: 'This is a valid test message for checking rate limiting.'
    }, rlHeaders);
    lastStatus = res.status;
    console.log(`  Request #${i} -> Status: ${res.status}`);
  }

  assert('Rate Limiter: Trigger HTTP 429 Too Many Requests on 6th request', lastStatus === 429, `Got: ${lastStatus}`);

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} Passed`);
  console.log(`========================================\n`);

  if (passed !== total) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
