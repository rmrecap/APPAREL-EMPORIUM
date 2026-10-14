const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const megaMenuJson = JSON.stringify([
  {
    title: 'FASHION',
    sections: [
      {
        header: '',
        links: [
          { label: "Men's Fashion", url: '/products?category=mens-fashion' },
          { label: "Women's Fashion", url: '/products?category=womens-fashion' },
          { label: "Children's Fashion", url: '/products?category=childrens-fashion' }
        ]
      }
    ]
  },
  {
    title: 'HOME TEXTILES',
    sections: [
      {
        header: '',
        links: [
          { label: 'Towels', url: '/products?category=towel' },
          { label: 'Bedding', url: '/products?category=bedding' },
          { label: 'Curtains', url: '/products?category=curtain' }
        ]
      }
    ]
  },
  {
    title: 'FOOTWEAR',
    sections: [
      {
        header: '',
        links: [
          { label: 'Basic Espadrille', url: '/products?category=basic-espadrilles' },
          { label: 'Fashion Espadrille', url: '/products?category=fashion-espadrilles' }
        ]
      }
    ]
  },
  {
    title: 'ACCESSORIES',
    sections: [
      {
        header: '',
        links: [
          { label: 'Scarf', url: '/products?category=scarves' },
          { label: 'Hat & Caps', url: '/products?category=hats-caps' },
          { label: 'Gloves', url: '/products?category=gloves' },
          { label: 'Socks', url: '/products?category=socks' },
          { label: 'Gift Box', url: '/products?category=gift-box' }
        ]
      }
    ]
  }
]);

async function main() {
  // 1. Update all items matching Products or Categories or /products
  const result = await prisma.menuItem.updateMany({
    where: {
      OR: [
        { label: { in: ['Products', 'Categories', 'products', 'categories'] } },
        { url: '/products' },
        { isMegaMenu: true }
      ]
    },
    data: {
      isMegaMenu: true,
      megaMenuData: megaMenuJson
    }
  });
  console.log('Updated megaMenuData on menu items count:', result.count);

  // 2. If both "Products" and "Categories" exist, deactivate "Categories" to prevent clutter
  const productsItem = await prisma.menuItem.findFirst({
    where: { label: { in: ['Products', 'products'] } }
  });
  if (productsItem) {
    const deactivated = await prisma.menuItem.updateMany({
      where: {
        label: { in: ['Categories', 'categories'] },
        id: { not: productsItem.id }
      },
      data: { isActive: false }
    });
    console.log('Deactivated redundant Categories items count:', deactivated.count);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
