import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractApiKey, verifyApiKey } from '@/lib/api-auth';
import { corsHeaders, handlePreflight, withCors } from '../cors';
import { normalizeIncomingImages } from '@/lib/image-parser';
import { resolveOrCreateCategory } from '@/lib/category-resolver';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// ─── PREFLIGHT (required for browser CORS) ───────────────────────────────────
export async function OPTIONS(req: NextRequest) {
    return handlePreflight(req);
}

// ─── POST: Create or Update a product from External API ───────────────────────
export async function POST(req: NextRequest) {
    try {
        let body: any = {};
        const uploadedFiles: string[] = [];
        const contentType = req.headers.get('content-type') || '';

        // Support both application/json and multipart/form-data
        if (contentType.includes('multipart/form-data')) {
            try {
                const formData = await req.formData();
                for (const [key, value] of formData.entries()) {
                    if (value instanceof File) {
                        const bytes = await value.arrayBuffer();
                        const buffer = Buffer.from(bytes);
                        const ext = path.extname(value.name || '').toLowerCase() || '.jpg';
                        const safeBase = (value.name || 'product').replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 30);
                        const fileName = `${safeBase}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}${ext}`;
                        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
                        if (!fs.existsSync(uploadDir)) {
                            fs.mkdirSync(uploadDir, { recursive: true });
                        }
                        fs.writeFileSync(path.join(uploadDir, fileName), buffer);
                        uploadedFiles.push(`/uploads/products/${fileName}`);
                    } else if (typeof value === 'string') {
                        try {
                            body[key] = JSON.parse(value);
                        } catch {
                            body[key] = value;
                        }
                    }
                }
            } catch (err) {
                console.error('[External API] formData parse error:', err);
            }
        } else {
            body = await req.json().catch(() => ({}));
        }

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

        // 2. Field Extraction & Fallbacks
        const productName = body.name || body.title || body.productName || body.product_name || (body.styleNo ? `Style ${body.styleNo}` : 'New Apparel Product');
        const productDescription = body.description || body.shortDescription || body.desc || body.details || body.content || `${productName} manufactured for global B2B export by Apparel Emporium.`;
        const shortDescription = body.shortDescription || productDescription.substring(0, 160);

        // 3. Category Resolution (guaranteed never to crash)
        const requestedCat = body.categoryId || body.categorySlug || body.category || body.subCategory || body.divisionType || 'Apparel';
        const resolvedCategory = await resolveOrCreateCategory(requestedCat);
        const resolvedCategoryId = resolvedCategory.id;

        // 4. Image Extraction (handles images, imageUrl, photo, gallery, coverImage, base64, etc.)
        const finalImageUrls = normalizeIncomingImages(body, uploadedFiles);
        const imagesJson = JSON.stringify(finalImageUrls);

        // 5. Auto-publish status check
        const autoPublishSetting = await prisma.siteSetting.findUnique({
            where: { key: 'api_products_auto_publish' }
        });
        const defaultAutoPublish = autoPublishSetting ? autoPublishSetting.value !== 'false' : true;
        const finalIsActive = body.isActive !== undefined ? Boolean(body.isActive) : defaultAutoPublish;
        const finalStatus = body.status || (finalIsActive ? 'PUBLISHED' : 'DRAFT');

        // 6. Pricing & Tiers
        let tieredPricingStr = '[]';
        if (body.tieredPricing) {
            tieredPricingStr = typeof body.tieredPricing === 'string'
                ? body.tieredPricing
                : JSON.stringify(body.tieredPricing);
        }

        let finalPriceRange = body.priceRange || '';
        if (!finalPriceRange && body.tieredPricing && Array.isArray(body.tieredPricing) && body.tieredPricing.length > 0) {
            const prices = body.tieredPricing.map((t: any) => parseFloat(t.price)).filter((p: number) => !isNaN(p));
            if (prices.length > 0) {
                const minP = Math.min(...prices);
                const maxP = Math.max(...prices);
                finalPriceRange = minP === maxP ? `$${minP.toFixed(2)}` : `$${minP.toFixed(2)} - $${maxP.toFixed(2)}`;
            }
        }

        const finalSku = body.sku || body.styleNo || `AE-EXT-${Date.now().toString().slice(-6)}`;
        const finalStyleNo = body.styleNo || finalSku;

        const stringifyVal = (val: any) => {
            if (Array.isArray(val)) return JSON.stringify(val);
            if (typeof val === 'string') return val;
            return null;
        };

        // Specifications
        let specsJson = '{}';
        if (typeof body.specifications === 'object' && body.specifications !== null) {
            specsJson = JSON.stringify(body.specifications);
        } else if (typeof body.specifications === 'string') {
            specsJson = body.specifications;
        } else {
            specsJson = JSON.stringify({
                Fabric: body.fabricComposition || body.fabric || '100% Cotton',
                GSM: body.gsm ? String(body.gsm) : '180 GSM',
                MOQ: body.minOrder || '500 pcs',
                Fit: body.fit || 'Regular Fit'
            });
        }

        const tags = body.tags;
        const tagsString = Array.isArray(tags) ? tags.join(', ') : (tags || '');

        const productData = {
            name: productName,
            title: productName,
            styleNo: finalStyleNo,
            description: productDescription,
            shortDescription: shortDescription,
            categoryId: resolvedCategoryId,
            department: body.department || 'Menswear',
            subCategory: body.subCategory || resolvedCategory.name || 'General',
            divisionType: body.divisionType || 'Knit',
            brand: body.brand || 'Apparel Emporium',
            fabricComposition: body.fabricComposition || body.fabric || null,
            fabricConstruction: body.fabricConstruction || null,
            yarnCount: body.yarnCount || null,
            gsm: body.gsm ? String(body.gsm) : null,
            gauge: body.gauge || null,
            fit: body.fit || null,
            dyeingFinishing: body.dyeingFinishing || null,
            certifications: stringifyVal(body.certifications),
            sizes: stringifyVal(body.sizes),
            colors: stringifyVal(body.colors),
            samplingLeadTime: body.samplingLeadTime || null,
            productionLeadTime: body.productionLeadTime || null,
            images: imagesJson,
            specifications: specsJson,
            isFeatured: body.isFeatured ?? false,
            isActive: finalIsActive,
            status: finalStatus,
            sku: finalSku,
            tags: tagsString,
            priceDisplay: body.priceDisplay ?? true,
            minOrder: body.minOrder || '',
            priceRange: finalPriceRange,
            tieredPricing: tieredPricingStr,
            seoTitle: body.seoTitle || productName,
            seoDescription: body.seoDescription || shortDescription.substring(0, 160),
            seoKeywords: body.seoKeywords || tagsString
        };

        // 7. Safe Upsert Product (Prevent duplicate styleNo or slug failure)
        let product: any;
        const existingByStyle = finalStyleNo ? await prisma.product.findUnique({ where: { styleNo: finalStyleNo } }) : null;
        
        // Base slug
        const rawSlug = body.slug || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
        const existingBySlug = (!existingByStyle) ? await prisma.product.findUnique({ where: { slug: rawSlug } }) : null;

        const existing = existingByStyle || existingBySlug;

        if (existing) {
            product = await prisma.product.update({
                where: { id: existing.id },
                data: {
                    ...productData,
                    slug: existing.slug // Keep existing slug on update
                },
                include: {
                    category: { select: { name: true, slug: true } }
                }
            });
        } else {
            // Guarantee unique slug on insert
            let finalSlug = rawSlug;
            const slugCheck = await prisma.product.findUnique({ where: { slug: finalSlug } });
            if (slugCheck) {
                finalSlug = `${rawSlug}-${Date.now().toString().slice(-4)}`;
            }

            product = await prisma.product.create({
                data: {
                    ...productData,
                    slug: finalSlug
                },
                include: {
                    category: { select: { name: true, slug: true } }
                }
            });
        }

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
                styleNo: product.styleNo,
                category: product.category?.name || resolvedCategory.name,
                categorySlug: product.category?.slug || resolvedCategory.slug,
                images: finalImageUrls,
                imageCount: finalImageUrls.length,
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
            styleNo: true,
            images: true,
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
