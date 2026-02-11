import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreatePlatformDto {
  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty({ message: 'Platform name is required' })
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @Min(0, { message: 'Tax rate cannot be negative' })
  @Max(100, { message: 'Tax rate cannot exceed 100%' })
  taxRate: number;

  @IsNumber()
  @Min(0, { message: 'Commission cannot be negative' })
  @Max(100, { message: 'Commission cannot exceed 100%' })
  commission: number;

  @IsNumber()
  @Min(0, { message: 'Shipping fee cannot be negative' })
  @IsOptional()
  shippingFee?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdatePlatformDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @Min(0, { message: 'Tax rate cannot be negative' })
  @Max(100, { message: 'Tax rate cannot exceed 100%' })
  taxRate: number;

  @IsNumber()
  @Min(0, { message: 'Commission cannot be negative' })
  @Max(100, { message: 'Commission cannot exceed 100%' })
  commission: number;

  @IsNumber()
  @Min(0, { message: 'Shipping fee cannot be negative' })
  shippingFee: number;

  @IsBoolean()
  active: boolean;
}
