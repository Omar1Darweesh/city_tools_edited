import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Assigning all pages to ADMIN role...\n');

    // Find ADMIN role (uppercase)
    const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' },  // ✅ Changed to ADMIN (uppercase)
    });

    if (!adminRole) {
        console.error('❌ ADMIN role not found!');
        return;
    }

    console.log(`✅ Found ADMIN role (ID: ${adminRole.id})\n`);

    // Get all pages
    const allPages = await prisma.page.findMany({
        orderBy: { sortOrder: 'asc' }
    });

    console.log(`📄 Found ${allPages.length} pages\n`);

    // Clear existing page assignments for ADMIN
    const deleted = await prisma.rolePage.deleteMany({
        where: { roleId: adminRole.id },
    });

    console.log(`🗑️  Cleared ${deleted.count} existing page assignments\n`);

    // Assign all pages to ADMIN
    for (const page of allPages) {
        await prisma.rolePage.create({
            data: {
                roleId: adminRole.id,
                pageId: page.id,
            },
        });
        console.log(`   ✓ ${page.nameAr} (${page.key})`);
    }

    console.log(`\n✅ Successfully assigned ${allPages.length} pages to ADMIN role!`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
