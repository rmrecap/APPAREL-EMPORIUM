const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync() {
  const syncCat = async (name, slug, parentId = null, order = 0) => {
    return prisma.category.upsert({
      where: { slug },
      update: { name, parentId, order, isActive: true },
      create: { name, slug, parentId, order, isActive: true }
    });
  };

  // 1. FASHION
  const fashion = await syncCat('Fashion', 'fashion', null, 1);
  const men = await syncCat("Men's Fashion", 'mens-fashion', fashion.id, 1);
  const women = await syncCat("Women's Fashion", 'womens-fashion', fashion.id, 2);
  const kids = await syncCat("Children's Fashion", 'childrens-fashion', fashion.id, 3);

  // Men Subcategories
  await syncCat('Men Knitwear', 'men-knitwear', men.id, 1);
  await syncCat('Men Woven', 'men-woven', men.id, 2);
  await syncCat('Men Sweater', 'men-sweater', men.id, 3);

  // Women Subcategories
  await syncCat('Women Knitwear', 'women-knitwear', women.id, 1);
  await syncCat('Women Woven', 'women-woven', women.id, 2);
  await syncCat('Women Sweater', 'women-sweater', women.id, 3);

  // Kids Subcategories
  await syncCat('Kids Knitwear', 'kids-knitwear', kids.id, 1);
  await syncCat('Kids Woven', 'kids-woven', kids.id, 2);
  await syncCat('Kids Sweater', 'kids-sweater', kids.id, 3);

  // 2. HOMETEXTILES
  const home = await syncCat('Home Textiles', 'hometextiles', null, 2);
  await syncCat('Towel', 'towel', home.id, 1);
  await syncCat('Bedding', 'bedding', home.id, 2);
  await syncCat('Curtain', 'curtain', home.id, 3);

  // 3. FOOTWEAR
  const footwear = await syncCat('Footwear', 'footwear', null, 3);
  await syncCat('Basic Espadrilles', 'basic-espadrilles', footwear.id, 1);
  await syncCat('Fashion Espadrilles', 'fashion-espadrilles', footwear.id, 2);

  // 4. ACCESSORIES
  const accessories = await syncCat('Accessories', 'accessories', null, 4);
  await syncCat('Scarves', 'scarves', accessories.id, 1);
  await syncCat('Hats/Caps', 'hats-caps', accessories.id, 2);
  await syncCat('Gloves', 'gloves', accessories.id, 3);
  await syncCat('Socks', 'socks', accessories.id, 4);
  await syncCat('Gift Box', 'gift-box', accessories.id, 5);

  console.log('Categories synced successfully!');
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
