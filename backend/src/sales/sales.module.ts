import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { PrismaService } from '../prisma.service';
import { ProductAuditService } from '../products/product-audit.service'; // ✅ Add this import

@Module({
  controllers: [SalesController, ReturnsController],
  providers: [
    SalesService,
    ReturnsService,
    PrismaService,
    ProductAuditService, // ✅ Add this provider
  ],
  exports: [SalesService, ReturnsService],
})
export class SalesModule { }
