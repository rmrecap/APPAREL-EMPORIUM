/**
 * Localizes ALL remote product images (Google Drive, iili.io, etc.) into /public/uploads/products/,
 * updates Product.images + Product.ogImage + schema columns in SQLite (prisma/dev.db),
 * registers all files in /public/uploads/* into MediaFile table,
 * and updates prisma/catalog_backup_257_products.json.
 *
 * Usage: node scripts/localize-and-sync-media.js [--skip-download] [--db-only]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const CWD = process.cwd();
const UPLOAD_ROOT = path.join(CWD, 'public', 'uploads');
const PRODUCTS_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'products');
const CACHE_DIR = path.join(UPLOAD_ROOT, 'cache');

function detectImageFormat(buffer) {
    if (!buffer || buffer.length < 16) return null;
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { ext: '.jpg', mimeType: 'image/jpeg' };
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return { ext: '.png', mimeType: 'image/png' };
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
        return { ext: '.gif', mimeType: 'image/gif' };
    }
    if (
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
        return { ext: '.webp', mimeType: 'image/webp' };
    }
    const head = buffer.subarray(0, 256).toString('utf8').trim().toLowerCase();
    if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
        return { ext: '.svg', mimeType: 'image/svg+xml' };
    }
    return null;
}

function getMimeFromExt(ext) {
    switch (ext.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        case '.pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
}

function extractGoogleDriveFileId(url) {
    if (!url) return null;
    const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (lh3Match) return lh3Match[1];
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];
    const idParamMatch = url.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?[^#]*\bid=([a-zA-Z0-9_-]+)/);
    if (idParamMatch) return idParamMatch[1];
    return null;
}

function getCacheFilename(url) {
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 16);
    const base = path.basename(url.split('?')[0]).replace(/[^a-zA-Z0-9._-]/g, '_');
    return `cached_${hash}_${base}`;
}

function getStemForUrl(url) {
    const driveId = extractGoogleDriveFileId(url);
    if (driveId) return `gd-${driveId}`;
    const urlHash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
    const cleanBase = path.basename(url.split('?')[0]).replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 32) || 'img';
    return `ext-${cleanBase}-${urlHash}`;
}

function findExistingLocalFileByStem(dir, stem) {
    for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.gif']) {
        const candidate = `${stem}${ext}`;
        const full = path.join(dir, candidate);
        if (fs.existsSync(full) && fs.statSync(full).size > 200) {
            return candidate;
        }
    }
    return null;
}

async function fetchBufferWithRetries(url, retries = 3) {
    const driveId = extractGoogleDriveFileId(url);
    const candidates = driveId
        ? [`https://lh3.googleusercontent.com/d/${driveId}`, `https://drive.google.com/uc?export=download&id=${driveId}`]
        : [url];

    for (const target of candidates) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 20000);
                const res = await fetch(target, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                    },
                });
                clearTimeout(timer);
                if (!res.ok) {
                    if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * attempt));
                    continue;
                }
                const buf = Buffer.from(await res.arrayBuffer());
                if (detectImageFormat(buf)) return buf;
            } catch {
                if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * attempt));
            }
        }
    }
    return null;
}

async function downloadAllRemoteUrls(uniqueUrls, skipDownload) {
    if (!fs.existsSync(PRODUCTS_UPLOAD_DIR)) {
        fs.mkdirSync(PRODUCTS_UPLOAD_DIR, { recursive: true });
    }

    const urlToLocalMap = new Map();
    const toDownload = [];

    for (const url of uniqueUrls) {
        const stem = getStemForUrl(url);
        const existing = findExistingLocalFileByStem(PRODUCTS_UPLOAD_DIR, stem);
        if (existing) {
            urlToLocalMap.set(url, `/uploads/products/${existing}`);
            continue;
        }
        // Check cache directory
        const cacheFile = path.join(CACHE_DIR, getCacheFilename(url));
        if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 200) {
            const buf = fs.readFileSync(cacheFile);
            const detected = detectImageFormat(buf);
            if (detected) {
                const fileName = `${stem}${detected.ext}`;
                fs.writeFileSync(path.join(PRODUCTS_UPLOAD_DIR, fileName), buf);
                urlToLocalMap.set(url, `/uploads/products/${fileName}`);
                continue;
            }
        }
        if (!skipDownload) {
            toDownload.push(url);
        }
    }

    console.log(`📦 Already local/cached: ${urlToLocalMap.size} | Need network download: ${toDownload.length}`);

    if (toDownload.length === 0) {
        return { urlToLocalMap, downloaded: 0, failed: [] };
    }

    let index = 0;
    let downloaded = 0;
    const failed = [];
    const concurrency = 20;

    async function worker() {
        while (true) {
            const currentIdx = index++;
            if (currentIdx >= toDownload.length) break;
            const url = toDownload[currentIdx];
            const stem = getStemForUrl(url);

            const buf = await fetchBufferWithRetries(url, 3);
            if (buf) {
                const detected = detectImageFormat(buf);
                if (detected) {
                    const fileName = `${stem}${detected.ext}`;
                    fs.writeFileSync(path.join(PRODUCTS_UPLOAD_DIR, fileName), buf);
                    urlToLocalMap.set(url, `/uploads/products/${fileName}`);
                    downloaded++;
                    if ((downloaded + failed.length) % 100 === 0 || currentIdx === toDownload.length - 1) {
                        console.log(`   Progress: ${downloaded + failed.length}/${toDownload.length} (downloaded=${downloaded}, failed=${failed.length})`);
                    }
                    continue;
                }
            }
            failed.push(url);
        }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    return { urlToLocalMap, downloaded, failed };
}

function buildEnrichedFieldsForProduct(p, catName) {
    let specs = {};
    try {
        const parsed = typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : (p.specifications || {});
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) specs = parsed;
    } catch {}

    const updates = {};

    // 1. Backfill empty description cleanly from shortDescription + DB metadata (no fabricated prices/MOQ)
    if (!p.description || p.description.trim().length < 5) {
        const baseShort = (p.shortDescription || '').trim();
        const dept = p.department || 'Apparel';
        const div = p.divisionType || 'Garment';
        const sub = catName || p.subCategory || div;
        const extra = `Manufactured by Apparel Emporium for international B2B wholesale & private-label sourcing in the ${dept} (${div} / ${sub}) division. Available with custom tech-pack specifications, buyer-requested fabric weights, Pantone color matching, and AQL quality inspection.`;
        updates.description = baseShort ? `${baseShort}\n\n${extra}` : `${p.name}. ${extra}`;
    }

    // 2. Backfill empty specifications JSON
    const specKeys = Object.keys(specs);
    if (specKeys.length === 0) {
        specs = {
            Style: p.styleNo || p.sku || p.slug,
            Department: p.department || 'Apparel',
            Division: p.divisionType || 'Apparel',
            Category: catName || p.subCategory || 'Export Apparel',
            Brand: p.brand || 'Apparel Emporium',
            'Order Volume': p.minOrder || 'Flexible / As Per Buyer Requirement',
        };
        updates.specifications = JSON.stringify(specs);
    }

    // 3. Populate dedicated schema columns from specifications JSON when null
    if (!p.fabricComposition && (specs.Fabric || specs.Composition || specs.Material)) {
        updates.fabricComposition = String(specs.Fabric || specs.Composition || specs.Material);
    }
    if (!p.fabricConstruction && (specs['Knit Type'] || specs.Construction || specs['Fabric Type'])) {
        updates.fabricConstruction = String(specs['Knit Type'] || specs.Construction || specs['Fabric Type']);
    }
    if (!p.yarnCount && specs['Yarn Count']) {
        updates.yarnCount = String(specs['Yarn Count']);
    }
    if (!p.gauge && specs.Gauge) {
        updates.gauge = String(specs.Gauge);
    }
    if (!p.fit && specs.Fit) {
        updates.fit = String(specs.Fit);
    }
    if (!p.colors && (specs.Colour || specs.Color || specs.Colors)) {
        const cVal = String(specs.Colour || specs.Color || specs.Colors);
        updates.colors = JSON.stringify(cVal.split(/,|\/|&|\band\b/i).map((s) => s.trim()).filter(Boolean));
    }
    if (!p.seoTitle) {
        updates.seoTitle = p.name;
    }
    if (!p.seoDescription) {
        updates.seoDescription = (p.shortDescription || updates.description || p.name).substring(0, 160);
    }
    if (!p.tags || p.tags.trim() === '') {
        const tagParts = Array.from(new Set([
            p.department,
            p.divisionType,
            catName || p.subCategory,
            specs.Fabric,
            specs['Product Type'],
            specs.Colour,
        ].filter(Boolean).map((s) => String(s).trim())));
        if (tagParts.length > 0) updates.tags = tagParts.join(', ');
    }
    if (!p.seoKeywords && (updates.tags || p.tags)) {
        updates.seoKeywords = updates.tags || p.tags;
    }

    return updates;
}

async function syncDiskUploadsToMediaLibrary() {
    const allowedFolders = ['products', 'logos', 'demo', 'general', 'blog'];

    const products = await prisma.product.findMany({
        select: { id: true, name: true, slug: true, images: true },
    });

    const pathMetaMap = new Map();
    for (const p of products) {
        let imgs = [];
        try { imgs = JSON.parse(p.images || '[]'); } catch {}
        if (!Array.isArray(imgs)) continue;
        imgs.forEach((item, idx) => {
            const u = typeof item === 'string' ? item : (item && (item.url || item.src || item.path));
            if (typeof u === 'string' && u.startsWith('/uploads/')) {
                if (!pathMetaMap.has(u)) {
                    pathMetaMap.set(u, { productName: p.name, slug: p.slug, index: idx + 1 });
                }
            }
        });
    }

    const existingRecords = await prisma.mediaFile.findMany({
        select: { id: true, filePath: true, alt: true, originalName: true },
    });
    const existingByPath = new Map(existingRecords.map((r) => [r.filePath, r]));

    let scannedFiles = 0;
    let createdRecords = 0;
    let updatedRecords = 0;
    const toCreate = [];

    for (const folder of allowedFolders) {
        const dirPath = path.join(UPLOAD_ROOT, folder);
        if (!fs.existsSync(dirPath)) continue;

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isFile()) continue;
            const ext = path.extname(entry.name).toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf'].includes(ext)) continue;

            scannedFiles++;
            const absPath = path.join(dirPath, entry.name);
            const webPath = `/uploads/${folder}/${entry.name}`;
            const meta = pathMetaMap.get(webPath);
            const existing = existingByPath.get(webPath);

            if (!existing) {
                const stat = fs.statSync(absPath);
                let mimeType = getMimeFromExt(ext);
                try {
                    const fd = fs.openSync(absPath, 'r');
                    const buf = Buffer.alloc(64);
                    fs.readSync(fd, buf, 0, 64, 0);
                    fs.closeSync(fd);
                    const detected = detectImageFormat(buf);
                    if (detected) mimeType = detected.mimeType;
                } catch {}

                toCreate.push({
                    fileName: entry.name,
                    originalName: meta ? `${meta.slug}-${meta.index}${ext}` : entry.name,
                    filePath: webPath,
                    fileSize: stat.size,
                    mimeType,
                    folder,
                    alt: meta ? meta.productName : null,
                });
            } else if (meta && (!existing.alt || existing.originalName.startsWith('gd-') || existing.originalName.startsWith('ext-'))) {
                await prisma.mediaFile.update({
                    where: { id: existing.id },
                    data: {
                        ...(existing.alt ? {} : { alt: meta.productName }),
                        ...(existing.originalName.startsWith('gd-') || existing.originalName.startsWith('ext-')
                            ? { originalName: `${meta.slug}-${meta.index}${ext}` }
                            : {}),
                    },
                });
                updatedRecords++;
            }
        }
    }

    // Batch insert MediaFile records in chunks (SQLite & Prisma version safe)
    const chunkSize = 100;
    for (let i = 0; i < toCreate.length; i += chunkSize) {
        const chunk = toCreate.slice(i, i + chunkSize);
        await prisma.$transaction(chunk.map((data) => prisma.mediaFile.create({ data })));
        createdRecords += chunk.length;
    }

    const totalInDb = await prisma.mediaFile.count();
    return { scannedFiles, createdRecords, updatedRecords, totalInDb };
}

async function main() {
    const args = new Set(process.argv.slice(2));
    const skipDownload = args.has('--skip-download');
    const dbOnly = args.has('--db-only');

    console.log('================================================================');
    console.log('🔄 LOCALIZING PRODUCT IMAGES & SYNCING DATABASE / MEDIA LIBRARY');
    console.log('================================================================');

    const products = await prisma.product.findMany({
        include: { category: { select: { name: true, slug: true } } },
    });

    // Collect all remote URLs
    const uniqueRemoteUrls = new Set();
    for (const p of products) {
        let imgs = [];
        try { imgs = JSON.parse(p.images || '[]'); } catch { imgs = p.images ? [p.images] : []; }
        if (!Array.isArray(imgs)) imgs = [imgs];
        for (const item of imgs) {
            const u = typeof item === 'string' ? item : (item && (item.url || item.src || item.path));
            if (typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))) {
                uniqueRemoteUrls.add(u.trim());
            }
        }
    }

    console.log(`📊 Found ${products.length} products and ${uniqueRemoteUrls.size} unique remote image URLs.`);

    const { urlToLocalMap, downloaded, failed } = dbOnly
        ? await downloadAllRemoteUrls(Array.from(uniqueRemoteUrls), true)
        : await downloadAllRemoteUrls(Array.from(uniqueRemoteUrls), skipDownload);

    if (!dbOnly) {
        console.log(`✅ Remote localization pass: mapped=${urlToLocalMap.size}, newlyDownloaded=${downloaded}, failed=${failed.length}`);
        if (failed.length > 0) {
            console.log('⚠️ Failed URLs sample:', failed.slice(0, 10));
        }
    }

    // Update every product in DB: images, ogImage, and missing schema fields
    let productsImageUpdated = 0;
    let productsSchemaEnriched = 0;

    for (const p of products) {
        let imgs = [];
        try { imgs = JSON.parse(p.images || '[]'); } catch { imgs = p.images ? [p.images] : []; }
        if (!Array.isArray(imgs)) imgs = [imgs];

        let imgChanged = false;
        const newImgs = imgs.map((item) => {
            const isObj = typeof item === 'object' && item !== null;
            const rawUrl = isObj ? (item.url || item.src || item.path || '') : String(item || '');
            const trimmed = rawUrl.trim();
            if (urlToLocalMap.has(trimmed)) {
                imgChanged = true;
                const localPath = urlToLocalMap.get(trimmed);
                return isObj ? { ...item, url: localPath } : localPath;
            }
            return item;
        });

        const firstImg = newImgs[0] ? (typeof newImgs[0] === 'string' ? newImgs[0] : newImgs[0].url) : null;
        const schemaUpdates = buildEnrichedFieldsForProduct(p, p.category?.name);

        if (firstImg && (!p.ogImage || p.ogImage.startsWith('http'))) {
            schemaUpdates.ogImage = firstImg;
        }
        if (imgChanged) {
            schemaUpdates.images = JSON.stringify(newImgs);
            productsImageUpdated++;
        }

        if (Object.keys(schemaUpdates).length > 0) {
            await prisma.product.update({
                where: { id: p.id },
                data: schemaUpdates,
            });
            productsSchemaEnriched++;
        }
    }

    console.log(`✅ DB Product Updates: imagePathsLocalized=${productsImageUpdated}, schemaEnriched=${productsSchemaEnriched}`);

    // Sync MediaFile table from all disk uploads
    const mediaStats = await syncDiskUploadsToMediaLibrary();
    console.log('✅ MediaFile Sync:', mediaStats);

    // Update prisma/catalog_backup_257_products.json so backups match localized paths & schema
    if (!dbOnly) {
        const refreshedProducts = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
        const backup257Path = path.join(CWD, 'prisma', 'catalog_backup_257_products.json');
        fs.writeFileSync(backup257Path, JSON.stringify(refreshedProducts, null, 2), 'utf8');
        console.log(`💾 Updated ${backup257Path} (${refreshedProducts.length} products)`);
    }

    console.log('================================================================');
    console.log('🎉 LOCALIZATION & DATABASE MEDIA SYNC COMPLETE');
    console.log('================================================================');
}

if (require.main === module) {
    main()
        .catch((err) => {
            console.error('❌ Localization error:', err);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = { syncDiskUploadsToMediaLibrary, downloadAllRemoteUrls };
