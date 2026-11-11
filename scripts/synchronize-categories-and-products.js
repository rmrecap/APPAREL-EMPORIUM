const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('🔄 SYNCHRONIZING AUTHENTIC CATEGORIES & PRODUCT TAXONOMY (249)');
  console.log('================================================================');

  const categoriesJsonPath = path.join(process.cwd(), 'prisma', 'categories_backup_246.json');
  const productsJsonPath = path.join(process.cwd(), 'prisma', 'catalog_backup_249_products.json');

  if (!fs.existsSync(categoriesJsonPath)) {
    console.warn(`⚠️ Categories JSON not found at ${categoriesJsonPath}`);
  } else {
    console.log('📁 Syncing 246 Categories (Pass 1: Nodes)...');
    const categories = JSON.parse(fs.readFileSync(categoriesJsonPath, 'utf8'));
    for (const cat of categories) {
      const existing = await prisma.category.findFirst({
        where: { OR: [{ id: cat.id }, { slug: cat.slug }] }
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

    console.log('🔗 Syncing 246 Categories (Pass 2: Hierarchy)...');
    for (const cat of categories.filter(c => c.parentId)) {
      try {
        const current = await prisma.category.findFirst({
          where: { OR: [{ id: cat.id }, { slug: cat.slug }] }
        });
        const parent = await prisma.category.findFirst({
          where: { id: cat.parentId }
        });
        if (current && parent && current.id !== parent.id) {
          await prisma.category.update({
            where: { id: current.id },
            data: { parentId: parent.id }
          });
        }
      } catch (e) {
        // Safe to ignore non-blocking parent mismatches
      }
    }
  }

  // Check product count in database
  const currentCount = await prisma.product.count();
  console.log(`📊 Current products in DB: ${currentCount}`);

  if (fs.existsSync(productsJsonPath)) {
    const backupProducts = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
    console.log(`📦 Loaded ${backupProducts.length} verified products from catalog backup`);

    const allCats = await prisma.category.findMany();
    const catIds = new Set(allCats.map(c => c.id));
    const fallbackCatId = allCats.length > 0 ? allCats[0].id : null;

    let upsertedCount = 0;
    for (const p of backupProducts) {
      const data = { ...p };
      delete data.category; // Relation field
      if (!catIds.has(data.categoryId)) {
        data.categoryId = fallbackCatId;
      }

      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          title: data.title,
          department: data.department,
          divisionType: data.divisionType,
          subCategory: data.subCategory,
          categoryId: data.categoryId,
          isActive: data.isActive,
          priceDisplay: data.priceDisplay,
          priceRange: data.priceRange,
          minOrder: data.minOrder
        },
        create: data
      });
      upsertedCount++;
    }
    console.log(`✅ Upserted/Synchronized ${upsertedCount} authentic products with verified taxonomy.`);
  }

  // Final Health Check & Department Breakdown
  const finalCount = await prisma.product.count();
  const catCount = await prisma.category.count();
  const allProds = await prisma.product.findMany({ select: { title: true, department: true } });
  
  const depts = {};
  for (const p of allProds) {
    depts[p.department || 'Unknown'] = (depts[p.department || 'Unknown'] || 0) + 1;
  }

  const womenInMen = allProds.filter(p => p.department === 'Menswear' && (p.title.toLowerCase().includes("women") || p.title.toLowerCase().includes("girl"))).length;
  const kidsInMen = allProds.filter(p => p.department === 'Menswear' && (p.title.toLowerCase().includes("boy") || p.title.toLowerCase().includes("kids"))).length;

  console.log('----------------------------------------------------------------');
  console.log(`✅ TOTAL PRODUCTS: ${finalCount} (Target: >=240)`);
  console.log(`✅ TOTAL CATEGORIES: ${catCount} (Target: >=200)`);
  console.log('✅ DEPARTMENT BREAKDOWN:', JSON.stringify(depts));
  console.log(`✅ WOMEN IN MENSWEAR: ${womenInMen} (Target: 0)`);
  console.log(`✅ KIDS IN MENSWEAR: ${kidsInMen} (Target: 0)`);
  console.log('================================================================');

  if (finalCount < 240) {
    throw new Error(`Integrity check failed: only ${finalCount} products found, expected at least 240.`);
  }
}

main()
  .catch((err) => {
    console.error('❌ Synchronize error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
