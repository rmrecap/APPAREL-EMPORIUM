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
            value: '45 - 65 Days',
            description: 'Fast-track supply chain from spinning to container loading.',
        },
        {
            label: 'Audits & Standards',
            value: 'GOTS, BSCI, SEDEX, OEKO-TEX 100',
            description: 'Environmentally responsible dyeing with zero hazardous discharges.',
        },
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
            question: 'What are Apparel Emporium’s top-selling knitwear categories?',
            answer: 'Our main knitwear lines include graphic and plain basic T-shirts, premium pique polo shirts, French Terry sweatshirts, brushed fleece hoodies, joggers, sports tank tops, and loungewear.',
        },
        {
            question: 'Can you provide organic and certified recycled knit fabrics?',
            answer: 'Yes, we supply GOTS certified 100% organic cotton, BCI (Better Cotton Initiative) cotton, and GRS certified recycled polyester blends with complete scope certificates (TC).',
        },
        {
            question: 'What is the sampling turnaround for custom knitwear styles?',
            answer: 'Lab dips for color matching are delivered within 4 to 5 working days. Proto samples take 5 to 7 days, allowing rapid design iterations for seasonal buying collections.',
        },
        {
            question: 'What is your monthly knitwear manufacturing capacity?',
            answer: 'Through our vetted partner factory network in Dhaka and Gazipur, we manage an aggregated capacity exceeding 1.5 million knitwear garments per month.',
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
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
