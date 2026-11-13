const https = require('https');

async function checkUrl(url) {
  const res = await fetch(url);
  const text = await res.text();
  return { status: res.status, text };
}

async function run() {
  console.log('--- 1. Testing Homepage Schema ---');
  const home = await checkUrl('https://aelbd.net/');
  console.log('Homepage status:', home.status);
  console.log('Contains ItemList:', home.text.includes('"ItemList"'));
  console.log('Contains Service:', home.text.includes('"Service"'));
  console.log('Contains Retail Product:', home.text.includes('"Product"'));
  console.log('Contains Retail Offer:', home.text.includes('"Offer"') || home.text.includes('"offers"'));
  console.log('Contains telephone:', home.text.includes('"telephone"'));
  console.log('Contains Uttara address:', home.text.includes('Uttara'));

  console.log('\n--- 2. Testing Products Page ---');
  const products = await checkUrl('https://aelbd.net/products');
  console.log('Products status:', products.status);
  console.log('Contains Showing page:', products.text.includes('Showing page'));
  console.log('Contains 257 export garments:', products.text.includes('257 export garments'));
  console.log('Contains pagination ellipsis (...):', products.text.includes('...'));

  console.log('\n--- 3. Testing Single Product Page Schema ---');
  // Grab first product id
  const apiRes = await fetch('https://aelbd.net/api/products?limit=1');
  const apiData = await apiRes.json();
  const firstId = apiData.products[0].id;
  const prodPage = await checkUrl(`https://aelbd.net/products/${firstId}`);
  console.log(`Product ${firstId} status:`, prodPage.status);
  console.log('Product page contains Service:', prodPage.text.includes('"Service"'));
  console.log('Product page contains retail Offer:', prodPage.text.includes('"Offer"') || prodPage.text.includes('"offers"'));
  console.log('Product page contains B2B RFQ button:', prodPage.text.includes('Request B2B Quotation') || prodPage.text.includes('Request Quotation'));

  console.log('\n--- 4. Testing MCP Route ---');
  const mcpRes = await fetch('https://aelbd.net/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
  });
  const mcpData = await mcpRes.json();
  console.log('MCP status:', mcpRes.status);
  const toolNames = mcpData.result?.tools?.map(t => t.name) || [];
  console.log('MCP Registered Tools:', toolNames);
}

run().catch(console.error);
