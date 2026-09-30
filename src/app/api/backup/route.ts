import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { PassThrough, Readable } from 'stream';

export const dynamic = 'force-dynamic';

function getFolderStats(dirPath: string): { count: number; size: number } {
    let count = 0;
    let size = 0;

    function traverse(currentDir: string) {
        if (!fs.existsSync(currentDir)) return;
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                traverse(fullPath);
            } else if (entry.isFile()) {
                count++;
                try {
                    size += fs.statSync(fullPath).size;
                } catch { }
            }
        }
    }

    traverse(dirPath);
    return { count, size };
}

export async function GET(req: NextRequest) {
    const guard = await requireAuth();
    if (!guard.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(guard.user.role)) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'full';
    const dateStr = new Date().toISOString().split('T')[0];
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    try {
        // ── 1. STATS ONLY ──
        if (type === 'stats') {
            const [productCount, userCount, rfqCount, inquiryCount] = await Promise.all([
                prisma.product.count(),
                prisma.user.count(),
                prisma.rFQ.count(),
                prisma.contactInquiry.count(),
            ]);

            const uploadsStats = getFolderStats(uploadsDir);
            let dbSize = 0;
            let dbModified = null;
            if (fs.existsSync(dbPath)) {
                const stat = fs.statSync(dbPath);
                dbSize = stat.size;
                dbModified = stat.mtime;
            }

            return NextResponse.json({
                success: true,
                stats: {
                    productCount,
                    userCount,
                    rfqCount,
                    inquiryCount,
                    imageCount: uploadsStats.count,
                    mediaSizeBytes: uploadsStats.size,
                    dbSizeBytes: dbSize,
                    dbLastModified: dbModified,
                    timestamp: new Date().toISOString(),
                }
            });
        }

        // ── 2. DATABASE FILE ONLY (.db) ──
        if (type === 'db') {
            if (!fs.existsSync(dbPath)) {
                return NextResponse.json({ error: 'Database ledger file not found on disk.' }, { status: 404 });
            }
            const fileBuffer = fs.readFileSync(dbPath);
            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/x-sqlite3',
                    'Content-Disposition': `attachment; filename=aelbd-database-${dateStr}.db`,
                },
            });
        }

        // ── 3. PRODUCTS DATA EXPORT (.json) ──
        if (type === 'products') {
            const products = await prisma.product.findMany({
                include: { category: true },
                orderBy: { createdAt: 'desc' }
            });
            const jsonString = JSON.stringify(products, null, 2);
            return new NextResponse(jsonString, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename=aelbd-products-${dateStr}.json`,
                },
            });
        }

        // ── 4. USERS EXPORT (.json) ──
        if (type === 'users') {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true
                }
            });
            return new NextResponse(JSON.stringify(users, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename=aelbd-users-${dateStr}.json`,
                },
            });
        }

        // ── 5. MEDIA / UPLOADS ARCHIVE (.zip) ──
        if (type === 'media') {
            const passthrough = new PassThrough();
            const archive = archiver('zip', { zlib: { level: 5 } });

            archive.pipe(passthrough);
            if (fs.existsSync(uploadsDir)) {
                archive.directory(uploadsDir, 'uploads');
            }
            archive.finalize();

            const webStream = Readable.toWeb(passthrough) as any;
            return new NextResponse(webStream, {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename=aelbd-media-uploads-${dateStr}.zip`,
                },
            });
        }

        // ── 6. FULL SYSTEM BACKUP (Database + Uploads + JSON Exports) ──
        if (type === 'full') {
            const [products, users, rfqs, inquiries, categories] = await Promise.all([
                prisma.product.findMany({ include: { category: true } }),
                prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        lastLoginAt: true,
                        createdAt: true
                    }
                }),
                prisma.rFQ.findMany(),
                prisma.contactInquiry.findMany(),
                prisma.category.findMany()
            ]);

            const passthrough = new PassThrough();
            const archive = archiver('zip', { zlib: { level: 6 } });

            archive.pipe(passthrough);

            // Add raw DB file
            if (fs.existsSync(dbPath)) {
                archive.file(dbPath, { name: 'database.db' });
            }

            // Add all uploaded media files
            if (fs.existsSync(uploadsDir)) {
                archive.directory(uploadsDir, 'public/uploads');
            }

            // Add JSON data ledger
            archive.append(JSON.stringify(products, null, 2), { name: 'products.json' });
            archive.append(JSON.stringify(users, null, 2), { name: 'users.json' });
            archive.append(JSON.stringify(categories, null, 2), { name: 'categories.json' });
            archive.append(JSON.stringify(rfqs, null, 2), { name: 'rfqs.json' });
            archive.append(JSON.stringify(inquiries, null, 2), { name: 'inquiries.json' });

            // Add manifest metadata
            const manifest = {
                site: 'Apparel Emporium (aelbd.net)',
                backupDate: new Date().toISOString(),
                stats: {
                    productsCount: products.length,
                    usersCount: users.length,
                    categoriesCount: categories.length,
                    rfqsCount: rfqs.length,
                    inquiriesCount: inquiries.length,
                }
            };
            archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

            archive.finalize();

            const webStream = Readable.toWeb(passthrough) as any;
            return new NextResponse(webStream, {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename=aelbd-FULL-backup-${dateStr}.zip`,
                },
            });
        }

        return NextResponse.json({ error: 'Invalid backup type parameter.' }, { status: 400 });
    } catch (error: any) {
        console.error('Backup generation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate backup.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const guard = await requireAuth();
    if (!guard.ok || !['DEVELOPER', 'SUPER_ADMIN'].includes(guard.user.role)) {
        return NextResponse.json({ error: 'Unauthorized: Super Admin or Developer access required to restore backups.' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: 'No backup file supplied.' }, { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        const backupBackupDir = path.join(process.cwd(), 'prisma', 'backups');

        if (!fs.existsSync(backupBackupDir)) {
            fs.mkdirSync(backupBackupDir, { recursive: true });
        }

        // Take a safety snapshot of current DB before overwriting
        if (fs.existsSync(dbPath)) {
            const safetyFile = path.join(backupBackupDir, `safety-before-restore-${Date.now()}.db`);
            fs.copyFileSync(dbPath, safetyFile);
        }

        // Critical Section: Disconnect Prisma pooling before overwriting locked DB file
        await prisma.$disconnect();

        fs.writeFileSync(dbPath, buffer);

        // Reconnect safely
        await prisma.$connect();

        return NextResponse.json({
            success: true,
            message: 'Database ledger restored successfully. Prisma reconnected.'
        });
    } catch (error: any) {
        console.error('Restore error:', error);
        return NextResponse.json({ error: error.message || 'Failed to restore backup.' }, { status: 500 });
    }
}
