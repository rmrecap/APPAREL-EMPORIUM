import { prisma } from '@/lib/prisma';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilter from '@/components/products/ProductFilter';
import AtelierDecorations3D from '@/components/products/AtelierDecorations3D';
import CatalogTaxonomyDirectory from '@/components/products/CatalogTaxonomyDirectory';
import { DEFAULT_CATALOG_TAXONOMY, TaxonomyDivision } from '@/lib/catalog-taxonomy';
import { X } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: { category?: string; q?: string; page?: string };
}): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';
    if (searchParams.category) {
        let cat = null;
        try {
            cat = await prisma.category.findUnique({
                where: { slug: searchParams.category },
                select: { name: true, description: true, slug: true }
            });
        } catch { }

        if (cat) {
            return {
                title: `${cat.name} Sourcing & Export Manufacturing | AELBD`,
                description: cat.description || `Source export-quality ${cat.name.toLowerCase()} manufactured in certified Bangladesh garment factories. Custom tech-pack development, private label, and volume production.`,
                alternates: {
                    canonical: `/products?category=${encodeURIComponent(cat.slug)}`,
                },
                openGraph: {
                    title: `${cat.name} Sourcing & Export Manufacturing | AELBD`,
                    description: `Custom ${cat.name.toLowerCase()} production and export sourcing in Bangladesh.`,
                    url: `${baseUrl}/products?category=${encodeURIComponent(cat.slug)}`,
                    images: ['/logo.jpg'],
                }
            };
        }
    }

    if (searchParams.q) {
        return {
            title: `Search: "${searchParams.q}" | Apparel Catalog | AELBD`,
            description: `Browse garment manufacturing catalog search results for ${searchParams.q}.`,
            robots: { index: false, follow: true },
        };
    }

    return {
        title: 'Export Garments & Apparel Catalog | AELBD Bangladesh',
        description: 'Explore our B2B ready-to-export garments catalog: custom knitwear, woven garments, denim, sweaters, and apparel accessories manufactured in Bangladesh.',
        alternates: {
            canonical: '/products',
        },
        openGraph: {
            title: 'Export Garments & Apparel Catalog | AELBD Bangladesh',
            description: 'B2B export sourcing catalog for readymade garments, knitwear, woven apparel, and sweaters.',
            url: `${baseUrl}/products`,
            images: ['/logo.jpg'],
        }
    };
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { category?: string; q?: string; page?: string; fabric?: string; moq?: string; sort?: string }
}) {
    const { category, q, page, fabric, moq, sort } = searchParams;

    // Fetch categories for sidebar
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
            parent: { select: { name: true, slug: true } },
            children: { where: { isActive: true }, select: { id: true, name: true, slug: true } },
            _count: { select: { products: true } }
        },
        orderBy: { order: 'asc' }
    });

    // Top Category Pills: All Items + 4 Main Categories
    const topPills = [
        { label: 'All Items', slug: '' },
        { label: 'Fashion', slug: 'fashion' },
        { label: 'Home Textiles', slug: 'hometextiles' },
        { label: 'Footwear', slug: 'footwear' },
        { label: 'Accessories', slug: 'accessories' },
    ];

    // Build the query object
    const where: any = { isActive: true };

    if (category) {
        // Match category directly or descendant subcategories
        const collectDescendantSlugs = (slugToFind: string): string[] => {
            const target = categories.find(c => c.slug === slugToFind || c.slug.includes(slugToFind));
            if (!target) return [slugToFind];
            const directChildSlugs = categories
                .filter(c => c.parentId === target.id)
                .map(c => c.slug);
            const nestedSlugs = directChildSlugs.flatMap(s => collectDescendantSlugs(s));
            return [slugToFind, target.slug, ...directChildSlugs, ...nestedSlugs];
        };

        const allMatchedSlugs = Array.from(new Set(collectDescendantSlugs(category)));
        where.OR = [
            { category: { slug: { in: allMatchedSlugs } } },
            { tags: { contains: category } },
            { name: { contains: category } }
        ];
    }

    if (q) {
        where.OR = [
            { name: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
            { slug: { contains: q } }
        ];
    }

    // Fabric and MOQ filters
    const filters: any[] = [];

    if (fabric) {
        const fabrics = fabric.split(',');
        filters.push({
            OR: fabrics.map(f => ({ specifications: { contains: f } }))
        });
    }

    if (moq) {
        const moqs = moq.split(',');
        filters.push({
            OR: moqs.map(m => ({ specifications: { contains: m } }))
        });
    }

    if (filters.length > 0) {
        where.AND = filters;
    }

    // Sorting order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };

    // Pagination logic
    const limit = 12;
    const currentPage = parseInt(page || '1');
    const skip = (currentPage - 1) * limit;

    // Fetch products with the constructed query
    const products = await prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy
    });

    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);

    // Build query string for pagination links
    const buildQueryString = (pageNum: number) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (q) params.set('q', q);
        if (fabric) params.set('fabric', fabric);
        if (moq) params.set('moq', moq);
        if (sort) params.set('sort', sort);
        params.set('page', pageNum.toString());
        return `/products?${params.toString()}`;
    };

    // Helper for pill links
    const buildPillLink = (pillSlug: string) => {
        const params = new URLSearchParams();
        if (pillSlug) params.set('category', pillSlug);
        if (q) params.set('q', q);
        if (fabric) params.set('fabric', fabric);
        if (moq) params.set('moq', moq);
        if (sort) params.set('sort', sort);
        return `/products?${params.toString()}`;
    };

    // Fetch dynamic catalog taxonomy matrix from DB or fallback
    let catalogTaxonomy: TaxonomyDivision[] = DEFAULT_CATALOG_TAXONOMY;
    try {
        const taxonomySetting = await prisma.siteSetting.findUnique({
            where: { key: 'catalog_taxonomy_matrix' }
        });
        if (taxonomySetting?.value) {
            const parsed = JSON.parse(taxonomySetting.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
                catalogTaxonomy = parsed;
            }
        }
    } catch (e) { }

    return (
        <div className="catalog-bg-canvas min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500 relative">
            {/* ── HERO BANNER: Deep Navy Blue Banner ── */}
            <div className="bg-[#142338] dark:bg-[#0A1220] text-white pt-28 sm:pt-32 pb-14 sm:pb-16 relative overflow-hidden shadow-lg border-b border-white/10">
                {/* Subtle garment weave texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* 3D Sewing Needle, Thread & Button Floating Art */}
                <AtelierDecorations3D variant="top-right" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight mb-3 text-white">
                        Manufacturer Catalog
                    </h1>
                    <p className="text-blue-100/90 max-w-2xl mx-auto text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                        Explore our world-class garment sourcing options. We bridge the gap between Bangladeshi excellence and global brands.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-7xl">
                {/* ── TOP HORIZONTAL CATEGORY PILLS BAR ── */}
                <div className="mb-8 overflow-x-auto custom-scrollbar pb-2">
                    <div className="flex items-center gap-2.5 min-w-max">
                        {topPills.map((pill) => {
                            const isPillActive = (!category && !pill.slug) || (category === pill.slug);
                            return (
                                <Link
                                    key={pill.slug || 'all'}
                                    href={buildPillLink(pill.slug)}
                                    className={`px-4 sm:px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${isPillActive
                                        ? 'bg-[#182B48] dark:bg-blue-600 text-white shadow-md scale-105 border border-[#2B4268] dark:border-blue-400'
                                        : 'bg-[#ECE5DC] dark:bg-[#121A2C] text-slate-700 dark:text-slate-300 hover:bg-[#E2D9CD] dark:hover:bg-[#1A253E] border border-white/60 dark:border-white/5 shadow-[2px_2px_6px_rgba(0,0,0,0.04),-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-none'
                                        }`}
                                >
                                    <span>{pill.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ── 3D SOURCING FILTERS SIDEBAR ── */}
                    <div className="w-full lg:w-72 shrink-0">
                        <ProductFilter categories={categories as any} />
                    </div>

                    {/* ── 3D PRODUCT MARKETPLACE & LIVE RESULTS ── */}
                    <div className="flex-grow min-w-0">
                        {/* Live Results Bar */}
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 sidebar-3d-panel rounded-[22px] gap-4">
                            <div>
                                <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
                                    LIVE RESULTS
                                </h2>
                                <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                                    Showing <span className="text-blue-600 dark:text-blue-400 font-black">{products.length > 0 ? skip + 1 : 0}-{Math.min(skip + limit, totalProducts)}</span> of {totalProducts} items matching your criteria
                                </p>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <label htmlFor="product-sort-select" className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                    SORT BY
                                </label>
                                <select
                                    id="product-sort-select"
                                    aria-label="Sort garments by criteria"
                                    defaultValue={sort || 'latest'}
                                    className="input-3d-inset text-slate-900 dark:text-white rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
                                >
                                    <option value="latest">Latest Arrival</option>
                                    <option value="name">Name (A-Z)</option>
                                    <option value="moq">Low MOQ First</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {products.length > 0 ? (
                            <ProductGrid products={products as any} />
                        ) : (
                            <div className="p-16 text-center sidebar-3d-panel rounded-[28px]">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <X size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">No products found</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto mb-6">
                                    We couldn't find any items matching your current filters.
                                </p>
                                <Link
                                    href="/products"
                                    className="inline-block bg-[#1B2B44] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-black transition-all"
                                >
                                    Clear All Filters
                                </Link>
                            </div>
                        )}

                        {/* Smart Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-2">
                                {currentPage > 1 && (
                                    <a
                                        href={buildQueryString(currentPage - 1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#ECE5DC] dark:bg-[#121A2C] text-slate-700 dark:text-slate-300 hover:bg-[#1B2B44] hover:text-white transition-all shadow-xs text-xs font-bold"
                                    >
                                        &larr;
                                    </a>
                                )}

                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <a
                                            key={i}
                                            href={buildQueryString(pageNum)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl font-black text-xs transition-all shadow-xs ${currentPage === pageNum
                                                ? 'bg-[#1B2B44] text-white scale-105 shadow-md'
                                                : 'bg-[#ECE5DC] dark:bg-[#121A2C] text-slate-700 dark:text-slate-300 hover:bg-[#E0D7CC] dark:hover:bg-[#1A253E]'
                                                }`}
                                        >
                                            {pageNum}
                                        </a>
                                    );
                                })}

                                {currentPage < totalPages && (
                                    <a
                                        href={buildQueryString(currentPage + 1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#ECE5DC] dark:bg-[#121A2C] text-slate-700 dark:text-slate-300 hover:bg-[#1B2B44] hover:text-white transition-all shadow-xs text-xs font-bold"
                                    >
                                        &rarr;
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── COMPLETE BRAND TAXONOMY & PRODUCT DIRECTORY ── */}
                <CatalogTaxonomyDirectory initialTaxonomy={catalogTaxonomy} />
            </div>
        </div>
    );
}
