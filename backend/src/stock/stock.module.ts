import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaService } from '../prisma.service';
import { CostAccountingService } from './cost-accounting.service';
import { ProductsModule } from '../products/products.module'; // ✅ ADD THIS

@Module({
  imports: [ProductsModule], // ✅ ADD THIS LINE
  controllers: [StockController],
  providers: [StockService, PrismaService, CostAccountingService],
  exports: [StockService, CostAccountingService],
})
export class StockModule {}
