import { PrismaService } from '../prisma.service';
import { CreateSaleDto } from './dto/sales.dto';
import { Prisma } from '@prisma/client';
export declare class SalesService {
    private prisma;
    constructor(prisma: PrismaService);
    createSale(createSaleDto: CreateSaleDto, userId: number): Promise<{
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
                cost: Prisma.Decimal;
                costAvg: Prisma.Decimal;
                priceRetail: Prisma.Decimal;
                priceWholesale: Prisma.Decimal;
                minQty: number | null;
                maxQty: number | null;
            };
        } & {
            id: number;
            productId: number;
            salesInvoiceId: number;
            qty: number;
            unitPrice: Prisma.Decimal;
            lineDiscount: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        total: Prisma.Decimal;
        notes: string | null;
        createdBy: number;
        customerId: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        totalDiscount: Prisma.Decimal;
        channel: string | null;
        platformCommission: Prisma.Decimal;
        invoiceNo: string;
        subtotal: Prisma.Decimal;
        totalTax: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        costOfGoods: Prisma.Decimal | null;
        grossProfit: Prisma.Decimal | null;
        netProfit: Prisma.Decimal | null;
        profitMargin: Prisma.Decimal | null;
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        branchId?: number;
        customerId?: number;
        search?: string;
        paymentMethod?: string;
        dateFilter?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
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
            discountAmount: Prisma.Decimal;
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
        discountAmount: Prisma.Decimal;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    }>;
    getDailySummary(branchId: number, date?: Date): Promise<{
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
    private generateInvoiceNo;
}
