import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import B2BCategoryPage from '@/components/products/B2BCategoryPage';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aelbd.net';

export const metadata: Metadata = {
    title: 'Sweater Sourcing & B2B Garment Manufacturer in Bangladesh | Apparel Buying House',
    description: 'Leading B2B Garment Manufacturer and Apparel Buying House for fine and heavy gauge sweaters (3GG to 14GG) in Bangladesh. Custom OEM/ODM clothing exporter for cardigans, pullovers, and knitwear.',
    alternates: {
        canonical: `${baseUrl}/products/sweater`,
    },
    openGraph: {
        title: 'Sweater Sourcing & B2B Garment Manufacturer in Bangladesh | Apparel Buying House',
        description: 'B2B Garment Manufacturer & Apparel Buying House for export sweaters manufactured in Bangladesh: 3GG to 14GG pullovers and cardigans.',
        url: `${baseUrl}/products/sweater`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sweater Sourcing & B2B Garment Manufacturer in Bangladesh | Apparel Buying House',
        description: 'B2B Garment Manufacturer & Apparel Buying House for export sweaters in Bangladesh.',
        images: ['/logo.jpg'],
    },
};

export default async function SweaterCategoryPage() {
    // Query matching sweater products
    const rawProducts = await prisma.product.findMany({
        where: {
            isActive: true,
            OR: [
                { divisionType: { equals: 'Sweater' } },
                { category: { slug: { contains: 'sweater' } } },
                { category: { parent: { slug: { contains: 'sweater' } } } },
                { tags: { contains: 'sweater' } },
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
            label: 'Knitting Gauges',
            value: '3GG, 5GG, 7GG, 12GG, 14GG',
            description: 'Coarse chunky cables to ultra-fine gauge corporate pullovers.',
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
            parameter: 'Knitting Gauge Range',
            specification: 'Coarse gauge: 3GG, 5GG, 7GG (chunky winter knits, cardigans, cable pullovers); Fine gauge: 12GG, 14GG (corporate sweaters, lightweight vests)',
            buyerNote: 'Fully computerized flatbed Stoll (CMS) and Shima Seiki (SVR/SSG) machines.'
        },
        {
            parameter: 'Yarn Compositions',
            specification: '100% Cotton, 50/50 Cotton/Acrylic, Cashmere-feel Acrylic, Merino Wool Blends, Lambswool, Mohair, Chenille, Alpaca blends',
            buyerNote: 'High yarn twist stability and anti-pilling treatments (tested to ISO 12945-2).'
        },
        {
            parameter: 'Minimum Order Quantity (MOQ)',
            specification: 'Flexible and tailored strictly per tech-pack, yarn spinning minimums, and buyer order volume',
            buyerNote: 'Flexible color breakdowns tailored to private label and retail collections.'
        },
        {
            parameter: 'Sampling Turnaround',
            specification: 'Yarn swatch & stitch tension: 3 – 5 days; Proto / Fit Sample: 7 – 10 days; Salesman Sample (SMS): 15 – 20 days',
            buyerNote: 'Experienced sweater programmers delivering precision computer stitch files.'
        },
        {
            parameter: 'Bulk Production Timeline',
            specification: 'Customized production schedules aligned with destination country, port logistics, and seasonal requirements',
            buyerNote: 'Scheduled container loading at Chittagong port with moisture-controlled packaging.'
        },
        {
            parameter: 'Stitch & Pattern Capabilities',
            specification: 'Full Jacquard, Intarsia, Cable Knit, Fisherman Rib, Pointelle, Tuck Stitch, Milano Rib, Plating, Dip-Dye Washes',
            buyerNote: 'Clean linking with calibrated gauges (no seam ridges or puckering).'
        },
        {
            parameter: 'Needle Safety & QA Protocols',
            specification: 'Dual-pass 9-point conveyorized metal detection (ferrous 1.0mm, non-ferrous 1.2mm, stainless 1.5mm)',
            buyerNote: 'Zero metal tolerance; strict needle reconstruction records kept for each workstation.'
        },
        {
            parameter: 'Quality Inspection Standards',
            specification: 'AQL 1.5 Major Defects / AQL 2.5 Minor Defects (MIL-STD-105E)',
            buyerNote: 'Dimensional stability, loop formation, weight per dozen, and wash test validation.'
        },
        {
            parameter: 'Social & Factory Compliance',
            specification: 'Fully audited partner factories adhering to international labor and safety standards; detailed compliance dossiers provided upon request',
            buyerNote: 'Complete transparency with on-the-ground technical supervision on every production line.'
        }
    ];

    const manufacturingPoints = [
        'Advanced automated Jacquard, Intarsia, Cable, and Tuck stitch programming',
        'Specialized linking machines with calibrated gauges for clean neckbands and shoulder joins',
        'In-house yarn winding with silicone waxing for smooth stitch tension and zero snags',
        'Washing, milling, and softening baths that give luxurious handfeel to acrylic and wool blends',
        'Dual-pass conveyorized 9-point metal & broken needle detection on all finished sweaters',
        'Comprehensive yarn pilling and dimensional stability testing in accredited labs',
    ];

    const faqs = [
        {
            question: 'What knitting machines are utilized in your partner sweater factories?',
            answer: 'Our partner facilities are equipped with computerized flat knitting machines from world-class makers Stoll (Germany) and Shima Seiki (Japan), capable of complex intarsia, multi-color jacquards, and structured rib textures.',
        },
        {
            question: 'How do you determine MOQ and production lead times for sweater manufacturing?',
            answer: 'Our MOQs and production timelines are flexible and customized based on your tech pack, yarn spinning schedules, and order volume. We tailor timelines to meet buyer seasonal fall/winter retail delivery schedules.',
        },
        {
            question: 'How do you prevent needle breakage and guarantee buyer safety?',
            answer: 'All factories enforce strict needle control policies: broken needles must be fully reconstructed before a replacement is issued. Every sweater passes through two independent conveyorized metal detectors before final poly-bag packing.',
        },
        {
            question: 'What is the seasonal production calendar for fall/winter sweater orders?',
            answer: 'We recommend initiating yarn development and proto sampling between January and March, finalizing purchase orders by April/May, allowing container shipments from July to September.',
        },
    ];

    return (
        <B2BCategoryPage
            slug="sweater"
            categoryName="Sweater"
            h1="Export Sweaters & Knitwear Sourcing in Bangladesh"
            subheading="Source fine to coarse gauge sweaters (3GG to 14GG pullovers, cardigans, turtlenecks, cable knits) manufactured with automated Stoll and Shima Seiki flat knitting in Bangladesh."
            description="Sweater manufacturing requires deep technical mastery in yarn tension, linking, and wash formulation. Apparel Emporium partners with Bangladesh’s premier sweater manufacturers to supply luxury-feel pullovers, holiday jacquards, and workwear cardigans to major retail brands worldwide."
            specHighlights={specHighlights}
            manufacturingSpecsTable={manufacturingSpecsTable}
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
