import fs from 'fs';
import path from 'path';

/**
 * Normalizes all possible variations of image inputs from external tools, AI models,
 * form submissions, or API requests into a clean array of string URLs.
 * 
 * Supports:
 * - Direct URLs: ["https://..."]
 * - Object arrays: [{ url: "https://..." }] or [{ src: "..." }]
 * - Singular image fields: imageUrl, image, coverImage, thumbnail, photo, etc.
 * - Comma-separated strings: "url1, url2"
 * - JSON encoded strings: '["url1"]'
 * - Base64 Data URLs: "data:image/jpeg;base64,..." (auto-saved to /uploads/products/)
 * - Attached files from multipart/form-data
 */
export function normalizeIncomingImages(body: any, extraFileUrls: string[] = []): string[] {
    const rawList: any[] = [...extraFileUrls];

    if (!body || typeof body !== 'object') {
        return filterAndCleanUrls(rawList);
    }

    const candidateKeys = [
        'images', 'image', 'imageUrl', 'image_url', 'photos', 'photo',
        'gallery', 'pictures', 'picture', 'thumbnail', 'thumb',
        'coverImage', 'cover_image', 'featuredImage', 'featured_image',
        'media', 'files', 'img', 'imgs', 'productImages', 'product_images',
        'productImage', 'product_image', 'ogImage'
    ];

    const sources = [body, body.product, body.data, body.payload].filter(Boolean);

    for (const src of sources) {
        for (const key of candidateKeys) {
            const val = src[key];
            if (val === undefined || val === null || val === '') continue;

            if (Array.isArray(val)) {
                for (const item of val) {
                    if (typeof item === 'string') rawList.push(item);
                    else if (typeof item === 'object' && item !== null) {
                        const u = item.url || item.src || item.link || item.path;
                        if (u) rawList.push(u);
                    }
                }
            } else if (typeof val === 'object' && val !== null) {
                const u = val.url || val.src || val.link || val.path;
                if (u) rawList.push(u);
            } else if (typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed)) {
                            for (const item of parsed) {
                                if (typeof item === 'string') rawList.push(item);
                                else if (typeof item === 'object' && item !== null) {
                                    const u = item.url || item.src || item.link || item.path;
                                    if (u) rawList.push(u);
                                }
                            }
                        }
                    } catch {
                        rawList.push(trimmed);
                    }
                } else if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
                    trimmed.split(',').forEach(s => {
                        const cl = s.trim();
                        if (cl) rawList.push(cl);
                    });
                } else {
                    rawList.push(trimmed);
                }
            }
        }
    }

    return filterAndCleanUrls(rawList);
}

function filterAndCleanUrls(items: any[]): string[] {
    const results: string[] = [];
    const seen = new Set<string>();

    for (const item of items) {
        if (!item || typeof item !== 'string') continue;
        const trimmed = item.trim();
        if (!trimmed || trimmed === '[]' || trimmed === 'null' || trimmed === '{}' || trimmed === 'undefined') {
            continue;
        }

        // Handle Base64 Data URL (save to /public/uploads/products)
        if (trimmed.startsWith('data:image/')) {
            try {
                const match = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
                if (match) {
                    const ext = match[1] === 'jpeg' ? '.jpg' : `.${match[1]}`;
                    const cleanBase64 = match[2].replace(/\s/g, '');
                    const buffer = Buffer.from(cleanBase64, 'base64');
                    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const fileName = `gen-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
                    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
                    const savedPath = `/uploads/products/${fileName}`;
                    if (!seen.has(savedPath)) {
                        seen.add(savedPath);
                        results.push(savedPath);
                    }
                    continue;
                }
            } catch (err) {
                console.error('[image-parser] Failed to decode base64 image:', err);
            }
        }

        if (!seen.has(trimmed)) {
            seen.add(trimmed);
            results.push(trimmed);
        }
    }

    return results;
}
