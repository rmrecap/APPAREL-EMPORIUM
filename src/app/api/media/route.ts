import { NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { localizeAllProductImagesInDb, syncDiskUploadsToMediaLibrary } from '@/lib/media-sync';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
    try {
        const guard = await requireAuth();
        if (!guard.ok) return guard.response;

        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder');
        const search = (searchParams.get('search') || '').trim();
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
        const limitRaw = parseInt(searchParams.get('limit') || '24', 10) || 24;
        const limit = Math.min(Math.max(1, limitRaw), 200);
        const skip = (page - 1) * limit;

        const where: any = {};

        if (folder && folder !== 'all') {
            where.folder = folder;
        }

        if (search) {
            where.OR = [
                { fileName: { contains: search } },
                { originalName: { contains: search } },
                { alt: { contains: search } },
                { filePath: { contains: search } },
            ];
        }

        const [files, total, allCount, folderGroups, allProducts, allMediaPaths] = await Promise.all([
            prisma.mediaFile.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                skip,
                take: limit,
                include: {
                    user: { select: { name: true, email: true } },
                },
            }),
            prisma.mediaFile.count({ where }),
            prisma.mediaFile.count(),
            prisma.mediaFile.groupBy({
                by: ['folder'],
                _count: { _all: true },
            }),
            prisma.product.findMany({
                select: { id: true, name: true, slug: true, images: true },
            }),
            prisma.mediaFile.findMany({
                select: { filePath: true },
            }),
        ]);

        const mediaPathSet = new Set(allMediaPaths.map((m) => m.filePath));
        let totalProductImageRefs = 0;
        let externalImageRefs = 0;
        let missingFromMediaRefs = 0;
        const missingProducts: Array<{ id: string; name: string; slug: string; issue: string }> = [];

        for (const prod of allProducts) {
            let imgs: any[] = [];
            try {
                imgs = JSON.parse(prod.images || '[]');
            } catch {
                imgs = prod.images ? [prod.images] : [];
            }
            if (!Array.isArray(imgs)) imgs = [imgs];

            let prodHasExternal = false;
            let prodHasMissingMedia = false;

            for (const item of imgs) {
                const u = typeof item === 'string' ? item : item?.url || item?.src || item?.path || '';
                if (!u || typeof u !== 'string') continue;
                totalProductImageRefs++;
                if (u.startsWith('http://') || u.startsWith('https://')) {
                    externalImageRefs++;
                    prodHasExternal = true;
                } else if (u.startsWith('/uploads/') && !mediaPathSet.has(u)) {
                    missingFromMediaRefs++;
                    prodHasMissingMedia = true;
                }
            }

            if ((prodHasExternal || prodHasMissingMedia) && missingProducts.length < 25) {
                missingProducts.push({
                    id: prod.id,
                    name: prod.name,
                    slug: prod.slug,
                    issue: prodHasExternal ? 'EXTERNAL_URL' : 'NOT_IN_MEDIA_LIBRARY',
                });
            }
        }

        const folderCounts: Record<string, number> = { all: allCount };
        for (const grp of folderGroups) {
            folderCounts[grp.folder] = grp._count._all;
        }

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return NextResponse.json({
            success: true,
            files,
            total,
            folderCounts,
            mediaAudit: {
                totalProducts: allProducts.length,
                totalProductImageRefs,
                externalImageRefs,
                missingFromMediaRefs,
                isHealthy: externalImageRefs === 0 && missingFromMediaRefs === 0,
                flaggedProducts: missingProducts,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Failed to fetch media:', error);
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const guard = await requirePermission('media.upload');
        if (!guard.ok) {
            const adminGuard = await requireAuth();
            if (!adminGuard.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(adminGuard.user.role)) {
                return guard.response;
            }
        }

        const body = await req.json().catch(() => ({}));
        const action = body?.action || 'sync';

        if (action === 'localize-all') {
            const result = await localizeAllProductImagesInDb();
            return NextResponse.json({
                success: true,
                action,
                ...result,
            });
        }

        const syncResult = await syncDiskUploadsToMediaLibrary();
        return NextResponse.json({
            success: true,
            action: 'sync',
            ...syncResult,
        });
    } catch (error: any) {
        console.error('Media sync error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to sync media library' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const guard = await requireAuth();
        if (!guard.ok) return guard.response;
        if (!['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(guard.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { id, alt, folder, originalName } = body || {};

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
        }

        const updated = await prisma.mediaFile.update({
            where: { id },
            data: {
                ...(alt !== undefined ? { alt: alt === null ? null : String(alt) } : {}),
                ...(folder !== undefined ? { folder: String(folder).replace(/[^a-zA-Z0-9_-]/g, '') || 'general' } : {}),
                ...(originalName !== undefined ? { originalName: String(originalName) } : {}),
            },
        });

        return NextResponse.json({ success: true, file: updated });
    } catch (error: any) {
        console.error('Media update error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update media' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const guard = await requireAuth();
        if (!guard.ok) return guard.response;
        if (!['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(guard.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const idsParam = searchParams.get('ids');
        let ids: string[] = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];

        if (ids.length === 0) {
            const body = await req.json().catch(() => ({}));
            if (Array.isArray(body?.ids)) {
                ids = body.ids.map((s: any) => String(s).trim()).filter(Boolean);
            }
        }

        if (ids.length === 0) {
            return NextResponse.json({ error: 'No media IDs provided' }, { status: 400 });
        }

        const records = await prisma.mediaFile.findMany({
            where: { id: { in: ids } },
        });

        await prisma.mediaFile.deleteMany({
            where: { id: { in: ids } },
        });

        const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
        for (const rec of records) {
            try {
                const stillReferenced = await prisma.mediaFile.count({
                    where: { filePath: rec.filePath },
                });
                if (stillReferenced === 0 && rec.filePath.startsWith('/uploads/')) {
                    const targetPath = path.resolve(process.cwd(), 'public', rec.filePath.replace(/^\//, ''));
                    if (targetPath.startsWith(uploadsRoot) && fs.existsSync(targetPath)) {
                        fs.unlinkSync(targetPath);
                    }
                }
            } catch (e) {
                console.warn('Could not unlink media file from disk:', rec.filePath, e);
            }
        }

        return NextResponse.json({ success: true, deletedCount: records.length });
    } catch (error: any) {
        console.error('Media delete error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete media' }, { status: 500 });
    }
}
