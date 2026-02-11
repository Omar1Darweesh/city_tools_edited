import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getSalesSummary(startDate?: string, endDate?: string, branchId?: string): Promise<{
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
    getTopProducts(limit?: string, branchId?: string, startDate?: string, endDate?: string): Promise<{
        productId: number;
        productName: string;
        quantity: number;
        revenue: number;
        profit: number;
    }[]>;
    getLowStockProducts(threshold?: string, branchId?: string): Promise<{
        id: number;
        nameEn: string;
        nameAr: string | null;
        code: string;
        barcode: string;
        stock: number;
    }[]>;
    getDashboardMetrics(branchId?: string, startDate?: string, endDate?: string): Promise<{
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
    getDashboardSummary(branchId?: string): Promise<{
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
