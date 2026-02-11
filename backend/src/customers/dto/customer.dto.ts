import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CustomerType } from '@prisma/client';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @ValidateIf((o) => o.phone && o.phone.length > 0)
  @IsString()
  @MinLength(10, { message: 'Phone must be at least 10 characters' })
  @MaxLength(50)
  phone?: string;

  @IsEnum(CustomerType, {
    message: 'Type must be either RETAIL or WHOLESALE',
  })
  type: CustomerType;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean; // ✅ ADD THIS LINE
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @ValidateIf((o) => o.phone && o.phone.length > 0)
  @IsString()
  @MinLength(10, { message: 'Phone must be at least 10 characters' })
  @MaxLength(50)
  phone?: string;

  @IsEnum(CustomerType, {
    message: 'Type must be either RETAIL or WHOLESALE',
  })
  @IsOptional()
  type?: CustomerType;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
