import { PrismaService } from '../prisma.service';
import { MovementType } from '@prisma/client';
export declare class StockService {
    private prisma;
    constructor(prisma: PrismaService);
    getStockOnHand(params: {
        productId?: number;
        stockLocationId?: number;
        branchId?: number;
    }): Promise<any[]>;
    createAdjustment(data: {
        productId: number;
        stockLocationId: number;
        qtyChange: number;
        notes?: string;
        userId: number;
    }): Promise<{
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
        stockLocation: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        productId: number;
        stockLocationId: number;
        qtyChange: number;
        movementType: import(".prisma/client").$Enums.MovementType;
        refTable: string | null;
        refId: number | null;
        notes: string | null;
        createdBy: number;
    }>;
    getLocations(branchId?: number): Promise<({
        branch: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            address: string | null;
        };
    } & {
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
    })[]>;
    getMovementHistory(params: {
        productId?: number;
        stockLocationId?: number;
        movementType?: MovementType;
        skip?: number;
        take?: number;
    }): Promise<{
        data: ({
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
            stockLocation: {
                id: number;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                branchId: number;
            };
            user: {
                id: number;
                username: string;
                fullName: string;
            };
        } & {
            id: number;
            createdAt: Date;
            productId: number;
            stockLocationId: number;
            qtyChange: number;
            movementType: import(".prisma/client").$Enums.MovementType;
            refTable: string | null;
            refId: number | null;
            notes: string | null;
            createdBy: number;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    createBatchAdjustment(data: {
        stockLocationId: number;
        adjustments: Array<{
            productId: number;
            qtyChange: number;
        }>;
        notes?: string;
        userId: number;
    }): Promise<({
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
        stockLocation: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        productId: number;
        stockLocationId: number;
        qtyChange: number;
        movementType: import(".prisma/client").$Enums.MovementType;
        refTable: string | null;
        refId: number | null;
        notes: string | null;
        createdBy: number;
    })[]>;
    createTransfer(data: {
        fromStockLocationId: number;
        toStockLocationId: number;
        items: Array<{
            productId: number;
            qty: number;
        }>;
        notes?: string;
        userId: number;
    }): Promise<{
        transferOut: {
            id: number;
            createdAt: Date;
            productId: number;
            stockLocationId: number;
            qtyChange: number;
            movementType: import(".prisma/client").$Enums.MovementType;
            refTable: string | null;
            refId: number | null;
            notes: string | null;
            createdBy: number;
        }[];
        transferIn: {
            id: number;
            createdAt: Date;
            productId: number;
            stockLocationId: number;
            qtyChange: number;
            movementType: import(".prisma/client").$Enums.MovementType;
            refTable: string | null;
            refId: number | null;
            notes: string | null;
            createdBy: number;
        }[];
        fromLocation: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
        };
        toLocation: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
        };
    }>;
}
