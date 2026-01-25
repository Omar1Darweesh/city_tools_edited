export declare class AdjustmentItemDto {
    productId: number;
    qtyChange: number;
}
export declare class CreateAdjustmentDto {
    stockLocationId: number;
    notes?: string;
}
export declare class CreateBatchAdjustmentDto {
    stockLocationId: number;
    adjustments: AdjustmentItemDto[];
    notes?: string;
}
export declare class TransferItemDto {
    productId: number;
    qty: number;
}
export declare class CreateTransferDto {
    fromStockLocationId: number;
    toStockLocationId: number;
    items: TransferItemDto[];
    notes?: string;
}
