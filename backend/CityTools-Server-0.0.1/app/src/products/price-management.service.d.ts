import { PrismaService } from '../prisma.service';
import { ProductAuditService } from './product-audit.service';
export declare class PriceManagementService {
    private prisma;
    private productAudit;
    constructor(prisma: PrismaService, productAudit: ProductAuditService);
    bulkUpdatePrices(data: {
        updates: Array<{
            productId: number;
            priceRetail?: number;
            priceWholesale?: number;
        }>;
        userId: number;
        reason?: string;
    }): Promise<{
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
    }[]>;
    getPriceHistory(productId: number): Promise<({
        user: {
            id: number;
            username: string;
            fullName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        productId: number;
        reason: string | null;
        priceType: string;
        oldPrice: import("@prisma/client/runtime/library").Decimal;
        newPrice: import("@prisma/client/runtime/library").Decimal;
        changedBy: number;
    })[]>;
    updatePricesByCategory(data: {
        categoryId: number;
        adjustment: number;
        adjustmentType: 'PERCENTAGE' | 'FIXED';
        priceType: 'RETAIL' | 'WHOLESALE';
        userId: number;
        reason?: string;
    }): Promise<{
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
    }[]>;
}
