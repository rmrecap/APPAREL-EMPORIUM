const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const megaMenuJson = JSON.stringify([
  {
    title: 'KNIT',
    sections: [
      {
        header: '',
        links: [
          { label: 'Menswear', url: '/products?category=knitwear-mens' },
          { label: 'Womenswear', url: '/products?category=knitwear-womens' },
          { label: 'Kidswear', url: '/products?category=knitwear-kids' }
        ]
      }
    ]
  },
  {
    title: 'WOVEN',
    sections: [
      {
        header: '',
        links: [
          { label: 'Men', url: '/products?category=woven-mens' },
          { label: 'Women', url: '/products?category=woven-womens' },
          { label: 'Kids', url: '/products?category=woven-kids' }
        ]
      }
    ]
  },
  {
    title: 'SWEATER',
    sections: [
      {
        header: '',
        links: [
          { label: 'Men', url: '/products?category=sweater-mens' },
          { label: 'Women', url: '/products?category=sweater-womens' },
          { label: 'Kids', url: '/products?category=sweater-kids' }
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
