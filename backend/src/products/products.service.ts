import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
  CreateItemTypeDto,
  UpdateItemTypeDto,
} from './dto/hierarchy.dto';
import { ProductAuditService } from './product-audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private productAudit: ProductAuditService,
  ) { }

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { active: true },
      include: {
        subcategories: {
          where: { active: true },
          include: {
            itemTypes: {
              where: { active: true },
              include: {                    // ← ADD THIS
                _count: {                   // ← ADD THIS
                  select: { products: true }, // ← ADD THIS
                },                          // ← ADD THIS
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

  async findCategoryById(id: number) {
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
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        active: data.active ?? true,
      },
    });
  }

  async updateCategory(id: number, data: UpdateCategoryDto) {
    await this.findCategoryById(id); // Check exists
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async removeCategory(id: number) {
    // Soft delete
    return this.prisma.category.update({
      where: { id },
      data: { active: false },
    });
  }

  // ============================================
  // SUBCATEGORY OPERATIONS
  // ============================================

  async findAllSubcategories(categoryId?: number) {
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

  async findSubcategoryById(id: number) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: true,
        itemTypes: true,
      },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    return subcategory;
  }

  async createSubcategory(data: CreateSubcategoryDto) {
    // Verify category exists
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

  async updateSubcategory(id: number, data: UpdateSubcategoryDto) {
    await this.findSubcategoryById(id); // Check exists

    if (data.categoryId) {
      await this.findCategoryById(data.categoryId); // Verify new category exists
    }

    return this.prisma.subcategory.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async removeSubcategory(id: number) {
    // Soft delete
    return this.prisma.subcategory.update({
      where: { id },
      data: { active: false },
    });
  }

  // ============================================
  // ITEM TYPE OPERATIONS
  // ============================================

  async findAllItemTypes(subcategoryId?: number) {
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

  async findItemTypeById(id: number) {
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
      throw new NotFoundException('Item type not found');
    }

    return itemType;
  }

  async createItemType(data: CreateItemTypeDto) {
    // Verify subcategory exists
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

  async updateItemType(id: number, data: UpdateItemTypeDto) {
    await this.findItemTypeById(id); // Check exists

    if (data.subcategoryId) {
      await this.findSubcategoryById(data.subcategoryId); // Verify new subcategory exists
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

  async removeItemType(id: number) {
    // Soft delete
    return this.prisma.itemType.update({
      where: { id },
      data: { active: false },
    });
  }

  // ============================================
  // PRODUCT OPERATIONS
  // ============================================

  async create(createProductDto: CreateProductDto) {
    // Auto-generate code if not provided
    if (!createProductDto.code) {
      const lastProduct = await this.prisma.product.findFirst({
        orderBy: { id: 'desc' },
      });
      const nextId = (lastProduct?.id || 0) + 1;
      createProductDto.code = `PROD${String(nextId).padStart(6, '0')}`;
    }

    // Check if barcode already exists
    const existingBarcode = await this.prisma.product.findUnique({
      where: { barcode: createProductDto.barcode },
    });
    if (existingBarcode) {
      throw new ConflictException('يوجد منتج بنفس الباركود بالفعل');
    }

    // Check if code already exists
    const existingCode = await this.prisma.product.findUnique({
      where: { code: createProductDto.code },
    });
    if (existingCode) {
      throw new ConflictException('يوجد منتج بنفس الكود بالفعل');
    }

    // Validate itemTypeId if provided
    if (createProductDto.itemTypeId) {
      await this.findItemTypeById(createProductDto.itemTypeId);
    }

    // Extract initialStock from DTO
    const { initialStock, ...productData } = createProductDto as any;

    // Construct data object properly
    const finalProductData: any = {
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

    // Add categoryId only if provided
    if (productData.categoryId) {
      finalProductData.categoryId = productData.categoryId;
    }

    // Add itemTypeId only if provided
    if (productData.itemTypeId) {
      finalProductData.itemTypeId = productData.itemTypeId;
    }

    // ✅ USE TRANSACTION to create product + initial stock
    const product = await this.prisma.$transaction(async (prisma) => {
      // Create the product
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

      // ✅ Add initial stock if provided
      if (initialStock && initialStock > 0) {
        // Get first available stock location (or create a default one)
        let stockLocation = await prisma.stockLocation.findFirst({
          where: { active: true },
          orderBy: { id: 'asc' },
        });

        // If no stock location exists, create a default one
        if (!stockLocation) {
          // Get first branch
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

        // Create initial stock movement
        await prisma.stockMovement.create({
          data: {
            productId: newProduct.id,
            stockLocationId: stockLocation.id,
            movementType: 'ADJUSTMENT',
            qtyChange: initialStock,
            notes: 'رصيد افتتاحي - Initial Stock',
            createdBy: 1, // ✅ Fixed: use 'createdBy' not 'userId'
          },
        });

        console.log(`✅ Added initial stock: ${initialStock} ${newProduct.unit} for product ${newProduct.code}`);
      }

      return newProduct;
    });

    // Log audit
    await this.productAudit.logChange(
      product.id,
      'CREATE' as AuditAction,
      product,
      null,
      1,
    );

    return product;
  }



  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    categoryId?: number;
    subcategoryId?: number;
    itemTypeId?: number;
    active?: boolean;
    branchId?: number;
  }) {
    const { skip = 0, take = 50, search, categoryId, subcategoryId, itemTypeId, active, branchId } = params || {};

    const where: any = {};

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

    // Filter by subcategory (through itemType)
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

    // Attach stock levels
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

  async findOne(id: number, branchId?: number) {
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
      throw new NotFoundException('Product not found');
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

  async findByBarcode(barcode: string, branchId?: number) {
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
      throw new NotFoundException('Product not found');
    }

    if (!product.active) {
      throw new ConflictException('Product is inactive');
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

  async findByIdentifier(identifier: string, branchId?: number) {
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
      throw new NotFoundException('Product not found');
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

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.barcode) {
      const existing = await this.prisma.product.findUnique({
        where: { barcode: updateProductDto.barcode },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('يوجد منتج بنفس الباركود بالفعل');
      }
    }

    if (updateProductDto.code) {
      const existing = await this.prisma.product.findUnique({
        where: { code: updateProductDto.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('يوجد منتج بنفس الكود بالفعل');
      }
    }

    if (updateProductDto.itemTypeId) {
      await this.findItemTypeById(updateProductDto.itemTypeId);
    }

    // Construct update data properly (remove undefined fields)
    const updateData: any = {};

    if (updateProductDto.code !== undefined) updateData.code = updateProductDto.code;
    if (updateProductDto.barcode !== undefined) updateData.barcode = updateProductDto.barcode;
    if (updateProductDto.nameEn !== undefined) updateData.nameEn = updateProductDto.nameEn;
    if (updateProductDto.nameAr !== undefined) updateData.nameAr = updateProductDto.nameAr;
    if (updateProductDto.brand !== undefined) updateData.brand = updateProductDto.brand;
    if (updateProductDto.unit !== undefined) updateData.unit = updateProductDto.unit;
    if (updateProductDto.cost !== undefined) updateData.cost = updateProductDto.cost;
    if (updateProductDto.priceRetail !== undefined) updateData.priceRetail = updateProductDto.priceRetail;
    if (updateProductDto.priceWholesale !== undefined) updateData.priceWholesale = updateProductDto.priceWholesale;
    if (updateProductDto.minQty !== undefined) updateData.minQty = updateProductDto.minQty;
    if (updateProductDto.maxQty !== undefined) updateData.maxQty = updateProductDto.maxQty;
    if (updateProductDto.active !== undefined) updateData.active = updateProductDto.active;
    if (updateProductDto.categoryId !== undefined) updateData.categoryId = updateProductDto.categoryId;
    if (updateProductDto.itemTypeId !== undefined) updateData.itemTypeId = updateProductDto.itemTypeId;

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

    await this.productAudit.logChange(
      id,
      'UPDATE' as AuditAction,
      updated,
      existingProduct,
      1,
    );

    return updated;
  }


  async remove(id: number) {
    const existingProduct = await this.findOne(id);

    const updated = await this.prisma.product.update({
      where: { id },
      data: { active: false },
    });

    // ✅ ADD AUDIT LOG
    await this.productAudit.logChange(
      id,
      'DELETE' as AuditAction,
      updated,
      existingProduct,
      1, // Replace with actual userId from request
    );

    return updated;
  }


  // ============================================
  // TRANSACTION HISTORY (Keep existing methods)
  // ============================================

  async getProductTransactions(productId: number, filters?: {
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { productId };

    if (filters?.type) {
      where.movementType = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
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

  async getTransactionSummary(productId: number) {
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
      throw new NotFoundException('Product not found');
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
  async getAuditHistory(productId: number) {
    await this.findOne(productId); // Ensure product exists
    return this.productAudit.getFormattedAuditHistory(productId);
  }

}
