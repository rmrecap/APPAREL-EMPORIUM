/**
 * VibeSec & System Security / Agent-Readiness Audit
 * Inspired by BehiSecc/VibeSec-Skill security and agent-readiness guidelines.
 */
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log(' 🛡️ RUNNING VIBESEC SECURITY & AGENT AUDIT');
console.log('====================================================');

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
    if (condition) {
        console.log(`[PASS] ${label}`);
        passed++;
    } else {
        console.error(`[FAIL] ${label} - ${detail}`);
        failed++;
    }
}

// 1. CVE-2025-29927 Check in middleware
const middlewarePath = path.join(__dirname, '..', 'src', 'middleware.ts');
const middlewareContent = fs.existsSync(middlewarePath) ? fs.readFileSync(middlewarePath, 'utf8') : '';
check(
    'CVE-2025-29927 Next.js subrequest bypass mitigation',
    middlewareContent.includes('x-middleware-subrequest'),
    'Middleware must reject x-middleware-subrequest headers'
);

// 2. robots.txt Content-Signal check
const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
const robotsContent = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8') : '';
check(
    'robots.txt declares Content-Signal',
    robotsContent.includes('Content-Signal: search=yes, ai-train=no'),
    'public/robots.txt must declare Content-Signal'
);

// 3. llms.txt check
const llmsPath = path.join(__dirname, '..', 'public', 'llms.txt');
const llmsContent = fs.existsSync(llmsPath) ? fs.readFileSync(llmsPath, 'utf8') : '';
check(
    'llms.txt exists and provides site summary',
    fs.existsSync(llmsPath) && llmsContent.includes('Apparel Emporium'),
    'public/llms.txt must exist and describe the business'
);

// 4. MCP Server Card (SEP-1649) check
const serverCardPath = path.join(__dirname, '..', 'public', '.well-known', 'mcp', 'server-card.json');
check(
    'MCP Server Card (SEP-1649) published',
    fs.existsSync(serverCardPath),
    'public/.well-known/mcp/server-card.json must exist'
);

// 5. Product catalog backup check
const backupPath = path.join(__dirname, '..', 'prisma', 'catalog_backup_174_products.json');
check(
    'Product catalog backup exists (174 products protected)',
    fs.existsSync(backupPath),
    'prisma/catalog_backup_174_products.json must be preserved'
);

// 6. WebMCP and schema in layout
const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
const layoutContent = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : '';
check(
    'Organization / LocalBusiness schema includes telephone and offers',
    layoutContent.includes('+88 02 4895 5519') && layoutContent.includes('priceCurrency') && layoutContent.includes('LocalBusiness'),
    'layout.tsx schema must include telephone, LocalBusiness and Product Offer'
);
check(
    'WebMCP in-browser tools registered',
    layoutContent.includes('modelContext.registerTool'),
    'layout.tsx must register WebMCP tools'
);

// 7. Homepage single <h1> check
const categoryStagePath = path.join(__dirname, '..', 'src', 'components', 'home', 'Category3DStage.tsx');
const categoryStageContent = fs.existsSync(categoryStagePath) ? fs.readFileSync(categoryStagePath, 'utf8') : '';
check(
    'Homepage has exactly one primary <h1>',
    categoryStageContent.includes('<h1'),
    'Category3DStage.tsx must contain <h1>'
);

console.log('====================================================');
console.log(` AUDIT RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
    process.exit(1);
}

