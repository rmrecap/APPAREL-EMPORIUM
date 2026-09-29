import { NextRequest, NextResponse } from 'next/server';
import { requireRole, requireAdmin } from '@/lib/auth-guards';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
    try {
        const guard = await requireRole(['DEVELOPER', 'SUPER_ADMIN']);
        if (!guard.ok) return guard.response;

        const body = await request.json().catch(() => ({}));
        const action = body.action || 'full';

        console.log(`[UPDATE] Triggering Action: ${action} by user ${guard.user.email}...`);

        let stdoutOutput = '';

        switch (action) {
            case 'rebuild': {
                const res = await execAsync('npm run build', {
                    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' },
                });
                stdoutOutput = res.stdout;
                break;
            }

            case 'restart': {
                const res = await execAsync(
                    'pm2 reload ecosystem.config.js --env production || pm2 restart aelbd-production || pm2 restart garments-website || pm2 restart all || pm2 start ecosystem.config.js'
                );
                stdoutOutput = res.stdout;
                break;
            }

            case 'db': {
                const res = await execAsync('npx prisma generate && npx prisma db push --accept-data-loss');
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

            case 'db-optimize': {
                const res = await execAsync('npx prisma db push --skip-generate --accept-data-loss');
                stdoutOutput = res.stdout;
                break;
            }

            case 'media-optimize': {
                const imagesCachePath = path.join(process.cwd(), '.next', 'cache', 'images');
                if (fs.existsSync(imagesCachePath)) {
                    fs.rmSync(imagesCachePath, { recursive: true, force: true });
                }
                stdoutOutput = 'Media image cache purged successfully.';
                break;
            }

            case 'revalidate-full': {
                const fullCachePath = path.join(process.cwd(), '.next', 'cache');
                if (fs.existsSync(fullCachePath)) {
                    fs.rmSync(fullCachePath, { recursive: true, force: true });
                }
                await execAsync(
                    'pm2 reload ecosystem.config.js --env production || pm2 restart aelbd-production || pm2 restart garments-website || pm2 restart all || echo "Cache cleared"'
                );
                stdoutOutput = 'Global ISR cache cleared and application reloaded.';
                break;
            }

            case 'pull-only': {
                const res = await execAsync('git fetch origin main && git reset --hard origin/main');
                stdoutOutput = res.stdout;
                break;
            }

            case 'full':
            case 'auto-deploy':
            default: {
                const fullCmd = [
                    'git fetch origin main',
                    'git reset --hard origin/main',
                    'npm install --no-audit --no-fund',
                    'npx prisma generate',
                    'npx prisma db push --accept-data-loss',
                    'npm run build',
                    'pm2 reload ecosystem.config.js --env production || pm2 restart aelbd-production || pm2 restart garments-website || pm2 restart all || true',
                ].join(' && ');

                const res = await execAsync(fullCmd, {
                    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' },
                });
                stdoutOutput = res.stdout || 'Deployment completed successfully.';
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
