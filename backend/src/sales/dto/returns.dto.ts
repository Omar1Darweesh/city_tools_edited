import {
  IsInt,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReturnType {
  STOCK = 'STOCK',
  DEFECTIVE = 'DEFECTIVE',
}

export class DefectedProductPricingDto {
  @IsNumber()
  @IsPositive()
  priceRetail: number;

  @IsNumber()
  @IsPositive()
  priceWholesale: number;
}

export class ReturnItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  qtyReturned: number;

  @IsNumber()
  refundAmount: number;

  @IsEnum(ReturnType)
  @IsOptional()
  returnType?: ReturnType;

  @IsOptional()
  @ValidateNested()
  @Type(() => DefectedProductPricingDto)
  defectedProductPricing?: DefectedProductPricingDto;
}

export class CreateReturnDto {
  @IsInt()
  salesInvoiceId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsString()
  @IsOptional()
  reason?: string;
}
