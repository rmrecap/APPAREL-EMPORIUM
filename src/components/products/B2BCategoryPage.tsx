import React from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/products/ProductGrid';
import AtelierDecorations3D from '@/components/products/AtelierDecorations3D';
import { Product } from '@/types';
import { ShieldCheck, Award, Factory, ArrowRight, CheckCircle2, Clock, Box, HelpCircle, FileText, CheckCheck, Sliders, ExternalLink } from 'lucide-react';
import B2BLeadMagnetSection from '@/components/leads/B2BLeadMagnetSection';

export interface B2BManufacturingSpecItem {
    parameter: string;
    specification: string;
    buyerNote: string;
}

export interface B2BCategoryPageProps {
    slug: string;
    categoryName: string;
    h1: string;
    subheading: string;
    description: string;
    specHighlights: {
        label: string;
        value: string;
        description: string;
    }[];
    manufacturingSpecsTable: B2BManufacturingSpecItem[];
    manufacturingPoints: string[];
    faqs: {
        question: string;
        answer: string;
    }[];
    products: Product[];
}

export default function B2BCategoryPage({
    slug,
    categoryName,
    h1,
    subheading,
    description,
    specHighlights,
    manufacturingSpecsTable,
    manufacturingPoints,
    faqs,
    products,
}: B2BCategoryPageProps) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';
    const canonicalUrl = `${baseUrl}/products/${slug}`;

    // Structured Data: BreadcrumbList + CollectionPage + FAQPage
    const schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': baseUrl,
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': 'Products',
                        'item': `${baseUrl}/products`,
                    },
                    {
                        '@type': 'ListItem',
                        'position': 3,
                        'name': categoryName,
                        'item': canonicalUrl,
                    },
                ],
            },
            {
                '@type': 'CollectionPage',
                '@id': `${canonicalUrl}#webpage`,
                'url': canonicalUrl,
                'name': h1,
                'description': description,
                'isPartOf': {
                    '@id': `${baseUrl}/#website`,
                },
                'about': {
                    '@type': 'Thing',
                    'name': categoryName,
                },
            },
            {
                '@type': 'FAQPage',
                'mainEntity': faqs.map((faq) => ({
                    '@type': 'Question',
                    'name': faq.question,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': faq.answer,
                    },
                })),
            },
        ],
    };

    return (
        <div className="catalog-bg-canvas min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500 relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            {/* ── HERO BANNER: Deep Navy Blue Atelier ── */}
            <div className="bg-[#142338] dark:bg-[#0A1220] text-white pt-28 sm:pt-32 pb-14 sm:pb-16 relative overflow-hidden shadow-lg border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <AtelierDecorations3D variant="top-right" />

                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/70 mb-4" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-white transition-colors">Products</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{categoryName}</span>
                    </nav>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 text-white">
                        {h1}
                    </h1>
                    <p className="text-blue-100/90 max-w-3xl text-sm sm:text-base md:text-lg font-medium leading-relaxed mb-6">
                        {subheading}
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck className="w-4 h-4" /> BSCI &amp; SEDEX SMETA Audited
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Award className="w-4 h-4" /> OEKO-TEX Standard 100 / GOTS
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Factory className="w-4 h-4" /> Direct Bangladesh Factory Pricing
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <CheckCheck className="w-4 h-4" /> AQL 1.5 / 2.5 Inspection
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
                {/* ── SPECIFICATION HIGHLIGHTS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {specHighlights.map((spec, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                                {spec.label}
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                {spec.value}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                {spec.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── SOURCING OVERVIEW & MANUFACTURING EXCELLENCE ── */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {categoryName} Sourcing &amp; Manufacturing Capabilities
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                                {description}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                {manufacturingPoints.map((point, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                                            {point}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Quote Card */}
                        <div className="bg-gradient-to-br from-[#142338] to-[#1E3A5F] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                            <div>
                                <span className="inline-block px-2.5 py-1 rounded bg-blue-500/30 text-blue-200 text-xs font-semibold mb-3">
                                    OEM / ODM Manufacturing
                                </span>
                                <h3 className="text-xl font-bold mb-2">Have a Tech-Pack or RFQ?</h3>
                                <p className="text-xs sm:text-sm text-blue-100/80 mb-6 leading-relaxed">
                                    Send us your specifications, required quantities, or target price point. Our merchandising team delivers quotes within 24 hours.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Link
                                    href={`/request-quote?category=${slug}`}
                                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                                >
                                    Request Sourcing Quote <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
                                >
                                    Speak to a Merchandiser
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CONCRETE B2B MANUFACTURING SPECIFICATIONS TABLE ── */}
                <div className="mb-14 bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {categoryName} B2B Manufacturing Specifications &amp; Quality Parameters
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Verified manufacturing parameters, production lead times, and global buyer standards.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">Manufacturing Parameter</th>
                                    <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">Specification Details</th>
                                    <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">Buyer &amp; Quality Benchmark</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {manufacturingSpecsTable.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                            {item.parameter}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                            {item.specification}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                                            {item.buyerNote}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── LIVE PRODUCT CATALOG SECTION ── */}
                <div className="mb-14">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                Available {categoryName} Catalog Items
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                {products.length > 0
                                    ? `Showing ${products.length} ready-to-source export styles`
                                    : 'Custom styles manufactured upon buyer tech-pack specifications'}
                            </p>
                        </div>
                        <Link
                            href="/products"
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                            View Entire Manufacturer Catalog &rarr;
                        </Link>
                    </div>

                    {products.length > 0 ? (
                        <ProductGrid products={products} />
                    ) : (
                        <div className="bg-white dark:bg-dark-surface p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                            <Box className="w-16 h-16 text-blue-500/40 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Custom OEM {categoryName} Production Available
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto mb-6">
                                We manufacture custom {categoryName.toLowerCase()} directly according to buyer tech-packs, GSM, colors, and branding specifications with low MOQs and rapid sampling.
                            </p>
                            <Link
                                href={`/request-quote?category=${slug}`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-md"
                            >
                                Submit Tech-Pack for {categoryName} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── B2B BUYER FAQS ── */}
                <div className="mb-14 bg-white dark:bg-dark-surface p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {categoryName} Sourcing FAQs for Global Buyers
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Common questions about manufacturing, lead times, audits, and custom tech-packs.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <details
                                key={idx}
                                className="group border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden bg-slate-50/50 dark:bg-slate-900/40"
                            >
                                <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                    <span>{faq.question}</span>
                                    <span className="transition group-open:rotate-180 text-blue-600 font-bold">
                                        &darr;
                                    </span>
                                </summary>
                                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 pt-3">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>

                {/* ── B2B FACTORY COMPLIANCE & LINE SHEET LEAD MAGNET ── */}
                <B2BLeadMagnetSection
                    sourcePage={`/products/${slug}`}
                    defaultCategory={slug as any}
                    title={`Request 2026 ${categoryName} Factory Profile & Line Sheet`}
                    subtitle={`Direct access to verified social audits, machine lists, yarn counts, and wholesale FOB price sheets for ${categoryName.toLowerCase()}.`}
                />

                {/* ── RELATED B2B SOURCING & COMPLIANCE GUIDES ── */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Related Sourcing &amp; Social Compliance Guides
                        </h3>
                        <Link href="/blog" className="text-xs font-semibold text-blue-600 hover:underline">
                            View All Guides &rarr;
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            href="/blog/bsci-vs-sedex-compliance-standards-guide"
                            className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-sm block group"
                        >
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Compliance &amp; Audits
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-1">
                                BSCI vs SEDEX (SMETA): Apparel Compliance Guide for Global Buyers [2026] &rarr;
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                4-pillar SMETA audit checklists, zero audit duplication, and certified partner factories in Bangladesh.
                            </p>
                        </Link>
                        <Link
                            href="/blog/higg-vs-smeta-social-audit-standard-fashion-supply-chain"
                            className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-sm block group"
                        >
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                ESG &amp; Sustainability
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-1">
                                Higg vs SMETA: Which Social Audit Standard is Better for Fashion Supply Chains [2026] &rarr;
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                Compare Higg FEM/FSLM with Sedex SMETA to optimize ethical sourcing and environmental compliance.
                            </p>
                        </Link>
                        <Link
                            href="/blog/how-sedex-membership-reduces-supplier-audit-duplication"
                            className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-sm block group"
                        >
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Supply Chain Cost Savings
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-1">
                                How SEDEX Membership &amp; SMETA Audits Reduce Supplier Audit Duplication for Global Brands &rarr;
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                Eliminate redundant auditing costs and accelerate shipment lead times through shared audit registries.
                            </p>
                        </Link>
                        <Link
                            href="/blog/apparel-sourcing-company-bangladesh-buyer-guide"
                            className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-sm block group"
                        >
                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                Sourcing Strategy
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-1">
                                Apparel Sourcing in Bangladesh: Complete B2B Guide to Knitwear, Woven &amp; Sweater Manufacturing [2026] &rarr;
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                End-to-end buyer playbook on MOQ negotiations, tech-pack development, and Chittagong container dispatch.
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
