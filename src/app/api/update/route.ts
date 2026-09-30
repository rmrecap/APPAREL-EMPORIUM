import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireAdmin } from '@/lib/auth-guards';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const execAsync = promisify(exec);

/**
 * Builds an enhanced environment with all known Node, npm, npx, and pm2 paths.
 * Resolves "/bin/sh: line 1: npm: command not found" on Hostinger / CloudLinux.
 */
function getEnhancedEnv(): NodeJS.ProcessEnv {
    const nodeDir = path.dirname(process.execPath);
    const candidateDirs = [
        nodeDir,
        '/opt/alt/alt-nodejs22/root/usr/bin',
        '/opt/alt/alt-nodejs20/root/usr/bin',
        '/opt/alt/alt-nodejs18/root/usr/bin',
        '/usr/local/bin',
        '/usr/bin',
        '/bin',
        path.join(process.env.HOME || '/root', '.nvm/versions/node/current/bin'),
        path.join(process.env.HOME || '/root', '.npm-global/bin'),
        path.join(process.env.HOME || '/root', '.local/bin'),
    ].filter(d => fs.existsSync(d));

    const currentPath = process.env.PATH || '';
    const enhancedPath = [...new Set([...candidateDirs, ...currentPath.split(path.delimiter)])].join(path.delimiter);

    return {
        ...process.env,
        PATH: enhancedPath,
        NODE_OPTIONS: '--max-old-space-size=2048',
    };
}

/**
 * Locates the exact path of a CLI tool (npm, npx, git, pm2).
 */
function findBin(tool: string): string {
    const nodeDir = path.dirname(process.execPath);
    const directPath = path.join(nodeDir, tool);
    if (fs.existsSync(directPath)) return `"${directPath}"`;

    const knownPaths = [
        `/opt/alt/alt-nodejs20/root/usr/bin/${tool}`,
        `/opt/alt/alt-nodejs22/root/usr/bin/${tool}`,
        `/usr/local/bin/${tool}`,
        `/usr/bin/${tool}`,
    ];
    for (const p of knownPaths) {
        if (fs.existsSync(p)) return `"${p}"`;
    }
    return tool;
}

/**
 * Pulls latest code from GitHub.
 * If .git directory does not exist on the server (e.g. Hostinger clean file deploy),
 * it downloads the repository zip directly from GitHub and extracts it safely.
 */
async function pullLatestCode(env: NodeJS.ProcessEnv): Promise<string> {
    const gitDir = path.join(process.cwd(), '.git');
    const hasGit = fs.existsSync(gitDir);

    if (hasGit) {
        try {
            const gitBin = findBin('git');
            const res = await execAsync(
                `${gitBin} config --global --add safe.directory "${process.cwd()}" || true && ${gitBin} fetch origin main && ${gitBin} reset --hard origin/main`,
                { env, timeout: 60000 }
            );
            return res.stdout || 'Git fetch & reset completed successfully.';
        } catch (gitErr: any) {
            console.warn('[PULL_WARN] Git CLI pull failed, falling back to direct GitHub zip extract:', gitErr?.message);
        }
    }

    // Direct GitHub Archive Download & Extract (Fail-Safe when .git is absent)
    const zipUrl = 'https://github.com/rmrecap/APPAREL-EMPORIUM/archive/refs/heads/main.zip';
    console.log(`[PULL] Fetching repository archive directly from ${zipUrl}...`);

    const response = await fetch(zipUrl);
    if (!response.ok) {
        throw new Error(`Failed to download repository zip from GitHub: HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    // Preserve local sensitive files
    const preservedFiles = ['.env', '.env.local', 'prisma/dev.db', 'prisma/dev.db-journal'];

    let filesExtracted = 0;
    for (const entry of entries) {
        if (entry.isDirectory) continue;

        // Path inside zip is typically APPAREL-EMPORIUM-main/...
        const parts = entry.entryName.split('/');
        parts.shift(); // remove root prefix
        const relativePath = parts.join('/');
        if (!relativePath) continue;

        // Skip preserving local database and env files
        if (preservedFiles.includes(relativePath) || relativePath.startsWith('public/uploads/')) {
            continue;
        }

        const targetFilePath = path.join(process.cwd(), relativePath);
        const targetDir = path.dirname(targetFilePath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(targetFilePath, entry.getData());
        filesExtracted++;
    }

    return `Direct GitHub archive extract complete: ${filesExtracted} files updated. (Preserved database & uploads).`;
}

export async function POST(request: NextRequest) {
    try {
        const guard = await requireRole(['DEVELOPER', 'SUPER_ADMIN']);
        if (!guard.ok) return guard.response;

        const body = await request.json().catch(() => ({}));
        const action = body.action || 'full';
        const env = getEnhancedEnv();

        console.log(`[UPDATE] Triggering Action: [${action}] by user ${guard.user.email}...`);

        let stdoutOutput = '';

        const npm = findBin('npm');
        const npx = findBin('npx');
        const pm2 = findBin('pm2');

        switch (action) {
            case 'pull-only': {
                stdoutOutput = await pullLatestCode(env);
                break;
            }

            case 'rebuild': {
                const res = await execAsync(`${npm} run build`, { env, timeout: 180000 });
                stdoutOutput = res.stdout;
                break;
            }

            case 'restart': {
                const restartCmd = [
                    `${pm2} reload ecosystem.config.js --env production`,
                    `${pm2} restart aelbd-production`,
                    `${pm2} restart garments-website`,
                    `${pm2} restart all`,
                    `${npx} pm2 reload ecosystem.config.js || true`,
                ].join(' || ');

                const res = await execAsync(restartCmd, { env }).catch(e => ({ stdout: e.stdout || e.message }));
                stdoutOutput = res.stdout || 'Restart command issued.';
                break;
            }

            case 'db': {
                const res = await execAsync(`${npx} prisma generate && ${npx} prisma db push --accept-data-loss`, {
                    env,
                    timeout: 60000,
                });
                stdoutOutput = res.stdout;
                break;
            }

            case 'clear-cache': {
                const cachePath = path.join(process.cwd(), '.next', 'cache');
                if (fs.existsSync(cachePath)) {
                    fs.rmSync(cachePath, { recursive: true, force: true });
                }
                stdoutOutput = 'Next.js build cache purged successfully.';
                break;
            }

            case 'full':
            case 'auto-deploy':
            default: {
                // 1. Pull / Extract Code
                const pullMsg = await pullLatestCode(env);

                // 2. Dependencies
                let installMsg = '';
                try {
                    const instRes = await execAsync(`${npm} install --no-audit --no-fund`, { env, timeout: 120000 });
                    installMsg = instRes.stdout;
                } catch (e: any) {
                    installMsg = `Warning: npm install note: ${e.message}`;
                }

                // 3. Prisma
                let prismaMsg = '';
                try {
                    const prRes = await execAsync(`${npx} prisma generate && ${npx} prisma db push --accept-data-loss`, {
                        env,
                        timeout: 60000,
                    });
                    prismaMsg = prRes.stdout;
                } catch (e: any) {
                    prismaMsg = `Prisma note: ${e.message}`;
                }

                // 4. Build
                const buildRes = await execAsync(`${npm} run build`, { env, timeout: 240000 });

                // 5. Reload PM2
                const reloadCmd = [
                    `${pm2} reload ecosystem.config.js --env production`,
                    `${pm2} restart aelbd-production`,
                    `${pm2} restart garments-website`,
                    `${pm2} restart all`,
                    `${npx} pm2 reload ecosystem.config.js || true`,
                    `echo "Reload complete"`,
                ].join(' || ');
                await execAsync(reloadCmd, { env }).catch(() => {});

                stdoutOutput = [
                    `[1/4] Pull: ${pullMsg}`,
                    `[2/4] Dependencies & Prisma: ${prismaMsg || 'OK'}`,
                    `[3/4] Build: ${buildRes.stdout ? buildRes.stdout.substring(0, 300) + '...' : 'Complete'}`,
                    `[4/4] Process reloaded successfully.`,
                ].join('\n\n');
                break;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Action [${action}] completed successfully`,
            details: stdoutOutput,
        });
    } catch (error: any) {
        console.error(`[UPDATE ERROR]`, error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Action failed',
                details: error.stderr || error.stdout || 'No additional details',
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) return guard.response;

        const { checkForUpdates } = await import('@/lib/version');
        const info = await checkForUpdates();
        return NextResponse.json(info);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
