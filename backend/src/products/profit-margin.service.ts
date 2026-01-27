import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductAuditService } from './product-audit.service';

export interface EffectiveMargins {
    retailMargin: number;
    wholesaleMargin: number;
    source: 'PRODUCT' | 'ITEM_TYPE' | 'SUBCATEGORY' | 'CATEGORY' | 'DEFAULT';
}

@Injectable()
export class ProfitMarginService {
    constructor(
        private prisma: PrismaService,
        private productAudit: ProductAuditService,
    ) { }

    /**
     * Calculate selling price from cost and margin
     * Formula: price = cost × (1 + margin)
     * Example: cost=100, margin=0.40 → price=140
     */
    private calculatePrice(cost: number, margin: number): number {
        if (margin < 0) {
            throw new BadRequestException('Profit margin cannot be negative');
        }
        return cost * (1 + margin);
    }

    /**
     * Get effective margin for a product by checking hierarchy
     * Priority: Product → ItemType → Subcategory → Category → Default
     */
    async getEffectiveMargins(productId: number): Promise<EffectiveMargins> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                itemType: {
                    include: {
                        subcategory: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            throw new BadRequestException(`Product with ID ${productId} not found`);
        }

        // Priority 1: Product-level margins
        if (
            product.retailMargin !== null &&
            product.retailMargin !== undefined &&
            product.wholesaleMargin !== null &&
            product.wholesaleMargin !== undefined
        ) {
            return {
                retailMargin: Number(product.retailMargin),
                wholesaleMargin: Number(product.wholesaleMargin),
                source: 'PRODUCT',
            };
        }

        // Priority 2: ItemType-level margins
        if (
            product.itemType?.defaultRetailMargin !== null &&
            product.itemType?.defaultRetailMargin !== undefined &&
            product.itemType?.defaultWholesaleMargin !== null &&
            product.itemType?.defaultWholesaleMargin !== undefined
        ) {
            return {
                retailMargin: Number(product.itemType.defaultRetailMargin),
                wholesaleMargin: Number(product.itemType.defaultWholesaleMargin),
                source: 'ITEM_TYPE',
            };
        }

        // Priority 3: Subcategory-level margins
        if (
            product.itemType?.subcategory?.defaultRetailMargin !== null &&
            product.itemType?.subcategory?.defaultRetailMargin !== undefined &&
            product.itemType?.subcategory?.defaultWholesaleMargin !== null &&
            product.itemType?.subcategory?.defaultWholesaleMargin !== undefined
        ) {
            return {
                retailMargin: Number(product.itemType.subcategory.defaultRetailMargin),
                wholesaleMargin: Number(product.itemType.subcategory.defaultWholesaleMargin),
                source: 'SUBCATEGORY',
            };
        }

        // Priority 4: Category-level margins
        if (
            product.category?.defaultRetailMargin !== null &&
            product.category?.defaultRetailMargin !== undefined &&
            product.category?.defaultWholesaleMargin !== null &&
            product.category?.defaultWholesaleMargin !== undefined
        ) {
            return {
                retailMargin: Number(product.category.defaultRetailMargin),
                wholesaleMargin: Number(product.category.defaultWholesaleMargin),
                source: 'CATEGORY',
            };
        }

        // Priority 5: System default
        return {
            retailMargin: 0.30, // 30% default
            wholesaleMargin: 0.15, // 15% default
            source: 'DEFAULT',
        };
    }

    /**
     * Update a single product's prices based on costAvg and effective margins
     */
    async updateProductPrices(productId: number, userId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new BadRequestException(`Product with ID ${productId} not found`);
        }

        const costAvg = Number(product.costAvg);

        if (costAvg <= 0) {
            console.log(`⚠️ Product ${productId} has zero or negative cost. Skipping price update.`);
            return product;
        }

        const { retailMargin, wholesaleMargin, source } = await this.getEffectiveMargins(productId);

        const newRetailPrice = this.calculatePrice(costAvg, retailMargin);
        const newWholesalePrice = this.calculatePrice(costAvg, wholesaleMargin);

        const oldRetailPrice = Number(product.priceRetail);
        const oldWholesalePrice = Number(product.priceWholesale);

        // Update product prices
        const updated = await this.prisma.product.update({
            where: { id: productId },
            data: {
                priceRetail: newRetailPrice,
                priceWholesale: newWholesalePrice,
            },
        });

        // Log audit if prices changed
        if (oldRetailPrice !== newRetailPrice || oldWholesalePrice !== newWholesalePrice) {
            await this.productAudit.logChange(
                productId,
                'UPDATE',
                {
                    priceRetail: newRetailPrice,
                    priceWholesale: newWholesalePrice,
                    marginSource: source,
                    retailMargin: `${(retailMargin * 100).toFixed(1)}%`,
                    wholesaleMargin: `${(wholesaleMargin * 100).toFixed(1)}%`,
                },
                {
                    priceRetail: oldRetailPrice,
                    priceWholesale: oldWholesalePrice,
                },
                userId,
            );

            console.log(
                `✅ Updated prices for product ${productId} (${product.nameEn}): ` +
                `Retail: ${oldRetailPrice.toFixed(2)} → ${newRetailPrice.toFixed(2)} | ` +
                `Wholesale: ${oldWholesalePrice.toFixed(2)} → ${newWholesalePrice.toFixed(2)} ` +
                `(Margin source: ${source})`
            );
        }

        return updated;
    }

    /**
     * Set profit margins at category level and update all products
     */
    async setCategoryMargins(data: {
        categoryId: number;
        retailMargin: number;
        wholesaleMargin: number;
        userId: number;
    }) {
        const { categoryId, retailMargin, wholesaleMargin, userId } = data;

        if (retailMargin < 0 || wholesaleMargin < 0) {
            throw new BadRequestException('Margins cannot be negative');
        }

        // Update category
        await this.prisma.category.update({
            where: { id: categoryId },
            data: {
                defaultRetailMargin: retailMargin,
                defaultWholesaleMargin: wholesaleMargin,
            },
        });

        console.log(`📊 Category ${categoryId} margins updated: Retail=${(retailMargin * 100).toFixed(1)}%, Wholesale=${(wholesaleMargin * 100).toFixed(1)}%`);

        // Find all products in this category (direct or via itemType)
        const products = await this.prisma.product.findMany({
            where: {
                OR: [
                    { categoryId: categoryId },
                    {
                        itemType: {
                            subcategory: {
                                categoryId: categoryId,
                            },
                        },
                    },
                ],
                active: true,
            },
        });

        console.log(`🔄 Updating ${products.length} products in category ${categoryId}...`);

        let updated = 0;
        for (const product of products) {
            try {
                await this.updateProductPrices(product.id, userId);
                updated++;
            } catch (error) {
                console.error(`❌ Failed to update product ${product.id}:`, error.message);
            }
        }

        return {
            message: `Updated margins for category and ${updated} products`,
            productsUpdated: updated,
        };
    }

    /**
     * Set profit margins at subcategory level
     */
    async setSubcategoryMargins(data: {
        subcategoryId: number;
        retailMargin: number;
        wholesaleMargin: number;
        userId: number;
    }) {
        const { subcategoryId, retailMargin, wholesaleMargin, userId } = data;

        if (retailMargin < 0 || wholesaleMargin < 0) {
            throw new BadRequestException('Margins cannot be negative');
        }

        await this.prisma.subcategory.update({
            where: { id: subcategoryId },
            data: {
                defaultRetailMargin: retailMargin,
                defaultWholesaleMargin: wholesaleMargin,
            },
        });

        console.log(`📊 Subcategory ${subcategoryId} margins updated: Retail=${(retailMargin * 100).toFixed(1)}%, Wholesale=${(wholesaleMargin * 100).toFixed(1)}%`);

        // Find all products with this subcategory (via itemType)
        const products = await this.prisma.product.findMany({
            where: {
                itemType: {
                    subcategoryId: subcategoryId,
                },
                active: true,
            },
        });

        console.log(`🔄 Updating ${products.length} products in subcategory ${subcategoryId}...`);

        let updated = 0;
        for (const product of products) {
            try {
                await this.updateProductPrices(product.id, userId);
                updated++;
            } catch (error) {
                console.error(`❌ Failed to update product ${product.id}:`, error.message);
            }
        }

        return {
            message: `Updated margins for subcategory and ${updated} products`,
            productsUpdated: updated,
        };
    }

    /**
     * Set profit margins at item type level
     */
    async setItemTypeMargins(data: {
        itemTypeId: number;
        retailMargin: number;
        wholesaleMargin: number;
        userId: number;
    }) {
        const { itemTypeId, retailMargin, wholesaleMargin, userId } = data;

        if (retailMargin < 0 || wholesaleMargin < 0) {
            throw new BadRequestException('Margins cannot be negative');
        }

        await this.prisma.itemType.update({
            where: { id: itemTypeId },
            data: {
                defaultRetailMargin: retailMargin,
                defaultWholesaleMargin: wholesaleMargin,
            },
        });

        console.log(`📊 ItemType ${itemTypeId} margins updated: Retail=${(retailMargin * 100).toFixed(1)}%, Wholesale=${(wholesaleMargin * 100).toFixed(1)}%`);

        const products = await this.prisma.product.findMany({
            where: { itemTypeId: itemTypeId, active: true },
        });

        console.log(`🔄 Updating ${products.length} products in item type ${itemTypeId}...`);

        let updated = 0;
        for (const product of products) {
            try {
                await this.updateProductPrices(product.id, userId);
                updated++;
            } catch (error) {
                console.error(`❌ Failed to update product ${product.id}:`, error.message);
            }
        }

        return {
            message: `Updated margins for item type and ${updated} products`,
            productsUpdated: updated,
        };
    }

    /**
     * Recalculate all product prices (useful for migration or bulk recalculation)
     */
    async recalculateAllPrices(userId: number) {
        const products = await this.prisma.product.findMany({
            where: { active: true },
        });

        console.log(`🔄 Recalculating prices for ${products.length} products...`);

        let updated = 0;
        for (const product of products) {
            try {
                await this.updateProductPrices(product.id, userId);
                updated++;
            } catch (error) {
                console.error(`❌ Failed to update product ${product.id}:`, error.message);
            }
        }

        return {
            message: `Recalculated prices for ${updated} products`,
            productsUpdated: updated,
        };
    }
}
