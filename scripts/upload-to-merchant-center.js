/**
 * Google Merchant Center Product Uploader (Content API for Shopping v2.1)
 * Merchant ID: 5915122173
 * Store: Apparel Emporium (https://www.aelbd.net)
 */
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const MERCHANT_ID = '5915122173';
const SERVICE_ACCOUNT_KEY = 'c:/Users/DELL/Downloads/service-account.json';
const JSON_BACKUP_PATH = path.join(__dirname, '..', 'prisma', 'catalog_backup_257_products.json');
const BASE_URL = 'https://www.aelbd.net';

function parseImages(rawImages) {
    if (!rawImages) return [];
    try {
        const parsed = typeof rawImages === 'string' ? JSON.parse(rawImages) : rawImages;
        if (!Array.isArray(parsed)) return [parsed];
        const urls = [];
        for (const item of parsed) {
            let u = '';
            if (typeof item === 'string') u = item.trim();
            else if (item && typeof item === 'object') u = (item.url || item.src || item.path || '').trim();
            if (u) {
                if (!u.startsWith('http://') && !u.startsWith('https://')) {
                    const clean = u.startsWith('/') ? u : `/${u}`;
                    u = `${BASE_URL}${clean}`;
                }
                urls.push(u);
            }
        }
        return urls;
    } catch {
        return [];
    }
}

function parseBasePrice(priceRange) {
    if (!priceRange) return '3.50';
    const match = priceRange.match(/\$?(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]).toFixed(2) : '3.50';
}

function mapGender(department) {
    const dept = (department || '').toLowerCase();
    if (dept.includes('women') || dept.includes('female') || dept.includes('girl')) return 'female';
    if (dept.includes('men') || dept.includes('male') || dept.includes('boy')) return 'male';
    return 'unisex';
}

function mapAgeGroup(department, name) {
    const combined = `${department || ''} ${name || ''}`.toLowerCase();
    if (combined.includes('kid') || combined.includes('child') || combined.includes('boy') || combined.includes('girl') || combined.includes('infant') || combined.includes('baby')) {
        return 'kids';
    }
    return 'adult';
}

async function loadProducts() {
    try {
        const dbProds = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { id: 'asc' }
        });
        if (dbProds && dbProds.length > 0) {
            console.log(`✅ Loaded ${dbProds.length} products from database`);
            return dbProds;
        }
    } catch (err) {
        console.warn('⚠️ Could not load from DB, falling back to JSON:', err.message);
    }

    if (fs.existsSync(JSON_BACKUP_PATH)) {
        const raw = fs.readFileSync(JSON_BACKUP_PATH, 'utf8');
        const prods = JSON.parse(raw);
        console.log(`✅ Loaded ${prods.length} products from ${JSON_BACKUP_PATH}`);
        return prods;
    }
    throw new Error('No products available for upload.');
}

function transformToGoogleProduct(p) {
    const offerId = p.sku || `AE-${p.id.slice(-6)}`;
    const title = (p.name || p.title || 'Apparel Product').substring(0, 150);
    let desc = p.description || p.shortDescription || p.name || 'Export garment manufactured in Bangladesh by Apparel Emporium.';
    if (desc.length < 30) {
        desc = `${title}. Premium export-quality garment manufactured by Apparel Emporium in Bangladesh. Fabric construction, tailored fitting, and ethical manufacturing compliance.`;
    }
    desc = desc.substring(0, 5000);

    const link = `${BASE_URL}/products/${p.slug || p.id}`;
    const images = parseImages(p.images);
    const primaryImage = images.length > 0 ? images[0] : `${BASE_URL}/logo.jpg`;
    const additionalImages = images.slice(1, 10);
    const basePrice = parseBasePrice(p.priceRange);

    return {
        offerId: offerId,
        title: title,
        description: desc,
        link: link,
        imageLink: primaryImage,
        additionalImageLinks: additionalImages,
        contentLanguage: 'en',
        targetCountry: 'US',
        feedLabel: 'US',
        channel: 'online',
        availability: 'in stock',
        condition: 'new',
        googleProductCategory: 'Apparel & Accessories > Clothing',
        brand: p.brand || 'Apparel Emporium',
        price: {
            value: basePrice,
            currency: 'USD'
        },
        productTypes: [p.department, p.divisionType, p.subCategory].filter(Boolean),
        gender: mapGender(p.department),
        ageGroup: mapAgeGroup(p.department, p.name),
        identifierExists: false,
        mpn: offerId,
        customAttributes: [
            { name: 'department', value: p.department || 'Apparel' },
            { name: 'division', value: p.divisionType || 'Manufacturing' },
            { name: 'min_order', value: p.minOrder || 'Flexible MOQ' },
            { name: 'origin', value: 'Made in Bangladesh' }
        ]
    };
}

async function uploadToMerchantCenter() {
    console.log('================================================================');
    console.log('🚀 GOOGLE MERCHANT CENTER PRODUCT SYNC & UPLOADER');
    console.log(`   Merchant Center ID: ${MERCHANT_ID}`);
    console.log(`   Service Account: ${SERVICE_ACCOUNT_KEY}`);
    console.log('================================================================');

    if (!fs.existsSync(SERVICE_ACCOUNT_KEY)) {
        throw new Error(`Service account file not found at: ${SERVICE_ACCOUNT_KEY}`);
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_KEY,
        scopes: ['https://www.googleapis.com/auth/content']
    });

    const content = google.content({
        version: 'v2.1',
        auth: auth
    });

    // 1. Check API Connection & Account Access
    console.log(`🔍 Checking access to Merchant Account ${MERCHANT_ID}...`);
    try {
        const account = await content.accounts.get({
            merchantId: MERCHANT_ID,
            accountId: MERCHANT_ID
        });
        console.log(`✅ Connected successfully to Google Merchant Account!`);
        console.log(`   Account Name: ${account.data.name}`);
        console.log(`   Website: ${account.data.websiteUrl || 'Not set'}`);
    } catch (err) {
        console.error('\n❌ Google Merchant Center Connection Failed!');
        console.error(`   Message: ${err.message}`);
        if (err.message && err.message.includes('Content API for Shopping has not been used')) {
            console.error('\n👉 ACTION REQUIRED: Content API for Shopping is NOT enabled in your Google Cloud Project.');
            console.error('   Click this direct link to enable it:');
            console.error('   https://console.developers.google.com/apis/api/shoppingcontent.googleapis.com/overview?project=merchant-api-515608\n');
        } else if (err.message && (err.message.includes('User cannot access merchant') || err.message.includes('permission'))) {
            console.error('\n👉 ACTION REQUIRED: Service Account email is not added to Google Merchant Center.');
            console.error('   1. Go to https://merchants.google.com/');
            console.error('   2. Select account 5915122173');
            console.error('   3. Go to Settings ⚙️ > People and access');
            console.error('   4. Add user: merchant-api-uploader@merchant-api-515608.iam.gserviceaccount.com');
            console.error('   5. Give Standard or Admin role.\n');
        }
        return false;
    }

    // 2. Load and Prepare Products
    const products = await loadProducts();
    console.log(`\n📦 Transforming ${products.length} products for Google Shopping...`);

    const googleProducts = products.map(transformToGoogleProduct);

    // 3. Batch Upload via custombatch (50 items per batch)
    const BATCH_SIZE = 50;
    const totalBatches = Math.ceil(googleProducts.length / BATCH_SIZE);
    let totalSuccess = 0;
    let totalErrors = 0;

    for (let b = 0; b < totalBatches; b++) {
        const batchSlice = googleProducts.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        console.log(`\n📤 Uploading Batch ${b + 1}/${totalBatches} (${batchSlice.length} products)...`);

        const batchEntries = batchSlice.map((prod, idx) => ({
            batchId: b * BATCH_SIZE + idx + 1,
            merchantId: MERCHANT_ID,
            method: 'insert',
            product: prod
        }));

        try {
            const batchRes = await content.products.custombatch({
                requestBody: {
                    entries: batchEntries
                }
            });

            const entries = batchRes.data.entries || [];
            for (const entry of entries) {
                if (entry.errors && entry.errors.errors && entry.errors.errors.length > 0) {
                    totalErrors++;
                    console.error(`  ⚠️ Item ${entry.batchId} Error: ${entry.errors.errors[0].message}`);
                } else {
                    totalSuccess++;
                }
            }
            console.log(`  ✅ Batch ${b + 1} completed: ${batchSlice.length - (entries.filter(e => e.errors).length)} succeeded.`);
        } catch (batchErr) {
            console.error(`  ❌ Batch ${b + 1} fatal error:`, batchErr.message);
            totalErrors += batchSlice.length;
        }
    }

    console.log('\n================================================================');
    console.log(`🎉 UPLOAD SUMMARY`);
    console.log(`   Total Products Processed: ${googleProducts.length}`);
    console.log(`   Successfully Inserted: ${totalSuccess}`);
    console.log(`   Errors / Skipped: ${totalErrors}`);
    console.log('================================================================');
    return totalSuccess > 0;
}

uploadToMerchantCenter()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
