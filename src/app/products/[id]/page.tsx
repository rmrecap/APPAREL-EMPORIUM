import { prisma } from '@/lib/prisma';
import { notFound, permanentRedirect } from 'next/navigation';
import ProductDetail3DView from '@/components/products/ProductDetail3DView';
import { Metadata } from 'next';
import { extractProductImages, extractFeaturedImage } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    let decodedSlug = params.id;
    try {
        decodedSlug = decodeURIComponent(params.id);
    } catch { }

    const product = await prisma.product.findFirst({
        where: {
            OR: [
                { slug: params.id },
                { slug: decodedSlug },
                { id: params.id }
            ]
        },
        select: { name: true, shortDescription: true, slug: true, images: true, ogImage: true, seoTitle: true, seoDescription: true, seoKeywords: true }
    });

    if (!product) {
        return {
            title: 'Product Details | Apparel Emporium',
            description: 'B2B garment sourcing, manufacturing and export specifications.'
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aelbd.net';
    const firstImgRel = product.ogImage || extractFeaturedImage(product.images, '/images/3d/white_tshirt.jpg');
    const firstImg = firstImgRel.startsWith('http') ? firstImgRel : `${baseUrl}${firstImgRel.startsWith('/') ? '' : '/'}${firstImgRel}`;
    const productSlug = product.slug || params.id;

    return {
        title: product.seoTitle || `${product.name} Wholesale Manufacturing & Sourcing | AELBD`,
        description: product.seoDescription || product.shortDescription || `Explore specifications, MOQ, and wholesale production details for ${product.name}.`,
        keywords: product.seoKeywords || undefined,
        alternates: {
            canonical: `https://www.aelbd.net/products/${encodeURIComponent(productSlug)}`,
        },
        openGraph: {
            title: `${product.name} | Apparel Emporium B2B Sourcing`,
            description: product.shortDescription || `Explore specifications, MOQ, and wholesale production details for ${product.name}.`,
            url: `https://www.aelbd.net/products/${encodeURIComponent(productSlug)}`,
            images: [{ url: firstImg, alt: product.name }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Apparel Emporium B2B Sourcing`,
            description: product.shortDescription || '',
            images: [firstImg],
        }
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    let decodedSlug = params.id;
    try {
        decodedSlug = decodeURIComponent(params.id);
    } catch { }

    const product = (await prisma.product.findFirst({
        where: {
            OR: [
                { slug: params.id },
                { slug: decodedSlug },
                { id: params.id }
            ]
        },
        include: { category: true }
    })) as any;

    if (!product) {
        notFound();
    }

    // ── 301/308 Permanent Redirect from raw ID to canonical slug ──────────────
    if (params.id === product.id && product.slug && params.id !== product.slug) {
        permanentRedirect(`/products/${encodeURIComponent(product.slug)}`);
    }

    // Query related products in same category (or fallback to active products)
    let relatedProducts: any[] = [];
    if (product.categoryId) {
        relatedProducts = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id },
                isActive: true
            },
            take: 3,
            include: { category: true }
        });
    }

    // Ensure we always have 3 related cards if category has fewer products
    if (relatedProducts.length < 3) {
        const additional = await prisma.product.findMany({
            where: {
                id: {
                    notIn: [product.id, ...relatedProducts.map(p => p.id)]
                },
                isActive: true
            },
            take: 3 - relatedProducts.length,
            include: { category: true }
        });
        relatedProducts = [...relatedProducts, ...additional];
    }

    // Query recent items fallback (for the bottom pill card)
    const fallbackRecent = await prisma.product.findMany({
        where: {
            id: { not: product.id },
            isActive: true
        },
        take: 2,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    });

    // ── Schema.org B2B Garment Manufacturing Service, Product & BreadcrumbList JSON-LD ──
    const productImages = extractProductImages(product.images, '/images/3d/white_tshirt.jpg');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aelbd.net';
    const absoluteImages = productImages.map(img => img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`);

    let parsedSpecs: Record<string, string> = {};
    try {
        if (typeof product.specifications === 'string') {
            const p = JSON.parse(product.specifications);
            if (p && typeof p === 'object' && !Array.isArray(p)) parsedSpecs = p;
        }
    } catch { }

    const additionalProperties = Object.entries(parsedSpecs)
        .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
        .map(([k, v]) => ({
            '@type': 'PropertyValue',
            'name': k,
            'value': String(v),
        }));

    const b2bServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': product.name,
        'serviceType': `B2B Custom Garment Sourcing & Manufacturing - ${product.category?.name || 'Garments'}`,
        'provider': {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            'name': product.brand || 'Apparel Emporium',
            'url': baseUrl,
        },
        'description': product.description || product.shortDescription,
        'image': absoluteImages,
        'areaServed': 'Worldwide',
        'category': product.category?.name || product.subCategory || 'Garments',
    };

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'sku': product.sku || product.styleNo || product.id,
        'mpn': product.styleNo || product.sku || product.id,
        'description': product.description || product.shortDescription,
        'image': absoluteImages,
        'category': [product.department, product.divisionType, product.category?.name].filter(Boolean).join(' > ') || 'Apparel',
        'material': product.fabricComposition || parsedSpecs['Fabric'] || undefined,
        'brand': {
            '@type': 'Brand',
            'name': product.brand || 'Apparel Emporium',
        },
        ...(additionalProperties.length > 0 ? { 'additionalProperty': additionalProperties } : {}),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'Catalog', 'item': `${baseUrl}/products` },
            { '@type': 'ListItem', 'position': 3, 'name': product.category?.name || 'Category', 'item': `${baseUrl}/products?category=${encodeURIComponent(product.category?.slug || '')}` },
            { '@type': 'ListItem', 'position': 4, 'name': product.name, 'item': `${baseUrl}/products/${encodeURIComponent(product.slug || product.id)}` }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(b2bServiceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ProductDetail3DView
                product={product}
                relatedProducts={relatedProducts}
                fallbackRecent={fallbackRecent}
            />
        </>
    );
}
