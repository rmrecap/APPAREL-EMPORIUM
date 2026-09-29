import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePreflight, withCors } from '../../cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req);
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const rawApiKey = req.headers.get('x-api-key');
        const token = authHeader?.replace(/^Bearer\s+/i, '').trim() || rawApiKey?.trim();

        if (!token) {
            return withCors(req, NextResponse.json(
                { success: false, error: 'API Key or Token missing. Add header: x-api-key or Authorization: Bearer <key>' },
                { status: 401 }
            ));
        }

        const expectedSecret = process.env.AEL_API_SECRET || process.env.API_SECRET_KEY || 'ael_secret_key_2026_xyz';
        const validKeySetting = await prisma.siteSetting.findUnique({
            where: { key: 'api_external_key' }
        });

        const isAuthorized = token === expectedSecret || (validKeySetting && token === validKeySetting.value);

        if (!isAuthorized) {
            return withCors(req, NextResponse.json(
                { success: false, error: 'Invalid API Key or Secret Token.' },
                { status: 403 }
            ));
        }

        const body = await req.json();
        const items = Array.isArray(body) ? body : body.products;

        if (!Array.isArray(items) || items.length === 0) {
            return withCors(req, NextResponse.json({
                success: false,
                error: 'Expected a JSON array of products or { products: [...] }'
            }, { status: 400 }));
        }

        const results: any[] = [];
        const errors: any[] = [];

        // Preload all categories for fast lookups
        const allCategories = await prisma.category.findMany({
            select: { id: true, slug: true, name: true }
        });
        const categoryBySlug = new Map(allCategories.map(c => [c.slug, c.id]));
        const categoryById = new Map(allCategories.map(c => [c.id, c.slug]));

        // Check Dashboard Auto-Publish Setting
        const autoPublishSetting = await prisma.siteSetting.findUnique({
            where: { key: 'api_products_auto_publish' }
        });
        const defaultAutoPublish = autoPublishSetting ? autoPublishSetting.value !== 'false' : true;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const {
                name,
                slug,
                description,
                shortDescription,
                categorySlug,
                categoryId,
                images,
                specifications,
                isFeatured = false,
                isActive,
                status,
                sku,
                tags,
                priceDisplay = true,
                minOrder,
                priceRange,
                tieredPricing,
                seoTitle,
                seoDescription,
                seoKeywords
            } = item;

            if (!name || !description || (!categorySlug && !categoryId)) {
                errors.push({ index: i, name: name || 'Unnamed', error: 'Missing name, description, or category' });
                continue;
            }

            const resolvedCategoryId = categoryId || (categorySlug ? categoryBySlug.get(categorySlug) : null);
            if (!resolvedCategoryId) {
                errors.push({ index: i, name, error: `Category "${categorySlug || categoryId}" not found` });
                continue;
            }

            let finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const existing = await prisma.product.findUnique({ where: { slug: finalSlug } });
            if (existing) {
                finalSlug = `${finalSlug}-${Date.now()}-${i}`;
            }

            try {
                const product = await prisma.product.create({
                    data: {
                        name,
                        slug: finalSlug,
                        description,
                        shortDescription: shortDescription || description.substring(0, 150),
                        categoryId: resolvedCategoryId,
                        images: Array.isArray(images) ? JSON.stringify(images) : (images || '[]'),
                        specifications: typeof specifications === 'object' && specifications !== null
                            ? JSON.stringify(specifications)
                            : (specifications || '{}'),
                        isFeatured,
                        isActive: isActive !== undefined ? Boolean(isActive) : defaultAutoPublish,
                        status: status || ((isActive !== undefined ? Boolean(isActive) : defaultAutoPublish) ? 'PUBLISHED' : 'DRAFT'),
                        sku: sku || `AE-BLK-${Date.now()}-${i}`,
                        tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
                        priceDisplay,
                        minOrder: minOrder || '',
                        priceRange: priceRange || '',
                        tieredPricing: typeof tieredPricing === 'string' ? tieredPricing : JSON.stringify(tieredPricing || []),
                        seoTitle: seoTitle || name,
                        seoDescription: seoDescription || (shortDescription || '').substring(0, 160),
                        seoKeywords: seoKeywords || (Array.isArray(tags) ? tags.join(', ') : (tags || ''))
                    }
                });
                results.push({
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    isActive: product.isActive,
                    status: product.status,
                });
            } catch (err: any) {
                errors.push({ index: i, name, error: err.message });
            }
        }

        return withCors(req, NextResponse.json({
            success: true,
            message: `Successfully processed ${results.length} of ${items.length} products.`,
            uploadedCount: results.length,
            errorCount: errors.length,
            results,
            errors
        }, { status: results.length > 0 ? 200 : 400 }));

    } catch (error: any) {
        return withCors(req, NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 }));
    }
}
