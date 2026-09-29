import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractApiKey, verifyApiKey } from '@/lib/api-auth';
import { corsHeaders, handlePreflight, withCors } from '../cors';

// ─── PREFLIGHT (required for browser CORS) ───────────────────────────────────
export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req);
}

// ─── POST: Create a new product ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));

        // 1. Extract and Authenticate API Key
        const incomingKey = extractApiKey(req, body);

        if (!incomingKey) {
            return withCors(req, NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized access: API Key missing. Send via header (x-api-key, x-secret-key, or Authorization) or request body.',
                    receivedKey: 'none'
                },
                { status: 401 }
            ));
        }

        const isAuthorized = await verifyApiKey(incomingKey);
        if (!isAuthorized) {
            return withCors(req, NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized access: Invalid Secret Key',
                    receivedKey: incomingKey ? `${incomingKey.substring(0, 4)}...` : 'none'
                },
                { status: 401 }
            ));
        }

        // Handle connection test
        if (body.test === true || body.ping === true || Object.keys(body).length === 0 || (Object.keys(body).length === 1 && (body.apiKey || body.secretKey || body['x-api-key']))) {
            return withCors(req, NextResponse.json({
                success: true,
                message: 'Connected Successfully to AELBD API!'
            }, { status: 200 }));
        }

        const {
            name,
            title,
            styleNo,
            category,
            subCategory,
            divisionType,
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
        } = body;

        // Check Dashboard Auto-Publish Setting
        const autoPublishSetting = await prisma.siteSetting.findUnique({
            where: { key: 'api_products_auto_publish' }
        });
        // Default to true if not configured; if set to 'false', products are saved as DRAFT
        const defaultAutoPublish = autoPublishSetting ? autoPublishSetting.value !== 'false' : true;
        const finalIsActive = isActive !== undefined ? Boolean(isActive) : defaultAutoPublish;
        const finalStatus = status || (finalIsActive ? 'PUBLISHED' : 'DRAFT');

        const productName = name || title || (styleNo ? `Style ${styleNo}` : '');
        const productDescription = description || shortDescription || productName;
        const requestedCat = categorySlug || category || subCategory || divisionType;

        // 3. Validate required fields
        if (!productName || !productDescription) {
            return withCors(req, NextResponse.json({
                success: false,
                error: 'Missing required fields. Need: name/title and description.'
            }, { status: 400 }));
        }

        // 4. Resolve Category by slug or name (with auto fallback)
        let resolvedCategoryId = categoryId;
        if (!resolvedCategoryId && requestedCat) {
            const catSlug = String(requestedCat).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const categoryMatch = await prisma.category.findFirst({
                where: { OR: [{ slug: catSlug }, { name: String(requestedCat) }] }
            });
            if (categoryMatch) {
                resolvedCategoryId = categoryMatch.id;
            } else {
                const createdCat = await prisma.category.create({
                    data: {
                        name: String(requestedCat),
                        slug: catSlug || `cat-${Date.now()}`,
                        description: `Sourcing category for ${requestedCat}`
                    }
                });
                resolvedCategoryId = createdCat.id;
            }
        } else if (!resolvedCategoryId) {
            const defaultCat = await prisma.category.findFirst();
            if (defaultCat) {
                resolvedCategoryId = defaultCat.id;
            } else {
                const apparelCat = await prisma.category.create({
                    data: {
                        name: 'Apparel',
                        slug: 'apparel',
                        description: 'General Apparel Category'
                    }
                });
                resolvedCategoryId = apparelCat.id;
            }
        }

        // 5. Auto-generate slug from name if not provided
        let finalSlug = slug || productName.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // 6. Check if slug already exists; append timestamp if so
        const existing = await prisma.product.findUnique({ where: { slug: finalSlug } });
        if (existing) {
            finalSlug = `${finalSlug}-${Date.now()}`;
        }

        // 7. Build tiered pricing string
        let tieredPricingStr = '[]';
        if (tieredPricing) {
            tieredPricingStr = typeof tieredPricing === 'string'
                ? tieredPricing
                : JSON.stringify(tieredPricing);
        }

        // 8. Build auto price range from tiers if priceRange is not given
        let finalPriceRange = priceRange || '';
        if (!finalPriceRange && tieredPricing && Array.isArray(tieredPricing) && tieredPricing.length > 0) {
            const prices = tieredPricing.map((t: any) => parseFloat(t.price)).filter(p => !isNaN(p));
            if (prices.length > 0) {
                const minP = Math.min(...prices);
                const maxP = Math.max(...prices);
                finalPriceRange = minP === maxP ? `$${minP.toFixed(2)}` : `$${minP.toFixed(2)} - $${maxP.toFixed(2)}`;
            }
        }

        const finalSku = sku || styleNo || `AE-EXT-${Date.now()}`;

        // 9. Create Product
        const product = await prisma.product.create({
            data: {
                name: productName,
                title: productName,
                styleNo: styleNo || finalSku,
                slug: finalSlug,
                description: productDescription,
                shortDescription: shortDescription || productDescription.substring(0, 150),
                categoryId: resolvedCategoryId,
                images: Array.isArray(images) ? JSON.stringify(images) : (images || '[]'),
                specifications: typeof specifications === 'object' && specifications !== null
                    ? JSON.stringify(specifications)
                    : (specifications || '{}'),
                isFeatured,
                isActive: finalIsActive,
                status: finalStatus,
                sku: finalSku,
                tags: Array.isArray(tags) ? tags.join(', ') : (tags || ''),
                priceDisplay,
                minOrder: minOrder || '',
                priceRange: finalPriceRange,
                tieredPricing: tieredPricingStr,
                seoTitle: seoTitle || productName,
                seoDescription: seoDescription || (shortDescription || '').substring(0, 160),
                seoKeywords: seoKeywords || (Array.isArray(tags) ? tags.join(', ') : (tags || ''))
            },
            include: {
                category: { select: { name: true, slug: true } }
            }
        });

        const statusMessage = finalIsActive
            ? `✅ Product "${product.name}" published LIVE successfully to website!`
            : `📝 Product "${product.name}" saved as DRAFT in Admin Dashboard (Awaiting Approval)!`;

        return withCors(req, NextResponse.json({
            success: true,
            message: statusMessage,
            mode: finalIsActive ? 'PUBLISHED_LIVE' : 'SAVED_DRAFT',
            product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                category: product.category.name,
                categorySlug: product.category.slug,
                priceRange: product.priceRange,
                isActive: product.isActive,
                status: product.status,
                url: `/products/${product.slug}`
            }
        }, { status: 201 }));

    } catch (error: any) {
        console.error('[External API] POST /products error:', error);
        return withCors(req, NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 }));
    }
}

// ─── GET: List recent products ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const incomingKey = extractApiKey(req);
    const isAuthorized = await verifyApiKey(incomingKey);

    if (!isAuthorized) {
        return withCors(req, NextResponse.json(
            { success: false, error: 'Unauthorized. Provide a valid API key header (x-api-key or Authorization).' },
            { status: 401 }
        ));
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const categorySlug = searchParams.get('category');

    const where: any = {};
    if (categorySlug) {
        const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
        if (cat) where.categoryId = cat.id;
    }

    const products = await prisma.product.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            priceRange: true,
            isFeatured: true,
            isActive: true,
            createdAt: true,
            category: { select: { name: true, slug: true } }
        }
    });

    return withCors(req, NextResponse.json({
        success: true,
        count: products.length,
        products
    }));
}
