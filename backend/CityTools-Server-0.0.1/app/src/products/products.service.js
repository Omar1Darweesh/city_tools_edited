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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const product_audit_service_1 = require("./product-audit.service");
let ProductsService = class ProductsService {
    constructor(prisma, productAudit) {
        this.prisma = prisma;
        this.productAudit = productAudit;
    }
    async findAllCategories() {
        return this.prisma.category.findMany({
            where: { active: true },
            include: {
                subcategories: {
                    where: { active: true },
                    include: {
                        itemTypes: {
                            where: { active: true },
                            include: {
                                _count: {
                                    select: { products: true },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findCategoryById(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                subcategories: {
                    include: {
                        itemTypes: true,
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async createCategory(data) {
        return this.prisma.category.create({
            data: {
                name: data.name,
                nameAr: data.nameAr,
                active: data.active ?? true,
            },
        });
    }
    async updateCategory(id, data) {
        await this.findCategoryById(id);
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }
    async removeCategory(id) {
        return this.prisma.category.update({
            where: { id },
            data: { active: false },
        });
    }
    async findAllSubcategories(categoryId) {
        return this.prisma.subcategory.findMany({
            where: {
                active: true,
                ...(categoryId && { categoryId }),
            },
            include: {
                category: true,
                itemTypes: {
                    where: { active: true },
                },
                _count: {
                    select: {
                        itemTypes: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findSubcategoryById(id) {
        const subcategory = await this.prisma.subcategory.findUnique({
            where: { id },
            include: {
                category: true,
                itemTypes: true,
            },
        });
        if (!subcategory) {
            throw new common_1.NotFoundException('Subcategory not found');
        }
        return subcategory;
    }
    async createSubcategory(data) {
        await this.findCategoryById(data.categoryId);
        return this.prisma.subcategory.create({
            data: {
                categoryId: data.categoryId,
                name: data.name,
                nameAr: data.nameAr,
                active: data.active ?? true,
            },
            include: {
                category: true,
            },
        });
    }
    async updateSubcategory(id, data) {
        await this.findSubcategoryById(id);
        if (data.categoryId) {
            await this.findCategoryById(data.categoryId);
        }
        return this.prisma.subcategory.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });
    }
    async removeSubcategory(id) {
        return this.prisma.subcategory.update({
            where: { id },
            data: { active: false },
        });
    }
    async findAllItemTypes(subcategoryId) {
        return this.prisma.itemType.findMany({
            where: {
                active: true,
                ...(subcategoryId && { subcategoryId }),
            },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findItemTypeById(id) {
        const itemType = await this.prisma.itemType.findUnique({
            where: { id },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        if (!itemType) {
            throw new common_1.NotFoundException('Item type not found');
        }
        return itemType;
    }
    async createItemType(data) {
        await this.findSubcategoryById(data.subcategoryId);
        return this.prisma.itemType.create({
            data: {
                subcategoryId: data.subcategoryId,
                name: data.name,
                nameAr: data.nameAr,
                active: data.active ?? true,
            },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
    async updateItemType(id, data) {
        await this.findItemTypeById(id);
        if (data.subcategoryId) {
            await this.findSubcategoryById(data.subcategoryId);
        }
        return this.prisma.itemType.update({
            where: { id },
            data,
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });
    }
    async removeItemType(id) {
        return this.prisma.itemType.update({
            where: { id },
            data: { active: false },
        });
    }
    async create(createProductDto) {
        if (!createProductDto.code) {
            const lastProduct = await this.prisma.product.findFirst({
                orderBy: { id: 'desc' },
            });
            const nextId = (lastProduct?.id || 0) + 1;
            createProductDto.code = `PROD${String(nextId).padStart(6, '0')}`;
        }
        const existingBarcode = await this.prisma.product.findUnique({
            where: { barcode: createProductDto.barcode },
        });
        if (existingBarcode) {
            throw new common_1.ConflictException('يوجد منتج بنفس الباركود بالفعل');
        }
        const existingCode = await this.prisma.product.findUnique({
            where: { code: createProductDto.code },
        });
        if (existingCode) {
            throw new common_1.ConflictException('يوجد منتج بنفس الكود بالفعل');
        }
        if (createProductDto.itemTypeId) {
            await this.findItemTypeById(createProductDto.itemTypeId);
        }
        const { initialStock, ...productData } = createProductDto;
        const finalProductData = {
            code: productData.code,
            barcode: productData.barcode,
            nameEn: productData.nameEn,
            nameAr: productData.nameAr,
            brand: productData.brand,
            unit: productData.unit,
            cost: productData.cost,
            priceRetail: productData.priceRetail,
            priceWholesale: productData.priceWholesale,
            minQty: productData.minQty,
            maxQty: productData.maxQty,
            active: productData.active ?? true,
        };
        if (productData.categoryId) {
            finalProductData.categoryId = productData.categoryId;
        }
        if (productData.itemTypeId) {
            finalProductData.itemTypeId = productData.itemTypeId;
        }
        const product = await this.prisma.$transaction(async (prisma) => {
            const newProduct = await prisma.product.create({
                data: finalProductData,
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
            if (initialStock && initialStock > 0) {
                let stockLocation = await prisma.stockLocation.findFirst({
                    where: { active: true },
                    orderBy: { id: 'asc' },
                });
                if (!stockLocation) {
                    const firstBranch = await prisma.branch.findFirst({
                        where: { active: true },
                    });
                    if (!firstBranch) {
                        throw new Error('No active branch found. Please create a branch first.');
                    }
                    stockLocation = await prisma.stockLocation.create({
                        data: {
                            name: 'المخزن الرئيسي',
                            branchId: firstBranch.id,
                            active: true,
                        },
                    });
                }
                await prisma.stockMovement.create({
                    data: {
                        productId: newProduct.id,
                        stockLocationId: stockLocation.id,
                        movementType: 'ADJUSTMENT',
                        qtyChange: initialStock,
                        notes: 'رصيد افتتاحي - Initial Stock',
                        createdBy: 1,
                    },
                });
                console.log(`✅ Added initial stock: ${initialStock} ${newProduct.unit} for product ${newProduct.code}`);
            }
            return newProduct;
        });
        await this.productAudit.logChange(product.id, 'CREATE', product, null, 1);
        return product;
    }
    async findAll(params) {
        const { skip = 0, take = 50, search, categoryId, subcategoryId, itemTypeId, active, branchId } = params || {};
        const where = {};
        if (search) {
            where.OR = [
                { nameEn: { contains: search, mode: 'insensitive' } },
                { nameAr: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search } },
                { code: { contains: search } },
            ];
        }
        if (categoryId !== undefined) {
            where.categoryId = categoryId;
        }
        if (itemTypeId !== undefined) {
            where.itemTypeId = itemTypeId;
        }
        if (subcategoryId !== undefined) {
            where.itemType = {
                subcategoryId: subcategoryId,
            };
        }
        if (active !== undefined) {
            where.active = active;
        }
        const [total, products] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                skip,
                take,
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
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        const productIds = products.map((p) => p.id);
        const stocks = await this.prisma.stockMovement.groupBy({
            by: ['productId'],
            _sum: { qtyChange: true },
            where: {
                productId: { in: productIds },
                stockLocation: branchId ? { branchId } : undefined,
            },
        });
        const productsWithStock = products.map((p) => {
            const stockEntry = stocks.find((s) => s.productId === p.id);
            return {
                ...p,
                stock: stockEntry?._sum?.qtyChange || 0,
            };
        });
        return {
            data: productsWithStock,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
        };
    }
    async findOne(id, branchId) {
        const product = await this.prisma.product.findUnique({
            where: { id },
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
            throw new common_1.NotFoundException('Product not found');
        }
        const stock = await this.prisma.stockMovement.aggregate({
            _sum: { qtyChange: true },
            where: {
                productId: id,
                stockLocation: branchId ? { branchId } : undefined,
            },
        });
        return {
            ...product,
            stock: stock._sum.qtyChange || 0,
        };
    }
    async findByBarcode(barcode, branchId) {
        const product = await this.prisma.product.findUnique({
            where: { barcode },
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
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.active) {
            throw new common_1.ConflictException('Product is inactive');
        }
        const stock = await this.prisma.stockMovement.aggregate({
            _sum: { qtyChange: true },
            where: {
                productId: product.id,
                stockLocation: branchId ? { branchId } : undefined,
            },
        });
        return {
            ...product,
            stock: stock._sum.qtyChange || 0,
        };
    }
    async findByIdentifier(identifier, branchId) {
        const product = await this.prisma.product.findFirst({
            where: {
                OR: [
                    { barcode: identifier },
                    { code: identifier },
                ],
                active: true,
            },
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
            throw new common_1.NotFoundException('Product not found');
        }
        const stock = await this.prisma.stockMovement.aggregate({
            _sum: { qtyChange: true },
            where: {
                productId: product.id,
                stockLocation: branchId ? { branchId } : undefined,
            },
        });
        return {
            ...product,
            stock: stock._sum.qtyChange || 0,
        };
    }
    async update(id, updateProductDto) {
        const existingProduct = await this.prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (updateProductDto.barcode) {
            const existing = await this.prisma.product.findUnique({
                where: { barcode: updateProductDto.barcode },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('يوجد منتج بنفس الباركود بالفعل');
            }
        }
        if (updateProductDto.code) {
            const existing = await this.prisma.product.findUnique({
                where: { code: updateProductDto.code },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('يوجد منتج بنفس الكود بالفعل');
            }
        }
        if (updateProductDto.itemTypeId) {
            await this.findItemTypeById(updateProductDto.itemTypeId);
        }
        const updateData = {};
        if (updateProductDto.code !== undefined)
            updateData.code = updateProductDto.code;
        if (updateProductDto.barcode !== undefined)
            updateData.barcode = updateProductDto.barcode;
        if (updateProductDto.nameEn !== undefined)
            updateData.nameEn = updateProductDto.nameEn;
        if (updateProductDto.nameAr !== undefined)
            updateData.nameAr = updateProductDto.nameAr;
        if (updateProductDto.brand !== undefined)
            updateData.brand = updateProductDto.brand;
        if (updateProductDto.unit !== undefined)
            updateData.unit = updateProductDto.unit;
        if (updateProductDto.cost !== undefined)
            updateData.cost = updateProductDto.cost;
        if (updateProductDto.priceRetail !== undefined)
            updateData.priceRetail = updateProductDto.priceRetail;
        if (updateProductDto.priceWholesale !== undefined)
            updateData.priceWholesale = updateProductDto.priceWholesale;
        if (updateProductDto.minQty !== undefined)
            updateData.minQty = updateProductDto.minQty;
        if (updateProductDto.maxQty !== undefined)
            updateData.maxQty = updateProductDto.maxQty;
        if (updateProductDto.active !== undefined)
            updateData.active = updateProductDto.active;
        if (updateProductDto.categoryId !== undefined)
            updateData.categoryId = updateProductDto.categoryId;
        if (updateProductDto.itemTypeId !== undefined)
            updateData.itemTypeId = updateProductDto.itemTypeId;
        const updated = await this.prisma.product.update({
            where: { id },
            data: updateData,
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
        await this.productAudit.logChange(id, 'UPDATE', updated, existingProduct, 1);
        return updated;
    }
    async remove(id) {
        const existingProduct = await this.findOne(id);
        const updated = await this.prisma.product.update({
            where: { id },
            data: { active: false },
        });
        await this.productAudit.logChange(id, 'DELETE', updated, existingProduct, 1);
        return updated;
    }
    async getProductTransactions(productId, filters) {
        const where = { productId };
        if (filters?.type) {
            where.movementType = filters.type;
        }
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters.endDate)
                where.createdAt.lte = filters.endDate;
        }
        return this.prisma.stockMovement.findMany({
            where,
            include: {
                stockLocation: {
                    include: {
                        branch: true,
                    },
                },
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
    async getTransactionSummary(productId) {
        const [product, movements] = await Promise.all([
            this.prisma.product.findUnique({
                where: { id: productId },
                include: {
                    salesLines: true,
                    salesReturnLines: true,
                },
            }),
            this.prisma.stockMovement.findMany({
                where: { productId },
            }),
        ]);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const totalSales = product.salesLines.reduce((sum, line) => sum + line.qty, 0);
        const totalReturns = product.salesReturnLines.reduce((sum, line) => sum + line.qtyReturned, 0);
        const currentStock = movements.reduce((sum, m) => sum + m.qtyChange, 0);
        return {
            productId,
            productName: product.nameAr || product.nameEn,
            totalSales,
            totalReturns,
            currentStock,
            totalValue: Number(product.priceRetail) * currentStock,
        };
    }
    async getAuditHistory(productId) {
        await this.findOne(productId);
        return this.productAudit.getFormattedAuditHistory(productId);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        product_audit_service_1.ProductAuditService])
], ProductsService);
//# sourceMappingURL=products.service.js.map