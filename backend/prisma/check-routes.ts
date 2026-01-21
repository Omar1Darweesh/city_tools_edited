import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking page routes in database...\n');

    const allPages = await prisma.page.findMany({
        orderBy: { sortOrder: 'asc' }
    });

    console.log('📋 Current routes:\n');
    console.log('Key'.padEnd(25) + 'Route'.padEnd(30) + 'Name');
    console.log('-'.repeat(70));

    allPages.forEach(page => {
        console.log(
            page.key.padEnd(25) +
            page.route?.padEnd(30) +
            page.nameAr
        );
    });

    console.log('\n📝 Note: These routes must match your App.tsx routes!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
