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
exports.PriceManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const product_audit_service_1 = require("./product-audit.service");
let PriceManagementService = class PriceManagementService {
    constructor(prisma, productAudit) {
        this.prisma = prisma;
        this.productAudit = productAudit;
    }
    async bulkUpdatePrices(data) {
        return this.prisma.$transaction(async (tx) => {
            const results = [];
            for (const update of data.updates) {
                const product = await tx.product.findUnique({
                    where: { id: update.productId },
                });
                if (!product)
                    continue;
                const oldData = {
                    id: product.id,
                    code: product.code,
                    barcode: product.barcode,
                    nameEn: product.nameEn,
                    nameAr: product.nameAr,
                    brand: product.brand,
                    unit: product.unit,
                    cost: Number(product.cost),
                    priceRetail: Number(product.priceRetail),
                    priceWholesale: Number(product.priceWholesale),
                    minQty: product.minQty,
                    maxQty: product.maxQty,
                    active: product.active,
                    categoryId: product.categoryId,
                    itemTypeId: product.itemTypeId,
                };
                if (update.priceRetail !== undefined && update.priceRetail !== Number(product.priceRetail)) {
                    await tx.priceHistory.create({
                        data: {
                            productId: update.productId,
                            oldPrice: product.priceRetail,
                            newPrice: update.priceRetail,
                            priceType: 'RETAIL',
                            changedBy: data.userId,
                            reason: data.reason,
                        },
                    });
                }
                if (update.priceWholesale !== undefined && update.priceWholesale !== Number(product.priceWholesale)) {
                    await tx.priceHistory.create({
                        data: {
                            productId: update.productId,
                            oldPrice: product.priceWholesale,
                            newPrice: update.priceWholesale,
                            priceType: 'WHOLESALE',
                            changedBy: data.userId,
                            reason: data.reason,
                        },
                    });
                }
                const updated = await tx.product.update({
                    where: { id: update.productId },
                    data: {
                        priceRetail: update.priceRetail ?? product.priceRetail,
                        priceWholesale: update.priceWholesale ?? product.priceWholesale,
                    },
                });
                const newData = {
                    ...oldData,
                    priceRetail: Number(updated.priceRetail),
                    priceWholesale: Number(updated.priceWholesale),
                };
                results.push({
                    updated,
                    oldData,
                    newData,
                });
            }
            return results;
        }).then(async (results) => {
            for (const result of results) {
                try {
                    await this.productAudit.logChange(result.updated.id, 'UPDATE', result.newData, result.oldData, data.userId);
                }
                catch (error) {
                    console.error(`Failed to log audit for product ${result.updated.id}:`, error);
                }
            }
            return results.map(r => r.updated);
        });
    }
    async getPriceHistory(productId) {
        return this.prisma.priceHistory.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updatePricesByCategory(data) {
        const products = await this.prisma.product.findMany({
            where: { categoryId: data.categoryId },
        });
        const updates = products.map(product => {
            const currentPrice = data.priceType === 'RETAIL' ? Number(product.priceRetail) : Number(product.priceWholesale);
            const newPrice = data.adjustmentType === 'PERCENTAGE'
                ? currentPrice * (1 + data.adjustment / 100)
                : currentPrice + data.adjustment;
            return {
                productId: product.id,
                [data.priceType === 'RETAIL' ? 'priceRetail' : 'priceWholesale']: Math.round(newPrice * 100) / 100,
            };
        });
        return this.bulkUpdatePrices({
            updates,
            userId: data.userId,
            reason: data.reason,
        });
    }
};
exports.PriceManagementService = PriceManagementService;
exports.PriceManagementService = PriceManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        product_audit_service_1.ProductAuditService])
], PriceManagementService);
//# sourceMappingURL=price-management.service.js.map