import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
  CreateItemTypeDto,
  UpdateItemTypeDto,
} from './dto/hierarchy.dto';
import { BulkPriceUpdateDto, CategoryPriceUpdateDto } from './dto/price-management.dto';
import { PriceManagementService } from './price-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HierarchyPriceUpdateDto } from './dto/price-management.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly priceManagementService: PriceManagementService,
  ) { }

  // ============================================
  // CATEGORY ENDPOINTS
  // ============================================

  @Get('categories')
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('categories/:id')
  findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findCategoryById(id);
  }

  @Post('categories')
  createCategory(@Body() data: CreateCategoryDto) {
    return this.productsService.createCategory(data);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.productsService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeCategory(id);
  }

  // ============================================
  // SUBCATEGORY ENDPOINTS
  // ============================================

  @Get('subcategories')
  findAllSubcategories(@Query('categoryId') categoryId?: string) {
    return this.productsService.findAllSubcategories(
      categoryId ? Number(categoryId) : undefined,
    );
  }

  @Get('subcategories/:id')
  findSubcategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findSubcategoryById(id);
  }

  @Post('subcategories')
  createSubcategory(@Body() data: CreateSubcategoryDto) {
    return this.productsService.createSubcategory(data);
  }

  @Patch('subcategories/:id')
  updateSubcategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateSubcategoryDto,
  ) {
    return this.productsService.updateSubcategory(id, data);
  }

  @Delete('subcategories/:id')
  removeSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeSubcategory(id);
  }

  // ============================================
  // ITEM TYPE ENDPOINTS
  // ============================================

  @Get('item-types')
  findAllItemTypes(@Query('subcategoryId') subcategoryId?: string) {
    return this.productsService.findAllItemTypes(
      subcategoryId ? Number(subcategoryId) : undefined,
    );
  }

  @Get('item-types/:id')
  findItemTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findItemTypeById(id);
  }

  @Post('item-types')
  createItemType(@Body() data: CreateItemTypeDto) {
    return this.productsService.createItemType(data);
  }

  @Patch('item-types/:id')
  updateItemType(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateItemTypeDto,
  ) {
    return this.productsService.updateItemType(id, data);
  }

  @Delete('item-types/:id')
  removeItemType(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeItemType(id);
  }

  // ============================================
  // PRODUCT ENDPOINTS
  // ============================================

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('itemTypeId') itemTypeId?: string,
    @Query('active') active?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.productsService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      search,
      categoryId: categoryId ? Number(categoryId) : undefined,
      subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
      itemTypeId: itemTypeId ? Number(itemTypeId) : undefined,
      active: active !== undefined ? active === 'true' : undefined,
      branchId: branchId ? Number(branchId) : undefined,
    });
  }

  @Get('by-barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get('find/:identifier')
  findByIdentifier(
    @Param('identifier') identifier: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.productsService.findByIdentifier(
      identifier,
      branchId ? Number(branchId) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('branchId') branchId?: string,
  ) {
    return this.productsService.findOne(
      id,
      branchId ? Number(branchId) : undefined,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // ============================================
  // PRICE MANAGEMENT ENDPOINTS
  // ============================================
  @Put('prices/hierarchy')
  updatePricesByHierarchy(@Body() dto: HierarchyPriceUpdateDto, @Request() req: any) {
    return this.priceManagementService.updatePricesByHierarchy({
      ...dto,
      userId: req.user?.id || 1,
    });
  }

  @Post('prices/bulk-update')
  bulkUpdatePrices(@Body() dto: BulkPriceUpdateDto, @Request() req: any) {
    return this.priceManagementService.bulkUpdatePrices({
      ...dto,
      userId: req.user?.id || 1,
    });
  }

  @Put('prices/category')
  updatePricesByCategory(@Body() dto: CategoryPriceUpdateDto, @Request() req: any) {
    return this.priceManagementService.updatePricesByCategory({
      ...dto,
      userId: req.user?.id || 1,
    });
  }

  @Get(':id/price-history')
  getPriceHistory(@Param('id', ParseIntPipe) id: number) {
    return this.priceManagementService.getPriceHistory(id);
  }

  // ============================================
  // TRANSACTION HISTORY ENDPOINTS
  // ============================================

  @Get(':id/transactions')
  async getProductTransactions(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.productsService.getProductTransactions(id, {
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id/transactions/summary')
  async getTransactionSummary(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getTransactionSummary(id);
  }

  @Get(':id/audit-history')
  async getAuditHistory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getAuditHistory(id);
  }
}
