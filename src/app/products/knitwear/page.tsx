import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import B2BCategoryPage from '@/components/products/B2BCategoryPage';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    title: 'Knitwear Sourcing & Export Manufacturing | AELBD Bangladesh',
    description: 'Premium circular and flat knitwear manufacturing in Bangladesh. Sourcing t-shirts, polo shirts, hoodies, sweatshirts, and activewear with OEKO-TEX certified cotton, sustainable dyes, and strict QA.',
    alternates: {
        canonical: `${baseUrl}/products/knitwear`,
    },
    openGraph: {
        title: 'Knitwear Sourcing & Export Manufacturing | AELBD Bangladesh',
        description: 'Source export knitwear from Bangladesh: custom t-shirts, polo shirts, fleece hoodies, tracksuits, and activewear.',
        url: `${baseUrl}/products/knitwear`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Knitwear Sourcing & Export Manufacturing | AELBD Bangladesh',
        description: 'Source export knitwear from Bangladesh: custom t-shirts, polo shirts, fleece hoodies, and activewear.',
        images: ['/logo.jpg'],
    },
};

export default async function KnitwearCategoryPage() {
    // Query matching knitwear products
    const rawProducts = await prisma.product.findMany({
        where: {
            isActive: true,
            OR: [
                { divisionType: { equals: 'Knit' } },
                { category: { slug: { contains: 'knit' } } },
                { category: { parent: { slug: { contains: 'knit' } } } },
                { tags: { contains: 'knit' } },
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
            label: 'Fabric Constructions',
            value: 'Single Jersey, Pique, French Terry, Fleece, Rib',
            description: '100% Combed BCI/Organic Cotton, CVC, Poly-Cotton, Modal blends.',
        },
        {
            label: 'Weight (GSM)',
            value: '140 GSM - 420 GSM',
            description: 'Lightweight summer t-shirts to heavy brushed winter fleece.',
        },
        {
            label: 'Production Lead Time',
            value: '45 - 60 Days',
            description: 'Fast-track supply chain from knitting to container dispatch.',
        },
        {
            label: 'Audits & Standards',
            value: 'GOTS, BSCI, SEDEX (SMETA), OEKO-TEX 100',
            description: 'Environmentally responsible dyeing with zero hazardous discharges.',
        },
    ];

    const manufacturingSpecsTable = [
        {
            parameter: 'Yarn & Fiber Grades',
            specification: '100% Combed Ring-Spun Cotton, BCI Cotton, GOTS Certified Organic Cotton, CVC (60/40, 80/20), Recycled Polyester (GRS), Viscose/Rayon',
            buyerNote: '24s, 26s, 30s, 32s, 40s yarn counts from certified spinning mills.'
        },
        {
            parameter: 'Knit Knit Constructions',
            specification: 'Single Jersey, Interlock, 1x1 / 2x2 Rib, Pique / Lacoste, French Terry (unbrushed), Polar & Cotton Fleece (brushed), Waffle',
            buyerNote: 'Circular knit machines (Mayer & Cie, Terrot) ensuring zero torquing or spirality.'
        },
        {
            parameter: 'Weight Range (GSM)',
            specification: '140 GSM (lightweight tees) to 420 GSM (heavyweight streetwear hoodies & sweatpants)',
            buyerNote: 'Pre-shrunk fabric with compactor finish (< 4% shrinkage after wash).'
        },
        {
            parameter: 'Minimum Order Quantity (MOQ)',
            specification: '1,000 – 1,500 pcs per style for basic knitwear; 2,000 pcs for custom yarn dyed stripes',
            buyerNote: 'Can be split across 2-3 colorways and full size range (XS to 3XL).'
        },
        {
            parameter: 'Sampling Turnaround',
            specification: 'Lab Dips (Color matching): 4 – 5 days; Proto / Fit Sample: 5 – 7 days; SMS: 15 days',
            buyerNote: 'Rapid sample execution directly handled by dedicated sampling merchandisers.'
        },
        {
            parameter: 'Bulk Production Lead Time',
            specification: '45 – 60 days from final lab-dip, size-set, and accessories approval',
            buyerNote: 'Vertically integrated partner mills enable rapid 45-day turnaround.'
        },
        {
            parameter: 'Dyeing & Printing Capabilities',
            specification: 'Reactive Piece Dyeing, Pigment Dye, Discharge, Plastisol, High-Density 3D, Puff, DTG, Tajima Multi-Head Embroidery',
            buyerNote: 'Color fastness rating to washing & light: Grade 4-5 (AATCC/ISO standards).'
        },
        {
            parameter: 'Quality Control Standards',
            specification: 'AQL 1.5 Major Defects / AQL 2.5 Minor Defects (MIL-STD-105E)',
            buyerNote: 'Inline seam tension, color shading, stitch density (SPI), and final random checks.'
        },
        {
            parameter: 'Social & Eco Compliance',
            specification: 'amfori BSCI, SEDEX SMETA (4-Pillar), OEKO-TEX Standard 100, GOTS Organic, WRAP, RSC Accord',
            buyerNote: 'Zero audit duplication; shared SMETA platform access for buyers.'
        }
    ];

    const manufacturingPoints = [
        'Circular knitting machines (Mayer & Cie, Terrot) for uniform tension and zero skewing',
        'Advanced reactive, pigment, and tie-dye washes with colorfastness ratings exceeding 4-5',
        'Screen printing (discharge, high-density, plastisol, puff, water-based) and digital DTG',
        'Precision multi-head Tajima embroidery for badges, logos, and intricate designs',
        'Automatic 4-thread overlock and flatlock stitching for maximum seam durability',
        'Fabric pre-shrinking and compactor processing to maintain < 4% shrinkage after home washing',
    ];

    const faqs = [
        {
            question: 'What are Apparel Emporium’s core knitwear manufacturing capabilities?',
            answer: 'We manufacture full ranges of circular and flat knitwear including crewneck and V-neck t-shirts, pique polo shirts, heavy French Terry hoodies, brushed fleece sweatshirts, joggers, athletic tank tops, and loungewear.',
        },
        {
            question: 'What is your standard MOQ and lead time for knitwear production in Bangladesh?',
            answer: 'Our standard MOQ is 1,000 to 1,500 pieces per style across 2-3 colors. Bulk lead time is 45 to 60 days from pre-production approval, with initial proto samples delivered in 5 to 7 days.',
        },
        {
            question: 'Can you provide organic, recycled, and OEKO-TEX certified fabrics?',
            answer: 'Yes, we supply GOTS certified 100% organic cotton, BCI (Better Cotton Initiative) cotton, and GRS certified recycled polyester blends with complete scope transaction certificates (TC).',
        },
        {
            question: 'What quality control and inspection protocols are maintained?',
            answer: 'We enforce strict AQL 1.5 Major / 2.5 Minor inspection benchmarks. Every production batch undergoes weight checks, shrink tests, pull tests on snap buttons, and needle detection before dispatch.',
        },
    ];

    return (
        <B2BCategoryPage
            slug="knitwear"
            categoryName="Knitwear"
            h1="Knitwear & Jersey Apparel Manufacturing & Sourcing in Bangladesh"
            subheading="Source high-volume, export-quality circular and flat knitwear (T-shirts, polo shirts, fleece hoodies, tracksuits) manufactured with OEKO-TEX certified cotton in Bangladesh."
            description="Bangladesh is the global leader in knitwear manufacturing, offering unparalleled cost efficiency, vertically integrated mills, and skilled craftsmanship. Apparel Emporium manages your entire knit sourcing pipeline—from yarn selection and lab dips to garment assembly, custom branding, and shipping logistics."
            specHighlights={specHighlights}
            manufacturingSpecsTable={manufacturingSpecsTable}
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
