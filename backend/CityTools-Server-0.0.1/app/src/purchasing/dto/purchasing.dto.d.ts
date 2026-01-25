export declare class GRNLineDto {
    productId: number;
    qty: number;
    cost: number;
}
import { PaymentTerm } from '@prisma/client';
export declare class CreateGRNDto {
    supplierId: number;
    branchId: number;
    relatedPoId?: number;
    stockLocationId?: number;
    paymentTerm?: PaymentTerm;
    taxRate?: number;
    lines: GRNLineDto[];
    notes?: string;
}
export declare class CreateSupplierDto {
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    address?: string;
    paymentTerms?: string;
}
