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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const product_audit_service_1 = require("../products/product-audit.service");
let ReturnsService = class ReturnsService {
    constructor(prisma, productAuditService) {
        this.prisma = prisma;
        this.productAuditService = productAuditService;
    }
    async createReturn(data) {
        const { salesInvoiceId, items, reason, userId } = data;
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
            throw new common_1.NotFoundException(`Sales invoice with ID ${salesInvoiceId} not found`);
        }
        const existingReturns = await this.prisma.salesReturn.findMany({
            where: { salesInvoiceId },
            include: { lines: true },
        });
        const returnedQuantities = new Map();
        existingReturns.forEach((ret) => {
            ret.lines.forEach((line) => {
                const current = returnedQuantities.get(line.productId) || 0;
                returnedQuantities.set(line.productId, current + line.qtyReturned);
            });
        });
        for (const item of items) {
            const salesLine = salesInvoice.lines.find((line) => line.productId === item.productId);
            if (!salesLine) {
                throw new common_1.BadRequestException(`Product ${item.productId} not found in sales invoice`);
            }
            const alreadyReturned = returnedQuantities.get(item.productId) || 0;
            const availableToReturn = salesLine.qty - alreadyReturned;
            if (item.qtyReturned > availableToReturn) {
                throw new common_1.BadRequestException(`Cannot return ${item.qtyReturned} of product ${salesLine.product.nameAr}. ` +
                    `Already returned: ${alreadyReturned}, Available: ${availableToReturn}`);
            }
        }
        const totalRefund = items.reduce((sum, item) => sum + item.refundAmount, 0);
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
        const stockLocation = await this.prisma.stockLocation.findFirst({
            where: {
                branchId: salesInvoice.branchId,
                active: true,
            },
        });
        if (!stockLocation) {
            throw new common_1.BadRequestException(`No active stock location found for branch ${salesInvoice.branch.name}`);
        }
        const auditPromises = items.map(async (item) => {
            await this.prisma.stockMovement.create({
                data: {
                    productId: item.productId,
                    stockLocationId: stockLocation.id,
                    qtyChange: item.qtyReturned,
                    movementType: 'RETURN',
                    refTable: 'salesreturns',
                    refId: salesReturn.id,
                    notes: `Return from invoice ${salesInvoice.invoiceNo}`,
                    createdBy: userId,
                },
            });
            console.log(`📝 Creating audit log for return: Product ID ${item.productId}, Qty: ${item.qtyReturned}`);
            return this.prisma.productAudit.create({
                data: {
                    productId: item.productId,
                    action: 'UPDATE',
                    userId,
                    oldData: {
                        returnInfo: {
                            returnNo,
                            salesInvoiceNo: salesInvoice.invoiceNo,
                            qty: item.qtyReturned,
                            reason: reason || 'Return from sale',
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
        });
        await Promise.all(auditPromises);
        console.log(`✅ Return ${returnNo} processed with ${items.length} audit logs created`);
        return salesReturn;
    }
    async findAll(params) {
        const { skip, take, branchId, salesInvoiceId } = params;
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (salesInvoiceId)
            where.salesInvoiceId = salesInvoiceId;
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
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        product_audit_service_1.ProductAuditService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map