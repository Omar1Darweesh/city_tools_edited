import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  // OLD - Deprecated but kept for backward compatibility
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  // NEW - 3-level hierarchy
  @IsNumber()
  @IsOptional()
  itemTypeId?: number; // This links to the ItemType which links to Subcategory which links to Category

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @Min(0)
  priceRetail: number;

  @IsNumber()
  @Min(0)
  priceWholesale: number;

  @IsNumber()
  @Min(0, { message: 'Minimum quantity cannot be negative' })
  @IsOptional()
  minQty?: number;

  @IsNumber()
  @Min(0, { message: 'Maximum quantity cannot be negative' })
  @IsOptional()
  maxQty?: number;

  @IsNumber()
  @Min(0, { message: 'Initial stock cannot be negative' })
  @IsOptional()
  initialStock?: number; // ✅ ADD THIS

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  itemTypeId?: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costAvg?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceRetail?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceWholesale?: number;

  @IsNumber()
  @Min(0, { message: 'Minimum quantity cannot be negative' })
  @IsOptional()
  minQty?: number;

  @IsNumber()
  @Min(0, { message: 'Maximum quantity cannot be negative' })
  @IsOptional()
  maxQty?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
