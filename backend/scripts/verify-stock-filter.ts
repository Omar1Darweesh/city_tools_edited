import { PrismaClient, MovementType } from '@prisma/client';
import { ProductsService } from '../src/products/products.service';
import { ProductAuditService } from '../src/products/product-audit.service';

const prisma = new PrismaClient();
const auditService = new ProductAuditService(prisma as any);
const productsService = new ProductsService(prisma as any, auditService);

async function verifyStockFiltering() {
    console.log('🔄 Verifying Stock Filtering Logic...');

    try {
        // 1. Setup Data - Create Products with different stock levels
        const prefix = `FILTER_TEST_${Date.now()}`;

        // Product A: Empty (0 stock)
        const prodEmpty = await prisma.product.create({
            data: {
                code: `${prefix}_EMPTY`,
                barcode: `${prefix}_EMPTY`,
                nameEn: 'Test Empty',
                nameAr: 'Test Empty',
                minQty: 10,
                maxQty: 100,
                cost: 10,
                priceRetail: 20,
                priceWholesale: 15,
            }
        });

        // Product B: Low (5 stock, min 10)
        const prodLow = await prisma.product.create({
            data: {
                code: `${prefix}_LOW`,
                barcode: `${prefix}_LOW`,
                nameEn: 'Test Low',
                nameAr: 'Test Low',
                minQty: 10,
                maxQty: 100,
                cost: 10,
                priceRetail: 20,
                priceWholesale: 15,
            }
        });

        // Product C: Enough (50 stock, min 10, max 100)
        const prodEnough = await prisma.product.create({
            data: {
                code: `${prefix}_ENOUGH`,
                barcode: `${prefix}_ENOUGH`,
                nameEn: 'Test Enough',
                nameAr: 'Test Enough',
                minQty: 10,
                maxQty: 100,
                cost: 10,
                priceRetail: 20,
                priceWholesale: 15,
            }
        });

        // Product D: High (150 stock, max 100)
        const prodHigh = await prisma.product.create({
            data: {
                code: `${prefix}_HIGH`,
                barcode: `${prefix}_HIGH`,
                nameEn: 'Test High',
                nameAr: 'Test High',
                minQty: 10,
                maxQty: 100,
                cost: 10,
                priceRetail: 20,
                priceWholesale: 15,
            }
        });

        // Get a stock location
        const location = await prisma.stockLocation.findFirst();
        if (!location) throw new Error('No stock location found');

        // Add stock movements
        await prisma.stockMovement.createMany({
            data: [
                { productId: prodLow.id, stockLocationId: location.id, qtyChange: 5, movementType: MovementType.ADJUSTMENT, createdBy: 1 },
                { productId: prodEnough.id, stockLocationId: location.id, qtyChange: 50, movementType: MovementType.ADJUSTMENT, createdBy: 1 },
                { productId: prodHigh.id, stockLocationId: location.id, qtyChange: 150, movementType: MovementType.ADJUSTMENT, createdBy: 1 },
            ]
        });

        console.log('✅ Test Data Created');

        // 2. Test Filters

        // Test 'empty'
        console.log('🔍 Testing "empty" filter...');
        const emptyResult = await productsService.findAll({ search: prefix, stockStatus: 'empty' });
        const emptyIds = emptyResult.data.map(p => p.id);
        if (emptyIds.includes(prodEmpty.id)) console.log('  ✅ Found Empty product');
        else console.error('  ❌ Failed to find Empty product');
        if (emptyIds.includes(prodLow.id)) console.error('  ❌ Incorrectly found Low product');

        // Test 'low'
        console.log('🔍 Testing "low" filter...');
        const lowResult = await productsService.findAll({ search: prefix, stockStatus: 'low' });
        const lowIds = lowResult.data.map(p => p.id);
        if (lowIds.includes(prodLow.id)) console.log('  ✅ Found Low product');
        else console.error('  ❌ Failed to find Low product');

        // Test 'enough'
        console.log('🔍 Testing "enough" filter...');
        const enoughResult = await productsService.findAll({ search: prefix, stockStatus: 'enough' });
        const enoughIds = enoughResult.data.map(p => p.id);
        if (enoughIds.includes(prodEnough.id)) console.log('  ✅ Found Enough product');
        else console.error('  ❌ Failed to find Enough product');

        // Test 'high'
        console.log('🔍 Testing "high" filter...');
        const highResult = await productsService.findAll({ search: prefix, stockStatus: 'high' });
        const highIds = highResult.data.map(p => p.id);
        if (highIds.includes(prodHigh.id)) console.log('  ✅ Found High product');
        else console.error('  ❌ Failed to find High product');

        // Cleanup
        console.log('🧹 Cleaning up...');
        await prisma.stockMovement.deleteMany({ where: { productId: { in: [prodEmpty.id, prodLow.id, prodEnough.id, prodHigh.id] } } });
        await prisma.product.deleteMany({ where: { id: { in: [prodEmpty.id, prodLow.id, prodEnough.id, prodHigh.id] } } });

        console.log('✨ Verification Complete');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyStockFiltering();
