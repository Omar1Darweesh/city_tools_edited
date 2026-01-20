import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaService } from '../prisma.service';
import { CostAccountingService } from './cost-accounting.service';

@Module({
  controllers: [StockController],
  providers: [StockService, PrismaService, CostAccountingService],
  exports: [StockService, CostAccountingService],
})
export class StockModule {}
