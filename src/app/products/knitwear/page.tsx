import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import B2BCategoryPage from '@/components/products/B2BCategoryPage';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.aelbd.net';

export const metadata: Metadata = {
    title: 'Knitwear Sourcing & B2B Garment Manufacturer in Bangladesh | Apparel Buying House',
    description: 'Leading B2B Garment Manufacturer and Apparel Buying House for circular and flat knitwear in Bangladesh. Custom OEM/ODM clothing exporter for t-shirts, polo shirts, hoodies, sweatshirts, and activewear with AQL QA.',
    alternates: {
        canonical: `${baseUrl}/products/knitwear`,
    },
    openGraph: {
        title: 'Knitwear Sourcing & B2B Garment Manufacturer in Bangladesh | Apparel Buying House',
        description: 'B2B Garment Manufacturer & Apparel Buying House in Bangladesh: custom OEM/ODM t-shirts, polo shirts, fleece hoodies, tracksuits, and activewear.',
        url: `${baseUrl}/products/knitwear`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Knitwear Sourcing & B2B Garment Manufacturer in Bangladesh | Apparel Buying House',
        description: 'B2B Garment Manufacturer & Apparel Buying House in Bangladesh: custom OEM/ODM knitwear export.',
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
            parameter: 'Yarn & Fiber Grades',
            specification: '100% Combed Ring-Spun Cotton, BCI Cotton, Organic Cotton blends, CVC (60/40, 80/20), Recycled Polyester, Viscose/Rayon',
            buyerNote: '24s, 26s, 30s, 32s, 40s yarn counts from certified spinning mills.'
        },
        {
            parameter: 'Knit Constructions',
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
            specification: 'Flexible and tailored strictly per tech-pack, fabric batch minimums, and buyer order volume',
            buyerNote: 'Can be split across multiple colorways and full size range (XS to 3XL).'
        },
        {
            parameter: 'Sampling Turnaround',
            specification: 'Lab Dips (Color matching): 4 – 5 days; Proto / Fit Sample: 5 – 7 days; SMS: 15 days',
            buyerNote: 'Rapid sample execution directly handled by dedicated sampling merchandisers.'
        },
        {
            parameter: 'Bulk Production Timeline',
            specification: 'Customized production schedules aligned with destination country, port logistics, and seasonal requirements',
            buyerNote: 'Vertically integrated partner mills enable rapid turnaround.'
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
            parameter: 'Social & Factory Compliance',
            specification: 'Fully audited partner factories adhering to international labor and safety standards; detailed compliance dossiers provided upon request',
            buyerNote: 'Complete transparency with on-the-ground technical supervision on every production line.'
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
            question: 'How do you determine MOQ and production lead times for knitwear?',
            answer: 'Our MOQs and production timelines are flexible and tailored strictly to buyer tech packs, yarn availability, and order volumes. Fast-track options are available for ongoing retail programs.',
        },
        {
            question: 'Can you provide sustainable and certified organic cotton fabrics?',
            answer: 'Yes, we supply organic cotton, BCI cotton, and recycled polyester blends with complete mill test reports and transaction documentation.',
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
            subheading="Source high-volume, export-quality circular and flat knitwear (T-shirts, polo shirts, fleece hoodies, tracksuits) manufactured with premium cotton in Bangladesh."
            description="Bangladesh is the global leader in knitwear manufacturing, offering unparalleled cost efficiency, vertically integrated mills, and skilled craftsmanship. Apparel Emporium manages your entire knit sourcing pipeline—from yarn selection and lab dips to garment assembly, custom branding, and shipping logistics."
            specHighlights={specHighlights}
            manufacturingSpecsTable={manufacturingSpecsTable}
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
