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
            encoding: 'utf8',
            maxBuffer: 50 * 1024 * 1024,
            env: {
                ...process.env,
                NEXT_DEBUG_BUILD: '1',
                NODE_OPTIONS: '--max-old-space-size=1280 --stack-trace-limit=100',
                UV_THREADPOOL_SIZE: '1'
            }
        });
        console.log(out);
        return true;
    } catch (err) {
        const stdOut = err.stdout ? err.stdout.toString() : '';
        const stdErr = err.stderr ? err.stderr.toString() : '';
        console.error(`❌ [FAILED] ${desc}`);
        if (stdOut) console.error('--- STDOUT ---\n', stdOut);
        if (stdErr) console.error('--- STDERR ---\n', stdErr);
        throw new Error(`[${desc}] failed:\n${stdErr || stdOut || err.message}`);
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

    // 3b. ENSURE NEXT.JS BUILD ID GENERATOR RESILIENCE
    const buildIdGenPath = path.join(cwd, 'node_modules', 'next', 'dist', 'build', 'generate-build-id.js');
    if (fs.existsSync(buildIdGenPath)) {
        try {
            let content = fs.readFileSync(buildIdGenPath, 'utf8');
            if (content.includes('let buildId = await generate();')) {
                console.log('🔧 [PATCH] Applying buildId generator safety patch to Next.js...');
                content = content.replace(
                    'let buildId = await generate();',
                    'let buildId = typeof generate === "function" ? await generate() : null;'
                );
                fs.writeFileSync(buildIdGenPath, content, 'utf8');
                console.log('✅ [PATCH] Next.js buildId generator patched successfully.');
            }
        } catch (patchErr) {
            console.warn('⚠️ [PATCH WARNING]', patchErr.message);
        }
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
    process.env.NEXT_DEBUG_BUILD = '1';
    try {
        const userConfigPath = path.join(cwd, 'next.config.js');
        if (fs.existsSync(userConfigPath)) {
            delete require.cache[require.resolve(userConfigPath)];
            const userConfig = require(userConfigPath);
            console.log('📋 [CONFIG DEBUG] Loaded next.config.js:');
            console.log('   output:', userConfig.output);
            console.log('   typeof generateBuildId:', typeof userConfig.generateBuildId);
            if (typeof userConfig.generateBuildId === 'function') {
                const sampleId = await userConfig.generateBuildId();
                console.log('   sample generateBuildId():', sampleId);
            }
        }

        const nextBuild = require('next/dist/build').default;
        console.log('▶ [BUILD ENGINE] Invoking Next.js compiler directly...');
        await nextBuild(cwd, false, false, false, false, true, false, false, undefined);
        console.log('✅ [BUILD] Next.js compilation completed successfully.');

        // 9. FINAL INTEGRITY CHECK
        if (fs.existsSync(path.join(cwd, 'scripts', 'guard-product-integrity.js'))) {
            run('node scripts/guard-product-integrity.js', 'Final Production Product Verification');
        }

        console.log('\n🎉 [SUCCESS] Deployment build and verification completed successfully!');
    } catch (err) {
        console.error('\n❌ [BUILD EXCEPTION CAUGHT]');
        if (Array.isArray(err)) {
            console.error(`Received array of ${err.length} build error(s):`);
            err.forEach((e, idx) => {
                console.error(`\n--- Build Error #${idx + 1} ---`);
                console.error('Name:', e ? e.name : 'Unknown');
                console.error('Message:', e ? e.message : String(e));
                console.error('Stack:\n', e ? e.stack : 'No stack');
                if (e && e.cause) console.error('Cause:\n', e.cause);
            });
        } else if (err) {
            console.error('Name:', err.name);
            console.error('Message:', err.message);
            console.error('Stack:\n', err.stack);
            if (err.cause) console.error('Cause:\n', err.cause);
        }
        throw new Error(`Next.js build failed: ${Array.isArray(err) ? err.map(e => e.message || String(e)).join('; ') : err.message}`);
    }
}

main().catch(err => {
    console.error('\n💥 [FATAL DEPLOY ERROR]', err.message);
    process.exit(1);
});
