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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const sales_dto_1 = require("./dto/sales.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SalesController = class SalesController {
    constructor(salesService) {
        this.salesService = salesService;
    }
    createSale(createSaleDto, req) {
        return this.salesService.createSale(createSaleDto, req.user.userId);
    }
    findAll(skip, take, branchId, customerId, search, paymentMethod, dateFilter, startDate, endDate) {
        return this.salesService.findAll({
            skip: skip ? parseInt(skip) : undefined,
            take: take ? parseInt(take) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
            customerId: customerId ? parseInt(customerId) : undefined,
            search,
            paymentMethod,
            dateFilter,
            startDate,
            endDate,
        });
    }
    findOne(id) {
        return this.salesService.findOne(id);
    }
    getDailySummary(branchId, date) {
        const targetDate = date ? new Date(date) : new Date();
        return this.salesService.getDailySummary(branchId, targetDate);
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)('sales'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sales_dto_1.CreateSaleDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createSale", null);
__decorate([
    (0, common_1.Get)('sales'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('customerId')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('paymentMethod')),
    __param(6, (0, common_1.Query)('dateFilter')),
    __param(7, (0, common_1.Query)('startDate')),
    __param(8, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('sales/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('daily-summary'),
    __param(0, (0, common_1.Query)('branchId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "getDailySummary", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)('pos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map