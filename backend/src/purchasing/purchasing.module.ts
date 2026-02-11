import { Module } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { PurchasingController } from './purchasing.controller';
import { PrismaService } from '../prisma.service';
import { StockModule } from '../stock/stock.module';
import { CostAccountingService } from '../stock/cost-accounting.service';
import { ProfitMarginService } from '../products/profit-margin.service'; // ✅ ADD THIS
import { ProductAuditService } from '../products/product-audit.service'; // ✅ ADD THIS

@Module({
  imports: [StockModule],
  controllers: [PurchasingController],
  providers: [
    PurchasingService,
    PrismaService,
    CostAccountingService,
    ProfitMarginService, // ✅ ADD THIS
    ProductAuditService, // ✅ ADD THIS (needed by ProfitMarginService)
  ],
})
export class PurchasingModule {}
