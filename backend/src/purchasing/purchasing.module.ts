import { Module } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { PurchasingController } from './purchasing.controller';
import { PrismaService } from '../prisma.service';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [StockModule],
  controllers: [PurchasingController],
  providers: [PurchasingService, PrismaService],
})
export class PurchasingModule {}
