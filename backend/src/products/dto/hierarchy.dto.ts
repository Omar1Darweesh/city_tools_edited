import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

// ============================================
// CATEGORY DTOs
// ============================================
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  // ✅ ADD THESE TWO FIELDS:
  @IsNumber()
  @Min(0, { message: 'Retail margin cannot be negative' })
  @Max(500, { message: 'Retail margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultRetailMargin?: number;

  @IsNumber()
  @Min(0, { message: 'Wholesale margin cannot be negative' })
  @Max(500, { message: 'Wholesale margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultWholesaleMargin?: number;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  // ✅ ADD THESE TWO FIELDS:
  @IsNumber()
  @Min(0, { message: 'Retail margin cannot be negative' })
  @Max(500, { message: 'Retail margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultRetailMargin?: number;

  @IsNumber()
  @Min(0, { message: 'Wholesale margin cannot be negative' })
  @Max(500, { message: 'Wholesale margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultWholesaleMargin?: number;
}

// ============================================
// SUBCATEGORY DTOs
// ============================================
export class CreateSubcategoryDto {
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsNumber()
  @Min(0, { message: 'Retail margin cannot be negative' })
  @Max(500, { message: 'Retail margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultRetailMargin?: number;

  @IsNumber()
  @Min(0, { message: 'Wholesale margin cannot be negative' })
  @Max(500, { message: 'Wholesale margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultWholesaleMargin?: number;
}

export class UpdateSubcategoryDto {
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsNumber()
  @Min(0, { message: 'Retail margin cannot be negative' })
  @Max(500, { message: 'Retail margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultRetailMargin?: number;

  @IsNumber()
  @Min(0, { message: 'Wholesale margin cannot be negative' })
  @Max(500, { message: 'Wholesale margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultWholesaleMargin?: number;
}

// ============================================
// ITEM TYPE DTOs
// ============================================
export class CreateItemTypeDto {
  @IsNumber()
  @IsNotEmpty()
  subcategoryId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsNumber()
  @Min(0, { message: 'Retail margin cannot be negative' })
  @Max(500, { message: 'Retail margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultRetailMargin?: number;

  @IsNumber()
  @Min(0, { message: 'Wholesale margin cannot be negative' })
  @Max(500, { message: 'Wholesale margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultWholesaleMargin?: number;
}

export class UpdateItemTypeDto {
  @IsNumber()
  @IsOptional()
  subcategoryId?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsNumber()
  @Min(0, { message: 'Retail margin cannot be negative' })
  @Max(500, { message: 'Retail margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultRetailMargin?: number;

  @IsNumber()
  @Min(0, { message: 'Wholesale margin cannot be negative' })
  @Max(500, { message: 'Wholesale margin cannot exceed 500 (50000%)' })
  @IsOptional()
  defaultWholesaleMargin?: number;
}
