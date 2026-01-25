import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sales.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    createSale(createSaleDto: CreateSaleDto, req: any): Promise<{
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
            salesInvoiceId: number;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineDiscount: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        createdBy: number;
        customerId: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        totalDiscount: import("@prisma/client/runtime/library").Decimal;
        channel: string | null;
        platformCommission: import("@prisma/client/runtime/library").Decimal;
        invoiceNo: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        totalTax: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        costOfGoods: import("@prisma/client/runtime/library").Decimal | null;
        grossProfit: import("@prisma/client/runtime/library").Decimal | null;
        netProfit: import("@prisma/client/runtime/library").Decimal | null;
        profitMargin: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(skip?: string, take?: string, branchId?: string, customerId?: string, search?: string, paymentMethod?: string, dateFilter?: string, startDate?: string, endDate?: string): Promise<{
        data: {
            subtotal: number;
            total: number;
            totalTax: number;
            totalDiscount: number;
            platformCommission: number;
            costOfGoods: number | undefined;
            grossProfit: number | undefined;
            netProfit: number | undefined;
            profitMargin: number | undefined;
            customer: {
                id: number;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                phone: string | null;
                type: import(".prisma/client").$Enums.CustomerType;
                taxNumber: string | null;
            } | null;
            branch: {
                name: string;
            };
            user: {
                username: string;
                fullName: string;
            };
            id: number;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
            notes: string | null;
            createdBy: number;
            customerId: number | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            channel: string | null;
            invoiceNo: string;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        }[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        subtotal: number;
        total: number;
        totalTax: number;
        totalDiscount: number;
        platformCommission: number;
        costOfGoods: number | undefined;
        grossProfit: number | undefined;
        netProfit: number | undefined;
        profitMargin: number | undefined;
        lines: {
            unitPrice: number;
            lineDiscount: number;
            taxRate: number;
            lineTotal: number;
            product: {
                nameAr: string | null;
                barcode: string;
                nameEn: string;
            };
            id: number;
            productId: number;
            salesInvoiceId: number;
            qty: number;
        }[];
        customer: {
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
        } | null;
        branch: {
            name: string;
        };
        user: {
            id: number;
            username: string;
            fullName: string;
        };
        id: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        notes: string | null;
        createdBy: number;
        customerId: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        channel: string | null;
        invoiceNo: string;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    }>;
    getDailySummary(branchId: number, date?: string): Promise<{
        date: Date;
        branchId: number;
        summary: Record<string, {
            count: number;
            total: number;
        }>;
        grandTotal: number;
        invoiceCount: number;
        recentSales: {
            total: number;
            id: number;
            createdAt: Date;
            user: {
                fullName: string;
            };
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            invoiceNo: string;
        }[];
    }>;
}
