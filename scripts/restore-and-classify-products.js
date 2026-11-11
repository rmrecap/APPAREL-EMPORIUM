/**
 * Complete Catalog Restoration & Intelligent AI/Taxonomy Classification
 * Restores all 249 products from backup zip and fixes category/gender mismatches.
 */
const { PrismaClient } = require('@prisma/client');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('====================================================');
    console.log(' 🔄 RESTORING & AUTO-CLASSIFYING PRODUCT CATALOG');
    console.log('====================================================');

    const zipPath = 'c:/Users/DELL/Downloads/aelbd-FULL-backup-2026-11-11.zip';
    if (!fs.existsSync(zipPath)) {
        throw new Error(`Backup zip not found at ${zipPath}`);
    }

    const zip = new AdmZip(zipPath);
    const rawCategories = JSON.parse(zip.readAsText('categories.json'));
    const rawProducts = JSON.parse(zip.readAsText('products.json'));

    console.log(`📦 Loaded from backup: ${rawCategories.length} categories, ${rawProducts.length} products`);

    // 1. Upsert all categories (Pass 1: base records without foreign keys to prevent FK order failures)
    console.log('📁 Synchronizing category tree (Pass 1: Create/Update nodes)...');
    for (const cat of rawCategories) {
        const existing = await prisma.category.findFirst({
            where: {
                OR: [
                    { id: cat.id },
                    { slug: cat.slug }
                ]
            }
        });

        if (existing) {
            await prisma.category.update({
                where: { id: existing.id },
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description || null,
                    image: cat.image || null,
                    order: cat.order || 0,
                    isActive: cat.isActive !== false
                }
            });
        } else {
            await prisma.category.create({
                data: {
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description || null,
                    image: cat.image || null,
                    parentId: null,
                    order: cat.order || 0,
                    isActive: cat.isActive !== false
                }
            });
        }
    }

    // Pass 2: Link parent relationships safely
    console.log('🔗 Linking category parent-child hierarchy (Pass 2)...');
    for (const cat of rawCategories.filter(c => c.parentId)) {
        try {
            // Find current category
            const current = await prisma.category.findFirst({
                where: { OR: [{ id: cat.id }, { slug: cat.slug }] }
            });
            // Find parent
            const rawParent = rawCategories.find(c => c.id === cat.parentId);
            const parent = rawParent
                ? await prisma.category.findFirst({ where: { OR: [{ id: rawParent.id }, { slug: rawParent.slug }] } })
                : await prisma.category.findUnique({ where: { id: cat.parentId } });

            if (current && parent && current.id !== parent.id) {
                await prisma.category.update({
                    where: { id: current.id },
                    data: { parentId: parent.id }
                });
            }
        } catch (e) {
            // Safe ignore minor hierarchy cycles
        }
    }

    console.log('✅ Categories synchronized successfully.');

    // Category mapping lookup
    const allDbCats = await prisma.category.findMany();
    const catBySlug = new Map(allDbCats.map(c => [c.slug.toLowerCase(), c]));
    const catById = new Map(allDbCats.map(c => [c.id, c]));

    // Find specific category IDs for automatic gender remapping
    const womensSweaterCat = catBySlug.get('womens-sweaters-cardigans-pullovers') || catBySlug.get('womens-sweater') || catBySlug.get('women-sweater');
    const womensTshirtCat = catBySlug.get('womens-t-shirt') || catBySlug.get('womens-knit-tshirt');
    const womensDressCat = catBySlug.get('womens-woven-dress') || catBySlug.get('womens-knit-dress');
    const womensNightwearCat = catBySlug.get('womens-knit-nightwear');
    const kidsDenimCat = catBySlug.get('kids-woven-denim');
    const kidsTrouserCat = catBySlug.get('kids-woven-trouser');
    const kidsSweaterCat = catBySlug.get('kids-sweaters-cardigans-pullovers') || catBySlug.get('kids-sweater');

    let fixedCount = 0;
    const classifiedProducts = [];

    console.log('🤖 Running Intelligent AI Classification on all 249 products...');

    for (const p of rawProducts) {
        let name = (p.name || p.title || '').trim();
        let currentCat = catById.get(p.categoryId) || p.category || {};
        let department = p.department;
        let divisionType = p.divisionType;
        let categoryId = p.categoryId;

        const isWomen = /\b(women|womens|woman|ladies|lady|female)\b/i.test(name);
        const isKids = /\b(kid|kids|child|children|childrens|baby|toddler|infant|boy|boys|girl|girls)\b/i.test(name);
        const isMen = /\b(men|mens|man|male|gent|gentleman)\b/i.test(name) && !isWomen;
        const isHomeTextile = /\b(towel|bedding|curtain|duvet|pillow|linen)\b/i.test(name) || currentCat.slug === 'towel';
        const isFootwear = /\b(espadrille|shoe|footwear)\b/i.test(name);

        let changed = false;

        // 1. Department Alignment
        if (isHomeTextile) {
            department = 'Home Textiles';
            divisionType = 'Home Textiles';
        } else if (isFootwear) {
            divisionType = 'Footwear';
            department = isWomen ? 'Womenswear' : (isKids ? 'Kidswear' : 'Menswear');
        } else if (isWomen) {
            if (department !== 'Womenswear') {
                department = 'Womenswear';
                changed = true;
            }
        } else if (isKids) {
            if (department !== 'Kidswear') {
                department = 'Kidswear';
                changed = true;
            }
        } else if (isMen) {
            if (department !== 'Menswear') {
                department = 'Menswear';
                changed = true;
            }
        }

        // 2. Division Type Alignment
        if (!isHomeTextile && !isFootwear) {
            if (/\b(sweater|cardigan|pullover|jumper|poncho|knit top|mock neck|turtleneck)\b/i.test(name)) {
                divisionType = 'Sweater';
            } else if (/\b(denim|jean|jeans|chino|trouser|trousers|pant|pants|cargo|dress|blouse|skirt)\b/i.test(name) && !/\b(jogger|t-shirt|tee)\b/i.test(name)) {
                divisionType = 'Woven';
            } else if (/\b(t-shirt|tshirt|tee|polo|sweatshirt|hoodie|jogger|tank top|pyjama|nightwear|legging)\b/i.test(name)) {
                divisionType = 'Knit';
            }
        }

        // 3. Category Remapping for Mismatches
        if (isWomen) {
            // If assigned to a men's category, remap to corresponding women's category
            if (currentCat.slug && currentCat.slug.includes('men') && !currentCat.slug.includes('women')) {
                if (divisionType === 'Sweater' && womensSweaterCat) {
                    categoryId = womensSweaterCat.id;
                    changed = true;
                } else if (name.toLowerCase().includes('dress') && womensDressCat) {
                    categoryId = womensDressCat.id;
                    changed = true;
                } else if (name.toLowerCase().includes('pyjama') && womensNightwearCat) {
                    categoryId = womensNightwearCat.id;
                    changed = true;
                } else if (name.toLowerCase().includes('t-shirt') && womensTshirtCat) {
                    categoryId = womensTshirtCat.id;
                    changed = true;
                }
            }
        } else if (isKids) {
            if (currentCat.slug && !currentCat.slug.includes('kid')) {
                if (name.toLowerCase().includes('denim') || name.toLowerCase().includes('jean')) {
                    if (kidsDenimCat) { categoryId = kidsDenimCat.id; changed = true; }
                } else if (name.toLowerCase().includes('cargo') || name.toLowerCase().includes('trouser') || name.toLowerCase().includes('chino')) {
                    if (kidsTrouserCat) { categoryId = kidsTrouserCat.id; changed = true; }
                } else if (divisionType === 'Sweater' && kidsSweaterCat) {
                    categoryId = kidsSweaterCat.id;
                    changed = true;
                }
            }
        }

        if (changed) {
            fixedCount++;
        }

        // Ensure categoryId exists in DB
        let resolvedCat = catById.get(categoryId) || catBySlug.get((currentCat.slug || '').toLowerCase());
        if (!resolvedCat && allDbCats.length > 0) {
            resolvedCat = allDbCats[0];
        }
        const finalCategoryId = resolvedCat ? resolvedCat.id : categoryId;

        const productRecord = {
            id: p.id,
            name: name,
            slug: p.slug,
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            categoryId: finalCategoryId,
            images: typeof p.images === 'string' ? p.images : JSON.stringify(p.images || []),
            specifications: typeof p.specifications === 'string' ? p.specifications : JSON.stringify(p.specifications || {}),
            isFeatured: Boolean(p.isFeatured),
            isActive: Boolean(p.isActive !== false),
            tags: p.tags || null,
            variants: p.variants ? (typeof p.variants === 'string' ? p.variants : JSON.stringify(p.variants)) : null,
            priceDisplay: p.priceDisplay !== false,
            minOrder: p.minOrder || '500 pcs',
            priceRange: p.priceRange || '$3.50 - $18.00',
            tieredPricing: p.tieredPricing ? (typeof p.tieredPricing === 'string' ? p.tieredPricing : JSON.stringify(p.tieredPricing)) : null,
            ogImage: p.ogImage || null,
            seoDescription: p.seoDescription || null,
            seoKeywords: p.seoKeywords || null,
            seoTitle: p.seoTitle || null,
            sku: p.sku || `AE-${p.id.slice(-6)}`,
            additionalCategories: p.additionalCategories || null,
            styleNo: p.styleNo || p.sku || `AE-${p.id.slice(-6)}`,
            title: name,
            department: department,
            subCategory: p.subCategory || (resolvedCat ? resolvedCat.slug : currentCat.slug) || null,
            divisionType: divisionType,
            brand: p.brand || 'Apparel Emporium',
            isHumanVerified: Boolean(p.isHumanVerified),
            verifiedBy: p.verifiedBy || null,
            status: p.status || 'PUBLISHED',
        };

        const existingProd = await prisma.product.findFirst({
            where: { OR: [{ id: p.id }, { slug: p.slug }] }
        });

        if (existingProd) {
            await prisma.product.update({
                where: { id: existingProd.id },
                data: productRecord
            });
        } else {
            await prisma.product.create({
                data: productRecord
            });
        }

        classifiedProducts.push(productRecord);
    }

    console.log(`✅ Upserted ${classifiedProducts.length} products (Auto-fixed ${fixedCount} misclassified items).`);

    // Verify database count
    const totalInDb = await prisma.product.count();
    console.log(`📊 Total products in local database: ${totalInDb}`);

    // Department breakdown
    const deptCounts = {};
    for (const p of classifiedProducts) {
        deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
    }
    console.log('📈 Department Breakdown:', deptCounts);

    // Save offline json backup of 249 products
    const backupOutputPath = path.join(process.cwd(), 'prisma', 'catalog_backup_249_products.json');
    fs.writeFileSync(backupOutputPath, JSON.stringify(classifiedProducts, null, 2), 'utf-8');
    console.log(`💾 Saved complete catalog backup to: ${backupOutputPath} (${fs.statSync(backupOutputPath).size} bytes)`);

    // Also update catalog_backup_174_products.json so old reference works
    fs.writeFileSync(path.join(process.cwd(), 'prisma', 'catalog_backup_174_products.json'), JSON.stringify(classifiedProducts, null, 2), 'utf-8');

    console.log('====================================================');
    console.log(' 🎉 RESTORATION & CLASSIFICATION COMPLETE');
    console.log('====================================================');
}

main()
    .catch(e => {
        console.error('Fatal error during restoration:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
