import { StockService } from './stock.service';
import { CreateBatchAdjustmentDto, CreateTransferDto } from './dto/stock.dto';
declare class CreateAdjustmentDto {
    productId: number;
    stockLocationId: number;
    qtyChange: number;
    notes?: string;
}
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    getStockOnHand(productId?: string, stockLocationId?: string, branchId?: string): Promise<any[]>;
    createAdjustment(createAdjustmentDto: CreateAdjustmentDto, req: any): Promise<{
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
    createBatchAdjustment(dto: CreateBatchAdjustmentDto, req: any): Promise<({
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
    createTransfer(dto: CreateTransferDto, req: any): Promise<{
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
    getLocations(branchId?: string): Promise<({
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
    getMovementHistory(productId?: string, stockLocationId?: string, movementType?: string, skip?: string, take?: string): Promise<{
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
}
export {};
