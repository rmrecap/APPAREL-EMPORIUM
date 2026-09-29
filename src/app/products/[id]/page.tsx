import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ProductDetail3DView from '@/components/products/ProductDetail3DView';
import { Metadata } from 'next';

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

    let firstImg = '/logo.jpg';
    try {
        const parsedImgs = JSON.parse(product.images);
        if (Array.isArray(parsedImgs) && parsedImgs.length > 0) firstImg = parsedImgs[0];
    } catch { }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

    return {
        title: `${product.name} Wholesale Manufacturing & Sourcing | AELBD`,
        description: product.shortDescription || `Explore specifications, MOQ, and wholesale production details for ${product.name}.`,
        alternates: {
            canonical: `/products/${product.slug}`,
        },
        openGraph: {
            title: `${product.name} | Apparel Emporium B2B Sourcing`,
            description: product.shortDescription || `Explore specifications, MOQ, and wholesale production details for ${product.name}.`,
            url: `${baseUrl}/products/${product.slug}`,
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

    // ── 301 Permanent Redirect from raw ID to canonical slug ──────────────
    if (params.id === product.id && product.slug && params.id !== product.slug) {
        redirect(`/products/${encodeURIComponent(product.slug)}`);
    }

    // Query related products in same category (or fallback to active products)
    let relatedProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            isActive: true
        },
        take: 3,
        include: { category: true }
    });

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

    // ── Schema.org Product & BreadcrumbList JSON-LD ─────────────────────────
    let productImages: string[] = [];
    try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) productImages = parsed;
    } catch { }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'image': productImages.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
        'description': product.shortDescription || product.description,
        'brand': {
            '@type': 'Brand',
            'name': 'Apparel Emporium'
        },
        'category': product.category?.name || 'Garments',
        'offers': {
            '@type': 'AggregateOffer',
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock',
            'seller': {
                '@type': 'Organization',
                'name': 'Apparel Emporium Ltd.'
            }
        }
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'Catalog', 'item': `${baseUrl}/products` },
            { '@type': 'ListItem', 'position': 3, 'name': product.category?.name || 'Category', 'item': `${baseUrl}/products?category=${encodeURIComponent(product.category?.slug || '')}` },
            { '@type': 'ListItem', 'position': 4, 'name': product.name, 'item': `${baseUrl}/products/${encodeURIComponent(product.slug)}` }
        ]
    };

    return (
        <>
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
