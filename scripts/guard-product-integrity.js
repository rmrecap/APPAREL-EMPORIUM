const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyAndProtect() {
    console.log('🛡️ [INTEGRITY GUARD] Verifying database and product count...');
    
    const count = await prisma.product.count();
    const catCount = await prisma.category.count();
    console.log(`📊 [INTEGRITY GUARD] Products found: ${count}, Categories found: ${catCount}`);

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const backupDir = path.join(homeDir, 'db_backups');

    if (!fs.existsSync(backupDir)) {
        try {
            fs.mkdirSync(backupDir, { recursive: true });
        } catch (e) {
            console.warn('Could not create backup directory:', e.message);
        }
    }

    if (count >= 48) {
        console.log(`✅ [INTEGRITY GUARD] Product count is healthy (${count} >= 48). Creating verified snapshot...`);
        try {
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, path.join(backupDir, 'dev_verified_healthy.db'));
                fs.copyFileSync(dbPath, path.join(process.cwd(), 'prisma', 'dev.db.verified'));
                console.log('✅ [INTEGRITY GUARD] Verified database snapshot saved.');
            }
        } catch (err) {
            console.warn('Snapshot copy warning:', err.message);
        }
        return true;
    } else {
        console.error(`🚨 [INTEGRITY GUARD] Product count is LOW (${count} < 48)! Attempting recovery...`);
        
        // Search for healthy backup
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
            console.log(`✅ [INTEGRITY GUARD] Recovered product count: ${reCount}`);
            if (reCount >= 48) {
                return true;
            }
        }

        throw new Error(`CRITICAL INTEGRITY FAILURE: Product count is ${count} (expected >= 48). Deployment halted to protect data.`);
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
