const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== ENFORCING CATALOG PRODUCT INTEGRITY & TAXONOMY DISCIPLINE ===');

  // 1. Purge any dummy/synthetic products (e.g., cmv88nw* or placeholder-only)
  const dummyDeleted = await prisma.product.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'cmv88nw' } },
        { images: { contains: '/products/knitwear-hero.png' } },
        { images: { contains: '/products/sweater-hero.png' } },
        { images: { contains: '/products/woven-hero.png' } }
      ]
    }
  });
  if (dummyDeleted.count > 0) {
    console.log(`[CLEANUP] Deleted ${dummyDeleted.count} synthetic placeholder products.`);
  }

  // 2. Fetch all authentic products
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' }
  });
  console.log(`[INVENTORY] Total authentic products found: ${products.length}`);

  // 3. Ensure Category records exist for each taxonomy group & subcategory
  const requiredCategories = [
    // Roots
    { name: 'Fashion', slug: 'fashion', parentSlug: null },
    { name: 'Home Textiles', slug: 'hometextiles', parentSlug: null },
    { name: 'Footwear', slug: 'footwear', parentSlug: null },
    { name: 'Accessories', slug: 'accessories', parentSlug: null },

    // Fashion Pillars
    { name: "Men's Fashion", slug: 'mens-fashion', parentSlug: 'fashion' },
    { name: "Women's Fashion", slug: 'womens-fashion', parentSlug: 'fashion' },
    { name: "Children's Fashion", slug: 'childrens-fashion', parentSlug: 'fashion' },

    // Men's Groups & Items
    { name: 'Circular Knit Items', slug: 'men-circular-knit', parentSlug: 'mens-fashion' },
    { name: 'Flat Knit Items', slug: 'men-flat-knit', parentSlug: 'mens-fashion' },
    { name: 'Woven Items', slug: 'men-woven', parentSlug: 'mens-fashion' },
    { name: 'T-Shirt', slug: 'mens-t-shirt', parentSlug: 'men-circular-knit' },
    { name: 'Polo-Shirt', slug: 'mens-polo-shirt', parentSlug: 'men-circular-knit' },
    { name: 'Sweatshirt / Hoodie', slug: 'mens-sweatshirt', parentSlug: 'men-circular-knit' },
    { name: 'Jogger / Trousers', slug: 'mens-trousers-joggers', parentSlug: 'men-circular-knit' },
    { name: 'Sweaters / Cardigans', slug: 'mens-sweaters-cardigans', parentSlug: 'men-flat-knit' },
    { name: 'Pullovers / Jumpers', slug: 'mens-pullover', parentSlug: 'men-flat-knit' },

    // Women's Groups & Items
    { name: 'Circular Knit Items', slug: 'women-circular-knit', parentSlug: 'womens-fashion' },
    { name: 'Flat Knit Items', slug: 'women-flat-knit', parentSlug: 'womens-fashion' },
    { name: 'Woven Items', slug: 'women-woven', parentSlug: 'womens-fashion' },
    { name: 'T-Shirt', slug: 'womens-t-shirt', parentSlug: 'women-circular-knit' },
    { name: 'Polo-Shirt', slug: 'womens-polo-shirt', parentSlug: 'women-circular-knit' },
    { name: 'Sweatshirt / Hoodie', slug: 'womens-sweatshirt', parentSlug: 'women-circular-knit' },
    { name: 'Dress', slug: 'womens-knit-dress', parentSlug: 'women-circular-knit' },
    { name: 'Tank Top / Undergarments', slug: 'womens-undergarments', parentSlug: 'women-circular-knit' },
    { name: 'Sweaters / Cardigans / Pullovers', slug: 'womens-sweaters-cardigans-pullovers', parentSlug: 'women-flat-knit' },

    // Home Textiles
    { name: 'Towel', slug: 'towel', parentSlug: 'hometextiles' },
    { name: 'Bedding', slug: 'bedding', parentSlug: 'hometextiles' },
    { name: 'Curtain', slug: 'curtain', parentSlug: 'hometextiles' },

    // Footwear
    { name: 'Basic Espadrilles', slug: 'basic-espadrilles', parentSlug: 'footwear' },
    { name: 'Fashion Espadrilles', slug: 'fashion-espadrilles', parentSlug: 'footwear' },

    // Accessories
    { name: 'Scarves', slug: 'scarves', parentSlug: 'accessories' },
    { name: 'Hats & Caps', slug: 'hats-caps', parentSlug: 'accessories' },
    { name: 'Gloves', slug: 'gloves', parentSlug: 'accessories' },
    { name: 'Socks', slug: 'socks', parentSlug: 'accessories' },
    { name: 'Gift Box', slug: 'gift-box', parentSlug: 'accessories' }
  ];

  const categoryMap = new Map();
  for (const item of requiredCategories) {
    let cat = await prisma.category.findUnique({ where: { slug: item.slug } });
    let parentId = item.parentSlug ? (categoryMap.get(item.parentSlug) || null) : null;
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: item.name,
          slug: item.slug,
          parentId,
          isActive: true
        }
      });
    } else if (parentId && cat.parentId !== parentId) {
      cat = await prisma.category.update({
        where: { id: cat.id },
        data: { parentId }
      });
    }
    categoryMap.set(item.slug, cat.id);
  }

  // 4. Exact, disciplined taxonomy mapping for every genuine product
  let updatedCount = 0;
  for (const prod of products) {
    const rawText = `${prod.title || prod.name || ''} ${prod.slug || ''} ${prod.description || ''}`.toLowerCase();

    let divisionType = 'Knit';
    let department = 'Menswear';
    let subCategory = 'mens-t-shirt';
    let targetCatSlug = 'mens-t-shirt';

    // Footwear Check
    if (rawText.includes('espadrille') || rawText.includes('footwear')) {
      divisionType = 'Footwear';
      department = rawText.includes('women') ? 'Womenswear' : 'Menswear';
      if (rawText.includes('basic') || rawText.includes('classic') || rawText.includes('minimalist') || rawText.includes('slip-on') || rawText.includes('slip-ons')) {
        subCategory = 'basic-espadrilles';
        targetCatSlug = 'basic-espadrilles';
      } else {
        subCategory = 'fashion-espadrilles';
        targetCatSlug = 'fashion-espadrilles';
      }
    }
    // Home Textiles Check
    else if (rawText.includes('towel')) {
      divisionType = 'Home Textiles';
      department = 'Home Textiles';
      subCategory = 'towel';
      targetCatSlug = 'towel';
    }
    // Sweater (Flat Knit) Check
    else if (rawText.includes('sweater') || rawText.includes('pullover') || rawText.includes('cardigan') || rawText.includes('jumper')) {
      divisionType = 'Sweater';
      department = rawText.includes('women') ? 'Womenswear' : (rawText.includes('kids') ? 'Kidswear' : 'Menswear');
      subCategory = department === 'Womenswear' ? 'womens-sweaters-cardigans-pullovers' : 'mens-pullover';
      targetCatSlug = subCategory;
    }
    // Circular Knit Items
    else {
      divisionType = 'Knit';
      if (rawText.includes('women') || rawText.includes('dress') || rawText.includes('blouse') || rawText.includes('tank')) {
        department = 'Womenswear';
        if (rawText.includes('dress')) {
          subCategory = 'womens-knit-dress';
          targetCatSlug = 'womens-knit-dress';
        } else if (rawText.includes('polo')) {
          subCategory = 'womens-polo-shirt';
          targetCatSlug = 'womens-polo-shirt';
        } else if (rawText.includes('hoodie') || rawText.includes('sweatshirt')) {
          subCategory = 'womens-sweatshirt';
          targetCatSlug = 'womens-sweatshirt';
        } else if (rawText.includes('bodysuit') || rawText.includes('undergarment') || rawText.includes('tank')) {
          subCategory = 'womens-undergarments';
          targetCatSlug = 'womens-undergarments';
        } else {
          subCategory = 'womens-t-shirt';
          targetCatSlug = 'womens-t-shirt';
        }
      } else if (rawText.includes('kids') || rawText.includes('baby')) {
        department = 'Kidswear';
        subCategory = 'kids-knit-tshirt';
        targetCatSlug = 'kids-knit-tshirt';
      } else {
        department = 'Menswear';
        if (rawText.includes('polo')) {
          subCategory = 'mens-polo-shirt';
          targetCatSlug = 'mens-polo-shirt';
        } else if (rawText.includes('hoodie') || rawText.includes('sweatshirt')) {
          subCategory = 'mens-sweatshirt';
          targetCatSlug = 'mens-sweatshirt';
        } else if (rawText.includes('jogger') || rawText.includes('trouser')) {
          subCategory = 'mens-trousers-joggers';
          targetCatSlug = 'mens-trousers-joggers';
        } else {
          subCategory = 'mens-t-shirt';
          targetCatSlug = 'mens-t-shirt';
        }
      }
    }

    const categoryId = categoryMap.get(targetCatSlug) || prod.categoryId;

    await prisma.product.update({
      where: { id: prod.id },
      data: {
        divisionType,
        department,
        subCategory,
        categoryId,
        isActive: true
      }
    });
    updatedCount++;
    console.log(`[OK] [#${updatedCount}] "${prod.name || prod.title}" -> Div: ${divisionType} | Dept: ${department} | Sub: ${subCategory}`);
  }

  console.log(`\n=== SUCCESSFULLY AUDITED & SYNCHRONIZED ${updatedCount} PRODUCTS ===`);
}

main()
  .catch(err => {
    console.error('Integrity error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
