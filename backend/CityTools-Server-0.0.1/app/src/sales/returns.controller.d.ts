import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/returns.dto';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    createReturn(createReturnDto: CreateReturnDto, req: any): Promise<{
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
    findAll(skip?: string, take?: string, branchId?: string, salesInvoiceId?: string): Promise<{
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
