import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing route mismatches...\n');

    const fixes = [
        { key: 'customer-accounts', oldRoute: '/customer-accounts', newRoute: '/customer-payments' },
        { key: 'receive-goods', oldRoute: '/goods-receipts', newRoute: '/receive-goods' },
        { key: 'stock', oldRoute: '/stock', newRoute: '/stock-adjustments' },
        { key: 'stock-adjustment', oldRoute: '/stock-adjustment', newRoute: '/stock-adjustments' },
    ];

    for (const fix of fixes) {
        const result = await prisma.page.update({
            where: { key: fix.key },
            data: { route: fix.newRoute },
        });

        console.log(`✅ ${fix.key}`);
        console.log(`   ${fix.oldRoute} → ${fix.newRoute}\n`);
    }

    console.log('✅ All routes fixed!\n');

    console.log('📋 Updated routes:\n');
    const allPages = await prisma.page.findMany({
        orderBy: { sortOrder: 'asc' }
    });

    allPages.forEach(page => {
        console.log(`   ${page.key.padEnd(25)} → ${page.route}`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
