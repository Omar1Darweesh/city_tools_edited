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
exports.PurchasingController = void 0;
const common_1 = require("@nestjs/common");
const purchasing_service_1 = require("./purchasing.service");
const purchasing_dto_1 = require("./dto/purchasing.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PurchasingController = class PurchasingController {
    constructor(purchasingService) {
        this.purchasingService = purchasingService;
    }
    createSupplier(createSupplierDto) {
        return this.purchasingService.createSupplier(createSupplierDto);
    }
    findAllSuppliers(skip, take, active, search) {
        return this.purchasingService.findAllSuppliers({
            skip: skip ? parseInt(skip) : undefined,
            take: take ? parseInt(take) : undefined,
            active: active !== undefined ? active === 'true' : undefined,
            search,
        });
    }
    findOneSupplier(id) {
        return this.purchasingService.findOneSupplier(id);
    }
    updateSupplier(id, data) {
        return this.purchasingService.updateSupplier(id, data);
    }
    removeSupplier(id) {
        return this.purchasingService.removeSupplier(id);
    }
    createGRN(createGRNDto, req) {
        return this.purchasingService.createGRN(createGRNDto, req.user.userId);
    }
    findAllGRNs(skip, take, branchId) {
        return this.purchasingService.findAllGRNs({
            skip: skip ? parseInt(skip) : undefined,
            take: take ? parseInt(take) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
        });
    }
    findOneGRN(id) {
        return this.purchasingService.findOneGRN(id);
    }
};
exports.PurchasingController = PurchasingController;
__decorate([
    (0, common_1.Post)('suppliers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchasing_dto_1.CreateSupplierDto]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Get)('suppliers'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('active')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "findAllSuppliers", null);
__decorate([
    (0, common_1.Get)('suppliers/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "findOneSupplier", null);
__decorate([
    (0, common_1.Patch)('suppliers/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Delete)('suppliers/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "removeSupplier", null);
__decorate([
    (0, common_1.Post)('grn'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchasing_dto_1.CreateGRNDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "createGRN", null);
__decorate([
    (0, common_1.Get)('grn'),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "findAllGRNs", null);
__decorate([
    (0, common_1.Get)('grn/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "findOneGRN", null);
exports.PurchasingController = PurchasingController = __decorate([
    (0, common_1.Controller)('purchasing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [purchasing_service_1.PurchasingService])
], PurchasingController);
//# sourceMappingURL=purchasing.controller.js.map