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
exports.CategoryPriceUpdateDto = exports.BulkPriceUpdateDto = exports.PriceUpdateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PriceUpdateDto {
}
exports.PriceUpdateDto = PriceUpdateDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceUpdateDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceUpdateDto.prototype, "priceRetail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceUpdateDto.prototype, "priceWholesale", void 0);
class BulkPriceUpdateDto {
}
exports.BulkPriceUpdateDto = BulkPriceUpdateDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PriceUpdateDto),
    __metadata("design:type", Array)
], BulkPriceUpdateDto.prototype, "updates", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkPriceUpdateDto.prototype, "reason", void 0);
class CategoryPriceUpdateDto {
}
exports.CategoryPriceUpdateDto = CategoryPriceUpdateDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CategoryPriceUpdateDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CategoryPriceUpdateDto.prototype, "adjustment", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PERCENTAGE', 'FIXED']),
    __metadata("design:type", String)
], CategoryPriceUpdateDto.prototype, "adjustmentType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['RETAIL', 'WHOLESALE']),
    __metadata("design:type", String)
], CategoryPriceUpdateDto.prototype, "priceType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryPriceUpdateDto.prototype, "reason", void 0);
//# sourceMappingURL=price-management.dto.js.map