const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const MIN_EXPECTED_PRODUCTS = 170;

async function restoreFromJson(jsonPath) {
    if (!fs.existsSync(jsonPath)) return false;
    try {
        console.log(`📥 [INTEGRITY GUARD] Emergency restoring products from JSON archive: ${jsonPath}`);
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const products = JSON.parse(raw);
        for (const p of products) {
            const data = { ...p };
            delete data.category; // remove relation object
            await prisma.product.upsert({
                where: { id: p.id },
                update: data,
                create: data,
            });
        }
        return true;
    } catch (e) {
        console.error('Failed to restore from JSON:', e.message);
        return false;
    }
}

async function verifyAndProtect() {
    console.log('🛡️ [INTEGRITY GUARD] Verifying database and product count...');
    
    const count = await prisma.product.count();
    const catCount = await prisma.category.count();
    console.log(`📊 [INTEGRITY GUARD] Products found: ${count}, Categories found: ${catCount}`);

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const backupDir = path.join(homeDir, 'db_backups');
    const jsonBackup = path.join(process.cwd(), 'prisma', 'catalog_backup_174_products.json');

    if (!fs.existsSync(backupDir)) {
        try {
            fs.mkdirSync(backupDir, { recursive: true });
        } catch (e) {
            console.warn('Could not create backup directory:', e.message);
        }
    }

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
