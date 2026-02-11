import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReturnDto } from './dto/returns.dto';

@Controller('pos/returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  // ✅ Public endpoint - no guard
  @Get('check-defective/:productId')
  async checkDefectiveProduct(@Param('productId') productId: string) {
    return this.returnsService.checkDefectiveProduct(+productId);
  }

  @Get('is-defective/:productId')
  async isDefectiveProduct(@Param('productId') productId: string) {
    const isDefective =
      await this.returnsService.isDefectiveProduct(+productId);
    return { isDefective };
  }

  // ✅ Protected endpoints below
  @Post()
  @UseGuards(JwtAuthGuard)
  createReturn(@Body() createReturnDto: CreateReturnDto, @Request() req: any) {
    return this.returnsService.createReturn({
      ...createReturnDto,
      userId: req.user.userId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('branchId') branchId?: string,
    @Query('salesInvoiceId') salesInvoiceId?: string,
  ) {
    return this.returnsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
      salesInvoiceId: salesInvoiceId ? parseInt(salesInvoiceId) : undefined,
    });
  }
}
