import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  getSalesSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportsService.getSalesSummary({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      branchId: branchId ? parseInt(branchId, 10) : undefined,
    });
  }

  @Get('top-products')
  getTopProducts(
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getTopProducts({
      limit: limit ? parseInt(limit, 10) : undefined,
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('low-stock')
  getLowStockProducts(
    @Query('threshold') threshold?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportsService.getLowStockProducts({
      threshold: threshold ? parseInt(threshold, 10) : undefined,
      branchId: branchId ? parseInt(branchId, 10) : undefined,
    });
  }

  @Get('dashboard')
  getDashboardMetrics(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDashboardMetrics({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('dashboard-summary')
  getDashboardSummary(@Query('branchId') branchId?: string) {
    return this.reportsService.getDashboardSummary({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
    });
  }

  // ✅ NEW: Export endpoint for JSON data (no warnings!)
  @Get('export/json')
  async exportJSON(
    @Query('reportType') reportType: string = 'dashboard',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
  ) {
    const params = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      branchId: branchId ? parseInt(branchId, 10) : undefined,
    };

    let data: any;

    switch (reportType) {
      case 'sales':
        data = await this.reportsService.getSalesSummary(params);
        break;
      case 'top-products':
        data = await this.reportsService.getTopProducts({
          limit: 20,
          ...params,
        });
        break;
      case 'low-stock':
        data = await this.reportsService.getLowStockProducts({
          threshold: 10,
          branchId: params.branchId,
        });
        break;
      case 'dashboard':
      default:
        data = await this.reportsService.getDashboardMetrics(params);
        break;
    }

    return data;
  }

  // ========== NEW ENHANCED ENDPOINTS ==========

  @Get('enhanced')
  getEnhancedDashboardMetrics(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getEnhancedDashboardMetrics({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('customers')
  getCustomerAnalytics(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getCustomerAnalytics({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('returns-analysis')
  getReturnsAnalysis(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getReturnsAnalysis({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('daily-trend')
  getDailySalesTrend(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDailySalesTrend({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('profit-by-category')
  getProfitByCategory(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getProfitByCategory({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('comparison')
  getPeriodComparison(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPeriodComparison({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // ✅ NEW: Platform Sales Details Report
  @Get('platform-sales')
  getPlatformSalesDetails(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('includeComparison') includeComparison?: string,
  ) {
    return this.reportsService.getPlatformSalesDetails({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      includePeriodComparison: includeComparison !== 'false', // Default true
    });
  }
}
