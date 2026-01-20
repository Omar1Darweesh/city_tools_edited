"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSalesSummary(params) {
        const { startDate, endDate, branchId } = params || {};
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                where.createdAt.lte = endOfDay;
            }
        }
        const [totalSales, salesByChannel, totalReturns] = await Promise.all([
            this.prisma.salesInvoice.aggregate({
                where,
                _sum: { total: true, totalTax: true, platformCommission: true },
                _count: true,
            }),
            this.prisma.salesInvoice.groupBy({
                by: ['channel'],
                where,
                _sum: { total: true },
                _count: true,
            }),
            this.prisma.salesReturn.aggregate({
                where: branchId ? { branchId } : {},
                _sum: { totalRefund: true },
                _count: true,
            }),
        ]);
        return {
            totalSales: Number(totalSales._sum.total || 0),
            totalTax: Number(totalSales._sum.totalTax || 0),
            totalCommission: Number(totalSales._sum.platformCommission || 0),
            salesCount: totalSales._count,
            totalReturns: Number(totalReturns._sum.totalRefund || 0),
            returnsCount: totalReturns._count,
            netSales: Number(totalSales._sum.total || 0) -
                Number(totalReturns._sum.totalRefund || 0),
            salesByChannel: salesByChannel.map((ch) => ({
                channel: ch.channel || 'NORMAL',
                total: Number(ch._sum.total || 0),
                count: ch._count,
            })),
        };
    }
    async getTopProducts(params) {
        const { limit = 10, branchId, startDate, endDate } = params || {};
        const where = {};
        if (branchId)
            where.salesInvoice = { branchId };
        if (startDate || endDate) {
            where.salesInvoice = {
                ...where.salesInvoice,
                createdAt: {},
            };
            if (startDate)
                where.salesInvoice.createdAt.gte = startDate;
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
        const productsWithDetails = await Promise.all(topProducts.map(async (item) => {
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
        }));
        return productsWithDetails;
    }
    async getLowStockProducts(params) {
        const { threshold = 10, branchId } = params || {};
        const where = { active: true };
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
            const stock = product.stockMovements.reduce((sum, mov) => sum + mov.qtyChange, 0);
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
    async getDashboardMetrics(params) {
        const { branchId, startDate, endDate } = params || {};
        const [salesSummary, topProducts, lowStock, salesLines, paymentMethods] = await Promise.all([
            this.getSalesSummary({ branchId, startDate, endDate }),
            this.getTopProducts({ limit: 10, branchId, startDate, endDate }),
            this.getLowStockProducts({ threshold: 10, branchId }),
            this.getSalesLinesForProfit({ branchId, startDate, endDate }),
            this.getPaymentMethodBreakdown({ branchId, startDate, endDate }),
        ]);
        const totalRevenue = salesSummary.totalSales;
        const totalCost = salesLines.reduce((sum, line) => sum + (line.cost * line.qty), 0);
        const grossProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const netProfit = grossProfit - salesSummary.totalTax - salesSummary.totalCommission;
        const allProducts = await this.prisma.product.findMany({
            where: { active: true },
            include: { stockMovements: true },
        });
        const totalStockValue = allProducts.reduce((sum, product) => {
            const stock = product.stockMovements.reduce((s, mov) => s + mov.qtyChange, 0);
            return sum + (stock * Number(product.cost));
        }, 0);
        const outOfStock = allProducts.filter(p => {
            const stock = p.stockMovements.reduce((s, mov) => s + mov.qtyChange, 0);
            return stock <= 0;
        });
        const salesByChannelWithPercentage = salesSummary.salesByChannel.map(ch => ({
            ...ch,
            percentage: totalRevenue > 0 ? (ch.total / totalRevenue) * 100 : 0,
        }));
        return {
            sales: {
                totalRevenue,
                orderCount: salesSummary.salesCount,
                averageOrderValue: salesSummary.salesCount > 0
                    ? totalRevenue / salesSummary.salesCount
                    : 0,
                totalReturns: salesSummary.totalReturns,
                netSales: salesSummary.netSales,
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
    async getSalesLinesForProfit(params) {
        const { branchId, startDate, endDate } = params || {};
        const where = {};
        if (branchId)
            where.salesInvoice = { branchId };
        if (startDate || endDate) {
            where.salesInvoice = {
                ...where.salesInvoice,
                createdAt: {},
            };
            if (startDate)
                where.salesInvoice.createdAt.gte = startDate;
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
        return salesLines.map(line => ({
            qty: line.qty,
            cost: Number(line.product.cost),
            revenue: Number(line.lineTotal),
        }));
    }
    async getPaymentMethodBreakdown(params) {
        const { branchId, startDate, endDate } = params || {};
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
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
        return paymentBreakdown.map(pm => ({
            method: pm.paymentMethod || 'Unknown',
            total: Number(pm._sum.total || 0),
            count: pm._count,
        }));
    }
    async getDashboardSummary(params) {
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
            const whereYesterday = { ...where, createdAt: { gte: yesterday, lt: today } };
            const [todaySales, yesterdaySales, todaySalesLines, topProductsToday, lowStockProducts, recentSales, totalProducts, totalCustomers] = await Promise.all([
                this.prisma.salesInvoice.aggregate({
                    where: whereToday,
                    _sum: { total: true },
                    _count: true,
                }),
                this.prisma.salesInvoice.aggregate({
                    where: whereYesterday,
                    _sum: { total: true },
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
                this.prisma.product.count({ where: { active: true } }),
                this.prisma.customer.count(),
            ]);
            const todayCost = todaySalesLines.reduce((sum, line) => sum + (Number(line.product?.cost || 0) * (line.qty || 0)), 0);
            const todayRevenue = Number(todaySales._sum.total || 0);
            const todayProfit = todayRevenue - todayCost;
            const todayOrders = todaySales._count;
            const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;
            const allProducts = await this.prisma.product.findMany({
                where: { active: true },
                include: { stockMovements: true },
            });
            const stockValue = allProducts.reduce((sum, product) => {
                const stock = product.stockMovements.reduce((s, mov) => s + mov.qtyChange, 0);
                return sum + (stock * Number(product.cost || 0));
            }, 0);
            const outOfStock = allProducts.filter(p => {
                const stock = p.stockMovements.reduce((s, mov) => s + mov.qtyChange, 0);
                return stock <= 0;
            }).length;
            return {
                today: {
                    sales: todayRevenue,
                    orders: todayOrders,
                    profit: todayProfit,
                    avgOrderValue,
                },
                yesterday: {
                    sales: Number(yesterdaySales._sum.total || 0),
                    orders: yesterdaySales._count,
                },
                inventory: {
                    totalProducts,
                    lowStock: lowStockProducts.length,
                    outOfStock,
                    stockValue,
                },
                recentSales: recentSales || [],
                topProductsToday: topProductsToday || [],
                lowStockProducts: lowStockProducts || [],
                totalCustomers: totalCustomers || 0,
            };
        }
        catch (error) {
            console.error('Error in getDashboardSummary:', error);
            return {
                today: { sales: 0, orders: 0, profit: 0, avgOrderValue: 0 },
                yesterday: { sales: 0, orders: 0 },
                inventory: { totalProducts: 0, lowStock: 0, outOfStock: 0, stockValue: 0 },
                recentSales: [],
                topProductsToday: [],
                lowStockProducts: [],
                totalCustomers: 0,
            };
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map