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
exports.ProductAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ProductAuditService = class ProductAuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProductAuditHistory(productId) {
        return this.prisma.productAudit.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getFormattedAuditHistory(productId) {
        const audits = await this.getProductAuditHistory(productId);
        return audits.map((audit) => {
            const changes = this.extractChanges(audit.oldData, audit.newData);
            return {
                id: audit.id,
                action: audit.action,
                changes,
                user: audit.user,
                timestamp: audit.createdAt,
                product: audit.product,
            };
        });
    }
    extractChanges(oldData, newData) {
        if (!oldData || !newData)
            return [];
        const changes = [];
        const fieldsToTrack = [
            'nameEn', 'nameAr', 'barcode', 'code',
            'priceRetail', 'priceWholesale', 'cost',
            'brand', 'unit', 'active', 'minQty', 'maxQty'
        ];
        for (const field of fieldsToTrack) {
            const oldValue = oldData[field];
            const newValue = newData[field];
            const areEqual = this.compareValues(oldValue, newValue);
            if (!areEqual) {
                changes.push({
                    field,
                    oldValue: oldValue,
                    newValue: newValue,
                });
            }
        }
        return changes;
    }
    compareValues(val1, val2) {
        if (val1 == null && val2 == null)
            return true;
        if (val1 == null || val2 == null)
            return false;
        if (typeof val1 === 'number' || typeof val2 === 'number') {
            return Number(val1) === Number(val2);
        }
        if (typeof val1 === 'boolean' || typeof val2 === 'boolean') {
            return Boolean(val1) === Boolean(val2);
        }
        return String(val1) === String(val2);
    }
    async logChange(productId, action, newData, oldData, userId) {
        try {
            const cleanNewData = this.cleanDataForAudit(newData);
            const cleanOldData = this.cleanDataForAudit(oldData);
            console.log('📝 Creating audit log:', {
                productId,
                action,
                userId,
                changes: this.extractChanges(cleanOldData, cleanNewData),
            });
            const audit = await this.prisma.productAudit.create({
                data: {
                    productId,
                    action,
                    newData: cleanNewData,
                    oldData: cleanOldData,
                    userId,
                },
            });
            console.log('✅ Audit log created successfully:', audit.id);
            return audit;
        }
        catch (error) {
            console.error('❌ Failed to create audit log:', error);
            throw error;
        }
    }
    cleanDataForAudit(data) {
        if (!data)
            return undefined;
        return {
            id: data.id,
            code: data.code,
            barcode: data.barcode,
            nameEn: data.nameEn,
            nameAr: data.nameAr,
            brand: data.brand,
            unit: data.unit,
            cost: Number(data.cost),
            priceRetail: Number(data.priceRetail),
            priceWholesale: Number(data.priceWholesale),
            minQty: data.minQty,
            maxQty: data.maxQty,
            active: data.active,
            categoryId: data.categoryId,
            itemTypeId: data.itemTypeId,
        };
    }
};
exports.ProductAuditService = ProductAuditService;
exports.ProductAuditService = ProductAuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductAuditService);
//# sourceMappingURL=product-audit.service.js.map