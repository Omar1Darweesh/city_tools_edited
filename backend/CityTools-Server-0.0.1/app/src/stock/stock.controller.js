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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const stock_service_1 = require("./stock.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const stock_dto_1 = require("./dto/stock.dto");
const class_validator_1 = require("class-validator");
class CreateAdjustmentDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdjustmentDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAdjustmentDto.prototype, "stockLocationId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAdjustmentDto.prototype, "qtyChange", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAdjustmentDto.prototype, "notes", void 0);
let StockController = class StockController {
    constructor(stockService) {
        this.stockService = stockService;
    }
    getStockOnHand(productId, stockLocationId, branchId) {
        return this.stockService.getStockOnHand({
            productId: productId ? parseInt(productId) : undefined,
            stockLocationId: stockLocationId ? parseInt(stockLocationId) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
        });
    }
    createAdjustment(createAdjustmentDto, req) {
        return this.stockService.createAdjustment({
            ...createAdjustmentDto,
            userId: req.user.userId,
        });
    }
    createBatchAdjustment(dto, req) {
        return this.stockService.createBatchAdjustment({
            ...dto,
            userId: req.user.userId,
        });
    }
    createTransfer(dto, req) {
        return this.stockService.createTransfer({
            ...dto,
            userId: req.user.userId,
        });
    }
    getLocations(branchId) {
        return this.stockService.getLocations(branchId ? parseInt(branchId) : undefined);
    }
    getMovementHistory(productId, stockLocationId, movementType, skip, take) {
        return this.stockService.getMovementHistory({
            productId: productId ? parseInt(productId) : undefined,
            stockLocationId: stockLocationId ? parseInt(stockLocationId) : undefined,
            movementType: movementType,
            skip: skip ? parseInt(skip) : undefined,
            take: take ? parseInt(take) : undefined,
        });
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Get)('on-hand'),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('stockLocationId')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getStockOnHand", null);
__decorate([
    (0, common_1.Post)('adjustments'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAdjustmentDto, Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "createAdjustment", null);
__decorate([
    (0, common_1.Post)('adjustments/batch'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_dto_1.CreateBatchAdjustmentDto, Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "createBatchAdjustment", null);
__decorate([
    (0, common_1.Post)('transfers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_dto_1.CreateTransferDto, Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "createTransfer", null);
__decorate([
    (0, common_1.Get)('locations'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)('movements'),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('stockLocationId')),
    __param(2, (0, common_1.Query)('movementType')),
    __param(3, (0, common_1.Query)('skip')),
    __param(4, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getMovementHistory", null);
exports.StockController = StockController = __decorate([
    (0, common_1.Controller)('stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map