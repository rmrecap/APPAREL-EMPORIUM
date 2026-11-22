import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import B2BCategoryPage from '@/components/products/B2BCategoryPage';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aelbd.net';

export const metadata: Metadata = {
    title: 'Woven Garments & Denim B2B Manufacturer in Bangladesh | Apparel Buying House',
    description: 'Leading B2B Garment Manufacturer and Apparel Buying House for export-grade woven apparel (denim jeans, shirts, trousers, jackets, chinos) in Bangladesh. Custom OEM/ODM clothing exporter.',
    alternates: {
        canonical: `${baseUrl}/products/woven`,
    },
    openGraph: {
        title: 'Woven Garments & Denim B2B Manufacturer in Bangladesh | Apparel Buying House',
        description: 'B2B Garment Manufacturer & Apparel Buying House in Bangladesh. Custom OEM/ODM woven clothing exporter: denim, shirts, trousers, and outerwear.',
        url: `${baseUrl}/products/woven`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Woven Garments & Denim B2B Manufacturer in Bangladesh | Apparel Buying House',
        description: 'B2B Garment Manufacturer & Apparel Buying House for woven apparel and denim export.',
        images: ['/logo.jpg'],
    },
};

export default async function WovenCategoryPage() {
    // Query matching woven products
    const rawProducts = await prisma.product.findMany({
        where: {
            isActive: true,
            OR: [
                { divisionType: { equals: 'Woven' } },
                { category: { slug: { contains: 'woven' } } },
                { category: { parent: { slug: { contains: 'woven' } } } },
                { tags: { contains: 'woven' } },
            ],
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 24,
    });

    const products = rawProducts.map((p) => ({
        ...p,
        tags: p.tags ? p.tags.split(',').map((t) => t.trim()) : [],
    })) as any;

    const specHighlights = [
        {
            label: 'Fabric Weaves',
            value: 'Twill, Poplin, Denim, Canvas, Oxford',
            description: '100% Cotton, CVC, TC blends, Spandex stretch, and Lyocell.',
        },
        {
            label: 'Hands-On Supervision',
            value: 'Active Floor Oversight',
            description: 'Unlike passive buying agencies, our technical team actively monitors daily factory floor progress from pattern grading to carton packing.',
        },
        {
            label: 'Technical Mastery',
            value: '40–50 Yrs Senior Expertise',
            description: 'Guided by senior garment masters with 40-50 years of hands-on industry experience auditing fabric tension, stitch density, and wash tolerances.',
        },
        {
            label: 'Buyer Ownership',
            value: '100% Quality Accountability',
            description: 'We treat every buyer order as our own creation—delivering complete transparency, zero-defect AQL control, and full compliance dossiers upon request.',
        },
    ];

    const manufacturingSpecsTable = [
        {
            parameter: 'Fabric Compositions',
            specification: '100% Combed Cotton, CVC (60/40, 80/20), TC (65/35), Cotton-Elastane (98/2), Lyocell/Tencel, Linen blends',
            buyerNote: 'Mill-sourced or imported greige fabric with complete technical laboratory test reports.'
        },
        {
            parameter: 'Fabric Weaves & Weights',
            specification: 'Twill, Plain Poplin, Oxford, Herringbone, Satin, Rigid & Stretch Denim (8.5 oz to 14.5 oz), 120 GSM to 380 GSM',
            buyerNote: 'Precision 4-point fabric inspection conducted prior to cutting.'
        },
        {
            parameter: 'Minimum Order Quantity (MOQ)',
            specification: 'Flexible and tailored strictly per tech-pack, fabric mill minimums, and buyer order volume',
            buyerNote: 'Flexible color/size breakdown tailored to private label and retail collections.'
        },
        {
            parameter: 'Sampling Turnaround',
            specification: 'Proto / Fit Sample: 5 – 7 days; Salesman Sample (SMS) in actual fabric: 15 days',
            buyerNote: 'Full CAD pattern grading & 3D virtual fit simulation available.'
        },
        {
            parameter: 'Bulk Production Timeline',
            specification: 'Customized production schedules aligned with destination country, port logistics, and seasonal requirements',
            buyerNote: 'Express fast-track options available for repeating retail programs.'
        },
        {
            parameter: 'Denim & Special Washes',
            specification: 'Enzyme Stone Wash, Bleach Wash, Ozone Eco-Wash, Whiskers, Hand Sanding, Resin 3D Crinkle, Acid Wash',
            buyerNote: 'Eco-certified laundry facilities using closed-loop zero-discharge water recycling.'
        },
        {
            parameter: 'Quality Inspection Benchmark',
            specification: 'AQL 1.5 Major Defects / AQL 2.5 Minor Defects (MIL-STD-105E)',
            buyerNote: 'Pre-production, In-line, and Final Random Inspection (FRI) reports supplied directly to buyers.'
        },
        {
            parameter: 'Social & Factory Compliance',
            specification: 'Fully audited partner factories adhering to international labor and safety standards; detailed compliance dossiers provided upon request',
            buyerNote: 'Complete transparency with on-the-ground technical supervision on every production line.'
        },
        {
            parameter: 'Incoterms & Shipping Ports',
            specification: 'FOB Chittagong Port (BDCGP) / Mongla Port, CIF European & US Ports, Air Courier DDP',
            buyerNote: 'Direct ocean carrier booking with Maersk, MSC, Hapag-Lloyd, and CMA CGM.'
        }
    ];

    const manufacturingPoints = [
        'Advanced automated CAD pattern making and computer-controlled laser fabric cutting',
        'In-house high-end laundry for denim washing (enzyme, stone, ozone, whiskers, acid wash)',
        'Heavy-duty bartacking, flat-felled seam construction, and automated pocket welting',
        'AQL 1.5 & AQL 2.5 final inspection standards with four-point fabric inspection',
        'Custom buttons, branded rivets, YKK/SBS zippers, woven labels, and retail packaging',
        'Dedicated bilingual merchandising team managing tech-packs, counter samples, and shipments',
    ];

    const faqs = [
        {
            question: 'What types of woven garments does Apparel Emporium manufacture in Bangladesh?',
            answer: 'We manufacture full ranges of woven apparel including men’s, women’s, and children’s denim jeans, casual and dress shirts, chinos, cargo pants, shorts, padded jackets, twill outerwear, and formal trousers.',
        },
        {
            question: 'How do you determine MOQ and production lead times for woven garments?',
            answer: 'Our MOQs and production timelines are flexible and customized based on your tech pack, fabric availability, and order volume. We tailor timelines to meet buyer seasonal retail delivery schedules with fast-track options available.',
        },
        {
            question: 'What quality control standards are applied during woven production?',
            answer: 'Every order undergoes strict 4-point fabric inspection prior to spreading, in-line process audits by senior technical masters, and final AQL 1.5/2.5 random inspections before packing into export master cartons.',
        },
        {
            question: 'How do you ensure ethical manufacturing and factory compliance?',
            answer: 'We partner exclusively with verified export-grade garment manufacturers adhering to strict labor safety and ethical workplace practices. Full factory compliance dossiers and audit records are shared transparently upon buyer request.',
        },
    ];

    return (
        <B2BCategoryPage
            slug="woven"
            categoryName="Woven"
            h1="Export Woven Garments Manufacturing & Sourcing in Bangladesh"
            subheading="Source high-grade woven apparel (casual shirts, denim jeans, chinos, trousers, jackets) from ethically audited partner manufacturing facilities in Bangladesh."
            description="Apparel Emporium delivers end-to-end woven garment sourcing solutions for international fashion brands, department stores, and private label importers. From technical weave development to high-tech denim washes and strict AQL 1.5 quality control, our dedicated hands-on team guarantees superior consistency and reliable global delivery."
            specHighlights={specHighlights}
            manufacturingSpecsTable={manufacturingSpecsTable}
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
