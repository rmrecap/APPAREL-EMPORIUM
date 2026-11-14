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
        select: { name: true, shortDescription: true, slug: true, images: true }
    });

    if (!product) {
        return {
            title: 'Product Details | Apparel Emporium',
            description: 'B2B garment sourcing, manufacturing and export specifications.'
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aelbd.net';
    const firstImgRel = extractFeaturedImage(product.images, '/images/3d/white_tshirt.jpg');
    const firstImg = firstImgRel.startsWith('http') ? firstImgRel : `${baseUrl}${firstImgRel.startsWith('/') ? '' : '/'}${firstImgRel}`;
    const productSlug = product.slug || params.id;

    return {
        title: `${product.name} Wholesale Manufacturing & Sourcing | AELBD`,
        description: product.shortDescription || `Explore specifications, MOQ, and wholesale production details for ${product.name}.`,
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

    // ── Schema.org B2B Garment Manufacturing Service & BreadcrumbList JSON-LD ──
    const productImages = extractProductImages(product.images, '/images/3d/white_tshirt.jpg');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

    const b2bServiceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': product.name,
        'serviceType': `B2B Custom Garment Sourcing & Manufacturing - ${product.category?.name || 'Garments'}`,
        'provider': {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            'name': 'Apparel Emporium',
            'url': baseUrl,
        },
        'description': product.shortDescription || product.description,
        'image': productImages.map(img => img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`),
        'areaServed': 'Worldwide',
        'category': product.category?.name || 'Garments',
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
