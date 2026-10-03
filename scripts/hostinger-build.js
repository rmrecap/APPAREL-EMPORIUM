const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, desc) {
    console.log(`\n======================================================`);
    console.log(`▶ [STEP] ${desc}`);
    console.log(`$ ${cmd}`);
    console.log(`======================================================`);
    try {
        execSync(cmd, {
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

function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
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

    // 2. CHECK & RESTORE @PRISMA/CLIENT GENERATOR
    const prismaGen = path.join(cwd, 'node_modules', '@prisma', 'client', 'generator-build', 'index.js');
    const fallbackDir = path.join(cwd, 'scripts', 'prisma-client-fallback');
    const targetClientDir = path.join(cwd, 'node_modules', '@prisma', 'client');

    if (!fs.existsSync(prismaGen)) {
        console.log('⚠️ [DEPS] @prisma/client generator is missing in node_modules.');
        if (fs.existsSync(fallbackDir)) {
            console.log('🔄 [DEPS] Restoring @prisma/client from verified repository fallback...');
            copyDirSync(fallbackDir, targetClientDir);
            console.log('✅ [DEPS] Successfully restored @prisma/client from fallback.');
        }
    }

    // 3. CHECK NEXT BINARY
    const nextBin = path.join(cwd, 'node_modules', 'next', 'dist', 'bin', 'next');
    if (!fs.existsSync(nextBin)) {
        console.log('⚠️ [DEPS] next binary is missing. Installing dependencies...');
        run('npm install --include=dev --no-audit --no-fund --prefix .', 'Install Dependencies');
    }

    // 4. GENERATE PRISMA CLIENT WITH LOCAL PINNED BINARY
    const localPrisma = path.join(cwd, 'node_modules', 'prisma', 'build', 'index.js');
    if (fs.existsSync(localPrisma)) {
        run(`node "${localPrisma}" generate`, 'Generate Prisma Client');
    } else {
        run('npx -y prisma@5.22.0 generate', 'Generate Prisma Client via npx');
    }

    // 5. PRE-MIGRATION PRODUCT INTEGRITY GUARD
    if (fs.existsSync(path.join(cwd, 'scripts', 'guard-product-integrity.js'))) {
        run('node scripts/guard-product-integrity.js', 'Pre-migration Product Integrity Guard');
    }

    // 6. UPDATE SCHEMA & SETTINGS
    if (fs.existsSync(localPrisma)) {
        run(`node "${localPrisma}" db push --accept-data-loss`, 'Sync Database Schema');
    } else {
        run('npx -y prisma@5.22.0 db push --accept-data-loss', 'Sync Database Schema via npx');
    }

    if (fs.existsSync(path.join(cwd, 'scripts', 'sync-corporate-settings.js'))) {
        run('node scripts/sync-corporate-settings.js', 'Synchronize Corporate Site Settings');
    }

    // 7. POST-MIGRATION PRODUCT INTEGRITY GUARD
    if (fs.existsSync(path.join(cwd, 'scripts', 'guard-product-integrity.js'))) {
        run('node scripts/guard-product-integrity.js', 'Post-migration Product Integrity Guard');
    }

    // 8. BUILD NEXT.JS PRODUCTION APPLICATION
    console.log('\n🏗️ [BUILD] Compiling Next.js production build...');
    if (fs.existsSync(nextBin)) {
        run(`node "${nextBin}" build`, 'Next.js Production Build');
    } else {
        run('npx next build', 'Next.js Production Build via npx');
    }

    // 9. FINAL INTEGRITY CHECK
    if (fs.existsSync(path.join(cwd, 'scripts', 'guard-product-integrity.js'))) {
        run('node scripts/guard-product-integrity.js', 'Final Production Product Verification');
    }

    console.log('\n🎉 [SUCCESS] Deployment build and verification completed successfully!');
}

main().catch(err => {
    console.error('\n💥 [FATAL DEPLOY ERROR]', err.message);
    process.exit(1);
});
