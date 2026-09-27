const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up duplicate products and setting showcase order...');

    // Deactivate old duplicates that have different slugs
    await prisma.product.updateMany({
        where: {
            slug: {
                notIn: [
                    'mens-leather-boots',
                    'mens-woven-denim-jacket',
                    'mens-knit-tshirt-white',
                    'mens-polo-pique-gray',
                    'mens-polo-classic-navy',
                    'mens-tshirt-premium-crew-navy'
                ]
            }
        },
        data: {
            isActive: false
        }
    });

    // Set precise createdAt so they sort in exact order:
    // 1. Leather Boots (most recent)
    // 2. Denim Jacket
    // 3. Classic T-shirt
    // 4. Pique Polo
    // 5. Classic Piqué Polo Shirt
    // 6. Premium Crew Neck T-Shirt
    const now = Date.now();

    await prisma.product.update({
        where: { slug: 'mens-leather-boots' },
        data: {
            createdAt: new Date(now + 60000),
            sku: 'LEATHER',
            name: 'Leather Boots',
            isActive: true,
            isFeatured: true
        }
    });

    await prisma.product.update({
        where: { slug: 'mens-woven-denim-jacket' },
        data: {
            createdAt: new Date(now + 50000),
            sku: 'DENIM',
            name: 'Denim Jacket',
            isActive: true,
            isFeatured: true
        }
    });

    await prisma.product.update({
        where: { slug: 'mens-knit-tshirt-white' },
        data: {
            createdAt: new Date(now + 40000),
            sku: 'T-SHIRT',
            name: 'Classic T-shirt',
            isActive: true,
            isFeatured: true
        }
    });

    await prisma.product.update({
        where: { slug: 'mens-polo-pique-gray' },
        data: {
            createdAt: new Date(now + 30000),
            sku: 'POLO',
            name: 'Pique Polo',
            isActive: true,
            isFeatured: true
        }
    });

    await prisma.product.update({
        where: { slug: 'mens-polo-classic-navy' },
        data: {
            createdAt: new Date(now + 20000),
            sku: 'POLO',
            name: 'Classic Piqué Polo Shirt',
            isActive: true,
            isFeatured: true
        }
    });

    await prisma.product.update({
        where: { slug: 'mens-tshirt-premium-crew-navy' },
        data: {
            createdAt: new Date(now + 10000),
            sku: 'NECK',
            name: 'Premium Crew Neck T-Shirt',
            isActive: true,
            isFeatured: true
        }
    });

    console.log('Successfully sorted and activated the 6 showcase items in exact order!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
