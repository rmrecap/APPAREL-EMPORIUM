const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const JSON_BACKUP_PATH = path.join(__dirname, '..', 'prisma', 'catalog_backup_257_products.json');
const XML_OUTPUT_PATH = path.join(__dirname, '..', 'public', 'google-merchant-feed.xml');
const TSV_OUTPUT_PATH = path.join(__dirname, '..', 'public', 'google-merchant-feed.tsv');
const TXT_OUTPUT_PATH = path.join(__dirname, '..', 'public', 'google-merchant-products.txt');
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

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function cleanText(text) {
    if (!text) return '';
    return text.replace(/[\r\n\t]+/g, ' ').trim();
}

async function loadProducts() {
    try {
        const dbProds = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { id: 'asc' }
        });
        if (dbProds && dbProds.length > 0) {
            console.log(`✅ Loaded ${dbProds.length} products directly from database`);
            return dbProds;
        }
    } catch (err) {
        console.warn('⚠️ Prisma query failed, using JSON backup:', err.message);
    }

    if (fs.existsSync(JSON_BACKUP_PATH)) {
        const raw = fs.readFileSync(JSON_BACKUP_PATH, 'utf8');
        const prods = JSON.parse(raw);
        console.log(`✅ Loaded ${prods.length} products from ${JSON_BACKUP_PATH}`);
        return prods;
    }
    throw new Error('No product source available.');
}

async function main() {
    console.log('================================================================');
    console.log('📦 GENERATING GOOGLE MERCHANT CENTER FEEDS (XML & TSV)');
    console.log('================================================================');

    const products = await loadProducts();
    console.log(`📊 Processing ${products.length} products for Apparel Emporium (Merchant ID: 5915122173)...`);

    // 1. Generate Google Merchant Center RSS 2.0 XML Feed
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Apparel Emporium - Ready-to-Export Garment Catalog</title>
    <link>${BASE_URL}</link>
    <description>OEM/ODM apparel manufacturer and exporter catalog from Bangladesh. High quality knitwear, woven garments, denim, and sweaters.</description>
`;

    // 2. Generate Google Merchant Center TSV/TXT Header (matching Merchant SFTP spec)
    const tsvHeaders = [
        'id',
        'title',
        'description',
        'availability',
        'link',
        'image_link',
        'additional_image_link',
        'price',
        'identifier_exists',
        'mpn',
        'brand',
        'condition',
        'channel',
        'shipping',
        'included_destination',
        'excluded_destination',
        'gender',
        'age_group',
        'product_type',
        'google_product_category',
        'custom_label_0',
        'custom_label_1',
        'custom_label_2',
        'custom_label_3'
    ];
    const tsvRows = [tsvHeaders.join('\t')];

    for (const p of products) {
        const id = p.sku || `AE-${p.id.slice(-6)}`;
        const title = (p.name || p.title || 'Apparel Product').substring(0, 150);
        
        let desc = p.description || p.shortDescription || p.name || 'Export garment manufactured in Bangladesh by Apparel Emporium.';
        if (desc.length < 30) {
            desc = `${title}. Premium export-quality garment manufactured by Apparel Emporium in Bangladesh. Fabric construction, tailored fitting, and ethical manufacturing compliance.`;
        }
        desc = desc.substring(0, 5000);

        const link = `${BASE_URL}/products/${p.slug || p.id}`;
        const images = parseImages(p.images);
        const primaryImage = images.length > 0 ? images[0] : `${BASE_URL}/logo.jpg`;
        const additionalImages = images.slice(1, 11);

        const basePrice = parseBasePrice(p.priceRange);
        const priceStr = `${basePrice} USD`;
        const condition = 'new';
        const brand = p.brand || 'Apparel Emporium';
        const gender = mapGender(p.department);
        const ageGroup = mapAgeGroup(p.department, p.name);
        const productType = [p.department, p.divisionType, p.subCategory].filter(Boolean).join(' > ') || 'Apparel & Accessories > Clothing';
        const googleCategory = 'Apparel & Accessories > Clothing';

        // XML Item
        xml += `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
`;
        for (const addImg of additionalImages) {
            xml += `      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>\n`;
        }
        xml += `      <g:availability>in_stock</g:availability>
      <g:price>${priceStr}</g:price>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:channel>online</g:channel>
      <g:included_destination>Free_listings</g:included_destination>
      <g:excluded_destination>Free_local_listings</g:excluded_destination>
      <g:excluded_destination>Local_inventory_ads</g:excluded_destination>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard Shipping</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
      <g:gender>${gender}</g:gender>
      <g:age_group>${ageGroup}</g:age_group>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${escapeXml(id)}</g:mpn>
      <g:custom_label_0>${escapeXml(p.department || 'Apparel')}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(p.divisionType || 'Manufacturing')}</g:custom_label_1>
      <g:custom_label_2>${escapeXml(cleanText(p.minOrder || 'Flexible MOQ'))}</g:custom_label_2>
      <g:custom_label_3>Made in Bangladesh</g:custom_label_3>
    </item>
`;

        // TSV Row
        const tsvRow = [
            cleanText(id),
            cleanText(title),
            cleanText(desc),
            'in_stock',
            cleanText(link),
            cleanText(primaryImage),
            cleanText(additionalImages.join(',')),
            priceStr,
            'no',
            cleanText(id),
            brand,
            condition,
            'online',
            'US:Standard Shipping:0.00 USD',
            'Free_listings',
            'Free_local_listings,Local_inventory_ads',
            gender,
            ageGroup,
            cleanText(productType),
            googleCategory,
            cleanText(p.department || 'Apparel'),
            cleanText(p.divisionType || 'Manufacturing'),
            cleanText(p.minOrder || 'Flexible MOQ'),
            'Made in Bangladesh'
        ];
        tsvRows.push(tsvRow.join('\t'));
    }

    xml += `  </channel>
</rss>`;

    fs.writeFileSync(XML_OUTPUT_PATH, xml, 'utf8');
    console.log(`✅ Saved XML Feed: ${XML_OUTPUT_PATH} (${fs.statSync(XML_OUTPUT_PATH).size} bytes)`);

    fs.writeFileSync(TSV_OUTPUT_PATH, tsvRows.join('\n'), 'utf8');
    console.log(`✅ Saved TSV Feed: ${TSV_OUTPUT_PATH} (${fs.statSync(TSV_OUTPUT_PATH).size} bytes)`);

    fs.writeFileSync(TXT_OUTPUT_PATH, tsvRows.join('\n'), 'utf8');
    console.log(`✅ Saved TXT Feed: ${TXT_OUTPUT_PATH} (${fs.statSync(TXT_OUTPUT_PATH).size} bytes)`);

    console.log('================================================================');
    console.log('🎉 GOOGLE MERCHANT FEEDS GENERATED SUCCESSFULLY');
    console.log(`   - File: public/google-merchant-feed.xml (${products.length} products)`);
    console.log(`   - File: public/google-merchant-feed.tsv (${products.length} products)`);
    console.log(`   - Live XML Feed URL: ${BASE_URL}/google-merchant-feed.xml`);
    console.log(`   - Live TSV Feed URL: ${BASE_URL}/google-merchant-feed.tsv`);
    console.log('================================================================');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
