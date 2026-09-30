import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractApiKey, verifyApiKey } from '@/lib/api-auth';
import { normalizeIncomingImages } from '@/lib/image-parser';
import { resolveOrCreateCategory } from '@/lib/category-resolver';
import { buildCategoryPrismaFilter } from '@/lib/catalog-taxonomy';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-secret-key, secret-key, api-key, authorization, Authorization, ngrok-skip-browser-warning',
};

const SAFE_CATEGORY_SELECT = {
    id: true,
    name: true,
    slug: true,
    image: true,
} as const;

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: CORS_HEADERS,
    });
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100);
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
        const skip = (page - 1) * limit;

        const q = searchParams.get('q');
        const featured = searchParams.get('featured');
        const category = searchParams.get('category');
        const categoryId = searchParams.get('category_id');
        const includeAllParam = searchParams.get('include_all') === 'true';
        const ids = searchParams.get('ids');

        // Only authenticated staff may view inactive/draft products
        let allowInactive = false;
        if (includeAllParam) {
            const session = await getServerSession(authOptions);
            const userRole = (session?.user as any)?.role;
            if (['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
                allowInactive = true;
            }
        }

        const where: any = {};
        if (!allowInactive) where.isActive = true;
        if (featured === 'true') where.isFeatured = true;
        if (categoryId) where.categoryId = categoryId;
        if (ids) where.id = { in: ids.split(',') };

        if (category) {
            const allCats = await prisma.category.findMany({
                where: { isActive: true },
                select: { id: true, name: true, slug: true, parentId: true }
            });
            const catFilter = buildCategoryPrismaFilter(category, allCats as any);
            where.AND = [catFilter];
        }

        if (q) {
            where.OR = [
                { name: { contains: q } },
                { description: { contains: q } },
                { tags: { contains: q } },
                { slug: { contains: q } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: { select: SAFE_CATEGORY_SELECT } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({ success: true, products, total }, { headers: CORS_HEADERS });
    } catch (error: any) {
        console.error('Products GET Error:', error);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500, headers: CORS_HEADERS });
    }
}

export async function POST(req: NextRequest) {
    try {
        // ১. রিকোয়েস্ট বডি এবং এপিআই কী রিড করা
        const body = await req.json().catch(() => ({}));
        const incomingKey = extractApiKey(req, body);

        let isExternalAuthorized = false;

        if (incomingKey) {
            const isValid = await verifyApiKey(incomingKey);
            if (isValid) {
                isExternalAuthorized = true;
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unauthorized access: Invalid Secret Key',
                        receivedKey: incomingKey ? `${incomingKey.substring(0, 4)}...` : 'none'
                    },
                    { status: 401, headers: CORS_HEADERS }
                );
            }
        }

        // যদি এক্সটার্নাল টোকেন না থাকে, তবে ইন্টারনাল অ্যাডমিন পারমিশন যাচাই করা হবে
        if (!isExternalAuthorized) {
            try {
                const guard = await requirePermission('products.create');
                if (!guard.ok) return guard.response;
            } catch {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized: Valid Secret Key or Staff Login Required' },
                    { status: 401, headers: CORS_HEADERS }
                );
            }
        }

        // টেস্ট কানেকশন রিকোয়েস্ট হ্যান্ডলিং (AI Tool "Test API Connection" চেক)
        if (body.test === true || body.ping === true || Object.keys(body).length === 0 || (Object.keys(body).length === 1 && (body.apiKey || body.secretKey || body['x-api-key']))) {
            return NextResponse.json(
                { success: true, message: 'Connected Successfully to AELBD API!' },
                { status: 200, headers: CORS_HEADERS }
            );
        }

        const {
            styleNo,
            title,
            name,
            slug,
            category,
            categoryId,
            department,
            subCategory,
            divisionType,
            brand,
            fabricComposition,
            fabricConstruction,
            yarnCount,
            gsm,
            gauge,
            fit,
            dyeingFinishing,
            certifications,
            samplingLeadTime,
            productionLeadTime,
            sizes,
            colors,
            targetSeason,
            packaging,
            exportMarkets,
            shortDescription,
            description,
            features,
            specifications,
            tags,
            seoTitle,
            seoDescription,
            seoKeywords,
            images,
            isHumanVerified,
            verifiedBy,
            status,
            isFeatured,
            isActive,
            sku,
            variants,
            tieredPricing,
            minOrder,
            priceRange,
            priceDisplay,
        } = body;

        const productTitle = title || name || body.productName || (styleNo ? `Style ${styleNo}` : 'New Product');

        // ৩. ক্যাটাগরি রেজোলিউশন (ক্যাটাগরি আইডি না থাকলে নাম বা স্লাগ দিয়ে স্বয়ংক্রিয় তৈরি বা ম্যাচ)
        const requestedCat = categoryId || category || subCategory || divisionType || 'Apparel';
        const resolvedCategory = await resolveOrCreateCategory(requestedCat);
        const resolvedCategoryId = resolvedCategory.id;

        // ৪. স্লাগ ও এসকেইউ ফরম্যাটিং
        const baseSlug = slug || productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
        const finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
        const finalSku = styleNo || sku || `AEL-${Date.now().toString().slice(-6)}`;

        // ৫. ইমেজ ও স্পেসিফিকেশন সিরিয়ালাইজেশন
        const finalImageUrls = normalizeIncomingImages(body);
        const imagesJson = JSON.stringify(finalImageUrls);

        let specsJson = '{}';
        if (typeof specifications === 'object' && specifications !== null) {
            specsJson = JSON.stringify(specifications);
        } else if (typeof specifications === 'string') {
            specsJson = specifications;
        } else {
            // যদি AI DNA ফিল্ডগুলো আলাদা আসে, স্পেক্স অবজেক্টে যোগ করে দেওয়া
            specsJson = JSON.stringify({
                fabricComposition: fabricComposition || '',
                fabricConstruction: fabricConstruction || '',
                yarnCount: yarnCount || '',
                gsm: gsm || '',
                gauge: gauge || '',
                fit: fit || '',
                dyeingFinishing: dyeingFinishing || '',
                leadTime: productionLeadTime || samplingLeadTime || '',
            });
        }

        const stringifyArray = (val: any) => {
            if (Array.isArray(val)) return JSON.stringify(val);
            if (typeof val === 'string') return val;
            return null;
        };

        const tagsString = Array.isArray(tags) ? tags.join(', ') : (tags || '');

        // Check Dashboard Auto-Publish Setting
        const autoPublishSetting = await prisma.siteSetting.findUnique({
            where: { key: 'api_products_auto_publish' },
        });
        const defaultAutoPublish = autoPublishSetting ? autoPublishSetting.value !== 'false' : true;
        const finalIsActive = isActive !== undefined ? Boolean(isActive) : defaultAutoPublish;
        const finalStatus = status || (finalIsActive ? 'PUBLISHED' : 'DRAFT');

        // ৬. ডাটাবেসে সেভ করা (Prisma Create / Upsert)
        const productData = {
            name: productTitle,
            title: productTitle,
            slug: finalSlug,
            sku: finalSku,
            styleNo: styleNo || finalSku,
            categoryId: resolvedCategoryId,
            department: department || 'Menswear',
            subCategory: subCategory || (typeof category === 'string' ? category : 'General'),
            divisionType: divisionType || 'Knit',
            brand: brand || 'Apparel Emporium',
            fabricComposition: fabricComposition || null,
            fabricConstruction: fabricConstruction || null,
            yarnCount: yarnCount || null,
            gsm: gsm ? String(gsm) : null,
            gauge: gauge || null,
            fit: fit || null,
            dyeingFinishing: dyeingFinishing || null,
            certifications: stringifyArray(certifications),
            samplingLeadTime: samplingLeadTime || null,
            productionLeadTime: productionLeadTime || null,
            sizes: stringifyArray(sizes),
            colors: stringifyArray(colors),
            targetSeason: targetSeason || null,
            packaging: packaging || null,
            exportMarkets: stringifyArray(exportMarkets),
            features: stringifyArray(features),
            shortDescription: shortDescription || description?.slice(0, 160) || '',
            description: description || shortDescription || productTitle,
            specifications: specsJson,
            tags: tagsString,
            seoTitle: seoTitle || productTitle,
            seoDescription: seoDescription || shortDescription || description?.slice(0, 150) || '',
            seoKeywords: seoKeywords || null,
            ogImage: Array.isArray(images) && images.length > 0 ? images[0] : null,
            images: imagesJson,
            variants: typeof variants === 'string' ? variants : JSON.stringify(variants || []),
            tieredPricing: typeof tieredPricing === 'string' ? tieredPricing : JSON.stringify(tieredPricing || []),
            isFeatured: isFeatured ?? false,
            isActive: finalIsActive,
            priceDisplay: priceDisplay ?? false,
            minOrder: minOrder || null,
            priceRange: priceRange || null,
            isHumanVerified: Boolean(isHumanVerified),
            verifiedBy: verifiedBy || null,
            status: finalStatus,
        };

        let product;
        const existingByStyle = (productData.styleNo) ? await prisma.product.findUnique({ where: { styleNo: productData.styleNo } }) : null;
        const existingBySlug = (!existingByStyle && productData.slug) ? await prisma.product.findUnique({ where: { slug: productData.slug } }) : null;
        const existingTarget = existingByStyle || existingBySlug;

        if (existingTarget) {
            product = await prisma.product.update({
                where: { id: existingTarget.id },
                data: productData,
            });
        } else {
            product = await prisma.product.create({
                data: productData,
            });
        }

        const statusNotice = finalIsActive
            ? 'Style successfully published to AELBD sourcing catalog (LIVE)!'
            : 'Style saved as DRAFT in AELBD Admin Portal (Awaiting Review)!';

        return NextResponse.json(
            {
                success: true,
                message: statusNotice,
                mode: finalIsActive ? 'PUBLISHED_LIVE' : 'SAVED_DRAFT',
                product,
            },
            { status: 201, headers: CORS_HEADERS }
        );
    } catch (error: any) {
        console.error('AELBD Upload Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create product' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
