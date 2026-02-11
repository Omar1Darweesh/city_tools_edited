import { PaymentMethod } from '@prisma/client';
export declare class SalesLineDto {
    productId: number;
    qty: number;
    unitPrice: number;
    lineDiscount?: number;
    taxRate?: number;
}
export declare class CreateSaleDto {
    branchId: number;
    customerId?: number;
    lines: SalesLineDto[];
    paymentMethod: PaymentMethod;
    totalDiscount?: number;
    stockLocationId?: number;
    notes?: string;
    channel?: string;
    platformCommission?: number;
}
