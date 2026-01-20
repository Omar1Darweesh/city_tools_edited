import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    // ✅ FIXED: Proper returns calculation using netRevenue from invoices
    async getSalesSummary(params?: {
        startDate?: Date;
        endDate?: Date;
        branchId?: number;
    }) {
        const { startDate, endDate, branchId } = params || {};
        const where: any = {};

        if (branchId) where.branchId = branchId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.createdAt.lte = endOfDay;
            }
        }

        // ✅ Get sales with proper fields (totalRefunded, netRevenue already calculated by sales.service)
        const [salesAgg, salesByChannel] = await Promise.all([
            this.prisma.salesInvoice.aggregate({
                where,
                _sum: {
                    total: true,
                    totalTax: true,
                    platformCommission: true,
                    totalRefunded: true,
                    netRevenue: true,
                },
                _count: true,
            }),
            this.prisma.salesInvoice.groupBy({
                by: ['channel'],
                where,
                _sum: { total: true },
                _count: true,
            }),
        ]);

        const totalSales = Number(salesAgg._sum.total || 0);
        const totalTax = Number(salesAgg._sum.totalTax || 0);
        const totalCommission = Number(salesAgg._sum.platformCommission || 0);
        const totalRefunds = Number(salesAgg._sum.totalRefunded || 0);

        // ✅ Use netRevenue if available, otherwise calculate
        const netSales =
            salesAgg._sum.netRevenue != null
                ? Number(salesAgg._sum.netRevenue)
                : totalSales - totalRefunds;

        return {
            totalSales,
            totalTax,
            totalCommission,
            salesCount: salesAgg._count,
            totalReturns: totalRefunds,
            returnsCount: 0,
            netSales,
            salesByChannel: salesByChannel.map((ch) => ({
                channel: ch.channel || 'NORMAL',
                total: Number(ch._sum.total || 0),
                count: ch._count,
            })),
        };
    }

    async getTopProducts(params?: {
        limit?: number;
        branchId?: number;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { limit = 10, branchId, startDate, endDate } = params || {};
        const where: any = {};

        if (branchId) where.salesInvoice = { branchId };
        if (startDate || endDate) {
            where.salesInvoice = {
                ...where.salesInvoice,
                createdAt: {},
            };
            if (startDate) where.salesInvoice.createdAt.gte = startDate;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.salesInvoice.createdAt.lte = endOfDay;
            }
        }

        const topProducts = await this.prisma.salesLine.groupBy({
            by: ['productId'],
            where,
            _sum: { qty: true, lineTotal: true },
            orderBy: { _sum: { lineTotal: 'desc' } },
            take: limit,
        });

        const productsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: item.productId },
                });

                const totalRevenue = Number(item._sum.lineTotal || 0);
                const totalQty = item._sum.qty || 0;
                const cost = product ? Number(product.cost) * totalQty : 0;
                const profit = totalRevenue - cost;

                return {
                    productId: item.productId,
                    productName: product?.nameAr || product?.nameEn || 'Unknown',
                    quantity: totalQty,
                    revenue: totalRevenue,
                    profit: profit,
                };
            }),
        );

        return productsWithDetails;
    }

    async getLowStockProducts(params?: { threshold?: number; branchId?: number }) {
        const { threshold = 10, branchId } = params || {};
        const where: any = { active: true };

        if (branchId) {
            where.stockMovements = {
                some: {
                    stockLocation: { branchId },
                },
            };
        }

        const products = await this.prisma.product.findMany({
            where,
            include: {
                stockMovements: {
                    where: branchId
                        ? { stockLocation: { branchId } }
                        : undefined,
                },
            },
        });

        const lowStockProducts = products
            .map((product) => {
                const stock = product.stockMovements.reduce(
                    (sum, mov) => sum + mov.qtyChange,
                    0,
                );
                return {
                    id: product.id,
                    nameEn: product.nameEn,
                    nameAr: product.nameAr,
                    code: product.code,
                    barcode: product.barcode,
                    stock,
                };
            })
            .filter((p) => p.stock < threshold)
            .sort((a, b) => a.stock - b.stock);

        return lowStockProducts;
    }

    async getDashboardMetrics(params?: {
        branchId?: number;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { branchId, startDate, endDate } = params || {};

        const [salesSummary, topProducts, lowStock, salesLines, paymentMethods] =
            await Promise.all([
                this.getSalesSummary({ branchId, startDate, endDate }),
                this.getTopProducts({ limit: 10, branchId, startDate, endDate }),
                this.getLowStockProducts({ threshold: 10, branchId }),
                this.getSalesLinesForProfit({ branchId, startDate, endDate }),
                this.getPaymentMethodBreakdown({ branchId, startDate, endDate }),
            ]);

        // ✅ FIXED: Distinguish between Gross and Net revenue
        const totalRevenue = salesSummary.totalSales; // Gross
        const netSales = salesSummary.netSales; // Net
        const totalCost = salesLines.reduce(
            (sum, line) => sum + line.cost * line.qty,
            0,
        );
        const grossProfit = netSales - totalCost;
        const profitMargin =
            netSales > 0 ? (grossProfit / netSales) * 100 : 0;

        // ✅ FIXED: Don't subtract tax (already included in netSales)
        const netProfit = grossProfit - salesSummary.totalCommission;

        const allProducts = await this.prisma.product.findMany({
            where: { active: true },
            include: { stockMovements: true },
        });

        const totalStockValue = allProducts.reduce((sum, product) => {
            const stock = product.stockMovements.reduce(
                (s, mov) => s + mov.qtyChange,
                0,
            );
            return sum + stock * Number(product.cost);
        }, 0);

        const outOfStock = allProducts.filter((p) => {
            const stock = p.stockMovements.reduce((s, mov) => s + mov.qtyChange, 0);
            return stock <= 0;
        });

        const salesByChannelWithPercentage = salesSummary.salesByChannel.map(
            (ch) => ({
                ...ch,
                percentage: totalRevenue > 0 ? (ch.total / totalRevenue) * 100 : 0,
            }),
        );

        return {
            sales: {
                totalRevenue,
                orderCount: salesSummary.salesCount,
                averageOrderValue:
                    salesSummary.salesCount > 0
                        ? totalRevenue / salesSummary.salesCount
                        : 0,
                totalReturns: salesSummary.totalReturns,
                netSales,
            },
            financial: {
                grossProfit,
                profitMargin,
                totalCost,
                totalTax: salesSummary.totalTax,
                totalCommission: salesSummary.totalCommission,
                netProfit,
            },
            inventory: {
                totalStockValue,
                lowStockCount: lowStock.length,
                outOfStockCount: outOfStock.length,
                totalProducts: allProducts.length,
            },
            performance: {
                topProducts,
                salesByChannel: salesByChannelWithPercentage,
                salesByPayment: paymentMethods,
            },
        };
    }

    private async getSalesLinesForProfit(params?: {
        branchId?: number;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { branchId, startDate, endDate } = params || {};
        const where: any = {};

        if (branchId) where.salesInvoice = { branchId };
        if (startDate || endDate) {
            where.salesInvoice = {
                ...where.salesInvoice,
                createdAt: {},
            };
            if (startDate) where.salesInvoice.createdAt.gte = startDate;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.salesInvoice.createdAt.lte = endOfDay;
            }
        }

        const salesLines = await this.prisma.salesLine.findMany({
            where,
            include: { product: true },
        });

        return salesLines.map((line) => ({
            qty: line.qty,
            cost: Number(line.product.cost),
            revenue: Number(line.lineTotal),
        }));
    }

    private async getPaymentMethodBreakdown(params?: {
        branchId?: number;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { branchId, startDate, endDate } = params || {};
        const where: any = {};

        if (branchId) where.branchId = branchId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.createdAt.lte = endOfDay;
            }
        }

        const paymentBreakdown = await this.prisma.salesInvoice.groupBy({
            by: ['paymentMethod'],
            where,
            _sum: { total: true },
            _count: true,
        });

        return paymentBreakdown.map((pm) => ({
            method: pm.paymentMethod || 'Unknown',
            total: Number(pm._sum.total || 0),
            count: pm._count,
        }));
    }

    async getDashboardSummary(params?: { branchId?: number }) {
        try {
            const { branchId } = params || {};
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const where = branchId ? { branchId } : {};
            const whereToday = { ...where, createdAt: { gte: today, lt: tomorrow } };
            const whereYesterday = {
                ...where,
                createdAt: { gte: yesterday, lt: today },
            };

            const [
                todaySales,
                yesterdaySales,
                todaySalesLines,
                topProductsToday,
                lowStockProducts,
                recentSales,
                todayReturns,
                yesterdayReturns,
                totalProducts,
                totalCustomers,
            ] = await Promise.all([
                this.prisma.salesInvoice.aggregate({
                    where: whereToday,
                    _sum: { total: true, totalRefunded: true, netRevenue: true },
                    _count: true,
                }),
                this.prisma.salesInvoice.aggregate({
                    where: whereYesterday,
                    _sum: { total: true, totalRefunded: true, netRevenue: true },
                    _count: true,
                }),
                this.prisma.salesLine.findMany({
                    where: { salesInvoice: whereToday },
                    include: { product: true },
                }),
                this.getTopProducts({
                    limit: 10,
                    branchId,
                    startDate: today,
                    endDate: tomorrow,
                }),
                this.getLowStockProducts({ threshold: 10, branchId }),
                this.prisma.salesInvoice.findMany({
                    where: whereToday,
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        invoiceNo: true,
                        total: true,
                        paymentMethod: true,
                        createdAt: true,
                    },
                }),
                this.prisma.salesReturn.aggregate({
                    where: whereToday,
                    _sum: { totalRefund: true },
                }),
                this.prisma.salesReturn.aggregate({
                    where: whereYesterday,
                    _sum: { totalRefund: true },
                }),
                this.prisma.product.count({ where: { active: true } }),
                this.prisma.customer.count(),
            ]);

            const todayCost = todaySalesLines.reduce(
                (sum, line) =>
                    sum + Number(line.product?.cost || 0) * (line.qty || 0),
                0,
            );

            const todayGrossRevenue = Number(todaySales._sum.total || 0);
            const todayReturnsVal = Number(todaySales._sum.totalRefunded || 0);
            const todayRevenue = Number(
                todaySales._sum.netRevenue || todayGrossRevenue - todayReturnsVal,
            );
            const todayProfit = todayRevenue - todayCost;
            const todayOrders = todaySales._count;
            const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

            const yesterdayGrossRevenue = Number(yesterdaySales._sum.total || 0);
            const yesterdayReturnsVal = Number(
                yesterdaySales._sum.totalRefunded || 0,
            );
            const yesterdayRevenue = Number(
                yesterdaySales._sum.netRevenue ||
                yesterdayGrossRevenue - yesterdayReturnsVal,
            );

            const allProducts = await this.prisma.product.findMany({
                where: { active: true },
                include: { stockMovements: true },
            });

            const stockValue = allProducts.reduce((sum, product) => {
                const stock = product.stockMovements.reduce(
                    (s, mov) => s + mov.qtyChange,
                    0,
                );
                return sum + stock * Number(product.cost || 0);
            }, 0);

            const outOfStock = allProducts.filter((p) => {
                const stock = p.stockMovements.reduce((s, mov) => s + mov.qtyChange, 0);
                return stock <= 0;
            }).length;

            return {
                today: {
                    sales: todayRevenue,
                    orders: todayOrders,
                    profit: todayProfit,
                    avgOrderValue,
                    returns: todayReturnsVal,
                },
                yesterday: {
                    sales: yesterdayRevenue,
                    orders: yesterdaySales._count,
                    returns: yesterdayReturnsVal,
                },
                inventory: {
                    totalProducts,
                    lowStock: lowStockProducts.length,
                    outOfStock,
                    stockValue,
                },
                recentSales:
                    recentSales.map((s) => ({ ...s, total: Number(s.total) })) || [],
                topProductsToday: topProductsToday || [],
                lowStockProducts: lowStockProducts || [],
                totalCustomers: totalCustomers || 0,
            };
        } catch (error) {
            console.error('Error in getDashboardSummary:', error);
            return {
                today: { sales: 0, orders: 0, profit: 0, avgOrderValue: 0, returns: 0 },
                yesterday: { sales: 0, orders: 0, returns: 0 },
                inventory: { totalProducts: 0, lowStock: 0, outOfStock: 0, stockValue: 0 },
                recentSales: [],
                topProductsToday: [],
                lowStockProducts: [],
                totalCustomers: 0,
            };
        }
    }
}
