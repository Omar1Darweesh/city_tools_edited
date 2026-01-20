import { PrismaService } from '../prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateCategoryDto, UpdateCategoryDto, CreateSubcategoryDto, UpdateSubcategoryDto, CreateItemTypeDto, UpdateItemTypeDto } from './dto/hierarchy.dto';
import { ProductAuditService } from './product-audit.service';
export declare class ProductsService {
    private prisma;
    private productAudit;
    constructor(prisma: PrismaService, productAudit: ProductAuditService);
    findAllCategories(): Promise<({
        subcategories: ({
            itemTypes: ({
                _count: {
                    products: number;
                };
            } & {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                subcategoryId: number;
            })[];
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number;
        })[];
        _count: {
            products: number;
        };
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findCategoryById(id: number): Promise<{
        subcategories: ({
            itemTypes: {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                subcategoryId: number;
            }[];
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number;
        })[];
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createCategory(data: CreateCategoryDto): Promise<{
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCategory(id: number, data: UpdateCategoryDto): Promise<{
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeCategory(id: number): Promise<{
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllSubcategories(categoryId?: number): Promise<({
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        _count: {
            itemTypes: number;
        };
        itemTypes: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            subcategoryId: number;
        }[];
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number;
    })[]>;
    findSubcategoryById(id: number): Promise<{
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        itemTypes: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            subcategoryId: number;
        }[];
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number;
    }>;
    createSubcategory(data: CreateSubcategoryDto): Promise<{
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number;
    }>;
    updateSubcategory(id: number, data: UpdateSubcategoryDto): Promise<{
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number;
    }>;
    removeSubcategory(id: number): Promise<{
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number;
    }>;
    findAllItemTypes(subcategoryId?: number): Promise<({
        _count: {
            products: number;
        };
        subcategory: {
            category: {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number;
        };
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        subcategoryId: number;
    })[]>;
    findItemTypeById(id: number): Promise<{
        subcategory: {
            category: {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number;
        };
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        subcategoryId: number;
    }>;
    createItemType(data: CreateItemTypeDto): Promise<{
        subcategory: {
            category: {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number;
        };
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        subcategoryId: number;
    }>;
    updateItemType(id: number, data: UpdateItemTypeDto): Promise<{
        subcategory: {
            category: {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number;
        };
    } & {
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        subcategoryId: number;
    }>;
    removeItemType(id: number): Promise<{
        id: number;
        name: string;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        subcategoryId: number;
    }>;
    create(createProductDto: CreateProductDto): Promise<{
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        itemType: ({
            subcategory: {
                category: {
                    id: number;
                    name: string;
                    nameAr: string | null;
                    active: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            subcategoryId: number;
        }) | null;
    } & {
        id: number;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        code: string;
        barcode: string;
        nameEn: string;
        itemTypeId: number | null;
        brand: string | null;
        unit: string;
        cost: import("@prisma/client/runtime/library").Decimal;
        costAvg: import("@prisma/client/runtime/library").Decimal;
        priceRetail: import("@prisma/client/runtime/library").Decimal;
        priceWholesale: import("@prisma/client/runtime/library").Decimal;
        minQty: number | null;
        maxQty: number | null;
    }>;
    findAll(params?: {
        skip?: number;
        take?: number;
        search?: string;
        categoryId?: number;
        subcategoryId?: number;
        itemTypeId?: number;
        active?: boolean;
        branchId?: number;
    }): Promise<{
        data: {
            stock: number;
            category: {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            itemType: ({
                subcategory: {
                    category: {
                        id: number;
                        name: string;
                        nameAr: string | null;
                        active: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: number;
                    name: string;
                    nameAr: string | null;
                    active: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    categoryId: number;
                };
            } & {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                subcategoryId: number;
            }) | null;
            id: number;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number | null;
            code: string;
            barcode: string;
            nameEn: string;
            itemTypeId: number | null;
            brand: string | null;
            unit: string;
            cost: import("@prisma/client/runtime/library").Decimal;
            costAvg: import("@prisma/client/runtime/library").Decimal;
            priceRetail: import("@prisma/client/runtime/library").Decimal;
            priceWholesale: import("@prisma/client/runtime/library").Decimal;
            minQty: number | null;
            maxQty: number | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: number, branchId?: number): Promise<{
        stock: number;
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        itemType: ({
            subcategory: {
                category: {
                    id: number;
                    name: string;
                    nameAr: string | null;
                    active: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            subcategoryId: number;
        }) | null;
        id: number;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        code: string;
        barcode: string;
        nameEn: string;
        itemTypeId: number | null;
        brand: string | null;
        unit: string;
        cost: import("@prisma/client/runtime/library").Decimal;
        costAvg: import("@prisma/client/runtime/library").Decimal;
        priceRetail: import("@prisma/client/runtime/library").Decimal;
        priceWholesale: import("@prisma/client/runtime/library").Decimal;
        minQty: number | null;
        maxQty: number | null;
    }>;
    findByBarcode(barcode: string, branchId?: number): Promise<{
        stock: number;
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        itemType: ({
            subcategory: {
                category: {
                    id: number;
                    name: string;
                    nameAr: string | null;
                    active: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            subcategoryId: number;
        }) | null;
        id: number;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        code: string;
        barcode: string;
        nameEn: string;
        itemTypeId: number | null;
        brand: string | null;
        unit: string;
        cost: import("@prisma/client/runtime/library").Decimal;
        costAvg: import("@prisma/client/runtime/library").Decimal;
        priceRetail: import("@prisma/client/runtime/library").Decimal;
        priceWholesale: import("@prisma/client/runtime/library").Decimal;
        minQty: number | null;
        maxQty: number | null;
    }>;
    findByIdentifier(identifier: string, branchId?: number): Promise<{
        stock: number;
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        itemType: ({
            subcategory: {
                category: {
                    id: number;
                    name: string;
                    nameAr: string | null;
                    active: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            subcategoryId: number;
        }) | null;
        id: number;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        code: string;
        barcode: string;
        nameEn: string;
        itemTypeId: number | null;
        brand: string | null;
        unit: string;
        cost: import("@prisma/client/runtime/library").Decimal;
        costAvg: import("@prisma/client/runtime/library").Decimal;
        priceRetail: import("@prisma/client/runtime/library").Decimal;
        priceWholesale: import("@prisma/client/runtime/library").Decimal;
        minQty: number | null;
        maxQty: number | null;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        category: {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        itemType: ({
            subcategory: {
                category: {
                    id: number;
                    name: string;
                    nameAr: string | null;
                    active: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: number;
                name: string;
                nameAr: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                categoryId: number;
            };
        } & {
            id: number;
            name: string;
            nameAr: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            subcategoryId: number;
        }) | null;
    } & {
        id: number;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        code: string;
        barcode: string;
        nameEn: string;
        itemTypeId: number | null;
        brand: string | null;
        unit: string;
        cost: import("@prisma/client/runtime/library").Decimal;
        costAvg: import("@prisma/client/runtime/library").Decimal;
        priceRetail: import("@prisma/client/runtime/library").Decimal;
        priceWholesale: import("@prisma/client/runtime/library").Decimal;
        minQty: number | null;
        maxQty: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        nameAr: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        code: string;
        barcode: string;
        nameEn: string;
        itemTypeId: number | null;
        brand: string | null;
        unit: string;
        cost: import("@prisma/client/runtime/library").Decimal;
        costAvg: import("@prisma/client/runtime/library").Decimal;
        priceRetail: import("@prisma/client/runtime/library").Decimal;
        priceWholesale: import("@prisma/client/runtime/library").Decimal;
        minQty: number | null;
        maxQty: number | null;
    }>;
    getProductTransactions(productId: number, filters?: {
        type?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<({
        stockLocation: {
            branch: {
                id: number;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                address: string | null;
            };
        } & {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
        };
        user: {
            id: number;
            username: string;
            fullName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        productId: number;
        stockLocationId: number;
        qtyChange: number;
        movementType: import(".prisma/client").$Enums.MovementType;
        refTable: string | null;
        refId: number | null;
        notes: string | null;
        createdBy: number;
    })[]>;
    getTransactionSummary(productId: number): Promise<{
        productId: number;
        productName: string;
        totalSales: number;
        totalReturns: number;
        currentStock: number;
        totalValue: number;
    }>;
    getAuditHistory(productId: number): Promise<{
        id: number;
        action: import(".prisma/client").$Enums.AuditAction;
        changes: {
            field: string;
            oldValue: any;
            newValue: any;
        }[];
        user: {
            id: number;
            username: string;
            fullName: string;
        };
        timestamp: Date;
        product: {
            id: number;
            nameAr: string | null;
            code: string;
            nameEn: string;
        };
    }[]>;
}
