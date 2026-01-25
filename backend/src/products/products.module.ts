import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PriceManagementService } from './price-management.service';
import { PrismaService } from '../prisma.service';
import { ProductAuditService } from './product-audit.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PriceManagementService, PrismaService, ProductAuditService],
  exports: [ProductsService, PriceManagementService, ProductAuditService],
})
export class ProductsModule { }
