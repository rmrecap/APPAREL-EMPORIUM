import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');
const CACHE_DIR = path.join(UPLOAD_ROOT, 'cache');

export function detectImageFormat(buffer: Buffer): { ext: string; mimeType: string } | null {
    if (!buffer || buffer.length < 16) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { ext: '.jpg', mimeType: 'image/jpeg' };
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return { ext: '.png', mimeType: 'image/png' };
    }
    // GIF: 47 49 46 38
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
        return { ext: '.gif', mimeType: 'image/gif' };
    }
    // WebP: RIFF....WEBP
    if (
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
        return { ext: '.webp', mimeType: 'image/webp' };
    }
    // SVG: text starting with <svg or <?xml
    const head = buffer.subarray(0, 256).toString('utf8').trim().toLowerCase();
    if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
        return { ext: '.svg', mimeType: 'image/svg+xml' };
    }

    return null;
}

export function extractGoogleDriveFileId(url: string): string | null {
    if (!url) return null;
    const lh3Match = url.match(/lh3\.googleusercontent\.com\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
    if (lh3Match) return lh3Match[1];

    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];

    const idParamMatch = url.match(/(?:drive\.google\.com|drive\.usercontent\.google\.com|docs\.google\.com)\/(?:open|uc|thumbnail|download)\?[^#]*\bid=([a-zA-Z0-9_-]+)/);
    if (idParamMatch) return idParamMatch[1];

    return null;
}

export function getCacheFilename(url: string): string {
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 16);
    const base = path.basename(url.split('?')[0]).replace(/[^a-zA-Z0-9._-]/g, '_');
    return `cached_${hash}_${base}`;
}

export function getMimeFromExt(ext: string): string {
    switch (ext.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        case '.pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
}

export async function registerMediaFileIfMissing(params: {
    filePath: string;
    fileName?: string;
    originalName?: string;
    folder?: string;
    alt?: string | null;
    uploadedBy?: string | null;
    fileSize?: number;
    mimeType?: string;
}) {
    const cleanWebPath = params.filePath.startsWith('/') ? params.filePath : `/${params.filePath}`;
    const existing = await prisma.mediaFile.findFirst({
        where: { filePath: cleanWebPath },
    });

    if (existing) {
        if (!existing.alt && params.alt) {
            return await prisma.mediaFile.update({
                where: { id: existing.id },
                data: { alt: params.alt },
            });
        }
        return existing;
    }

    const absPath = path.join(process.cwd(), 'public', cleanWebPath.replace(/^\//, ''));
    let fileSize = params.fileSize || 0;
    let mimeType = params.mimeType || '';

    if (fs.existsSync(absPath)) {
        const stat = fs.statSync(absPath);
        fileSize = stat.size;
        if (!mimeType) {
            try {
                const fd = fs.openSync(absPath, 'r');
                const buf = Buffer.alloc(64);
                fs.readSync(fd, buf, 0, 64, 0);
                fs.closeSync(fd);
                const detected = detectImageFormat(buf);
                mimeType = detected?.mimeType || getMimeFromExt(path.extname(absPath));
            } catch {
                mimeType = getMimeFromExt(path.extname(absPath));
            }
        }
    }

    if (!mimeType) mimeType = getMimeFromExt(path.extname(cleanWebPath));
    const fileName = params.fileName || path.basename(cleanWebPath);
    const folder = params.folder || (cleanWebPath.split('/')[2] || 'general');

    return await prisma.mediaFile.create({
        data: {
            fileName,
            originalName: params.originalName || fileName,
            filePath: cleanWebPath,
            fileSize,
            mimeType,
            folder,
            alt: params.alt || null,
            uploadedBy: params.uploadedBy || null,
        },
    });
}

function findExistingLocalFileByStem(dir: string, stem: string): string | null {
    if (!fs.existsSync(dir)) return null;
    for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.gif']) {
        const candidate = `${stem}${ext}`;
        const full = path.join(dir, candidate);
        if (fs.existsSync(full) && fs.statSync(full).size > 200) {
            return candidate;
        }
    }
    return null;
}

async function fetchBufferWithRetries(url: string, retries = 3): Promise<Buffer | null> {
    const driveId = extractGoogleDriveFileId(url);
    const candidates = driveId
        ? [
            `https://lh3.googleusercontent.com/d/${driveId}=s0`,
            `https://lh3.googleusercontent.com/d/${driveId}`,
            `https://drive.google.com/uc?export=download&id=${driveId}`,
            `https://drive.usercontent.google.com/download?id=${driveId}&export=download`,
        ]
        : [url];

    for (const target of candidates) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 15000);
                const res = await fetch(target, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                    },
                });
                clearTimeout(timer);
                if (!res.ok) {
                    if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * attempt));
                    continue;
                }
                const buf = Buffer.from(await res.arrayBuffer());
                if (detectImageFormat(buf)) {
                    return buf;
                }
            } catch {
                if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * attempt));
            }
        }
    }
    return null;
}

/**
 * Downloads a remote image (Google Drive, iili.io, or other http/https URL) into
 * /public/uploads/<folder>/, registers it in MediaFile, and returns the local path.
 * Returns the original URL only if download fails.
 */
export async function localizeImageUrl(
    rawUrl: string,
    options: { folder?: string; alt?: string; displayName?: string } = {}
): Promise<string> {
    if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
    const url = rawUrl.trim();
    if (!url) return url;

    const folder = (options.folder || 'products').replace(/[^a-zA-Z0-9_-]/g, '') || 'products';
    const targetDir = path.join(UPLOAD_ROOT, folder);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // Already local
    if (url.startsWith('/uploads/')) {
        await registerMediaFileIfMissing({
            filePath: url,
            folder: url.split('/')[2] || folder,
            alt: options.alt || null,
            originalName: options.displayName || path.basename(url),
        });
        return url;
    }
    if (url.startsWith('/images/')) {
        return url;
    }

    // Ignore non-http URLs (data: handled by image-parser)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return url;
    }

    const driveId = extractGoogleDriveFileId(url);
    const urlHash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
    let stem: string;
    if (driveId) {
        stem = `gd-${driveId}`;
    } else {
        const cleanBase = path.basename(url.split('?')[0]).replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 32) || 'img';
        stem = `ext-${cleanBase}-${urlHash}`;
    }

    // 1. Reuse already localized file on disk
    const existingFile = findExistingLocalFileByStem(targetDir, stem);
    if (existingFile) {
        const webPath = `/uploads/${folder}/${existingFile}`;
        await registerMediaFileIfMissing({
            filePath: webPath,
            fileName: existingFile,
            originalName: options.displayName || existingFile,
            folder,
            alt: options.alt || null,
        });
        return webPath;
    }

    // 2. Reuse cached file from /public/uploads/cache if available
    let buffer: Buffer | null = null;
    const cacheFile = path.join(CACHE_DIR, getCacheFilename(url));
    if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 200) {
        const cachedBuf = fs.readFileSync(cacheFile);
        if (detectImageFormat(cachedBuf)) {
            buffer = cachedBuf;
        }
    }

    // 3. Otherwise download from remote URL
    if (!buffer) {
        buffer = await fetchBufferWithRetries(url);
    }

    if (!buffer) {
        return url;
    }

    const detected = detectImageFormat(buffer);
    if (!detected) {
        return url;
    }

    const fileName = `${stem}${detected.ext}`;
    const absPath = path.join(targetDir, fileName);
    fs.writeFileSync(absPath, buffer);

    const webPath = `/uploads/${folder}/${fileName}`;
    await registerMediaFileIfMissing({
        filePath: webPath,
        fileName,
        originalName: options.displayName || fileName,
        folder,
        alt: options.alt || null,
        fileSize: buffer.length,
        mimeType: detected.mimeType,
    });

    return webPath;
}

/**
 * Scans all files under /public/uploads/* (except temporary /cache/)
 * and ensures every file is registered in the MediaFile table.
 * Also maps product names into MediaFile.alt / MediaFile.originalName for easy search.
 */
export async function syncDiskUploadsToMediaLibrary(): Promise<{
    scannedFiles: number;
    createdRecords: number;
    updatedRecords: number;
    totalInDb: number;
}> {
    const allowedFolders = ['products', 'logos', 'demo', 'general', 'blog'];

    // Build lookup from local /uploads/... path to product info
    const products = await prisma.product.findMany({
        select: { id: true, name: true, slug: true, images: true },
    });

    const pathMetaMap = new Map<string, { productName: string; slug: string; index: number }>();
    for (const p of products) {
        let imgs: any[] = [];
        try {
            imgs = JSON.parse(p.images || '[]');
        } catch {
            imgs = [];
        }
        if (!Array.isArray(imgs)) continue;
        imgs.forEach((item, idx) => {
            const u = typeof item === 'string' ? item : item?.url || item?.src || item?.path;
            if (typeof u === 'string' && u.startsWith('/uploads/')) {
                if (!pathMetaMap.has(u)) {
                    pathMetaMap.set(u, { productName: p.name, slug: p.slug, index: idx + 1 });
                }
            }
        });
    }

    const existingRecords = await prisma.mediaFile.findMany({
        select: { id: true, filePath: true, alt: true, originalName: true },
    });
    const existingByPath = new Map(existingRecords.map((r) => [r.filePath, r]));

    let scannedFiles = 0;
    let createdRecords = 0;
    let updatedRecords = 0;

    for (const folder of allowedFolders) {
        const dirPath = path.join(UPLOAD_ROOT, folder);
        if (!fs.existsSync(dirPath)) continue;

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isFile()) continue;
            const ext = path.extname(entry.name).toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf'].includes(ext)) continue;

            scannedFiles++;
            const absPath = path.join(dirPath, entry.name);
            const webPath = `/uploads/${folder}/${entry.name}`;
            const meta = pathMetaMap.get(webPath);
            const existing = existingByPath.get(webPath);

            if (!existing) {
                const stat = fs.statSync(absPath);
                let mimeType = getMimeFromExt(ext);
                try {
                    const fd = fs.openSync(absPath, 'r');
                    const buf = Buffer.alloc(64);
                    fs.readSync(fd, buf, 0, 64, 0);
                    fs.closeSync(fd);
                    const detected = detectImageFormat(buf);
                    if (detected) mimeType = detected.mimeType;
                } catch {}

                const displayOrig = meta
                    ? `${meta.slug}-${meta.index}${ext}`
                    : entry.name;

                await prisma.mediaFile.create({
                    data: {
                        fileName: entry.name,
                        originalName: displayOrig,
                        filePath: webPath,
                        fileSize: stat.size,
                        mimeType,
                        folder,
                        alt: meta ? meta.productName : null,
                    },
                });
                createdRecords++;
            } else if (meta && (!existing.alt || existing.originalName.startsWith('gd-') || existing.originalName.startsWith('ext-'))) {
                await prisma.mediaFile.update({
                    where: { id: existing.id },
                    data: {
                        ...(existing.alt ? {} : { alt: meta.productName }),
                        ...(existing.originalName.startsWith('gd-') || existing.originalName.startsWith('ext-')
                            ? { originalName: `${meta.slug}-${meta.index}${ext}` }
                            : {}),
                    },
                });
                updatedRecords++;
            }
        }
    }

    const totalInDb = await prisma.mediaFile.count();
    return { scannedFiles, createdRecords, updatedRecords, totalInDb };
}

/**
 * Localizes any remaining remote images across all products in the database,
 * updates Product.images & Product.ogImage, and syncs MediaFile.
 */
export async function localizeAllProductImagesInDb(): Promise<{
    productsProcessed: number;
    productsUpdated: number;
    imagesLocalized: number;
    imagesFailed: number;
    mediaSync: { scannedFiles: number; createdRecords: number; updatedRecords: number; totalInDb: number };
}> {
    const products = await prisma.product.findMany();
    let productsUpdated = 0;
    let imagesLocalized = 0;
    let imagesFailed = 0;

    for (const p of products) {
        let parsed: any[] = [];
        try {
            parsed = JSON.parse(p.images || '[]');
        } catch {
            parsed = p.images ? [p.images] : [];
        }
        if (!Array.isArray(parsed)) parsed = [parsed];

        let changed = false;
        const updatedImages: any[] = [];

        for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            const isObj = typeof item === 'object' && item !== null;
            const rawUrl = isObj ? (item.url || item.src || item.path || '') : String(item || '');

            if (!rawUrl) continue;

            if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
                const extGuess = path.extname(rawUrl.split('?')[0]) || '.jpg';
                const localUrl = await localizeImageUrl(rawUrl, {
                    folder: 'products',
                    alt: (isObj && item.alt) || p.name,
                    displayName: `${p.slug}-${i + 1}${extGuess}`,
                });

                if (localUrl !== rawUrl && localUrl.startsWith('/uploads/')) {
                    changed = true;
                    imagesLocalized++;
                    updatedImages.push(isObj ? { ...item, url: localUrl } : localUrl);
                } else {
                    imagesFailed++;
                    updatedImages.push(item);
                }
            } else {
                updatedImages.push(item);
            }
        }

        const firstLocal = (() => {
            const first = updatedImages[0];
            if (!first) return null;
            return typeof first === 'string' ? first : first?.url || null;
        })();

        const needsOgFix = !p.ogImage || p.ogImage.startsWith('http://') || p.ogImage.startsWith('https://');
        if (changed || (needsOgFix && firstLocal)) {
            await prisma.product.update({
                where: { id: p.id },
                data: {
                    ...(changed ? { images: JSON.stringify(updatedImages) } : {}),
                    ...(needsOgFix && firstLocal ? { ogImage: firstLocal } : {}),
                },
            });
            productsUpdated++;
        }
    }

    const mediaSync = await syncDiskUploadsToMediaLibrary();
    return {
        productsProcessed: products.length,
        productsUpdated,
        imagesLocalized,
        imagesFailed,
        mediaSync,
    };
}
