import { PrismaService } from '../prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSalesSummary(params?: {
        startDate?: Date;
        endDate?: Date;
        branchId?: number;
    }): Promise<{
        totalSales: number;
        totalTax: number;
        totalCommission: number;
        salesCount: number;
        totalReturns: number;
        returnsCount: number;
        netSales: number;
        salesByChannel: {
            channel: string;
            total: number;
            count: number;
        }[];
    }>;
    getTopProducts(params?: {
        limit?: number;
        branchId?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        productId: number;
        productName: string;
        quantity: number;
        revenue: number;
        profit: number;
    }[]>;
    getLowStockProducts(params?: {
        threshold?: number;
        branchId?: number;
    }): Promise<{
        id: number;
        nameEn: string;
        nameAr: string | null;
        code: string;
        barcode: string;
        stock: number;
    }[]>;
    getDashboardMetrics(params?: {
        branchId?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        sales: {
            totalRevenue: number;
            orderCount: number;
            averageOrderValue: number;
            totalReturns: number;
            netSales: number;
        };
        financial: {
            grossProfit: number;
            profitMargin: number;
            totalCost: number;
            totalTax: number;
            totalCommission: number;
            netProfit: number;
        };
        inventory: {
            totalStockValue: number;
            lowStockCount: number;
            outOfStockCount: number;
            totalProducts: number;
        };
        performance: {
            topProducts: {
                productId: number;
                productName: string;
                quantity: number;
                revenue: number;
                profit: number;
            }[];
            salesByChannel: {
                percentage: number;
                channel: string;
                total: number;
                count: number;
            }[];
            salesByPayment: {
                method: import(".prisma/client").$Enums.PaymentMethod;
                total: number;
                count: number;
            }[];
        };
    }>;
    private getSalesLinesForProfit;
    private getPaymentMethodBreakdown;
    getDashboardSummary(params?: {
        branchId?: number;
    }): Promise<{
        today: {
            sales: number;
            orders: number;
            profit: number;
            avgOrderValue: number;
        };
        yesterday: {
            sales: number;
            orders: number;
        };
        inventory: {
            totalProducts: number;
            lowStock: number;
            outOfStock: number;
            stockValue: number;
        };
        recentSales: {
            id: number;
            createdAt: Date;
            total: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            invoiceNo: string;
        }[];
        topProductsToday: {
            productId: number;
            productName: string;
            quantity: number;
            revenue: number;
            profit: number;
        }[];
        lowStockProducts: {
            id: number;
            nameEn: string;
            nameAr: string | null;
            code: string;
            barcode: string;
            stock: number;
        }[];
        totalCustomers: number;
    }>;
}
