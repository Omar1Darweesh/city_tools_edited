export declare class ReturnItemDto {
    productId: number;
    qtyReturned: number;
    refundAmount: number;
}
export declare class CreateReturnDto {
    salesInvoiceId: number;
    items: ReturnItemDto[];
    reason?: string;
}
