import {
    IsInt,
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsNotEmpty,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustmentItemDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsInt()
    @IsNotEmpty()
    qtyChange: number; // Can be positive or negative
}

export class CreateAdjustmentDto {
    @IsInt()
    @IsNotEmpty()
    stockLocationId: number;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateBatchAdjustmentDto {
    @IsInt()
    @IsNotEmpty()
    stockLocationId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AdjustmentItemDto)
    adjustments: AdjustmentItemDto[];

    @IsString()
    @IsOptional()
    notes?: string;
}

export class TransferItemDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsInt()
    @Min(1)
    qty: number;
}

export class CreateTransferDto {
    @IsInt()
    @IsNotEmpty()
    fromStockLocationId: number;

    @IsInt()
    @IsNotEmpty()
    toStockLocationId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TransferItemDto)
    items: TransferItemDto[];

    @IsString()
    @IsOptional()
    notes?: string;
}
