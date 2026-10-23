import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import B2BCategoryPage from '@/components/products/B2BCategoryPage';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    title: 'Sweater Manufacturing & Export Sourcing | AELBD Bangladesh',
    description: 'Sourcing fine and heavy gauge sweaters (3GG to 14GG) directly from Bangladesh. Cashmere blends, merino wool, cotton acrylic cardigans, pullovers, and seasonal knitwear with automated Shima Seiki knitting.',
    alternates: {
        canonical: `${baseUrl}/products/sweater`,
    },
    openGraph: {
        title: 'Sweater Manufacturing & Export Sourcing | AELBD Bangladesh',
        description: 'Export sweaters manufactured in Bangladesh: 3GG to 14GG jacquard, intarsia, cable knit pullovers, and cardigans.',
        url: `${baseUrl}/products/sweater`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sweater Manufacturing & Export Sourcing | AELBD Bangladesh',
        description: 'Export sweaters manufactured in Bangladesh: 3GG to 14GG pullovers and cardigans.',
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
            label: 'Yarn Compositions',
            value: 'Cotton, Acrylic, Merino, Lambswool, Cashmere Blends',
            description: 'Cotton-acrylic (50/50), 100% Cotton, Chenille, and recycled yarns.',
        },
        {
            label: 'Knitting Technology',
            value: 'Computerized Jacquard & Intarsia',
            description: 'Automated German Stoll & Japanese Shima Seiki flatbed machines.',
        },
        {
            label: 'Compliance Standards',
            value: 'BSCI, SMETA, WRAP, OEKO-TEX',
            description: 'Strict needle-detection protocols and calibrated linking machines.',
        },
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
            question: 'What are the MOQ requirements for sweater manufacturing in Bangladesh?',
            answer: 'For standard in-stock yarns (e.g. 100% acrylic or cotton-acrylic), MOQs start from 1,200 to 2,000 pieces per style. For custom-spun or custom-dyed wool yarns, MOQs are typically 2,500 to 3,000 pieces.',
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
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
