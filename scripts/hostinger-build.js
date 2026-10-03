const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, desc) {
    console.log(`\n======================================================`);
    console.log(`▶ [STEP] ${desc}`);
    console.log(`$ ${cmd}`);
    console.log(`======================================================`);
    try {
        const out = execSync(cmd, {
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_OPTIONS: '--max-old-space-size=1280',
                UV_THREADPOOL_SIZE: '1'
            }
        });
        return true;
    } catch (err) {
        console.error(`❌ [FAILED] ${desc}:`, err.message);
        throw err;
    }
}

async function main() {
    console.log('🚀 [HOSTINGER DEPLOY] Starting automated zero-data-loss build pipeline...');
    const cwd = process.cwd();
    const dbPath = path.join(cwd, 'prisma', 'dev.db');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const backupDir = path.join(homeDir, 'db_backups');

    // 1. BACKUP DATABASE BEFORE ANY ACTIONS
    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`📦 [BACKUP] Found active live database: ${dbPath} (${stats.size} bytes)`);
        try {
            if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
            fs.copyFileSync(dbPath, path.join(backupDir, `dev-before-build-${Date.now()}.db`));
            fs.copyFileSync(dbPath, path.join(backupDir, 'dev-before-build-latest.db'));
            fs.copyFileSync(dbPath, path.join(cwd, 'prisma', 'dev.db.bak'));
            console.log('✅ [BACKUP] Live database secured across persistent storage.');
        } catch (e) {
            console.warn('⚠️ [BACKUP WARNING]', e.message);
        }
    }

    // 2. CHECK / INSTALL REQUIRED DEPENDENCIES
    const prismaGen = path.join(cwd, 'node_modules', '@prisma', 'client', 'generator-build', 'index.js');
    const nextBin = path.join(cwd, 'node_modules', 'next', 'dist', 'bin', 'next');

    if (!fs.existsSync(prismaGen) || !fs.existsSync(nextBin)) {
        console.log('⚠️ [DEPS] Required dependencies missing. Running targeted install...');
        run('npm install @prisma/client@5.22.0 prisma@5.22.0 cross-env@7.0.3 --no-audit --no-fund', 'Install Prisma & Core Dependencies');
        run('npm install --include=dev --no-audit --no-fund', 'Install Full Dependencies');
    }

    // 3. GENERATE PRISMA CLIENT WITH LOCAL PINNED BINARY
    const localPrisma = path.join(cwd, 'node_modules', 'prisma', 'build', 'index.js');
    if (fs.existsSync(localPrisma)) {
        run(`node "${localPrisma}" generate`, 'Generate Prisma Client');
    } else {
        run('npx -y prisma@5.22.0 generate', 'Generate Prisma Client via npx');
    }

    // 4. PRE-MIGRATION PRODUCT INTEGRITY GUARD
    if (fs.existsSync(path.join(cwd, 'scripts', 'guard-product-integrity.js'))) {
        run('node scripts/guard-product-integrity.js', 'Pre-migration Product Integrity Guard');
    }

    // 5. UPDATE SCHEMA & SETTINGS
    if (fs.existsSync(localPrisma)) {
        run(`node "${localPrisma}" db push --accept-data-loss`, 'Sync Database Schema');
    } else {
        run('npx -y prisma@5.22.0 db push --accept-data-loss', 'Sync Database Schema via npx');
    }

    if (fs.existsSync(path.join(cwd, 'scripts', 'sync-corporate-settings.js'))) {
        run('node scripts/sync-corporate-settings.js', 'Synchronize Corporate Site Settings');
    }

    // 6. POST-MIGRATION PRODUCT INTEGRITY GUARD
    if (fs.existsSync(path.join(cwd, 'scripts', 'guard-product-integrity.js'))) {
        run('node scripts/guard-product-integrity.js', 'Post-migration Product Integrity Guard');
    }

    // 7. BUILD NEXT.JS PRODUCTION APPLICATION
    console.log('\n🏗️ [BUILD] Compiling Next.js production build...');
    if (fs.existsSync(nextBin)) {
        run(`node "${nextBin}" build`, 'Next.js Production Build');
    } else {
        run('npx next build', 'Next.js Production Build via npx');
    }

    // 8. FINAL INTEGRITY CHECK
    if (fs.existsSync(path.join(cwd, 'scripts', 'guard-product-integrity.js'))) {
        run('node scripts/guard-product-integrity.js', 'Final Production Product Verification');
    }

    console.log('\n🎉 [SUCCESS] Deployment build and verification completed successfully!');
}

main().catch(err => {
    console.error('\n💥 [FATAL DEPLOY ERROR]', err.message);
    process.exit(1);
});
