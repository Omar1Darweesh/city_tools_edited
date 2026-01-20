import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class SalesLineDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  qty: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lineDiscount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;
}

export class CreateSaleDto {
  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @IsInt()
  @IsOptional()
  customerId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesLineDto)
  lines: SalesLineDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalDiscount?: number;

  @IsInt()
  @IsOptional()
  stockLocationId?: number;

  @IsOptional()
  notes?: string;

  @IsOptional()
  channel?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  platformCommission?: number;

  @IsNumber() // ✅ NEW
  @Min(0) // ✅ NEW
  @IsOptional() // ✅ NEW
  shippingFee?: number; // ✅ NEW

  @IsNumber()
  @IsOptional()
  paidAmount?: number; // ✅ NEW: Amount paid now (if partial)

  @IsBoolean()
  @IsOptional()
  delivered?: boolean; // ✅ NEW: Deliver immediately (for credit sales)


}
