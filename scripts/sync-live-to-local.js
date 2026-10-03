const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching live categories...');
    const catRes = await fetch('https://www.aelbd.net/api/categories');
    const categories = await catRes.json();

    // Flatten parent and children
    const allCategories = [];
    function extract(cats) {
        for (const c of cats) {
            allCategories.push({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description || null,
                image: c.image || null,
                parentId: c.parentId || null,
                order: c.order || 0,
                isActive: c.isActive !== false
            });
            if (c.children && c.children.length > 0) {
                extract(c.children);
            }
        }
    }
    extract(categories);

    console.log(`Upserting ${allCategories.length} categories...`);
    // Upsert parents first (parentId is null)
    for (const cat of allCategories.filter(c => !c.parentId)) {
        await prisma.category.upsert({
            where: { id: cat.id },
            update: { name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, order: cat.order, isActive: cat.isActive },
            create: cat
        });
    }
    // Upsert children (parentId is not null)
    for (const cat of allCategories.filter(c => c.parentId)) {
        await prisma.category.upsert({
            where: { id: cat.id },
            update: { name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, parentId: cat.parentId, order: cat.order, isActive: cat.isActive },
            create: cat
        });
    }

    console.log('Fetching all live products...');
    const prodRes = await fetch('https://www.aelbd.net/api/products?limit=100');
    const prodData = await prodRes.json();
    const products = prodData.products || [];

    console.log(`Fetched ${products.length} live products. Upserting into local database...`);

    for (const p of products) {
        // If product's categoryId does not exist in category table, ensure it exists
        if (p.categoryId) {
            const catExists = await prisma.category.findUnique({ where: { id: p.categoryId } });
            if (!catExists && p.category) {
                await prisma.category.upsert({
                    where: { id: p.categoryId },
                    update: {},
                    create: {
                        id: p.categoryId,
                        name: p.category.name || 'General',
                        slug: p.category.slug || ('cat-' + p.categoryId)
                    }
                });
            }
        }

        const productData = {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            categoryId: p.categoryId,
            images: typeof p.images === 'string' ? p.images : JSON.stringify(p.images || []),
            specifications: typeof p.specifications === 'string' ? p.specifications : JSON.stringify(p.specifications || {}),
            isFeatured: Boolean(p.isFeatured),
            isActive: Boolean(p.isActive),
            tags: p.tags || null,
            variants: p.variants ? (typeof p.variants === 'string' ? p.variants : JSON.stringify(p.variants)) : null,
            priceDisplay: p.priceDisplay !== false,
            minOrder: p.minOrder || null,
            priceRange: p.priceRange || null,
            tieredPricing: p.tieredPricing ? (typeof p.tieredPricing === 'string' ? p.tieredPricing : JSON.stringify(p.tieredPricing)) : null,
            ogImage: p.ogImage || null,
            seoDescription: p.seoDescription || null,
            seoKeywords: p.seoKeywords || null,
            seoTitle: p.seoTitle || null,
            sku: p.sku || null,
            additionalCategories: p.additionalCategories ? (typeof p.additionalCategories === 'string' ? p.additionalCategories : JSON.stringify(p.additionalCategories)) : null,
            styleNo: p.styleNo || null,
            title: p.title || null,
            department: p.department || null,
            subCategory: p.subCategory || null,
            divisionType: p.divisionType || null,
            brand: p.brand || 'Apparel Emporium',
            fabricComposition: p.fabricComposition || null,
            fabricConstruction: p.fabricConstruction || null,
            yarnCount: p.yarnCount || null,
            gsm: p.gsm || null,
            gauge: p.gauge || null,
            fit: p.fit || null,
            dyeingFinishing: p.dyeingFinishing || null,
            certifications: p.certifications || null,
            samplingLeadTime: p.samplingLeadTime || null,
            productionLeadTime: p.productionLeadTime || null,
            sizes: p.sizes || null,
            colors: p.colors || null,
            targetSeason: p.targetSeason || null,
            packaging: p.packaging || null,
            exportMarkets: p.exportMarkets || null,
            features: p.features || null,
            isHumanVerified: Boolean(p.isHumanVerified),
            verifiedBy: p.verifiedBy || null,
            status: p.status || 'PUBLISHED'
        };

        await prisma.product.upsert({
            where: { id: p.id },
            update: productData,
            create: productData
        });
    }

    const finalCount = await prisma.product.count();
    console.log(`Sync completed! Total products now in local database: ${finalCount}`);
}

main()
    .catch(e => {
        console.error('Sync failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
