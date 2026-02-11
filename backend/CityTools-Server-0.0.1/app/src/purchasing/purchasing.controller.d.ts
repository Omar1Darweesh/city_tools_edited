import { PurchasingService } from './purchasing.service';
import { CreateGRNDto, CreateSupplierDto } from './dto/purchasing.dto';
export declare class PurchasingController {
    private readonly purchasingService;
    constructor(purchasingService: PurchasingService);
    createSupplier(createSupplierDto: CreateSupplierDto): Promise<{
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        contact: string | null;
        phone: string | null;
        email: string | null;
        paymentTerms: string | null;
    }>;
    findAllSuppliers(skip?: string, take?: string, active?: string, search?: string): Promise<{
        data: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            contact: string | null;
            phone: string | null;
            email: string | null;
            paymentTerms: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOneSupplier(id: number): Promise<{
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        contact: string | null;
        phone: string | null;
        email: string | null;
        paymentTerms: string | null;
    }>;
    updateSupplier(id: number, data: any): Promise<{
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        contact: string | null;
        phone: string | null;
        email: string | null;
        paymentTerms: string | null;
    }>;
    removeSupplier(id: number): Promise<{
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        contact: string | null;
        phone: string | null;
        email: string | null;
        paymentTerms: string | null;
    }>;
    createGRN(createGRNDto: CreateGRNDto, req: any): Promise<{
        supplier: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            contact: string | null;
            phone: string | null;
            email: string | null;
            paymentTerms: string | null;
        };
        lines: ({
            product: {
                id: number;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number | null;
                code: string;
                barcode: string;
                nameEn: string;
                itemTypeId: number | null;
                brand: string | null;
                unit: string;
                cost: import("@prisma/client/runtime/library").Decimal;
                costAvg: import("@prisma/client/runtime/library").Decimal;
                priceRetail: import("@prisma/client/runtime/library").Decimal;
                priceWholesale: import("@prisma/client/runtime/library").Decimal;
                minQty: number | null;
                maxQty: number | null;
            };
        } & {
            id: number;
            cost: import("@prisma/client/runtime/library").Decimal;
            productId: number;
            qty: number;
            goodsReceiptId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdBy: number;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        supplierId: number;
        relatedPoId: number | null;
        paymentTerm: import(".prisma/client").$Enums.PaymentTerm;
        grnNo: string;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAllGRNs(skip?: string, take?: string, branchId?: string): Promise<{
        data: ({
            branch: {
                id: number;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                address: string | null;
            };
            supplier: {
                id: number;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                contact: string | null;
                phone: string | null;
                email: string | null;
                paymentTerms: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
            total: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            createdBy: number;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            supplierId: number;
            relatedPoId: number | null;
            paymentTerm: import(".prisma/client").$Enums.PaymentTerm;
            grnNo: string;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOneGRN(id: number): Promise<{
        branch: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            address: string | null;
        };
        user: {
            id: number;
            username: string;
            fullName: string;
        };
        supplier: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            contact: string | null;
            phone: string | null;
            email: string | null;
            paymentTerms: string | null;
        };
        lines: ({
            product: {
                id: number;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number | null;
                code: string;
                barcode: string;
                nameEn: string;
                itemTypeId: number | null;
                brand: string | null;
                unit: string;
                cost: import("@prisma/client/runtime/library").Decimal;
                costAvg: import("@prisma/client/runtime/library").Decimal;
                priceRetail: import("@prisma/client/runtime/library").Decimal;
                priceWholesale: import("@prisma/client/runtime/library").Decimal;
                minQty: number | null;
                maxQty: number | null;
            };
        } & {
            id: number;
            cost: import("@prisma/client/runtime/library").Decimal;
            productId: number;
            qty: number;
            goodsReceiptId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdBy: number;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        supplierId: number;
        relatedPoId: number | null;
        paymentTerm: import(".prisma/client").$Enums.PaymentTerm;
        grnNo: string;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
}
