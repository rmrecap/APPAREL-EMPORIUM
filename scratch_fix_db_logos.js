const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.siteSetting.upsert({
    where: { key: 'header_logo_light' },
    update: { value: '/uploads/logos/apparel-emporium-logo-light.png' },
    create: { key: 'header_logo_light', value: '/uploads/logos/apparel-emporium-logo-light.png', group: 'general' }
  });
  await prisma.siteSetting.upsert({
    where: { key: 'header_logo_dark' },
    update: { value: '/uploads/logos/apparel-emporium-logo-dark.png' },
    create: { key: 'header_logo_dark', value: '/uploads/logos/apparel-emporium-logo-dark.png', group: 'general' }
  });
  const updated = await prisma.siteSetting.findMany({
    where: { key: { contains: 'logo' } }
  });
  console.log('Updated logo settings in DB:', JSON.stringify(updated, null, 2));
}

fix().catch(console.error).finally(() => prisma.$disconnect());
