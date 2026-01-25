import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { CreateGRNDto, CreateSupplierDto } from './dto/purchasing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('purchasing')
@UseGuards(JwtAuthGuard)
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) { }

  // Suppliers
  @Post('suppliers')
  createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
    return this.purchasingService.createSupplier(createSupplierDto);
  }

  @Get('suppliers')
  findAllSuppliers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
  ) {
    return this.purchasingService.findAllSuppliers({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      active: active !== undefined ? active === 'true' : undefined,
      search,
    });
  }

  @Get('suppliers/:id')
  findOneSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.purchasingService.findOneSupplier(id);
  }

  @Patch('suppliers/:id')
  updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.purchasingService.updateSupplier(id, data);
  }

  @Delete('suppliers/:id')
  removeSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.purchasingService.removeSupplier(id);
  }

  // GRN
  @Post('grn')
  createGRN(@Body() createGRNDto: CreateGRNDto, @Request() req: any) {
    return this.purchasingService.createGRN(createGRNDto, req.user.userId);
  }

  @Get('grn')
  findAllGRNs(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.purchasingService.findAllGRNs({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
    });
  }

  @Get('grn/:id')
  findOneGRN(@Param('id', ParseIntPipe) id: number) {
    return this.purchasingService.findOneGRN(id);
  }
}
