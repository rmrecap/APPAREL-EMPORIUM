import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SEED_DATA = [
    {
        id: 'seed-1',
        title: 'Organic Cotton T-Shirts — 50,000 pcs',
        description: 'Bulk order of GOTS-certified organic cotton crew-neck tees shipped to a European retail chain.',
        category: 'Knitwear',
        buyer: 'Nordic Retail Group',
        buyerCountry: 'Sweden',
        quantity: '50,000 pcs',
        status: 'DELIVERED' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
        id: 'seed-2',
        title: 'Denim Jackets — In Production',
        description: 'Heavyweight selvedge denim jackets currently in production for a North American brand.',
        category: 'Woven',
        buyer: 'Maple Apparel Co.',
        buyerCountry: 'Canada',
        quantity: '12,000 pcs',
        status: 'IN_PRODUCTION' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
    {
        id: 'seed-3',
        title: 'Activewear Leggings — Shipped',
        description: 'Moisture-wicking yoga leggings dispatched from Chittagong port to an Australian buyer.',
        category: 'Activewear',
        buyer: 'Southern Fit Pty',
        buyerCountry: 'Australia',
        quantity: '30,000 pcs',
        status: 'SHIPPED' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
        id: 'seed-4',
        title: 'Kids Polo Shirts — Completed',
        description: 'Pastel polo shirts for a Middle East school uniform program, delivered ahead of schedule.',
        category: 'Kidswear',
        buyer: 'Gulf Uniforms',
        buyerCountry: 'UAE',
        quantity: '80,000 pcs',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
        id: 'seed-5',
        title: 'Flannel Shirts — In Production',
        description: 'Brushed cotton flannel shirts entering bulk production for a UK high-street label.',
        category: 'Woven',
        buyer: 'Albion Styles',
        buyerCountry: 'United Kingdom',
        quantity: '25,000 pcs',
        status: 'IN_PRODUCTION' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
        id: 'seed-6',
        title: 'Hoodies — Delivered',
        description: 'Fleece-lined pullover hoodies completed and delivered to a German distributor.',
        category: 'Knitwear',
        buyer: 'Berlin Trading GmbH',
        buyerCountry: 'Germany',
        quantity: '40,000 pcs',
        status: 'DELIVERED' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
];

export async function GET(req: NextRequest) {
    try {
        const items = await prisma.deliveryUpdate.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            take: 20,
        });

        if (items.length === 0) {
            return NextResponse.json(SEED_DATA);
        }

        const mapped = items.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            buyer: item.buyer,
            buyerCountry: item.buyerCountry,
            quantity: item.quantity,
            status: item.status,
            imageUrl: item.imageUrl,
            createdAt: item.createdAt.toISOString(),
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        return NextResponse.json(SEED_DATA);
    }
}
