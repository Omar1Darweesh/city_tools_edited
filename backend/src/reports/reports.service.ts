import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ Date Helper: Normalize end date to include full day (23:59:59.999)
   * This ensures consistent date range queries across all reports
   */
  private normalizeEndDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(23, 59, 59, 999);
    return normalized;
  }

  /**
   * ✅ Date Helper: Normalize start date to beginning of day (00:00:00.000)
   * Ensures consistent start of day across all reports
   */
  private normalizeStartDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * ✅ Date Helper: Build date where clause with proper normalization
   */
  private buildDateWhere(startDate?: Date, endDate?: Date): any {
    if (!startDate && !endDate) return {};

    const dateWhere: any = {};
    if (startDate) dateWhere.gte = this.normalizeStartDate(startDate);
    if (endDate) dateWhere.lte = this.normalizeEndDate(endDate);

    return { createdAt: dateWhere };
  }

  private async getProductStockMap(branchId?: number) {
    const where: any = {};
    if (branchId) {
      where.stockLocation = { branchId };
    }

    const stockAgg = await this.prisma.stockMovement.groupBy({
      by: ['productId'],
      where,
      _sum: { qtyChange: true },
    });

    const stockMap = new Map<number, number>();
    stockAgg.forEach((item) => {
      stockMap.set(item.productId, item._sum.qtyChange || 0);
    });

    return stockMap;
  }

  // ✅ FIXED: Proper returns calculation using netRevenue from invoices
  async getSalesSummary(params?: {
    startDate?: Date;
    endDate?: Date;
    branchId?: number;
  }) {
    const { startDate, endDate, branchId } = params || {};
    const where: any = {};

    if (branchId) where.branchId = branchId;

    // ✅ Use date helper for consistent date handling
    const dateWhere = this.buildDateWhere(startDate, endDate);
    if (dateWhere.createdAt) where.createdAt = dateWhere.createdAt;

    // ✅ Get sales with proper fields (totalRefunded, netRevenue already calculated by sales.service)
    const [salesAgg, salesByChannel, platformSettings] = await Promise.all([
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
      this.prisma.platformSettings.findMany({
        select: {
          platform: true,
          name: true,
        },
      }),
    ]);

    // Create platform name map
    const platformMap = new Map<string, string>();
    platformSettings.forEach((p) => {
      platformMap.set(p.platform, p.name || p.platform);
    });

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
      salesByChannel: salesByChannel.map((ch) => {
        const channelCode = ch.channel || 'NORMAL';
        return {
          channel: channelCode,
          channelName: platformMap.get(channelCode) || channelCode,
          total: Number(ch._sum.total || 0),
          count: ch._count,
        };
      }),
    };
  }

  /**
   * ✅ NEW: Comprehensive Platform Sales Details Report
   * Provides detailed breakdown of sales by platform/channel including:
   * - Revenue (gross & net), Commission, Tax, Profit
   * - Order counts, Average order value
   * - Returns and refunds per platform
   * - Platform settings (name, icon, rates)
   * - Comparison with previous period
   */
  async getPlatformSalesDetails(params?: {
    startDate?: Date;
    endDate?: Date;
    branchId?: number;
    includePeriodComparison?: boolean;
  }): Promise<any> {
    const {
      startDate,
      endDate,
      branchId,
      includePeriodComparison = true,
    } = params || {};
    const where: any = {};

    if (branchId) where.branchId = branchId;
    const dateWhere = this.buildDateWhere(startDate, endDate);
    if (dateWhere.createdAt) where.createdAt = dateWhere.createdAt;

    // Get all platform settings for reference
    const platformSettings = await this.prisma.platformSettings.findMany({
      where: { active: true },
    });

    const platformsMap = new Map(
      platformSettings.map((ps) => [ps.platform, ps]),
    );

    // Get sales aggregated by channel with all necessary fields
    const salesByChannel = await this.prisma.salesInvoice.groupBy({
      by: ['channel'],
      where,
      _sum: {
        total: true,
        totalTax: true,
        platformCommission: true,
        totalRefunded: true,
        netRevenue: true,
        costOfGoods: true,
        grossProfit: true,
        netProfit: true,
        shippingFee: true,
      },
      _count: true,
    });

    // Get sales lines for detailed profit calculation
    const salesLines = await this.prisma.salesLine.findMany({
      where: {
        salesInvoice: where,
      },
      include: {
        product: {
          select: {
            costAvg: true,
          },
        },
        salesInvoice: {
          select: {
            channel: true,
          },
        },
      },
    });

    // Group sales lines by channel for accurate cost calculation
    const channelCostsMap = new Map<
      string,
      { cost: number; revenue: number }
    >();

    for (const line of salesLines) {
      const channel = line.salesInvoice.channel || 'NORMAL';
      const current = channelCostsMap.get(channel) || { cost: 0, revenue: 0 };

      const lineCost = Number(line.product?.costAvg || 0) * line.qty;
      const lineRevenue = Number(line.lineTotal || 0);

      current.cost += lineCost;
      current.revenue += lineRevenue;
      channelCostsMap.set(channel, current);
    }

    // Build detailed platform statistics
    const platformStats = salesByChannel.map((channel) => {
      const channelName = channel.channel || 'NORMAL';
      const platformConfig = platformsMap.get(channelName);

      const grossRevenue = Number(channel._sum.total || 0);
      const tax = Number(channel._sum.totalTax || 0);
      const commission = Number(channel._sum.platformCommission || 0);
      const refunded = Number(channel._sum.totalRefunded || 0);
      const netRevenue = Number(
        channel._sum.netRevenue || grossRevenue - refunded,
      );
      const shippingFee = Number(channel._sum.shippingFee || 0);
      const orderCount = channel._count;

      // Use actual cost from sales lines if available
      const channelCostData = channelCostsMap.get(channelName);
      const costOfGoods =
        channelCostData?.cost || Number(channel._sum.costOfGoods || 0);

      // Calculate profits
      const grossProfit = netRevenue - costOfGoods;
      const netProfit = grossProfit - commission - tax;
      const profitMargin =
        netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
      const netProfitMargin =
        netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

      // Calculate averages
      const avgOrderValue = orderCount > 0 ? grossRevenue / orderCount : 0;
      const avgProfit = orderCount > 0 ? grossProfit / orderCount : 0;

      // Commission and tax rates (calculated vs configured)
      const actualCommissionRate =
        grossRevenue > 0 ? (commission / grossRevenue) * 100 : 0;
      const actualTaxRate = grossRevenue > 0 ? (tax / grossRevenue) * 100 : 0;
      const configuredCommissionRate = platformConfig
        ? Number(platformConfig.commission) * 100
        : 0;
      const configuredTaxRate = platformConfig
        ? Number(platformConfig.taxRate) * 100
        : 0;

      return {
        platform: channelName,
        platformName: platformConfig?.name || channelName,
        platformIcon: platformConfig?.icon || '🏪',

        // Revenue metrics
        grossRevenue: Math.round(grossRevenue * 100) / 100,
        netRevenue: Math.round(netRevenue * 100) / 100,
        refunded: Math.round(refunded * 100) / 100,
        refundRate:
          grossRevenue > 0
            ? Math.round((refunded / grossRevenue) * 10000) / 100
            : 0,

        // Costs and fees
        costOfGoods: Math.round(costOfGoods * 100) / 100,
        commission: Math.round(commission * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shippingFee: Math.round(shippingFee * 100) / 100,

        // Profit metrics
        grossProfit: Math.round(grossProfit * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        netProfitMargin: Math.round(netProfitMargin * 100) / 100,

        // Order metrics
        orderCount,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        avgProfit: Math.round(avgProfit * 100) / 100,

        // Rate comparison
        actualCommissionRate: Math.round(actualCommissionRate * 100) / 100,
        configuredCommissionRate:
          Math.round(configuredCommissionRate * 100) / 100,
        actualTaxRate: Math.round(actualTaxRate * 100) / 100,
        configuredTaxRate: Math.round(configuredTaxRate * 100) / 100,

        // Platform configuration
        isConfigured: !!platformConfig,
        isActive: platformConfig?.active ?? false,
      };
    });

    // Calculate totals across all platforms
    const totals = platformStats.reduce(
      (acc, stat) => ({
        grossRevenue: acc.grossRevenue + stat.grossRevenue,
        netRevenue: acc.netRevenue + stat.netRevenue,
        refunded: acc.refunded + stat.refunded,
        commission: acc.commission + stat.commission,
        tax: acc.tax + stat.tax,
        costOfGoods: acc.costOfGoods + stat.costOfGoods,
        grossProfit: acc.grossProfit + stat.grossProfit,
        netProfit: acc.netProfit + stat.netProfit,
        orderCount: acc.orderCount + stat.orderCount,
        shippingFee: acc.shippingFee + stat.shippingFee,
      }),
      {
        grossRevenue: 0,
        netRevenue: 0,
        refunded: 0,
        commission: 0,
        tax: 0,
        costOfGoods: 0,
        grossProfit: 0,
        netProfit: 0,
        orderCount: 0,
        shippingFee: 0,
      },
    );

    // Calculate percentage contribution for each platform
    const platformsWithPercentage = platformStats.map((stat) => ({
      ...stat,
      revenuePercentage:
        totals.grossRevenue > 0
          ? Math.round((stat.grossRevenue / totals.grossRevenue) * 10000) / 100
          : 0,
      profitPercentage:
        totals.grossProfit > 0
          ? Math.round((stat.grossProfit / totals.grossProfit) * 10000) / 100
          : 0,
      orderPercentage:
        totals.orderCount > 0
          ? Math.round((stat.orderCount / totals.orderCount) * 10000) / 100
          : 0,
    }));

    // Sort by revenue descending
    platformsWithPercentage.sort((a, b) => b.grossRevenue - a.grossRevenue);

    // Period comparison (if requested and dates provided)
    let periodComparison = null;
    if (includePeriodComparison && startDate && endDate) {
      const periodDuration = endDate.getTime() - startDate.getTime();
      const prevStart = new Date(startDate.getTime() - periodDuration);
      const prevEnd = new Date(startDate.getTime() - 1);

      const prevPlatformStats: any = await this.getPlatformSalesDetails({
        startDate: prevStart,
        endDate: prevEnd,
        branchId,
        includePeriodComparison: false, // Avoid recursion
      });

      // Calculate changes for each platform
      const platformChanges = platformsWithPercentage.map((current) => {
        const previous = prevPlatformStats.platforms.find(
          (p: any) => p.platform === current.platform,
        );

        if (!previous) {
          return {
            platform: current.platform,
            revenueChange: current.grossRevenue > 0 ? 100 : 0,
            profitChange: current.grossProfit > 0 ? 100 : 0,
            orderChange: current.orderCount > 0 ? 100 : 0,
            isNew: true,
          };
        }

        const revenueChange =
          previous.grossRevenue > 0
            ? ((current.grossRevenue - previous.grossRevenue) /
                previous.grossRevenue) *
              100
            : current.grossRevenue > 0
              ? 100
              : 0;

        const profitChange =
          previous.grossProfit > 0
            ? ((current.grossProfit - previous.grossProfit) /
                previous.grossProfit) *
              100
            : current.grossProfit > 0
              ? 100
              : 0;

        const orderChange =
          previous.orderCount > 0
            ? ((current.orderCount - previous.orderCount) /
                previous.orderCount) *
              100
            : current.orderCount > 0
              ? 100
              : 0;

        return {
          platform: current.platform,
          revenueChange: Math.round(revenueChange * 100) / 100,
          profitChange: Math.round(profitChange * 100) / 100,
          orderChange: Math.round(orderChange * 100) / 100,
          isNew: false,
        };
      });

      periodComparison = {
        currentPeriod: {
          startDate,
          endDate,
          ...totals,
        },
        previousPeriod: {
          startDate: prevStart,
          endDate: prevEnd,
          ...prevPlatformStats.summary,
        },
        platformChanges,
      };
    }

    return {
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      summary: {
        ...totals,
        avgProfitMargin:
          totals.netRevenue > 0
            ? Math.round((totals.grossProfit / totals.netRevenue) * 10000) / 100
            : 0,
        avgOrderValue:
          totals.orderCount > 0
            ? Math.round((totals.grossRevenue / totals.orderCount) * 100) / 100
            : 0,
      },
      platforms: platformsWithPercentage,
      platformCount: platformsWithPercentage.length,
      comparison: periodComparison,
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

    // ✅ Use date helper for consistent date handling
    const dateWhere = this.buildDateWhere(startDate, endDate);
    if (dateWhere.createdAt) {
      where.salesInvoice = {
        ...where.salesInvoice,
        ...dateWhere,
      };
    }

    const topProducts = await this.prisma.salesLine.groupBy({
      by: ['productId'],
      where,
      _sum: { qty: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: 'desc' } },
      take: limit,
    });

    const productIds = topProducts.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productsWithDetails = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      const totalRevenue = Number(item._sum.lineTotal || 0);
      const totalQty = item._sum.qty || 0;
      const cost = product ? Number(product.costAvg) * totalQty : 0;
      const profit = totalRevenue - cost;

      return {
        productId: item.productId,
        productName: product?.nameAr || product?.nameEn || 'Unknown',
        quantity: totalQty,
        revenue: totalRevenue,
        profit: profit,
      };
    });

    return productsWithDetails;
  }

  async getLowStockProducts(params?: {
    threshold?: number;
    branchId?: number;
  }) {
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
          where: branchId ? { stockLocation: { branchId } } : undefined,
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

    const [
      salesSummary,
      topProducts,
      lowStock,
      salesLines,
      paymentMethods,
      salesByCategory,
      hourlyStats,
      platformSalesQuick,
    ] = await Promise.all([
      this.getSalesSummary({ branchId, startDate, endDate }),
      this.getTopProducts({ limit: 10, branchId, startDate, endDate }),
      this.getLowStockProducts({ threshold: 10, branchId }),
      this.getSalesLinesForProfit({ branchId, startDate, endDate }),
      this.getPaymentMethodBreakdown({ branchId, startDate, endDate }),
      this.getSalesByCategory({ branchId, startDate, endDate }),
      this.getHourlySalesStats({ branchId, startDate, endDate }),
      // ✅ NEW: Include platform sales summary (without comparison for speed)
      this.getPlatformSalesDetails({
        branchId,
        startDate,
        endDate,
        includePeriodComparison: false,
      }),
    ]);

    // ✅ FIXED: Distinguish between Gross and Net revenue
    const totalRevenue = salesSummary.totalSales; // Gross
    const netSales = salesSummary.netSales; // Net
    const totalCost = salesLines.reduce(
      (sum, line) => sum + line.cost * line.qty,
      0,
    );
    const grossProfit = netSales - totalCost;
    const profitMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    // ✅ FIXED: Don't subtract tax (already included in netSales)
    const netProfit = grossProfit - salesSummary.totalCommission;

    const allProducts = await this.prisma.product.findMany({
      where: { active: true },
      select: { id: true, costAvg: true },
    });

    const stockMap = await this.getProductStockMap();

    const totalStockValue = allProducts.reduce((sum, product) => {
      const stock = stockMap.get(product.id) || 0;
      return sum + stock * Number(product.costAvg);
    }, 0);

    const outOfStock = allProducts.filter((p) => {
      const stock = stockMap.get(p.id) || 0;
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
        salesByCategory,
        hourlyStats,
      },
      // ✅ NEW: Platform sales breakdown with detailed metrics
      platformSales: {
        summary: platformSalesQuick.summary,
        platforms: platformSalesQuick.platforms,
        platformCount: platformSalesQuick.platformCount,
      },
    };
  }

  private async getSalesByCategory(params?: {
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { branchId, startDate, endDate } = params || {};
    const where: any = {};

    if (branchId) where.salesInvoice = { branchId };
    if (startDate || endDate) {
      where.salesInvoice = { ...where.salesInvoice, createdAt: {} };
      if (startDate) where.salesInvoice.createdAt.gte = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.salesInvoice.createdAt.lte = endOfDay;
      }
    }

    const categorySales = await this.prisma.salesLine.groupBy({
      by: ['productId'],
      where,
      _sum: { lineTotal: true, qty: true },
    });

    // Group by category (need to fetch products to get categoryId)
    // Optimization: Fetch all products with categories first, or do aggregation in JS
    // Since Prisma doesn't support deep join in groupBy, we do it manually or optimized query
    const productIds = categorySales.map((c) => c.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const categoryMap = new Map<
      string,
      { total: number; count: number; name: string }
    >();

    for (const item of categorySales) {
      const product = products.find((p) => p.id === item.productId);
      const categoryName = product?.category?.nameAr || 'غير مصنف';
      const current = categoryMap.get(categoryName) || {
        total: 0,
        count: 0,
        name: categoryName,
      };

      current.total += Number(item._sum.lineTotal || 0);
      current.count += item._sum.qty || 0;
      categoryMap.set(categoryName, current);
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  }

  private async getHourlySalesStats(params?: {
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    // Use raw query for hourly grouping as it's database specific and cleaner
    const { branchId, startDate, endDate } = params || {};

    // Fallback or JS processing if raw query is complex with Prisma
    // We will fetch sales with createdAt and process in JS for simplicity and DB compatibility
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

    const sales = await this.prisma.salesInvoice.findMany({
      where,
      select: { createdAt: true, total: true },
    });

    const hourlyMap = new Map<
      string,
      { hour: string; total: number; count: number }
    >();

    // Initialize all hours 00-23
    for (let i = 0; i < 24; i++) {
      const h = i.toString().padStart(2, '0') + ':00';
      hourlyMap.set(h, { hour: h, total: 0, count: 0 });
    }

    for (const sale of sales) {
      const d = new Date(sale.createdAt);
      // We want LOCAL hour usually, but server time is stored.
      // Assuming reports are viewed in same timezone context or server time is consistent.
      // Adjusting to local time of the request if we knew offset, but standard practice:
      // Group by hour of the timestamp (UTC if stored as such).
      // FIXME: Ideally shift to requested timezone. For now, using server local hour.
      const h = d.getHours().toString().padStart(2, '0') + ':00';

      const current = hourlyMap.get(h) || { hour: h, total: 0, count: 0 };
      current.total += Number(sale.total);
      current.count += 1;
      hourlyMap.set(h, current);
    }

    return Array.from(hourlyMap.values());
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
      cost: Number(line.product.costAvg),
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
          sum + Number(line.product?.costAvg || 0) * (line.qty || 0),
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
        select: { id: true, costAvg: true },
      });

      const stockMap = await this.getProductStockMap();

      const stockValue = allProducts.reduce((sum, product) => {
        const stock = stockMap.get(product.id) || 0;
        return sum + stock * Number(product.costAvg || 0);
      }, 0);

      const outOfStock = allProducts.filter((p) => {
        const stock = stockMap.get(p.id) || 0;
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
        inventory: {
          totalProducts: 0,
          lowStock: 0,
          outOfStock: 0,
          stockValue: 0,
        },
        recentSales: [],
        topProductsToday: [],
        lowStockProducts: [],
        totalCustomers: 0,
      };
    }
  }

  // ========== NEW ENHANCED REPORT METHODS ==========

  /**
   * Get customer analytics - breakdown by type, top customers
   */
  async getCustomerAnalytics(params?: {
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { branchId, startDate, endDate } = params || {};
    const invoiceWhere: any = {};

    if (branchId) invoiceWhere.branchId = branchId;
    if (startDate || endDate) {
      invoiceWhere.createdAt = {};
      if (startDate) invoiceWhere.createdAt.gte = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        invoiceWhere.createdAt.lte = endOfDay;
      }
    }

    // Get total customers
    const totalCustomers = await this.prisma.customer.count({
      where: { active: true },
    });

    // Get customer type breakdown
    const customersByType = await this.prisma.customer.groupBy({
      by: ['type'],
      where: { active: true },
      _count: true,
    });

    // Get top customers by revenue in period
    const topCustomersData = await this.prisma.salesInvoice.groupBy({
      by: ['customerId'],
      where: {
        ...invoiceWhere,
        customerId: { not: null },
      },
      _sum: { total: true, netRevenue: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    });

    const customerIds = topCustomersData
      .map((c) => c.customerId)
      .filter(Boolean) as number[];
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
    });

    const topCustomers = topCustomersData.map((c) => {
      const customer = customers.find((cust) => cust.id === c.customerId);
      return {
        customerId: c.customerId,
        name: customer?.name || 'عميل غير مسجل',
        type: customer?.type || 'RETAIL',
        totalRevenue: Number(c._sum.total || 0),
        netRevenue: Number(c._sum.netRevenue || c._sum.total || 0),
        orderCount: c._count,
      };
    });

    // Count invoices with vs without customers (new vs walk-in)
    const [withCustomer, withoutCustomer] = await Promise.all([
      this.prisma.salesInvoice.count({
        where: { ...invoiceWhere, customerId: { not: null } },
      }),
      this.prisma.salesInvoice.count({
        where: { ...invoiceWhere, customerId: null },
      }),
    ]);

    return {
      totalCustomers,
      customersByType: customersByType.map((ct) => ({
        type: ct.type,
        count: ct._count,
      })),
      topCustomers,
      registeredSales: withCustomer,
      walkInSales: withoutCustomer,
    };
  }

  /**
   * Get returns analysis - breakdown by type, top returned products
   */
  async getReturnsAnalysis(params?: {
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

    // Get returns summary
    const returnsAgg = await this.prisma.salesReturn.aggregate({
      where,
      _sum: { totalRefund: true },
      _count: true,
    });

    // Get returns by type
    const returnLineWhere: any = {};
    if (branchId) returnLineWhere.salesReturn = { branchId };
    if (startDate || endDate) {
      returnLineWhere.salesReturn = {
        ...returnLineWhere.salesReturn,
        createdAt: {},
      };
      if (startDate) returnLineWhere.salesReturn.createdAt.gte = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        returnLineWhere.salesReturn.createdAt.lte = endOfDay;
      }
    }

    const returnsByType = await this.prisma.salesReturnLine.groupBy({
      by: ['returnType'],
      where: returnLineWhere,
      _sum: { refundAmount: true, qtyReturned: true },
      _count: true,
    });

    // Get top returned products
    const topReturnedProducts = await this.prisma.salesReturnLine.groupBy({
      by: ['productId'],
      where: returnLineWhere,
      _sum: { refundAmount: true, qtyReturned: true },
      _count: true,
      orderBy: { _sum: { qtyReturned: 'desc' } },
      take: 10,
    });

    const productIds = topReturnedProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const topReturned = topReturnedProducts.map((p) => {
      const product = products.find((prod) => prod.id === p.productId);
      return {
        productId: p.productId,
        productName: product?.nameAr || product?.nameEn || 'Unknown',
        qtyReturned: p._sum.qtyReturned || 0,
        refundAmount: Number(p._sum.refundAmount || 0),
        returnCount: p._count,
      };
    });

    // Calculate return rate (returns / sales ratio)
    const salesTotal = await this.prisma.salesInvoice.aggregate({
      where: branchId
        ? { branchId, createdAt: where.createdAt }
        : { createdAt: where.createdAt },
      _sum: { total: true },
    });

    const totalSalesValue = Number(salesTotal._sum.total || 0);
    const totalReturnsValue = Number(returnsAgg._sum.totalRefund || 0);
    const returnRate =
      totalSalesValue > 0 ? (totalReturnsValue / totalSalesValue) * 100 : 0;

    return {
      totalReturnsValue,
      totalReturnsCount: returnsAgg._count,
      returnRate: Math.round(returnRate * 100) / 100,
      returnsByType: returnsByType.map((rt) => ({
        type: rt.returnType,
        count: rt._count,
        qty: rt._sum.qtyReturned || 0,
        value: Number(rt._sum.refundAmount || 0),
      })),
      topReturnedProducts: topReturned,
    };
  }

  /**
   * Get daily sales trend for charts
   */
  async getDailySalesTrend(params?: {
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { branchId, startDate, endDate } = params || {};

    // Default to last 30 days if no dates provided
    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const where: any = { createdAt: { gte: start, lte: end } };
    if (branchId) where.branchId = branchId;

    const invoices = await this.prisma.salesInvoice.findMany({
      where,
      select: {
        createdAt: true,
        total: true,
        netRevenue: true,
        grossProfit: true,
      },
    });

    // Group by date
    const dailyMap = new Map<
      string,
      { total: number; count: number; profit: number }
    >();

    for (const inv of invoices) {
      const dateKey = inv.createdAt.toISOString().split('T')[0];
      const current = dailyMap.get(dateKey) || {
        total: 0,
        count: 0,
        profit: 0,
      };
      current.total += Number(inv.netRevenue || inv.total || 0);
      current.count += 1;
      current.profit += Number(inv.grossProfit || 0);
      dailyMap.set(dateKey, current);
    }

    // Fill in missing dates with zeros
    const result: Array<{
      date: string;
      total: number;
      count: number;
      profit: number;
    }> = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const data = dailyMap.get(dateKey) || { total: 0, count: 0, profit: 0 };
      result.push({
        date: dateKey,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
        profit: Math.round(data.profit * 100) / 100,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Get profit breakdown by category
   */
  async getProfitByCategory(params?: {
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { branchId, startDate, endDate } = params || {};
    const lineWhere: any = {};

    if (branchId) lineWhere.salesInvoice = { branchId };
    if (startDate || endDate) {
      lineWhere.salesInvoice = {
        ...lineWhere.salesInvoice,
        createdAt: {},
      };
      if (startDate) lineWhere.salesInvoice.createdAt.gte = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        lineWhere.salesInvoice.createdAt.lte = endOfDay;
      }
    }

    const salesLines = await this.prisma.salesLine.findMany({
      where: lineWhere,
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    const categoryMap = new Map<
      string,
      { revenue: number; cost: number; profit: number; qty: number }
    >();

    for (const line of salesLines) {
      const categoryName =
        line.product.category?.nameAr ||
        line.product.category?.name ||
        'غير مصنف';
      const current = categoryMap.get(categoryName) || {
        revenue: 0,
        cost: 0,
        profit: 0,
        qty: 0,
      };

      const lineRevenue = Number(line.lineTotal || 0);
      const lineCost = Number(line.product.costAvg || 0) * line.qty;
      const lineProfit = lineRevenue - lineCost;

      current.revenue += lineRevenue;
      current.cost += lineCost;
      current.profit += lineProfit;
      current.qty += line.qty;
      categoryMap.set(categoryName, current);
    }

    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        category: name,
        revenue: Math.round(data.revenue * 100) / 100,
        cost: Math.round(data.cost * 100) / 100,
        profit: Math.round(data.profit * 100) / 100,
        qty: data.qty,
        margin:
          data.revenue > 0
            ? Math.round((data.profit / data.revenue) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }

  /**
   * Get comparison with previous period
   */
  async getPeriodComparison(params?: {
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { branchId, startDate, endDate } = params || {};

    if (!startDate || !endDate) {
      return null;
    }

    // Calculate previous period with same duration
    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - periodDuration);
    const prevEnd = new Date(startDate.getTime() - 1);

    const where: any = {};
    if (branchId) where.branchId = branchId;

    // Current period
    const currentPeriod = await this.prisma.salesInvoice.aggregate({
      where: {
        ...where,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { total: true, netRevenue: true, grossProfit: true },
      _count: true,
    });

    // Previous period
    const previousPeriod = await this.prisma.salesInvoice.aggregate({
      where: {
        ...where,
        createdAt: { gte: prevStart, lte: prevEnd },
      },
      _sum: { total: true, netRevenue: true, grossProfit: true },
      _count: true,
    });

    const currentRevenue = Number(
      currentPeriod._sum.netRevenue || currentPeriod._sum.total || 0,
    );
    const previousRevenue = Number(
      previousPeriod._sum.netRevenue || previousPeriod._sum.total || 0,
    );
    const currentProfit = Number(currentPeriod._sum.grossProfit || 0);
    const previousProfit = Number(previousPeriod._sum.grossProfit || 0);

    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const profitChange =
      previousProfit > 0
        ? ((currentProfit - previousProfit) / previousProfit) * 100
        : currentProfit > 0
          ? 100
          : 0;

    const orderChange =
      previousPeriod._count > 0
        ? ((currentPeriod._count - previousPeriod._count) /
            previousPeriod._count) *
          100
        : currentPeriod._count > 0
          ? 100
          : 0;

    return {
      current: {
        revenue: Math.round(currentRevenue * 100) / 100,
        profit: Math.round(currentProfit * 100) / 100,
        orders: currentPeriod._count,
      },
      previous: {
        revenue: Math.round(previousRevenue * 100) / 100,
        profit: Math.round(previousProfit * 100) / 100,
        orders: previousPeriod._count,
      },
      changes: {
        revenueChange: Math.round(revenueChange * 100) / 100,
        profitChange: Math.round(profitChange * 100) / 100,
        orderChange: Math.round(orderChange * 100) / 100,
        revenueDirection:
          revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'same',
        profitDirection:
          profitChange > 0 ? 'up' : profitChange < 0 ? 'down' : 'same',
        orderDirection:
          orderChange > 0 ? 'up' : orderChange < 0 ? 'down' : 'same',
      },
    };
  }

  /**
   * Get comprehensive enhanced dashboard metrics
   */
  async getEnhancedDashboardMetrics(params?: {
    branchId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { branchId, startDate, endDate } = params || {};

    const [
      basicMetrics,
      customerAnalytics,
      returnsAnalysis,
      dailyTrend,
      profitByCategory,
      periodComparison,
    ] = await Promise.all([
      this.getDashboardMetrics({ branchId, startDate, endDate }),
      this.getCustomerAnalytics({ branchId, startDate, endDate }),
      this.getReturnsAnalysis({ branchId, startDate, endDate }),
      this.getDailySalesTrend({ branchId, startDate, endDate }),
      this.getProfitByCategory({ branchId, startDate, endDate }),
      this.getPeriodComparison({ branchId, startDate, endDate }),
    ]);

    return {
      ...basicMetrics,
      customers: customerAnalytics,
      returns: returnsAnalysis,
      trends: {
        dailySales: dailyTrend,
      },
      profitByCategory,
      comparison: periodComparison,
    };
  }
}
