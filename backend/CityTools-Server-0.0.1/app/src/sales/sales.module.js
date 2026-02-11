"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const sales_controller_1 = require("./sales.controller");
const returns_service_1 = require("./returns.service");
const returns_controller_1 = require("./returns.controller");
const prisma_service_1 = require("../prisma.service");
const product_audit_service_1 = require("../products/product-audit.service");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        controllers: [sales_controller_1.SalesController, returns_controller_1.ReturnsController],
        providers: [
            sales_service_1.SalesService,
            returns_service_1.ReturnsService,
            prisma_service_1.PrismaService,
            product_audit_service_1.ProductAuditService,
        ],
        exports: [sales_service_1.SalesService, returns_service_1.ReturnsService],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map