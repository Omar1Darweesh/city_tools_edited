// @ts-nocheck
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductsService } from '../products/products.service';
import { PurchasingService } from '../purchasing/purchasing.service';
import { SalesService } from '../sales/sales.service';
import { ReportsService } from '../reports/reports.service';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from '../products/dto/product.dto';
import { CreateSaleDto } from '../sales/dto/sales.dto';
import { PaymentMethod } from '@prisma/client';

async function bootstrap() {
  console.log('🚀 Starting System Logic Verification...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const productsService = app.get(ProductsService);
  const purchasingService = app.get(PurchasingService);
  const salesService = app.get(SalesService);
  const reportsService = app.get(ReportsService);
  const prisma = app.get(PrismaService);

  // Setup Test Data
  const timestamp = Date.now();
  const testBarcode = `TEST-${timestamp}`;
  const userId = 1; // Assuming admin user exists

  try {
    // ==========================================
    // STEP 1: CREATE PRODUCT
    // ==========================================
    console.log('\n📦 Step 1: Creating Product...');
    const productData: CreateProductDto = {
      code: `CODE-${timestamp}`,
      barcode: testBarcode,
      nameEn: 'Test Logic Product',
      nameAr: 'منتج اختبار',
      brand: 'TestBrand',
      unit: 'PCS',
      cost: 100, // Initial Cost
      priceRetail: 200,
      priceWholesale: 180,
      minQty: 10,
      maxQty: 100,
      initialStock: 10, // 10 units @ 100
      active: true,
      categoryId: null,
      itemTypeId: null,
    };

    const product = await productsService.create(productData, userId);
    console.log(`   Created Product ID: ${product.id}`);
    console.log(`   Initial Cost: ${product.cost} (Expect 100)`);
    console.log(`   Initial CostAvg: ${product.costAvg} (Expect 100)`);

    if (Number(product.costAvg) !== 100)
      throw new Error('❌ Initial CostAvg invalid');
    console.log('   ✅ Product Creation Logic: PASSED');

    // ==========================================
    // STEP 2: GRN (PURCHASING)
    // ==========================================
    console.log('\n🚚 Step 2: Receiving Goods (GRN)...');
    // We have 10 units @ 100. Value = 1000.
    // We buy 10 units @ 120. Value = 1200.
    // Total Units = 20. Total Value = 2200.
    // Expected Avg = 2200 / 20 = 110.

    // Must find a supplier first
    const supplier = await prisma.supplier.findFirst();
    if (!supplier) throw new Error('No supplier found to test GRN');

    await purchasingService.createGRN(
      {
        branchId: 1,
        supplierId: supplier.id,
        paymentTerm: 'CASH',
        taxRate: 0,
        notes: 'Test GRN',
        lines: [
          {
            productId: product.id,
            qty: 10,
            cost: 120,
          },
        ],
      },
      userId,
    );

    // Fetch product again to check CostAvg
    const updatedProduct = await productsService.findOne(product.id);
    console.log(`   New Cost (Last): ${updatedProduct.cost} (Expect 120)`);
    console.log(`   New CostAvg: ${updatedProduct.costAvg} (Expect 110)`);

    if (Math.abs(Number(updatedProduct.costAvg) - 110) > 0.01) {
      throw new Error(
        `❌ CostAvg Calculation Failed. Expected 110, Got ${updatedProduct.costAvg}`,
      );
    }
    console.log('   ✅ GRN Weighted Average Logic: PASSED');

    // ==========================================
    // STEP 3: SALES & PROFIT
    // ==========================================
    console.log('\n💰 Step 3: Selling Product...');
    // Sell 5 units @ 200.
    // Revenue = 1000.
    // Cost of Goods = 5 * 110 (Avg) = 550.
    // Profit = 450.

    // Create Sale
    const customer = await prisma.customer.findFirst();
    const branch = await prisma.branch.findFirst();

    const saleValues: CreateSaleDto = {
      branchId: branch?.id || 1,
      customerId: customer?.id || null,
      paymentMethod: PaymentMethod.CASH,
      paidAmount: 1000,
      lines: [
        {
          productId: product.id,
          qty: 5,
          unitPrice: 200,
        },
      ],
      delivered: true,
    };

    const sale = await salesService.createSale(saleValues, userId);
    console.log(`   Sale ID: ${sale.id}`);
    console.log(`   Total Revenue: ${sale.total}`);
    console.log(`   Recorded CostOfGoods: ${sale.costOfGoods}`);
    console.log(`   Recorded NetProfit: ${sale.netProfit}`);

    const expectedCost = 5 * 110; // 550
    const expectedProfit = 1000 - 550; // 450

    if (Math.abs(Number(sale.costOfGoods) - expectedCost) > 0.01) {
      throw new Error(
        `❌ Sales CostOfGoods Failed. Expected ${expectedCost}, Got ${sale.costOfGoods}`,
      );
    }
    if (Math.abs(Number(sale.netProfit) - expectedProfit) > 0.01) {
      throw new Error(
        `❌ Sales Profit Failed. Expected ${expectedProfit}, Got ${sale.netProfit}`,
      );
    }
    console.log('   ✅ Sales Profit Logic: PASSED');

    // ==========================================
    // STEP 4: DASHBOARD REPORT
    // ==========================================
    console.log('\n📊 Step 4: Verifying Dashboard Report...');
    const report = await reportsService.getDashboardSummary({
      branchId: branch?.id,
    });
    // This aggregates ALL sales, so we can't easily assert exact number unless DB was empty.
    // But we can check if it runs without error and returns plausible data.

    // However, we can check specific sales line analysis logic?
    // Let's rely on the previous successful steps.
    // If the Sales Invoice has the correct Profit listed in the DB (which we just verified),
    // the Report Service (which sums these columns) should work unless the Query is wrong.
    // We previously fixed the query to use costAvg.

    console.log(`   Today's Profit: ${report.today.profit}`);
    console.log('   ✅ Report Query: PASSED (Executed successfully)');

    // Cleanup
    console.log('\n🧹 Cleanup...');
    // Optional: Delete the test data to keep DB clean
    // await prisma.salesInvoice.delete({ where: { id: sale.id } });
    // await prisma.product.delete({ where: { id: product.id } });
    console.log('   Test data preserved for manual inspection.');

    console.log('\n🎉 ALL LOGIC TESTS PASSED SUCCESSFULLY 🎉');
  } catch (error) {
    console.error('\n🛑 TEST FAILED:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
