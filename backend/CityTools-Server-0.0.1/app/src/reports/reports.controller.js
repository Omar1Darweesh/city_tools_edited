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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getSalesSummary(startDate, endDate, branchId) {
        return this.reportsService.getSalesSummary({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
        });
    }
    getTopProducts(limit, branchId, startDate, endDate) {
        return this.reportsService.getTopProducts({
            limit: limit ? parseInt(limit) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    getLowStockProducts(threshold, branchId) {
        return this.reportsService.getLowStockProducts({
            threshold: threshold ? parseInt(threshold) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
        });
    }
    getDashboardMetrics(branchId, startDate, endDate) {
        return this.reportsService.getDashboardMetrics({
            branchId: branchId ? parseInt(branchId) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    getDashboardSummary(branchId) {
        return this.reportsService.getDashboardSummary({
            branchId: branchId ? parseInt(branchId) : undefined,
        });
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('sales-summary'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSalesSummary", null);
__decorate([
    (0, common_1.Get)('top-products'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    __param(0, (0, common_1.Query)('threshold')),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getLowStockProducts", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboardMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard-summary'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboardSummary", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map