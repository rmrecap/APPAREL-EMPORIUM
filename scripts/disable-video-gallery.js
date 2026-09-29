const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const existing = await prisma.siteSetting.findUnique({
        where: { key: 'homepage_sections_visibility' }
    });

    let current = {};
    if (existing && existing.value) {
        try {
            current = JSON.parse(existing.value);
        } catch (e) {}
    }

    current.telegram_video_gallery = false;

    await prisma.siteSetting.upsert({
        where: { key: 'homepage_sections_visibility' },
        create: {
            key: 'homepage_sections_visibility',
            value: JSON.stringify(current),
            group: 'homepage'
        },
        update: {
            value: JSON.stringify(current)
        }
    });

    console.log('Updated homepage_sections_visibility:', JSON.stringify(current));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
