import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PriceManagementService } from './price-management.service';
import { PrismaService } from '../prisma.service';
import { ProductAuditService } from './product-audit.service';
import { ProfitMarginService } from './profit-margin.service';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    PriceManagementService,
    ProductAuditService,
    ProfitMarginService, // ✅ ADD THIS
    PrismaService,
  ],
  exports: [
    ProductsService,
    PriceManagementService,
    ProductAuditService,
    ProfitMarginService, // ✅ ADD THIS
  ],
})
export class ProductsModule {}
