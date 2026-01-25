import { PrismaService } from '../prisma.service';
import { CreateReturnDto } from './dto/returns.dto';
import { ProductAuditService } from '../products/product-audit.service';
export declare class ReturnsService {
    private prisma;
    private productAuditService;
    constructor(prisma: PrismaService, productAuditService: ProductAuditService);
    createReturn(data: CreateReturnDto & {
        userId: number;
    }): Promise<{
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
            productId: number;
            returnId: number;
            qtyReturned: number;
            refundAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: number;
        createdAt: Date;
        branchId: number;
        createdBy: number;
        salesInvoiceId: number;
        reason: string | null;
        returnNo: string;
        totalRefund: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        branchId?: number;
        salesInvoiceId?: number;
    }): Promise<{
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
            user: {
                id: number;
                username: string;
                fullName: string;
            };
            lines: ({
                product: {
                    id: number;
                    nameAr: string | null;
                    barcode: string;
                    nameEn: string;
                };
            } & {
                id: number;
                productId: number;
                returnId: number;
                qtyReturned: number;
                refundAmount: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: number;
            createdAt: Date;
            branchId: number;
            createdBy: number;
            salesInvoiceId: number;
            reason: string | null;
            returnNo: string;
            totalRefund: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
    }>;
}
