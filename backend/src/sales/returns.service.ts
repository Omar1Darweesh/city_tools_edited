import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReturnDto, ReturnType } from './dto/returns.dto';
import { ProductAuditService } from '../products/product-audit.service';
import { SalesService } from './sales.service';

@Injectable()
export class ReturnsService {
    constructor(
        private prisma: PrismaService,
        private productAuditService: ProductAuditService,
        private salesService: SalesService,
    ) { }

    async checkDefectiveProduct(productId: number) {
        const originalProduct = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!originalProduct) {
            throw new NotFoundException(`Product ${productId} not found`);
        } // ✅ ADD THIS

        // Find defective category
        const defectiveCategory = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { name: { equals: 'Defective', mode: 'insensitive' } },
                    { nameAr: 'تلافيات' },
                ],
            },
        });

        if (!defectiveCategory) {
            return {
                exists: false,
                originalProduct: {
                    id: originalProduct.id,
                    nameAr: originalProduct.nameAr,
                    nameEn: originalProduct.nameEn,
                    priceRetail: originalProduct.priceRetail,
                    priceWholesale: originalProduct.priceWholesale,
                },
            };
        } // ✅ ADD THIS TOO

        // Check if defective product exists
        const defectiveBarcode = `${originalProduct.barcode}_DEF`;
        const defectiveProduct = await this.prisma.product.findFirst({
            where: {
                barcode: defectiveBarcode,
                categoryId: defectiveCategory.id,
            },
        });

        if (defectiveProduct) {
            return {
                exists: true,
                defectiveProduct: {
                    id: defectiveProduct.id,
                    code: defectiveProduct.code,
                    priceRetail: defectiveProduct.priceRetail,
                    priceWholesale: defectiveProduct.priceWholesale,
                },
                originalProduct: {
                    id: originalProduct.id,
                    nameAr: originalProduct.nameAr,
                    nameEn: originalProduct.nameEn,
                    priceRetail: originalProduct.priceRetail,
                    priceWholesale: originalProduct.priceWholesale,
                },
            };
        }

        return {
            exists: false,
            originalProduct: {
                id: originalProduct.id,
                nameAr: originalProduct.nameAr,
                nameEn: originalProduct.nameEn,
                priceRetail: originalProduct.priceRetail,
                priceWholesale: originalProduct.priceWholesale,
            },
        };
    }


    async createReturn(data: CreateReturnDto & { userId: number }) {
        const { salesInvoiceId, items, reason, userId } = data;

        for (const item of items) {
            const isDefective = await this.isDefectiveProduct(item.productId);

            // ✅ Auto-set return type for defective products FIRST
            if (isDefective) {
                // If user explicitly tried to set it as STOCK, throw error
                if (item.returnType && item.returnType !== ReturnType.DEFECTIVE) {
                    const product = await this.prisma.product.findUnique({
                        where: { id: item.productId },
                        select: { nameAr: true, nameEn: true, code: true },
                    });

                    if (!product) {
                        throw new NotFoundException(`Product ${item.productId} not found`);
                    }

                    throw new BadRequestException(
                        `المنتج "${product.nameAr || product.nameEn}" (${product.code}) هو منتج معيب ويجب إرجاعه كمنتج معيب فقط`
                    );
                }

                // Always set to DEFECTIVE for defective products
                item.returnType = ReturnType.DEFECTIVE;
            }
        }

        // Verify sales invoice exists
        const salesInvoice = await this.prisma.salesInvoice.findUnique({
            where: { id: salesInvoiceId },
            include: {
                lines: {
                    include: {
                        product: true,
                    },
                },
                branch: true,
            },
        });

        if (!salesInvoice) {
            throw new NotFoundException(`Sales invoice with ID ${salesInvoiceId} not found`);
        }

        // ✅ Check for already returned quantities
        const existingReturns = await this.prisma.salesReturn.findMany({
            where: { salesInvoiceId },
            include: { lines: true },
        });

        const returnedQuantities = new Map();
        existingReturns.forEach((ret: any) => {
            ret.lines.forEach((line: any) => {
                const current = returnedQuantities.get(line.productId) || 0;
                returnedQuantities.set(line.productId, current + line.qtyReturned);
            });
        });

        // Validate return quantities
        for (const item of items) {
            const salesLine = salesInvoice.lines.find(
                (line) => line.productId === item.productId,
            );

            if (!salesLine) {
                throw new BadRequestException(
                    `Product ${item.productId} not found in sales invoice`,
                );
            }

            const alreadyReturned = returnedQuantities.get(item.productId) || 0;
            const availableToReturn = salesLine.qty - alreadyReturned;

            if (item.qtyReturned > availableToReturn) {
                throw new BadRequestException(
                    `Cannot return ${item.qtyReturned} of product ${salesLine.product.nameAr}. ` +
                    `Already returned: ${alreadyReturned}, Available: ${availableToReturn}`,
                );
            }
        }

        // Calculate total refund
        const totalRefund = items.reduce((sum, item) => sum + item.refundAmount, 0);

        // Generate return number
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const branchCode = salesInvoice.branch.code;

        const lastReturn = await this.prisma.salesReturn.findFirst({
            where: {
                returnNo: {
                    startsWith: `RET-${branchCode}-${dateStr}`,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        let sequence = 1;
        if (lastReturn) {
            const lastSequence = parseInt(lastReturn.returnNo.split('-').pop() || '0');
            sequence = lastSequence + 1;
        }

        const returnNo = `RET-${branchCode}-${dateStr}-${sequence.toString().padStart(4, '0')}`;

        // ✅ Create return with lines (INCLUDING returnType)
        const salesReturn = await this.prisma.salesReturn.create({
            data: {
                returnNo,
                salesInvoiceId,
                branchId: salesInvoice.branchId,
                createdBy: userId,
                totalRefund: totalRefund,
                reason,
                lines: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        qtyReturned: item.qtyReturned,
                        refundAmount: item.refundAmount,
                        returnType: item.returnType || ReturnType.STOCK, // ✅ DEFAULT TO STOCK
                    })),
                },
            },
            include: {
                lines: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Get the main stock location for this branch
        const stockLocation = await this.prisma.stockLocation.findFirst({
            where: {
                branchId: salesInvoice.branchId,
                active: true,
            },
        });

        if (!stockLocation) {
            throw new BadRequestException(
                `No active stock location found for branch ${salesInvoice.branch.name}`,
            );
        }

        // ✅ Process each return item based on return type
        const auditPromises = items.map(async (item) => {
            const returnType = item.returnType || ReturnType.STOCK;

            if (returnType === ReturnType.STOCK) {
                // ✅ STOCK: Return to original product
                await this.handleStockReturn(
                    item,
                    stockLocation.id,
                    salesReturn,
                    salesInvoice,
                    userId,
                );
            } else if (returnType === ReturnType.DEFECTIVE) {
                // ✅ DEFECTIVE: Create/update defective product
                await this.handleDefectiveReturn(
                    item,
                    stockLocation.id,
                    salesReturn,
                    salesInvoice,
                    userId,
                );
            }
        });

        await Promise.all(auditPromises);

        try {
            await this.salesService.recalculateProfitAfterReturn(salesInvoiceId);
        } catch (error) {
            console.error('⚠️ Failed to recalculate profit:', error);
        }

        console.log(`✅ Return ${returnNo} processed with ${items.length} items`);
        return salesReturn;
    }

    // ✅ HELPER: Handle normal stock return
    private async handleStockReturn(
        item: any,
        stockLocationId: number,
        salesReturn: any,
        salesInvoice: any,
        userId: number,
    ) {
        // Return items to original product inventory
        await this.prisma.stockMovement.create({
            data: {
                productId: item.productId,
                stockLocationId,
                qtyChange: item.qtyReturned, // Positive for returns
                movementType: 'RETURN',
                refTable: 'sales_returns',
                refId: salesReturn.id,
                notes: `Return to stock from invoice ${salesInvoice.invoiceNo}`,
                createdBy: userId,
            },
        });

        console.log(
            `✅ STOCK RETURN: Product ID ${item.productId}, Qty: ${item.qtyReturned}`,
        );

        // Create audit log
        return this.prisma.productAudit.create({
            data: {
                productId: item.productId,
                action: 'UPDATE',
                userId,
                oldData: {
                    returnInfo: {
                        returnNo: salesReturn.returnNo,
                        salesInvoiceNo: salesInvoice.invoiceNo,
                        qty: item.qtyReturned,
                        returnType: 'STOCK',
                    },
                },
                newData: {
                    stockMovement: {
                        qtyChange: item.qtyReturned,
                        movementType: 'RETURN',
                    },
                },
            },
        });
    }

    private async handleDefectiveReturn(
        item: any,
        stockLocationId: number,
        salesReturn: any,
        salesInvoice: any,
        userId: number,
    ) {
        const originalProduct = await this.prisma.product.findUnique({
            where: { id: item.productId },
            include: {
                category: true,
                itemType: true,
            },
        });

        if (!originalProduct) {
            throw new NotFoundException(`Product ${item.productId} not found`);
        }

        // ✅ NEW CODE STARTS HERE ====================================
        // Check if the product being returned is ALREADY defective
        const isAlreadyDefective = await this.isDefectiveProduct(item.productId);

        if (isAlreadyDefective) {
            // Product is already defective - just return it to stock (no need to create defective version)
            await this.prisma.stockMovement.create({
                data: {
                    productId: item.productId,
                    stockLocationId,
                    qtyChange: item.qtyReturned,
                    movementType: 'RETURN',
                    refTable: 'sales_returns',
                    refId: salesReturn.id,
                    notes: `Defective product returned from invoice ${salesInvoice.invoiceNo}`,
                    createdBy: userId,
                },
            });

            console.log(
                `✅ DEFECTIVE RETURN: Product ${originalProduct.code} (already defective) returned to stock, Qty: +${item.qtyReturned}`,
            );

            // Create audit log
            return this.prisma.productAudit.create({
                data: {
                    productId: item.productId,
                    action: 'UPDATE',
                    userId,
                    oldData: {
                        returnInfo: {
                            returnNo: salesReturn.returnNo,
                            salesInvoiceNo: salesInvoice.invoiceNo,
                            qty: item.qtyReturned,
                            returnType: 'DEFECTIVE',
                            alreadyDefective: true,
                        },
                    },
                    newData: {
                        stockMovement: {
                            qtyChange: item.qtyReturned,
                            movementType: 'RETURN',
                        },
                    },
                },
            });
        }
        // ✅ NEW CODE ENDS HERE ====================================


        let defectiveCategory = await this.prisma.category.findFirst({
            where: {
                OR: [
                    { name: { equals: 'Defective', mode: 'insensitive' } },
                    { nameAr: 'تلافيات' },
                ],
            },
        });

        if (!defectiveCategory) {
            defectiveCategory = await this.prisma.category.create({
                data: {
                    name: 'Defective',
                    nameAr: 'تلافيات',
                    active: true,
                },
            });
        }

        // ✅ FIXED: Use consistent barcode pattern to find existing defective product
        const defectiveBarcode = `${originalProduct.barcode}_DEF`;

        let defectiveProduct = await this.prisma.product.findFirst({
            where: {
                barcode: defectiveBarcode,
                categoryId: defectiveCategory.id,
            },
        });

        if (defectiveProduct) {
            console.log(
                `♻️ Reusing existing defective product: ${defectiveProduct.code} (Barcode: ${defectiveBarcode})`,
            );

            // Update prices if provided
            if (item.defectedProductPricing) {
                const { priceRetail, priceWholesale } = item.defectedProductPricing;
                defectiveProduct = await this.prisma.product.update({
                    where: { id: defectiveProduct.id },
                    data: {
                        priceRetail,
                        priceWholesale,
                    },
                });
                console.log(
                    `📝 Updated prices: Retail ${priceRetail}, Wholesale ${priceWholesale}`,
                );
            }
        } else {
            // Validate pricing for new defective product
            if (!item.defectedProductPricing) {
                throw new BadRequestException(
                    `Defected product pricing is required for new defective product: ${originalProduct.nameAr || originalProduct.nameEn}`,
                );
            }

            const { priceRetail, priceWholesale } = item.defectedProductPricing;

            const lastProduct = await this.prisma.product.findFirst({
                orderBy: { id: 'desc' },
            });
            const nextId = (lastProduct?.id || 0) + 1;
            const defectiveCode = `DEF${String(nextId).padStart(6, '0')}`;

            defectiveProduct = await this.prisma.product.create({
                data: {
                    code: defectiveCode,
                    barcode: defectiveBarcode, // Consistent barcode without timestamp
                    nameEn: `${originalProduct.nameEn} (Defective)`,
                    nameAr: `${originalProduct.nameAr || originalProduct.nameEn} (تالف)`,
                    categoryId: defectiveCategory.id,
                    itemTypeId: null,
                    brand: originalProduct.brand,
                    unit: originalProduct.unit,
                    cost: originalProduct.cost,
                    priceRetail: priceRetail,
                    priceWholesale: priceWholesale,
                    minQty: 0,
                    maxQty: null,
                    active: true,
                },
            });

            console.log(
                `✅ Created NEW defective product: ${defectiveProduct.code} (Barcode: ${defectiveBarcode}) | Retail: ${priceRetail}, Wholesale: ${priceWholesale}`,
            );
        }

        // Add stock movement
        await this.prisma.stockMovement.create({
            data: {
                productId: defectiveProduct.id,
                stockLocationId,
                qtyChange: item.qtyReturned,
                movementType: 'RETURN',
                refTable: 'sales_returns',
                refId: salesReturn.id,
                notes: `Defective return from invoice ${salesInvoice.invoiceNo} (Original: ${originalProduct.code})`,
                createdBy: userId,
            },
        });

        console.log(
            `⚠️ DEFECTIVE RETURN: Product ${originalProduct.code} → ${defectiveProduct.code}, Qty: +${item.qtyReturned}`,
        );

        return this.prisma.productAudit.create({
            data: {
                productId: defectiveProduct.id,
                action: 'UPDATE',
                userId,
                oldData: {
                    returnInfo: {
                        returnNo: salesReturn.returnNo,
                        salesInvoiceNo: salesInvoice.invoiceNo,
                        originalProductId: originalProduct.id,
                        originalProductCode: originalProduct.code,
                        qty: item.qtyReturned,
                        returnType: 'DEFECTIVE',
                    },
                },
                newData: {
                    defectiveProduct: {
                        id: defectiveProduct.id,
                        code: defectiveProduct.code,
                        barcode: defectiveProduct.barcode,
                    },
                    stockMovement: {
                        qtyChange: item.qtyReturned,
                        movementType: 'RETURN',
                    },
                },
            },
        });
    }



    async isDefectiveProduct(productId: number): Promise<boolean> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { category: true },
        });

        if (!product) return false;

        // Check if product is in defective category
        const isInDefectiveCategory =
            product.category?.name?.toLowerCase() === 'defective' ||
            product.category?.nameAr === 'تلافيات';

        // Check if barcode has _DEF suffix
        const hasDefectiveBarcode = product.barcode.endsWith('_DEF');

        return isInDefectiveCategory || hasDefectiveBarcode;
    }


    // ... keep rest of the methods (findAll, etc.)
    async findAll(params: {
        skip?: number;
        take?: number;
        branchId?: number;
        salesInvoiceId?: number;
    }) {
        const { skip, take, branchId, salesInvoiceId } = params;

        const where: any = {};
        if (branchId) where.branchId = branchId;
        if (salesInvoiceId) where.salesInvoiceId = salesInvoiceId;

        const [data, total] = await Promise.all([
            this.prisma.salesReturn.findMany({
                skip,
                take,
                where,
                include: {
                    branch: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                        },
                    },
                    lines: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    nameAr: true,
                                    nameEn: true,
                                    barcode: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.salesReturn.count({ where }),
        ]);

        return { data, total };
    }
}
