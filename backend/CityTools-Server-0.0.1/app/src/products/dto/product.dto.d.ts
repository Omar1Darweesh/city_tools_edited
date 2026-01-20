export declare class CreateProductDto {
    code?: string;
    barcode: string;
    nameEn: string;
    nameAr?: string;
    categoryId?: number;
    itemTypeId?: number;
    brand?: string;
    unit?: string;
    cost: number;
    priceRetail: number;
    priceWholesale: number;
    minQty?: number;
    maxQty?: number;
    initialStock?: number;
    active?: boolean;
}
export declare class UpdateProductDto {
    code?: string;
    barcode?: string;
    nameEn?: string;
    nameAr?: string;
    categoryId?: number;
    itemTypeId?: number;
    brand?: string;
    unit?: string;
    cost?: number;
    priceRetail?: number;
    priceWholesale?: number;
    minQty?: number;
    maxQty?: number;
    active?: boolean;
}
