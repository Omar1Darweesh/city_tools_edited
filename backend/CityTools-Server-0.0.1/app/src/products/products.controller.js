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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const product_dto_1 = require("./dto/product.dto");
const hierarchy_dto_1 = require("./dto/hierarchy.dto");
const price_management_dto_1 = require("./dto/price-management.dto");
const price_management_service_1 = require("./price-management.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ProductsController = class ProductsController {
    constructor(productsService, priceManagementService) {
        this.productsService = productsService;
        this.priceManagementService = priceManagementService;
    }
    findAllCategories() {
        return this.productsService.findAllCategories();
    }
    findCategoryById(id) {
        return this.productsService.findCategoryById(id);
    }
    createCategory(data) {
        return this.productsService.createCategory(data);
    }
    updateCategory(id, data) {
        return this.productsService.updateCategory(id, data);
    }
    removeCategory(id) {
        return this.productsService.removeCategory(id);
    }
    findAllSubcategories(categoryId) {
        return this.productsService.findAllSubcategories(categoryId ? Number(categoryId) : undefined);
    }
    findSubcategoryById(id) {
        return this.productsService.findSubcategoryById(id);
    }
    createSubcategory(data) {
        return this.productsService.createSubcategory(data);
    }
    updateSubcategory(id, data) {
        return this.productsService.updateSubcategory(id, data);
    }
    removeSubcategory(id) {
        return this.productsService.removeSubcategory(id);
    }
    findAllItemTypes(subcategoryId) {
        return this.productsService.findAllItemTypes(subcategoryId ? Number(subcategoryId) : undefined);
    }
    findItemTypeById(id) {
        return this.productsService.findItemTypeById(id);
    }
    createItemType(data) {
        return this.productsService.createItemType(data);
    }
    updateItemType(id, data) {
        return this.productsService.updateItemType(id, data);
    }
    removeItemType(id) {
        return this.productsService.removeItemType(id);
    }
    create(createProductDto) {
        return this.productsService.create(createProductDto);
    }
    findAll(skip, take, search, categoryId, subcategoryId, itemTypeId, active, branchId) {
        return this.productsService.findAll({
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
            search,
            categoryId: categoryId ? Number(categoryId) : undefined,
            subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
            itemTypeId: itemTypeId ? Number(itemTypeId) : undefined,
            active: active !== undefined ? active === 'true' : undefined,
            branchId: branchId ? Number(branchId) : undefined,
        });
    }
    findByBarcode(barcode) {
        return this.productsService.findByBarcode(barcode);
    }
    findByIdentifier(identifier, branchId) {
        return this.productsService.findByIdentifier(identifier, branchId ? Number(branchId) : undefined);
    }
    findOne(id, branchId) {
        return this.productsService.findOne(id, branchId ? Number(branchId) : undefined);
    }
    update(id, updateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }
    remove(id) {
        return this.productsService.remove(id);
    }
    bulkUpdatePrices(dto, req) {
        return this.priceManagementService.bulkUpdatePrices({
            ...dto,
            userId: req.user?.id || 1,
        });
    }
    updatePricesByCategory(dto, req) {
        return this.priceManagementService.updatePricesByCategory({
            ...dto,
            userId: req.user?.id || 1,
        });
    }
    getPriceHistory(id) {
        return this.priceManagementService.getPriceHistory(id);
    }
    async getProductTransactions(id, type, startDate, endDate) {
        return this.productsService.getProductTransactions(id, {
            type,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    async getTransactionSummary(id) {
        return this.productsService.getTransactionSummary(id);
    }
    async getAuditHistory(id) {
        return this.productsService.getAuditHistory(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findCategoryById", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hierarchy_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, hierarchy_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Get)('subcategories'),
    __param(0, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllSubcategories", null);
__decorate([
    (0, common_1.Get)('subcategories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findSubcategoryById", null);
__decorate([
    (0, common_1.Post)('subcategories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hierarchy_dto_1.CreateSubcategoryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createSubcategory", null);
__decorate([
    (0, common_1.Patch)('subcategories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, hierarchy_dto_1.UpdateSubcategoryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateSubcategory", null);
__decorate([
    (0, common_1.Delete)('subcategories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeSubcategory", null);
__decorate([
    (0, common_1.Get)('item-types'),
    __param(0, (0, common_1.Query)('subcategoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllItemTypes", null);
__decorate([
    (0, common_1.Get)('item-types/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findItemTypeById", null);
__decorate([
    (0, common_1.Post)('item-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hierarchy_dto_1.CreateItemTypeDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createItemType", null);
__decorate([
    (0, common_1.Patch)('item-types/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, hierarchy_dto_1.UpdateItemTypeDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateItemType", null);
__decorate([
    (0, common_1.Delete)('item-types/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeItemType", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('subcategoryId')),
    __param(5, (0, common_1.Query)('itemTypeId')),
    __param(6, (0, common_1.Query)('active')),
    __param(7, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-barcode/:barcode'),
    __param(0, (0, common_1.Param)('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Get)('find/:identifier'),
    __param(0, (0, common_1.Param)('identifier')),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findByIdentifier", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('prices/bulk-update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_management_dto_1.BulkPriceUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "bulkUpdatePrices", null);
__decorate([
    (0, common_1.Put)('prices/category'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_management_dto_1.CategoryPriceUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updatePricesByCategory", null);
__decorate([
    (0, common_1.Get)(':id/price-history'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getPriceHistory", null);
__decorate([
    (0, common_1.Get)(':id/transactions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProductTransactions", null);
__decorate([
    (0, common_1.Get)(':id/transactions/summary'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getTransactionSummary", null);
__decorate([
    (0, common_1.Get)(':id/audit-history'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAuditHistory", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        price_management_service_1.PriceManagementService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map