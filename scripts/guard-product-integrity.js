const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const MIN_EXPECTED_PRODUCTS = 250;
const MIN_EXPECTED_CATEGORIES = 200;

async function restoreCategoriesFromJson(catsJsonPath) {
    if (!fs.existsSync(catsJsonPath)) return false;
    try {
        console.log(`📥 [INTEGRITY GUARD] Restoring categories from JSON archive: ${catsJsonPath}`);
        const raw = fs.readFileSync(catsJsonPath, 'utf8');
        const categories = JSON.parse(raw);

        // Pass 1: Upsert categories without parentId to prevent foreign key errors
        for (const cat of categories) {
            const existing = await prisma.category.findFirst({
                where: { OR: [{ id: cat.id }, { slug: cat.slug }] }
            });
            if (existing) {
                await prisma.category.update({
                    where: { id: existing.id },
                    data: {
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description || null,
                        image: cat.image || null,
                        order: cat.order || 0,
                        isActive: cat.isActive !== false
                    }
                });
            } else {
                await prisma.category.create({
                    data: {
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description || null,
                        image: cat.image || null,
                        parentId: null,
                        order: cat.order || 0,
                        isActive: cat.isActive !== false
                    }
                });
            }
        }

        // Pass 2: Connect parent relationships
        for (const cat of categories.filter(c => c.parentId)) {
            try {
                const current = await prisma.category.findFirst({
                    where: { OR: [{ id: cat.id }, { slug: cat.slug }] }
                });
                const parent = await prisma.category.findFirst({
                    where: { id: cat.parentId }
                });
                if (current && parent && current.id !== parent.id) {
                    await prisma.category.update({
                        where: { id: current.id },
                        data: { parentId: parent.id }
                    });
                }
            } catch (linkErr) {
                // Non-fatal if parent is skipped
            }
        }

        const count = await prisma.category.count();
        console.log(`✅ [INTEGRITY GUARD] Categories restored: ${count}`);
        return count >= MIN_EXPECTED_CATEGORIES;
    } catch (e) {
        console.error('Failed to restore categories from JSON:', e.message);
        return false;
    }
}

async function restoreFromJson(jsonPath) {
    if (!fs.existsSync(jsonPath)) return false;
    try {
        console.log(`📥 [INTEGRITY GUARD] Emergency restoring products from JSON archive: ${jsonPath}`);
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const products = JSON.parse(raw);

        // Ensure categories exist
        const existingCats = await prisma.category.findMany();
        let fallbackCatId = existingCats.length > 0 ? existingCats[0].id : null;
        if (!fallbackCatId) {
            const newCat = await prisma.category.create({
                data: { name: 'Apparel Export', slug: 'apparel-export', order: 0, isActive: true }
            });
            fallbackCatId = newCat.id;
        }

        const catIds = new Set(existingCats.map(c => c.id));

        for (const p of products) {
            const data = { ...p };
            delete data.category; // remove relation object
            if (!catIds.has(data.categoryId)) {
                data.categoryId = fallbackCatId;
            }
            await prisma.product.upsert({
                where: { id: p.id },
                update: data,
                create: data,
            });
        }
        return true;
    } catch (e) {
        console.error('Failed to restore products from JSON:', e.message);
        return false;
    }
}

async function verifyAndProtect() {
    console.log('🛡️ [INTEGRITY GUARD] Verifying database, categories, and product count...');
    
    let count = await prisma.product.count();
    let catCount = await prisma.category.count();
    console.log(`📊 [INTEGRITY GUARD] Initial: Products=${count}, Categories=${catCount}`);

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const backupDir = path.join(homeDir, 'db_backups');
    const jsonCatsBackup = path.join(process.cwd(), 'prisma', 'categories_backup_246.json');
    const jsonBackup257 = path.join(process.cwd(), 'prisma', 'catalog_backup_257_products.json');
    const jsonBackup = fs.existsSync(jsonBackup257) ? jsonBackup257 : path.join(process.cwd(), 'prisma', 'catalog_backup_249_products.json');
    const jsonBackupLegacy = path.join(process.cwd(), 'prisma', 'catalog_backup_174_products.json');

    if (!fs.existsSync(backupDir)) {
        try {
            fs.mkdirSync(backupDir, { recursive: true });
        } catch (e) {
            console.warn('Could not create backup directory:', e.message);
        }
    }

    // 1. Verify and protect categories
    if (catCount < MIN_EXPECTED_CATEGORIES) {
        console.warn(`⚠️ [INTEGRITY GUARD] Category count low (${catCount} < ${MIN_EXPECTED_CATEGORIES}). Restoring...`);
        if (fs.existsSync(jsonCatsBackup)) {
            await restoreCategoriesFromJson(jsonCatsBackup);
            catCount = await prisma.category.count();
        }
    }

    // 2. Verify and protect products
    if (count >= MIN_EXPECTED_PRODUCTS) {
        console.log(`✅ [INTEGRITY GUARD] Product count is healthy (${count} >= ${MIN_EXPECTED_PRODUCTS}). Creating verified snapshots...`);
        try {
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, path.join(backupDir, 'dev_verified_healthy.db'));
                fs.copyFileSync(dbPath, path.join(process.cwd(), 'prisma', 'dev.db.verified'));
                console.log('✅ [INTEGRITY GUARD] Verified database snapshot saved to disk.');
            }
        } catch (err) {
            console.warn('Snapshot copy warning:', err.message);
        }
        return true;
    } else {
        console.error(`🚨 [INTEGRITY GUARD] Product count is LOW (${count} < ${MIN_EXPECTED_PRODUCTS})! Attempting recovery...`);
        
        // Search for healthy backup candidates
        const candidateBackups = [
            path.join(backupDir, 'dev_verified_healthy.db'),
            path.join(backupDir, 'live_backup_latest.db'),
            path.join(process.cwd(), 'prisma', 'dev.db.verified'),
            path.join(process.cwd(), 'prisma', 'dev.db.live_backup')
        ];

        let recovered = false;
        for (const candidate of candidateBackups) {
            if (fs.existsSync(candidate) && fs.statSync(candidate).size > 200000) {
                console.log(`🔄 [INTEGRITY GUARD] Restoring from backup candidate: ${candidate}`);
                fs.copyFileSync(candidate, dbPath);
                recovered = true;
                break;
            }
        }

        if (recovered) {
            const reCount = await prisma.product.count();
            console.log(`✅ [INTEGRITY GUARD] Recovered product count via SQLite backup: ${reCount}`);
            if (reCount >= MIN_EXPECTED_PRODUCTS) {
                return true;
            }
        }

        // If SQLite candidate was still low or missing, fallback to JSON archive
        if (fs.existsSync(jsonBackup)) {
            const jsonOk = await restoreFromJson(jsonBackup);
            if (jsonOk) {
                const finalCount = await prisma.product.count();
                console.log(`✅ [INTEGRITY GUARD] Recovered product count via JSON archive: ${finalCount}`);
                if (finalCount >= MIN_EXPECTED_PRODUCTS) {
                    return true;
                }
            }
        }

        if (fs.existsSync(jsonBackupLegacy)) {
            const jsonOk = await restoreFromJson(jsonBackupLegacy);
            if (jsonOk) {
                const finalCount = await prisma.product.count();
                console.log(`✅ [INTEGRITY GUARD] Recovered product count via Legacy JSON archive: ${finalCount}`);
                if (finalCount >= MIN_EXPECTED_PRODUCTS) {
                    return true;
                }
            }
        }

        throw new Error(`CRITICAL INTEGRITY FAILURE: Product count is ${count} (expected >= ${MIN_EXPECTED_PRODUCTS}). Deployment halted to protect data.`);
    }
}

verifyAndProtect()
    .then(() => {
        console.log('✅ [INTEGRITY GUARD] All checks passed.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ [INTEGRITY GUARD] Check failed:', err.message);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
