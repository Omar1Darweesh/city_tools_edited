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
        console.log('\n🔵 ===== RETURN PROCESS STARTED =====');
        console.log('📦 Return Data:', JSON.stringify({
            salesInvoiceId: data.salesInvoiceId,
            itemsCount: data.items.length,
            items: data.items.map(i => ({
                productId: i.productId,
                qty: i.qtyReturned,
                returnType: i.returnType,
                hasPricing: !!i.defectedProductPricing
            }))
        }, null, 2));

        const { salesInvoiceId, items, reason, userId } = data;

        // ✅ STEP 1: Auto-set return type for defective products
        console.log('\n🔍 STEP 1: Checking for defective products...');
        for (const item of items) {
            const isDefective = await this.isDefectiveProduct(item.productId);
            console.log(`   Product ${item.productId}: isDefective = ${isDefective}`);

            if (isDefective) {
                if (item.returnType && item.returnType !== ReturnType.DEFECTIVE) {
                    const product = await this.prisma.product.findUnique({
                        where: { id: item.productId },
                        select: { nameAr: true, nameEn: true, code: true },
                    });

                    if (!product) {
                        throw new NotFoundException(`Product ${item.productId} not found`);
                    }

                    console.log(`   ❌ ERROR: Trying to return defective product as STOCK`);
                    throw new BadRequestException(
                        `المنتج "${product.nameAr || product.nameEn}" (${product.code}) هو منتج معيب ويجب إرجاعه كمنتج معيب فقط`
                    );
                }

                item.returnType = ReturnType.DEFECTIVE;
                console.log(`   ✅ Auto-set to DEFECTIVE for product ${item.productId}`);
            }
        }

        // ✅ STEP 2: Validate pricing for NEW defective products BEFORE transaction
        console.log('\n🔍 STEP 2: Validating defective pricing...');
        for (const item of items) {
            if (item.returnType === ReturnType.DEFECTIVE) {
                console.log(`   Checking product ${item.productId}...`);
                const isAlreadyDefective = await this.isDefectiveProduct(item.productId);
                console.log(`   Already defective: ${isAlreadyDefective}`);

                if (!isAlreadyDefective) {
                    const originalProduct = await this.prisma.product.findUnique({
                        where: { id: item.productId },
                    });

                    if (!originalProduct) {
                        console.log(`   ❌ ERROR: Product not found`);
                        throw new NotFoundException(`Product ${item.productId} not found`);
                    }

                    const defectiveBarcode = `${originalProduct.barcode}_DEF`;
                    const defectiveCategory = await this.prisma.category.findFirst({
                        where: {
                            OR: [
                                { name: { equals: 'Defective', mode: 'insensitive' } },
                                { nameAr: 'تلافيات' },
                            ],
                        },
                    });

                    const existingDefective = defectiveCategory
                        ? await this.prisma.product.findFirst({
                            where: {
                                barcode: defectiveBarcode,
                                categoryId: defectiveCategory.id,
                            },
                        })
                        : null;

                    console.log(`   Existing defective product: ${existingDefective ? 'YES' : 'NO'}`);
                    console.log(`   Has pricing: ${!!item.defectedProductPricing}`);

                    if (!existingDefective && !item.defectedProductPricing) {
                        console.log(`   ❌ ERROR: Missing pricing for new defective product`);
                        throw new BadRequestException(
                            `أسعار المنتج المعيب مطلوبة للمنتج: ${originalProduct.nameAr || originalProduct.nameEn}`
                        );
                    }
                    console.log(`   ✅ Pricing validation passed`);
                }
            }
        }

        // ✅ STEP 3: Verify sales invoice exists
        console.log('\n🔍 STEP 3: Verifying sales invoice...');
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
            console.log(`   ❌ ERROR: Sales invoice not found`);
            throw new NotFoundException(`Sales invoice with ID ${salesInvoiceId} not found`);
        }
        console.log(`   ✅ Invoice found: ${salesInvoice.invoiceNo}`);

        // ✅ STEP 4: Check for already returned quantities
        console.log('\n🔍 STEP 4: Checking already returned quantities...');
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
        console.log(`   Found ${existingReturns.length} existing returns`);

        // STEP 5: Validate return quantities
        console.log('STEP 5: Validating return quantities...');
        for (const item of items) {
            const salesLine = salesInvoice.lines.find(line => line.productId === item.productId);
            if (!salesLine) {
                console.log(`❌ ERROR: Product ${item.productId} not in invoice`);
                throw new BadRequestException(`Product ${item.productId} not found in sales invoice`);
            }

            const alreadyReturned = returnedQuantities.get(item.productId) || 0;
            const availableToReturn = salesLine.qty - alreadyReturned;

            console.log(`Product ${item.productId}: sold=${salesLine.qty}, returned=${alreadyReturned}, available=${availableToReturn}, requesting=${item.qtyReturned}`);

            if (item.qtyReturned > availableToReturn) {
                console.log('❌ ERROR: Quantity exceeds available');
                throw new BadRequestException(
                    `Cannot return ${item.qtyReturned} of product ${salesLine.product.nameAr}. Already returned: ${alreadyReturned}, Available: ${availableToReturn}`
                );
            }

            // ✅ FIXED: Validate refund amount INCLUDING TAX (what customer actually paid)
            const unitPrice = salesLine.unitPrice.toNumber(); // Price before tax (e.g., 450)
            const subtotalForItem = unitPrice * item.qtyReturned; // e.g., 450

            // Calculate tax rate from invoice
            const invoiceSubtotal = salesInvoice.subtotal.toNumber();
            const invoiceTax = salesInvoice.totalTax.toNumber();
            const taxRate = invoiceSubtotal > 0 ? invoiceTax / invoiceSubtotal : 0;

            // Calculate tax for this item
            const taxForItem = subtotalForItem * taxRate; // e.g., 450 × 0.15 = 67.50
            const maxRefundForItem = subtotalForItem + taxForItem; // e.g., 450 + 67.50 = 517.50

            if (item.refundAmount > maxRefundForItem) {
                console.log(`❌ ERROR: Refund amount exceeds original price + tax`);
                throw new BadRequestException(
                    `Refund amount (${item.refundAmount.toFixed(2)}) for product ${salesLine.product.nameAr} cannot exceed original price (${subtotalForItem.toFixed(2)}) + tax (${taxForItem.toFixed(2)}) = ${maxRefundForItem.toFixed(2)}`
                );
            }

            console.log(`✅ Refund amount valid for product ${item.productId}: ${item.refundAmount} <= ${maxRefundForItem.toFixed(2)} (base: ${subtotalForItem.toFixed(2)} + tax: ${taxForItem.toFixed(2)})`);
        }
        console.log('✅ All quantities and refund amounts valid');

        // STEP 6: Calculate total refund
        const totalRefund = items.reduce((sum, item) => sum + item.refundAmount, 0);
        console.log(`STEP 6: Total refund calculated: ${totalRefund.toFixed(2)}`);

        // STEP 6.5: Validate refund doesn't exceed invoice total
        console.log(`STEP 6.5: Validating refund amount...`);
        const invoiceTotal = salesInvoice.total.toNumber(); // Convert Decimal to number
        if (totalRefund > invoiceTotal) {
            console.log(`❌ ERROR: Refund exceeds invoice total`);
            throw new BadRequestException(
                `Refund amount (${totalRefund.toFixed(2)}) cannot exceed invoice total (${invoiceTotal.toFixed(2)})`
            );
        }
        console.log(`✅ Refund validation passed`);

        // ✅ STEP 8: Get stock location BEFORE transaction
        console.log('\n🔍 STEP 8: Validating stock location...');
        const stockLocation = await this.prisma.stockLocation.findFirst({
            where: {
                branchId: salesInvoice.branchId,
                active: true,
            },
        });

        if (!stockLocation) {
            console.log(`   ❌ ERROR: No active stock location`);
            throw new BadRequestException(
                `No active stock location found for branch ${salesInvoice.branch.name}`,
            );
        }
        console.log(`   ✅ Stock location found: ${stockLocation.id}`);

        // ✅ STEP 9: WRAP EVERYTHING IN TRANSACTION
        console.log('\n🔄 STEP 9: Starting database transaction...');
        console.log('   ⚠️  All operations from here will ROLLBACK if any error occurs');

        try {
            const salesReturn = await this.prisma.$transaction(async (tx) => {
                // ✅ FIXED: Generate return number INSIDE transaction to prevent race condition
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
                const branchCode = salesInvoice.branch.code;

                const lastReturn = await tx.salesReturn.findFirst({
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
                console.log(`\n📋 STEP 7: Generated return number: ${returnNo}`);

                console.log('\n   📝 Creating return record...');
                const createdReturn = await tx.salesReturn.create({
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
                                returnType: item.returnType || ReturnType.STOCK,
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
                console.log(`   ✅ Return record created with ID: ${createdReturn.id}`);

                console.log('\n   🔄 Processing stock movements...');
                for (const item of items) {
                    const returnType = item.returnType || ReturnType.STOCK;
                    console.log(`   Processing product ${item.productId} as ${returnType}...`);

                    if (returnType === ReturnType.STOCK) {
                        await this.handleStockReturnTx(
                            tx,
                            item,
                            stockLocation.id,
                            createdReturn,
                            salesInvoice,
                            userId,
                        );
                    } else if (returnType === ReturnType.DEFECTIVE) {
                        await this.handleDefectiveReturnTx(
                            tx,
                            item,
                            stockLocation.id,
                            createdReturn,
                            salesInvoice,
                            userId,
                        );
                    }
                }

                console.log('   ✅ All stock movements completed successfully');
                return createdReturn;
            });

            console.log('\n✅ TRANSACTION COMMITTED SUCCESSFULLY');
            console.log(`   Return ID: ${salesReturn.id}`);
            console.log(`   Return No: ${salesReturn.returnNo}`);

            // ✅ STEP 10: Recalculate profit
            console.log('\n🔍 STEP 10: Recalculating profit...');
            try {
                await this.salesService.recalculateProfitAfterReturn(salesInvoiceId);
                console.log('   ✅ Profit recalculated');
            } catch (error) {
                console.error('   ⚠️  Failed to recalculate profit:', error);
            }

            console.log(`\n🎉 ===== RETURN PROCESS COMPLETED =====`);
            console.log(`✅ Return ${salesReturn.returnNo} processed with ${items.length} items\n`);
            return salesReturn;

        } catch (error) {
            console.log('\n❌ ===== TRANSACTION ROLLED BACK =====');
            console.log('   All database changes have been reverted');
            console.log('   Error:', error.message);
            console.log('🔴 ===== RETURN PROCESS FAILED =====\n');
            throw error;
        }
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

        let defectiveProduct = await this.prisma.product.findUnique({
            where: {
                barcode: defectiveBarcode,
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
                    cost: originalProduct.costAvg,
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

    // ✅ NEW: Transaction version of handleStockReturn
    private async handleStockReturnTx(
        tx: any,
        item: any,
        stockLocationId: number,
        salesReturn: any,
        salesInvoice: any,
        userId: number,
    ) {
        await tx.stockMovement.create({
            data: {
                productId: item.productId,
                stockLocationId,
                qtyChange: item.qtyReturned,
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

        await tx.productAudit.create({
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

    private async handleDefectiveReturnTx(
        tx: any,
        item: any,
        stockLocationId: number,
        salesReturn: any,
        salesInvoice: any,
        userId: number,
    ) {
        const originalProduct = await tx.product.findUnique({
            where: { id: item.productId },
            include: {
                category: true,
                itemType: true,
            },
        });

        if (!originalProduct) {
            throw new NotFoundException(`Product ${item.productId} not found`);
        }

        // Check if product is already defective
        const isAlreadyDefective = await this.isDefectiveProduct(item.productId);

        if (isAlreadyDefective) {
            // Product is already defective - just return to stock
            await tx.stockMovement.create({
                data: {
                    productId: item.productId,
                    stockLocationId,
                    qtyChange: item.qtyReturned,
                    movementType: 'RETURN',
                    refTable: 'salesreturns',
                    refId: salesReturn.id,
                    notes: `Defective product returned from invoice ${salesInvoice.invoiceNo}`,
                    createdBy: userId,
                },
            });

            console.log(
                `DEFECTIVE RETURN: Product ${originalProduct.code} (already defective) returned to stock, Qty: ${item.qtyReturned}`,
            );

            return tx.productAudit.create({
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

        // Find or create defective category
        let defectiveCategory = await tx.category.findFirst({
            where: {
                OR: [
                    { name: { equals: 'Defective', mode: 'insensitive' } },
                    { nameAr: 'معيب' },
                ],
            },
        });

        if (!defectiveCategory) {
            defectiveCategory = await tx.category.create({
                data: {
                    name: 'Defective',
                    nameAr: 'معيب',
                    active: true,
                },
            });
        }

        const defectiveBarcode = originalProduct.barcode + '_DEF';

        // ✅ FIXED: Generate code BEFORE upsert
        const lastProduct = await tx.product.findFirst({
            orderBy: { id: 'desc' },
        });
        const nextId = (lastProduct?.id || 0) + 1;
        const defectiveCode = `DEF${String(nextId).padStart(6, '0')}`;

        // Prepare pricing
        const priceRetail =
            item.defectedProductPricing?.priceRetail || originalProduct.priceRetail;
        const priceWholesale =
            item.defectedProductPricing?.priceWholesale ||
            originalProduct.priceWholesale;

        // ✅ ATOMIC UPSERT - Solves the race condition!
        const defectiveProduct = await tx.product.upsert({
            where: {
                barcode: defectiveBarcode,
            },
            update: {
                // If product exists, update prices if provided
                ...(item.defectedProductPricing && {
                    priceRetail: item.defectedProductPricing.priceRetail,
                    priceWholesale: item.defectedProductPricing.priceWholesale,
                }),
            },
            create: {
                // If product doesn't exist, create it
                code: defectiveCode,
                barcode: defectiveBarcode,
                nameEn: `${originalProduct.nameEn} (Defective)`,
                nameAr: `${originalProduct.nameAr || originalProduct.nameEn} (معيب)`,
                categoryId: defectiveCategory.id,
                itemTypeId: null,
                brand: originalProduct.brand,
                unit: originalProduct.unit,
                cost: originalProduct.costAvg,
                priceRetail: priceRetail,
                priceWholesale: priceWholesale,
                minQty: 0,
                maxQty: null,
                active: true,
            },
        });

        console.log(
            `DEFECTIVE PRODUCT: ${defectiveProduct.code} (Barcode: ${defectiveBarcode})`,
        );

        // Add stock movement
        await tx.stockMovement.create({
            data: {
                productId: defectiveProduct.id,
                stockLocationId,
                qtyChange: item.qtyReturned,
                movementType: 'RETURN',
                refTable: 'salesreturns',
                refId: salesReturn.id,
                notes: `Defective return from invoice ${salesInvoice.invoiceNo} (Original: ${originalProduct.code})`,
                createdBy: userId,
            },
        });

        console.log(
            `DEFECTIVE RETURN: Product ${originalProduct.code} → ${defectiveProduct.code}, Qty: ${item.qtyReturned}`,
        );

        return tx.productAudit.create({
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
