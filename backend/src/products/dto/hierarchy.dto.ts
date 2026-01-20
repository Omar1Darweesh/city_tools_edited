import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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
}
