import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SAFE_CATEGORY_SELECT = {
    id: true,
    name: true,
    slug: true,
    image: true,
} as const;

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: { category: { select: SAFE_CATEGORY_SELECT } },
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // If inactive, only staff can view
        if (!product.isActive) {
            const session = await getServerSession(authOptions);
            const userRole = (session?.user as any)?.role;
            if (!['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Product GET Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: CORS_HEADERS,
    });
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get('authorization');
        const apiKey = req.headers.get('x-api-key');
        const expectedSecret = process.env.AEL_API_SECRET || process.env.API_SECRET_KEY;
        const token = authHeader?.replace('Bearer ', '').trim() || apiKey?.trim();

        if (!expectedSecret || token !== expectedSecret) {
            const guard = await requirePermission('products.edit');
            if (!guard.ok) return guard.response;
        }

        const body = await req.json();

        if (!body.name && !body.title) {
            return NextResponse.json({ error: 'Product name or title is required' }, { status: 400 });
        }

        const name = body.title || body.name;

        /* additionalCategories comes from the form as a string[] array */
        const additionalCats = Array.isArray(body.additionalCategories)
            ? JSON.stringify(body.additionalCategories)
            : (body.additionalCategories || null);

        const updateData: any = {
            ...(name && { name, title: name }),
            ...(body.slug && { slug: body.slug }),
            ...(body.styleNo && { styleNo: body.styleNo, sku: body.styleNo }),
            ...(body.description !== undefined && { description: body.description || '' }),
            ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription || '' }),
            ...(body.categoryId && { categoryId: body.categoryId }),
            ...(body.additionalCategories !== undefined && { additionalCategories: additionalCats }),
            ...(body.department !== undefined && { department: body.department }),
            ...(body.subCategory !== undefined && { subCategory: body.subCategory }),
            ...(body.divisionType !== undefined && { divisionType: body.divisionType }),
            ...(body.brand !== undefined && { brand: body.brand }),
            ...(body.fabricComposition !== undefined && { fabricComposition: body.fabricComposition }),
            ...(body.fabricConstruction !== undefined && { fabricConstruction: body.fabricConstruction }),
            ...(body.yarnCount !== undefined && { yarnCount: body.yarnCount }),
            ...(body.gsm !== undefined && { gsm: String(body.gsm) }),
            ...(body.gauge !== undefined && { gauge: body.gauge }),
            ...(body.fit !== undefined && { fit: body.fit }),
            ...(body.dyeingFinishing !== undefined && { dyeingFinishing: body.dyeingFinishing }),
            ...(body.certifications !== undefined && { certifications: typeof body.certifications === 'string' ? body.certifications : JSON.stringify(body.certifications || []) }),
            ...(body.samplingLeadTime !== undefined && { samplingLeadTime: body.samplingLeadTime }),
            ...(body.productionLeadTime !== undefined && { productionLeadTime: body.productionLeadTime }),
            ...(body.sizes !== undefined && { sizes: typeof body.sizes === 'string' ? body.sizes : JSON.stringify(body.sizes || []) }),
            ...(body.colors !== undefined && { colors: typeof body.colors === 'string' ? body.colors : JSON.stringify(body.colors || []) }),
            ...(body.targetSeason !== undefined && { targetSeason: body.targetSeason }),
            ...(body.packaging !== undefined && { packaging: body.packaging }),
            ...(body.exportMarkets !== undefined && { exportMarkets: typeof body.exportMarkets === 'string' ? body.exportMarkets : JSON.stringify(body.exportMarkets || []) }),
            ...(body.features !== undefined && { features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []) }),
            ...(body.images !== undefined && { images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []) }),
            ...(body.specifications !== undefined && { specifications: typeof body.specifications === 'string' ? body.specifications : JSON.stringify(body.specifications || {}) }),
            ...(body.variants !== undefined && { variants: typeof body.variants === 'string' ? body.variants : JSON.stringify(body.variants || []) }),
            ...(body.tieredPricing !== undefined && { tieredPricing: typeof body.tieredPricing === 'string' ? body.tieredPricing : JSON.stringify(body.tieredPricing || []) }),
            ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
            ...(body.isActive !== undefined && { isActive: body.isActive }),
            ...(body.status !== undefined && { status: body.status }),
            ...(body.tags !== undefined && { tags: typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []) }),
            ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
            ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription }),
        };

        const product = await prisma.product.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json({ success: true, product }, { headers: CORS_HEADERS });
    } catch (error: any) {
        console.error('Product PUT Error:', error?.message || error);
        return NextResponse.json({ error: error?.message || 'Failed to update product' }, { status: 500, headers: CORS_HEADERS });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get('authorization');
        const apiKey = req.headers.get('x-api-key');
        const expectedSecret = process.env.AEL_API_SECRET || process.env.API_SECRET_KEY;
        const token = authHeader?.replace('Bearer ', '').trim() || apiKey?.trim();

        if (!expectedSecret || token !== expectedSecret) {
            const guard = await requirePermission('products.delete');
            if (!guard.ok) return guard.response;
        }

        await prisma.product.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { headers: CORS_HEADERS });
    } catch (error: any) {
        console.error('Product DELETE Error:', error?.message || error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500, headers: CORS_HEADERS });
    }
}
