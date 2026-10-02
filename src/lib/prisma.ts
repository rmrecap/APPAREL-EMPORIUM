import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * Automatically ensures SQLite database persistence across Hostinger version deployments.
 * If dev.db is missing or fresh in the current version folder, it scans previous version folders
 * or shared directories and copies the populated database with all products over automatically.
 */
function ensurePersistentDatabase() {
    try {
        const cwd = process.cwd();
        const prismaDir = path.join(cwd, 'prisma');
        const dbPath = path.join(prismaDir, 'dev.db');

        if (!fs.existsSync(prismaDir)) {
            fs.mkdirSync(prismaDir, { recursive: true });
        }

        // If active dev.db exists and has actual data (> 2KB), keep a safe sync copy in domain root
        if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 2048) {
            try {
                const domainRoot = path.resolve(cwd, '..', '..', '..');
                if (fs.existsSync(domainRoot)) {
                    fs.copyFileSync(dbPath, path.join(domainRoot, 'dev.db'));
                }
            } catch {}
            return;
        }

        // Active dev.db is missing or empty - locate candidate populated dev.db from other versions
        const candidateLocations: string[] = [];

        // 1. Check parent versions folder in Hostinger (hbuilds/versions/*/nodejs/prisma/dev.db)
        const versionsDir = path.resolve(cwd, '..', '..');
        if (fs.existsSync(versionsDir) && path.basename(versionsDir) === 'versions') {
            try {
                const currentVersionFolder = path.basename(path.resolve(cwd, '..'));
                const dirs = fs.readdirSync(versionsDir, { withFileTypes: true });
                for (const d of dirs) {
                    if (d.isDirectory() && d.name !== currentVersionFolder) {
                        candidateLocations.push(path.join(versionsDir, d.name, 'nodejs', 'prisma', 'dev.db'));
                    }
                }
            } catch {}
        }

        // 2. Check domain root, backups, and shared locations
        candidateLocations.push(
            path.resolve(cwd, '..', '..', '..', 'dev.db'),
            path.resolve(cwd, '..', '..', '..', 'shared', 'dev.db'),
            path.resolve(cwd, '..', '..', '..', 'prisma', 'dev.db'),
            path.join(cwd, 'backups', 'dev-latest-safe.db'),
            path.join(cwd, 'prisma', 'dev.db.bak')
        );

        let bestCandidate: string | null = null;
        let bestSize = 2048;

        for (const loc of candidateLocations) {
            try {
                if (fs.existsSync(loc)) {
                    const stats = fs.statSync(loc);
                    if (stats.size > bestSize) {
                        bestCandidate = loc;
                        bestSize = stats.size;
                    }
                }
            } catch {}
        }

        if (bestCandidate) {
            console.log(`[PERSISTENCE] Restored persistent database with all products from ${bestCandidate} (${bestSize} bytes)`);
            fs.copyFileSync(bestCandidate, dbPath);
        }
    } catch (err: any) {
        console.warn('[PERSISTENCE NOTE]', err?.message);
    }
}

ensurePersistentDatabase();

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

// Persist singleton in both production and development to prevent connection exhaustion
globalForPrisma.prisma = prisma;


