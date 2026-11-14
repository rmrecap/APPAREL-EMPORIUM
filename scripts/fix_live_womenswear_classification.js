const https = require('https');

const productsToFix = [
  { id: 'cmwfm7c2g000hso9ijol4vuhw', name: "Women's Striped Long-Sleeve Top - Grey", isHoodie: false },
  { id: 'cmwflm556000fso9ic03yuutw', name: "Women's Acid-Wash Top - Dark Grey", isHoodie: false },
  { id: 'cmwfj55gq000dso9iphi89j3q', name: "Women's Swirl-Print Top - Cream", isHoodie: false },
  { id: 'cmwfiaovi000bso9ij2u5t4ey', name: "Women's Hoodie - Pink", isHoodie: true },
  { id: 'cmwfhhb2j0009so9ir9th60cc', name: "Women's Floral T-Shirt - Navy", isHoodie: false },
  { id: 'cmwfgi2rn0007so9i7nj3r0cu', name: "Women's Floral T-Shirt - White", isHoodie: false },
  { id: 'cmwffrz2s0005so9i4nqtsthi', name: "Women's Cross-Strap T-Shirt - Green", isHoodie: false },
  { id: 'cmwfdskbn0003so9igiouzdid', name: "Women's Striped T-Shirt - Light Blue and White", isHoodie: false },
  { id: 'cmwfcy6f70001so9im11znnez', name: "Women's Slogan T-Shirt - Dark Grey", isHoodie: false },
  { id: 'cmwfbz8ik0005s3gqleaxg3qt', name: "Women's Striped Henley T-Shirt - Grey and Black", isHoodie: false },
  { id: 'cmwf9uxvo0003s3gqtoaw8a5l', name: "Women's Sequin-Shoulder T-Shirt - Light Blue", isHoodie: false },
  { id: 'cmwf936k20001s3gqf47rusx7', name: "Women's Embroidered T-Shirt - Coral", isHoodie: false },
];

const WOMENS_TSHIRT_CAT = 'cmun39g1w001rwrdyh4fhz6vx';
const WOMENS_HOODIE_CAT = 'cmun39g2r001vwrdynchyvtz4';

function callMCP(tool, args) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: tool,
        arguments: args
      }
    });

    const req = https.request('https://aelbd.net/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'ae_1y7wso8ijykx7rbc'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log(`Starting classification fix for ${productsToFix.length} products on live aelbd.net...`);

  for (const item of productsToFix) {
    const categoryId = item.isHoodie ? WOMENS_HOODIE_CAT : WOMENS_TSHIRT_CAT;
    console.log(`Fixing ${item.name} (${item.id})...`);

    const result = await callMCP('classify_and_correct_product', {
      productId: item.id,
      department: 'Womenswear',
      divisionType: 'Knit',
      categoryId: categoryId,
      dryRun: false
    });

    if (result.error) {
      console.error(`Error fixing ${item.id}:`, result.error);
    } else {
      const resText = result.result?.content?.[0]?.text;
      console.log(`Result:`, resText ? JSON.parse(resText) : result);
    }
  }

  console.log('All products fixed! Now verifying taxonomy breakdown...');
  const overview = await callMCP('get_taxonomy_overview', {});
  console.log('Updated Overview:', JSON.parse(overview.result.content[0].text));
}

run().catch(console.error);
