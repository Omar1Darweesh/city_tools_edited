import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToHierarchy() {
    console.log('🔄 Starting hierarchy migration...\n');

    const categories = await prisma.category.findMany({
        include: { products: true },
    });

    for (const category of categories) {
        console.log(`📁 Processing category: ${category.name}`);

        // Create default subcategory
        const subcategory = await prisma.subcategory.create({
            data: {
                categoryId: category.id,
                name: `${category.name} - General`,
                nameAr: category.nameAr ? `${category.nameAr} - عام` : null,
                active: true,
            },
        });

        console.log(`  ✅ Created subcategory: ${subcategory.name}`);

        // Create default item type
        const itemType = await prisma.itemType.create({
            data: {
                subcategoryId: subcategory.id,
                name: `${category.name} - Standard`,
                nameAr: category.nameAr ? `${category.nameAr} - قياسي` : null,
                active: true,
            },
        });

        console.log(`  ✅ Created item type: ${itemType.name}`);

        // Update products
        if (category.products.length > 0) {
            await prisma.product.updateMany({
                where: { categoryId: category.id },
                data: { itemTypeId: itemType.id },
            });
            console.log(`  ✅ Updated ${category.products.length} products\n`);
        }
    }

    // Handle products without category
    const uncategorizedProducts = await prisma.product.count({
        where: { categoryId: null },
    });

    if (uncategorizedProducts > 0) {
        const uncatCategory = await prisma.category.create({
            data: { name: 'Uncategorized', nameAr: 'غير مصنف' },
        });

        const uncatSub = await prisma.subcategory.create({
            data: {
                categoryId: uncatCategory.id,
                name: 'General',
                nameAr: 'عام',
            },
        });

        const uncatType = await prisma.itemType.create({
            data: {
                subcategoryId: uncatSub.id,
                name: 'Standard',
                nameAr: 'قياسي',
            },
        });

        await prisma.product.updateMany({
            where: { categoryId: null },
            data: {
                categoryId: uncatCategory.id,
                itemTypeId: uncatType.id,
            },
        });

        console.log(`✅ Processed ${uncategorizedProducts} uncategorized products\n`);
    }

    console.log('🎉 Migration completed successfully!');
}

migrateToHierarchy()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
