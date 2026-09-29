const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Applying Developer Settings & Disabling Requested Features ---');

  const settingsToUpsert = [
    // Support FAQ / Protocols
    { key: 'support_buyer_faqs_protocols_enabled', value: 'false', group: 'support' },
    // Contact RFQ & Guarantee
    { key: 'contact_send_sourcing_rfq_enabled', value: 'false', group: 'contact' },
    { key: 'contact_24h_rfq_guarantee_enabled', value: 'false', group: 'contact' },
    // Homepage Floating Craft Icons & Section Icons
    { key: 'homepage_floating_icons_enabled', value: 'false', group: 'homepage' },
    { key: 'homepage_section_icons_enabled', value: 'false', group: 'homepage' },
    { key: 'homepage_quick_actions_enabled', value: 'false', group: 'homepage' },
  ];

  for (const item of settingsToUpsert) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      update: { value: item.value, group: item.group },
      create: { key: item.key, value: item.value, group: item.group }
    });
    console.log(`Updated setting: ${item.key} = ${item.value}`);
  }

  // Update homepage_sections_visibility to ensure our_products_3d and featured_products are false
  const existingVis = await prisma.siteSetting.findUnique({
    where: { key: 'homepage_sections_visibility' }
  });

  let visObj = {};
  if (existingVis && existingVis.value) {
    try {
      visObj = JSON.parse(existingVis.value);
    } catch (e) {
      visObj = {};
    }
  }

  visObj['our_products_3d'] = false;
  visObj['featured_products'] = false;

  await prisma.siteSetting.upsert({
    where: { key: 'homepage_sections_visibility' },
    update: { value: JSON.stringify(visObj), group: 'homepage' },
    create: { key: 'homepage_sections_visibility', value: JSON.stringify(visObj), group: 'homepage' }
  });
  console.log('Updated homepage_sections_visibility:', JSON.stringify(visObj));

  console.log('All requested features successfully disabled and persisted in database.');
}

main()
  .catch((e) => {
    console.error('Error running update script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
