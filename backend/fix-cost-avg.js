
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting costAvg backfill...');

    // Find products where costAvg is 0 but cost is > 0
    const products = await prisma.product.findMany({
        where: {
            costAvg: 0,
            cost: { gt: 0 },
        },
    });

    console.log(`Found ${products.length} products to update.`);

    let updatedCount = 0;
    for (const product of products) {
        try {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    costAvg: product.cost,
                },
            });
            updatedCount++;
            if (updatedCount % 50 === 0) {
                console.log(`Updated ${updatedCount} products...`);
            }
        } catch (error) {
            console.error(`❌ Failed to update product ${product.id}:`, error.message);
        }
    }

    console.log(`✅ Completed! Updated ${updatedCount} products.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
