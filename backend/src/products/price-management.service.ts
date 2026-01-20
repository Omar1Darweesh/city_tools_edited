import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductAuditService } from './product-audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class PriceManagementService {
    constructor(
        private prisma: PrismaService,
        private productAudit: ProductAuditService,
    ) { }

    async bulkUpdatePrices(data: {
        updates: Array<{
            productId: number;
            priceRetail?: number;
            priceWholesale?: number;
        }>;
        userId: number;
        reason?: string;
    }) {
        return this.prisma.$transaction(async (tx) => {
            const results = [];

            for (const update of data.updates) {
                const product = await tx.product.findUnique({
                    where: { id: update.productId },
                });

                if (!product) continue;

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

                // Record price history for retail
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

                // Record price history for wholesale
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

                // Update product prices
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
                    await this.productAudit.logChange(
                        result.updated.id,
                        'UPDATE' as AuditAction,
                        result.newData,
                        result.oldData,
                        data.userId,
                    );
                } catch (error) {
                    console.error(`Failed to log audit for product ${result.updated.id}:`, error);
                }
            }
            return results.map(r => r.updated);
        });
    }

    async getPriceHistory(productId: number) {
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

    // ✅ NEW: Enhanced hierarchy-based price update
    async updatePricesByHierarchy(data: {
        categoryId?: number;
        subcategoryId?: number;
        itemTypeId?: number;
        adjustment: number;
        adjustmentType: 'PERCENTAGE' | 'FIXED';
        operation: 'INCREASE' | 'DECREASE';
        priceType: 'RETAIL' | 'WHOLESALE' | 'BOTH';
        userId: number;
        reason?: string;
    }) {
        // Build WHERE clause based on hierarchy
        const where: any = { active: true };

        if (data.itemTypeId) {
            where.itemTypeId = data.itemTypeId;
        } else if (data.subcategoryId) {
            where.itemType = {
                subcategoryId: data.subcategoryId,
            };
        } else if (data.categoryId) {
            where.OR = [
                { categoryId: data.categoryId },
                {
                    itemType: {
                        subcategory: {
                            categoryId: data.categoryId,
                        },
                    },
                },
            ];
        } else {
            throw new BadRequestException('Must provide categoryId, subcategoryId, or itemTypeId');
        }

        // Fetch products
        const products = await this.prisma.product.findMany({ where });

        if (products.length === 0) {
            return { updated: 0, products: [] };
        }

        // Calculate new prices
        const updates = products.map(product => {
            const adjustmentValue = data.operation === 'DECREASE' ? -Math.abs(data.adjustment) : Math.abs(data.adjustment);

            const update: any = { productId: product.id };

            if (data.priceType === 'RETAIL' || data.priceType === 'BOTH') {
                const currentPrice = Number(product.priceRetail);
                const newPrice = data.adjustmentType === 'PERCENTAGE'
                    ? currentPrice * (1 + adjustmentValue / 100)
                    : currentPrice + adjustmentValue;
                update.priceRetail = Math.max(0, Math.round(newPrice * 100) / 100);
            }

            if (data.priceType === 'WHOLESALE' || data.priceType === 'BOTH') {
                const currentPrice = Number(product.priceWholesale);
                const newPrice = data.adjustmentType === 'PERCENTAGE'
                    ? currentPrice * (1 + adjustmentValue / 100)
                    : currentPrice + adjustmentValue;
                update.priceWholesale = Math.max(0, Math.round(newPrice * 100) / 100);
            }

            return update;
        });

        // Execute bulk update
        const updated = await this.bulkUpdatePrices({
            updates,
            userId: data.userId,
            reason: data.reason,
        });

        return {
            updated: updated.length,
            products: updated,
        };
    }

    // Keep for backward compatibility
    async updatePricesByCategory(data: {
        categoryId: number;
        adjustment: number;
        adjustmentType: 'PERCENTAGE' | 'FIXED';
        priceType: 'RETAIL' | 'WHOLESALE';
        userId: number;
        reason?: string;
    }) {
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
}
