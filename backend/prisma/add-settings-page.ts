import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('➕ Adding Settings page...\n');

    // Create settings page
    const settingsPage = await prisma.page.upsert({
        where: { key: 'settings' },
        update: {
            nameEn: 'Platform Settings',
            nameAr: 'إعدادات المنصات',
            category: 'admin',
            icon: 'Settings',
            route: '/settings/platforms',
            sortOrder: 13,
            active: true,
        },
        create: {
            key: 'settings',
            nameEn: 'Platform Settings',
            nameAr: 'إعدادات المنصات',
            category: 'admin',
            icon: 'Settings',
            route: '/settings/platforms',
            sortOrder: 13,
            active: true,
        },
    });

    console.log(`✅ Settings page created (ID: ${settingsPage.id})\n`);

    // Assign to ADMIN role
    const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' },
    });

    if (adminRole) {
        await prisma.rolePage.create({
            data: {
                roleId: adminRole.id,
                pageId: settingsPage.id,
            },
        });
        console.log('✅ Assigned Settings page to ADMIN role\n');
    }

    // Show all pages
    console.log('📋 All pages now:\n');
    const allPages = await prisma.page.findMany({
        orderBy: { sortOrder: 'asc' }
    });

    allPages.forEach(page => {
        console.log(`   ${page.sortOrder}. ${page.nameAr.padEnd(25)} → ${page.route}`);
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
