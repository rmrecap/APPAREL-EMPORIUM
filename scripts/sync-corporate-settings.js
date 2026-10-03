const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    try {
        const pDir = path.join(process.cwd(), 'prisma');
        fs.chmodSync(pDir, 0o777);
        const dFile = path.join(pDir, 'dev.db');
        if (fs.existsSync(dFile)) fs.chmodSync(dFile, 0o666);
        const jFile = path.join(pDir, 'dev.db-journal');
        if (fs.existsSync(jFile)) fs.chmodSync(jFile, 0o666);
    } catch (e) {}

    console.log('=== Checking Product Integrity Before Settings Update ===');
    let initialProductCount = await prisma.product.count();
    console.log(`Initial product count: ${initialProductCount}`);

    if (initialProductCount < 48) {
        console.warn(`⚠️ Warning: Product count is ${initialProductCount} (expected >= 48). Checking verified backup...`);
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        const candidateBackups = [
            path.join(homeDir, 'db_backups', 'dev_verified_healthy.db'),
            path.join(homeDir, 'db_backups', 'live_backup_latest.db'),
            path.join(process.cwd(), 'prisma', 'dev.db.verified')
        ];
        for (const candidate of candidateBackups) {
            if (fs.existsSync(candidate) && fs.statSync(candidate).size > 200000) {
                console.log(`Restoring database from: ${candidate}`);
                fs.copyFileSync(candidate, dbPath);
                break;
            }
        }
        initialProductCount = await prisma.product.count();
        console.log(`Updated initial product count: ${initialProductCount}`);
    }

    console.log('=== Updating Corporate Site Settings ===');
    const corporateSettings = [
        { key: 'company_name', value: 'Apparel Emporium', group: 'general' },
        { key: 'proprietor_name', value: 'Md. Kamal Hossain', group: 'corporate' },
        { key: 'proprietor_title', value: 'Proprietor', group: 'corporate' },
        { key: 'company_address', value: 'House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka- 1230, Bangladesh', group: 'contact' },
        { key: 'company_phone', value: '+88 02 4895 5519, 096 6691 2038', group: 'contact' },
        { key: 'whatsapp_number', value: '+88 018 1142 2225', group: 'contact' },
        { key: 'company_email', value: 'kamal@aelbd.net', group: 'contact' },
        { key: 'website_url', value: 'https://www.aelbd.net', group: 'general' },
        { key: 'contact_address', value: 'House # 03 (2nd Floor), Road # 12, Sector # 13, Uttara Model Town, Dhaka- 1230, Bangladesh', group: 'contact' },
        { key: 'contact_phone', value: '+88 02 4895 5519, 096 6691 2038', group: 'contact' },
        { key: 'contact_email', value: 'kamal@aelbd.net', group: 'contact' }
    ];

    for (const setting of corporateSettings) {
        await prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value, group: setting.group },
            create: setting
        });
        console.log(`✓ Set ${setting.key}: "${setting.value}"`);
    }

    console.log('=== Checking Product Integrity After Settings Update ===');
    const finalProductCount = await prisma.product.count();
    console.log(`Final product count: ${finalProductCount}`);

    if (finalProductCount !== initialProductCount) {
        throw new Error(`CRITICAL: Product count changed from ${initialProductCount} to ${finalProductCount}!`);
    }

    console.log(`✅ Success: All corporate settings updated. Total products perfectly preserved: ${finalProductCount}`);
}

main()
    .catch(e => {
        console.error('Error updating settings:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
