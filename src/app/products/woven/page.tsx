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
            value: '45 - 60 Days',
            description: 'From lab-dip & fit approval to FOB Chittagong port container loading.',
        },
        {
            label: 'Minimum Order Quantity',
            value: '1,000 - 3,000 Pcs',
            description: 'Per style with flexible color breakdowns (S-XXL sizes).',
        },
        {
            label: 'Audits & Compliance',
            value: 'BSCI, SEDEX (SMETA), OEKO-TEX, WRAP',
            description: 'Fully certified Tier-1 partner factories with zero audit duplication.',
        },
    ];

    const manufacturingSpecsTable = [
        {
            parameter: 'Fabric Compositions',
            specification: '100% Combed Cotton, CVC (60/40, 80/20), TC (65/35), Cotton-Elastane (98/2), Lyocell/Tencel, Linen blends',
            buyerNote: 'Mill-sourced or imported greige fabric with full Oeko-Tex certification.'
        },
        {
            parameter: 'Fabric Weaves & Weights',
            specification: 'Twill, Plain Poplin, Oxford, Herringbone, Satin, Rigid & Stretch Denim (8.5 oz to 14.5 oz), 120 GSM to 380 GSM',
            buyerNote: 'Precision 4-point fabric inspection conducted prior to cutting.'
        },
        {
            parameter: 'Minimum Order Quantity (MOQ)',
            specification: '1,000 pcs per style for in-stock fabrics; 2,500 – 3,000 pcs for custom woven mill runs',
            buyerNote: 'Flexible color/size breakdown (typically 2-3 colorways per style).'
        },
        {
            parameter: 'Sampling Lead Time',
            specification: 'Proto / Fit Sample: 5 – 7 days; Salesman Sample (SMS) in actual fabric: 15 days',
            buyerNote: 'Full CAD pattern grading & 3D virtual fit simulation available.'
        },
        {
            parameter: 'Bulk Production Lead Time',
            specification: '45 – 60 days from final PPS (Pre-Production Sample) & trim approval',
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
            buyerNote: 'Pre-production, In-line, and Final Random Inspection (FRI) reports supplied.'
        },
        {
            parameter: 'Social & Technical Audits',
            specification: 'amfori BSCI (Grade A/B), SEDEX SMETA (4-Pillar), OEKO-TEX Standard 100, WRAP, RSC Accord Safety',
            buyerNote: 'Dual certified facilities eliminate buyer audit re-inspection fees.'
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
            question: 'What is the standard MOQ and lead time for woven garments in Bangladesh?',
            answer: 'Our standard MOQ ranges from 1,000 to 3,000 pieces per style. Bulk production lead time is 45 to 60 days following PPS and trim approval, with proto sampling delivered within 5 to 7 days.',
        },
        {
            question: 'What quality control standards are applied during woven production?',
            answer: 'Every order undergoes strict 4-point fabric inspection prior to spreading, in-line process audits, and final AQL 1.5/2.5 random inspections before packing into export master cartons.',
        },
        {
            question: 'Are your woven manufacturing partner factories BSCI and SEDEX audited?',
            answer: 'Yes, 100% of our partner factories in Bangladesh hold valid BSCI, SEDEX (SMETA 4-pillar), WRAP, and OEKO-TEX Standard 100 certifications, ensuring ethical labor and zero audit duplication for buyers.',
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
            manufacturingSpecsTable={manufacturingSpecsTable}
            manufacturingPoints={manufacturingPoints}
            faqs={faqs}
            products={products}
        />
    );
}
