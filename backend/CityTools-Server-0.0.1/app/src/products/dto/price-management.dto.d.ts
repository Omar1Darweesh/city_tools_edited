export declare class PriceUpdateDto {
    productId: number;
    priceRetail?: number;
    priceWholesale?: number;
}
export declare class BulkPriceUpdateDto {
    updates: PriceUpdateDto[];
    reason?: string;
}
export declare class CategoryPriceUpdateDto {
    categoryId: number;
    adjustment: number;
    adjustmentType: 'PERCENTAGE' | 'FIXED';
    priceType: 'RETAIL' | 'WHOLESALE';
    reason?: string;
}
