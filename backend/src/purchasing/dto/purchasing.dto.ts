import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GRNLineDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  qty: number;

  @IsNumber()
  @Min(0)
  cost: number;
}

import { PaymentTerm } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateGRNDto {
  @IsInt()
  @IsNotEmpty()
  supplierId: number;

  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @IsInt()
  @IsOptional()
  relatedPoId?: number;

  @IsInt()
  @IsOptional()
  stockLocationId?: number;

  @IsEnum(PaymentTerm)
  @IsOptional()
  paymentTerm?: PaymentTerm;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GRNLineDto)
  lines: GRNLineDto[];

  @IsOptional()
  notes?: string;
}

export class CreateSupplierDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  contact?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  paymentTerms?: string;
}
