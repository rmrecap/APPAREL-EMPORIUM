import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import B2BCategoryPage from '@/components/products/B2BCategoryPage';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

export const metadata: Metadata = {
    title: 'Woven Garments Sourcing & Export Manufacturing | AELBD Bangladesh',
    description: 'Source export-grade woven apparel (shirts, denim jeans, trousers, jackets, chinos) from ethically audited, BSCI & SEDEX compliant factories in Bangladesh. Custom OEM/ODM specs, low MOQ, competitive pricing.',
    alternates: {
        canonical: `${baseUrl}/products/woven`,
    },
    openGraph: {
        title: 'Woven Garments Sourcing & Export Manufacturing | AELBD Bangladesh',
        description: 'Source export-grade woven apparel from certified Bangladesh garment manufacturers. Denim, formal shirts, chinos, cargo pants, and outerwear.',
        url: `${baseUrl}/products/woven`,
        images: ['/logo.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Woven Garments Sourcing & Export Manufacturing | AELBD Bangladesh',
        description: 'Source export-grade woven apparel from certified Bangladesh garment manufacturers.',
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
            label: 'Production Lead Time',
            value: '60 - 90 Days',
            description: 'From lab-dip & fit approval to FOB Chittagong port dispatch.',
        },
        {
            label: 'Minimum Order Quantity',
            value: '1,000 - 3,000 Pcs',
            description: 'Per style with flexible color breakdowns (S-XXL sizes).',
        },
        {
            label: 'Audits & Compliance',
            value: 'BSCI, SEDEX (SMETA), OEKO-TEX',
            description: 'Fully certified Tier-1 partner factories with zero audit duplication.',
        },
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
            question: 'What is the standard MOQ for woven garments production in Bangladesh?',
            answer: 'Our standard MOQ for woven apparel ranges from 1,000 to 3,000 pieces per style depending on fabric availability (mill-made vs in-stock yarn). Smaller trial quantities can be accommodated for established buyers.',
        },
        {
            question: 'How fast can you deliver proto samples and size sets for woven styles?',
            answer: 'Proto samples and tech-pack mockups are developed within 7 to 10 days using available fabrics. Salesman samples (SMS) in actual production fabric and trims require 15 to 20 days.',
        },
        {
            question: 'Are your woven manufacturing partner factories BSCI and SEDEX audited?',
            answer: 'Yes, 100% of our partner factories in Bangladesh are strictly vetted and hold valid BSCI, SEDEX (SMETA 4-pillar), WRAP, and OEKO-TEX Standard 100 certifications, ensuring ethical labor and eco-friendly processing.',
        },
    ];

    return (
        <B2BCategoryPage
            slug="woven"
            categoryName="Woven"
            h1="Export Woven Garments Manufacturing & Sourcing in Bangladesh"
            subheading="Source high-grade woven apparel (casual shirts, denim jeans, chinos, trousers, jackets) from ethically audited, BSCI & SEDEX compliant partner factories in Bangladesh."
            description="Apparel Emporium delivers end-to-end woven garment sourcing solutions for international fashion brands, department stores, and private label importers. From technical weave development to high-tech denim washes and strict AQL 1.5 quality control, our dedicated manufacturing network guarantees consistency and competitive pricing."
            specHighlights={specHighlights}
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
