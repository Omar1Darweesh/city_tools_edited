
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SalesService } from '../src/sales/sales.service';
import { PrismaService } from '../src/prisma.service';
import { CreateSaleDto } from '../src/sales/dto/sales.dto';
import { PaymentMethod } from '@prisma/client';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const salesService = app.get(SalesService);
    const prisma = app.get(PrismaService);

    console.log('🔄 Verifying Create Sale Logic...');

    try {
        // 1. Get a valid branch and customer or create dummy ones if needed context allowed.
        let branch = await prisma.branch.findFirst();
        if (!branch) {
            console.log('⚠️ No branch found, creating dummy branch...');
            branch = await prisma.branch.create({
                data: { name: 'Test Branch', code: 'TEST001', address: 'Test Address' }
            });
        }

        let customer = await prisma.customer.findFirst();
        if (!customer) {
            console.log('⚠️ No customer found, creating dummy customer...');
            customer = await prisma.customer.create({
                data: { name: 'Test Customer', phone: '0000000000', type: 'RETAIL' }
            });
        }

        // 2. Get some active products
        const products = await prisma.product.findMany({
            where: { active: true },
            take: 3
        });

        if (products.length === 0) throw new Error('No active products found');

        console.log(`📦 Found ${products.length} products to potentially sell.`);

        // 3. Construct Sale DTO
        const saleDto: CreateSaleDto = {
            branchId: branch.id,
            customerId: customer.id,
            lines: products.map(p => ({
                productId: p.id,
                qty: 1,
                unitPrice: Number(p.priceRetail),
            })),
            paymentMethod: PaymentMethod.CASH,
            paidAmount: 0 // Credit sale
        };

        const startTime = process.hrtime();

        // 4. Create Sale
        const sale = await salesService.createSale(saleDto, 1); // Assuming user ID 1 exists or handled

        const diff = process.hrtime(startTime);
        const ms = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

        console.log(`✅ Sale Created Successfully! ID: ${sale.id}`);
        console.log(`⏱️ Execution Time: ${ms}ms`);

        // Verify lines
        if (sale.lines.length !== products.length) {
            console.error('❌ Line count mismatch!');
        } else {
            console.log('✅ Line count matches.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
