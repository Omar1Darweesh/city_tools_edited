import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('🔍 Checking database...\n');

    const roles = await prisma.role.findMany();
    const pages = await prisma.page.findMany();

    console.log(`📋 Roles: ${roles.length}`);
    roles.forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));

    console.log(`\n📄 Pages: ${pages.length}`);
    pages.forEach(p => console.log(`   - ${p.nameAr} (${p.key})`));

    await prisma.$disconnect();
}

check();
