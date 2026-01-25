import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateBatchAdjustmentDto,
  CreateTransferDto,
} from './dto/stock.dto';
import { IsInt, IsString, IsOptional, IsNumber } from 'class-validator';

class CreateAdjustmentDto {
  @IsInt()
  productId: number;

  @IsInt()
  stockLocationId: number;

  @IsNumber()
  qtyChange: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Get('on-hand')
  getStockOnHand(
    @Query('productId') productId?: string,
    @Query('stockLocationId') stockLocationId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.stockService.getStockOnHand({
      productId: productId ? parseInt(productId) : undefined,
      stockLocationId: stockLocationId ? parseInt(stockLocationId) : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
    });
  }

  @Post('adjustments')
  createAdjustment(
    @Body() createAdjustmentDto: CreateAdjustmentDto,
    @Request() req: any,
  ) {
    return this.stockService.createAdjustment({
      ...createAdjustmentDto,
      userId: req.user.userId,
    });
  }

  @Post('adjustments/batch')
  createBatchAdjustment(
    @Body() dto: CreateBatchAdjustmentDto,
    @Request() req: any,
  ) {
    return this.stockService.createBatchAdjustment({
      ...dto,
      userId: req.user.userId,
    });
  }

  @Post('transfers')
  createTransfer(@Body() dto: CreateTransferDto, @Request() req: any) {
    return this.stockService.createTransfer({
      ...dto,
      userId: req.user.userId,
    });
  }

  @Get('locations')
  getLocations(@Query('branchId') branchId?: string) {
    return this.stockService.getLocations(
      branchId ? parseInt(branchId) : undefined,
    );
  }

  @Get('movements')
  getMovementHistory(
    @Query('productId') productId?: string,
    @Query('stockLocationId') stockLocationId?: string,
    @Query('movementType') movementType?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.stockService.getMovementHistory({
      productId: productId ? parseInt(productId) : undefined,
      stockLocationId: stockLocationId ? parseInt(stockLocationId) : undefined,
      movementType: movementType as any,
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }
}
