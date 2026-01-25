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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let SalesService = class SalesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSale(createSaleDto, userId) {
        const { branchId, customerId, lines, paymentMethod, totalDiscount = 0, stockLocationId, notes, channel, platformCommission = 0, } = createSaleDto;
        let locationId = stockLocationId;
        if (!locationId) {
            const defaultLocation = await this.prisma.stockLocation.findFirst({
                where: { branchId, active: true },
            });
            if (!defaultLocation) {
                throw new common_1.BadRequestException('No active stock location found for this branch');
            }
            locationId = defaultLocation.id;
        }
        let rawSubtotal = 0;
        const enrichedLines = [];
        for (const line of lines) {
            const product = await this.prisma.product.findUnique({
                where: { id: line.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${line.productId} not found`);
            }
            if (!product.active) {
                throw new common_1.BadRequestException(`Product ${product.nameEn} is inactive`);
            }
            const lineSubtotal = line.qty * line.unitPrice;
            rawSubtotal += lineSubtotal;
            enrichedLines.push({
                ...line,
                lineDiscount: line.lineDiscount || 0,
                taxRate: line.taxRate || 0,
            });
        }
        const subtotalAfterDiscount = rawSubtotal - totalDiscount;
        let totalTax = 0;
        for (const line of enrichedLines) {
            const lineRawSubtotal = line.qty * line.unitPrice;
            const lineDiscountAmount = (lineRawSubtotal / rawSubtotal) * totalDiscount;
            const lineSubtotalAfterDiscount = lineRawSubtotal - lineDiscountAmount;
            const lineTax = (lineSubtotalAfterDiscount * line.taxRate) / 100;
            totalTax += lineTax;
            line.lineTotal = lineSubtotalAfterDiscount + lineTax;
        }
        const total = subtotalAfterDiscount + totalTax + platformCommission;
        let costOfGoods = 0;
        for (const line of enrichedLines) {
            const product = await this.prisma.product.findUnique({
                where: { id: line.productId },
                select: { cost: true },
            });
            if (product && product.cost) {
                costOfGoods += Number(product.cost) * line.qty;
            }
        }
        const grossProfit = total - totalTax - costOfGoods;
        const netProfit = grossProfit - platformCommission;
        const profitMargin = total > 0 ? (netProfit / total) * 100 : 0;
        console.log('💰 Profit Calculation:');
        console.log('Cost of Goods:', costOfGoods.toFixed(2));
        console.log('Gross Profit:', grossProfit.toFixed(2));
        console.log('Net Profit:', netProfit.toFixed(2));
        console.log('Profit Margin:', profitMargin.toFixed(2) + '%');
        const invoiceNo = await this.generateInvoiceNo(branchId);
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.salesInvoice.create({
                data: {
                    invoiceNo,
                    branchId,
                    customerId,
                    subtotal: new client_1.Prisma.Decimal(rawSubtotal),
                    total: new client_1.Prisma.Decimal(total),
                    totalTax: new client_1.Prisma.Decimal(totalTax),
                    totalDiscount: new client_1.Prisma.Decimal(totalDiscount),
                    paymentStatus: client_1.PaymentStatus.PAID,
                    paymentMethod,
                    notes,
                    createdBy: userId,
                    lines: {
                        create: enrichedLines.map((line) => ({
                            productId: line.productId,
                            qty: line.qty,
                            unitPrice: new client_1.Prisma.Decimal(line.unitPrice),
                            lineDiscount: new client_1.Prisma.Decimal(line.lineDiscount),
                            taxRate: new client_1.Prisma.Decimal(line.taxRate),
                            lineTotal: new client_1.Prisma.Decimal(line.lineTotal),
                        })),
                    },
                    channel,
                    platformCommission: new client_1.Prisma.Decimal(platformCommission),
                    costOfGoods: new client_1.Prisma.Decimal(costOfGoods),
                    grossProfit: new client_1.Prisma.Decimal(grossProfit),
                    netProfit: new client_1.Prisma.Decimal(netProfit),
                    profitMargin: new client_1.Prisma.Decimal(profitMargin),
                },
                include: {
                    lines: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            for (const line of enrichedLines) {
                await tx.stockMovement.create({
                    data: {
                        productId: line.productId,
                        stockLocationId: locationId,
                        qtyChange: -line.qty,
                        movementType: client_1.MovementType.SALE,
                        refTable: 'sales_invoices',
                        refId: invoice.id,
                        createdBy: userId,
                    },
                });
            }
            return invoice;
        });
    }
    async findAll(params) {
        const { skip, take, branchId, customerId, search, paymentMethod, dateFilter, startDate, endDate } = params;
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (customerId)
            where.customerId = customerId;
        if (paymentMethod && paymentMethod !== 'ALL') {
            where.paymentMethod = paymentMethod;
        }
        if (dateFilter || (startDate && endDate)) {
            let start;
            let end;
            const now = new Date();
            switch (dateFilter) {
                case 'today':
                    start = new Date(now.setHours(0, 0, 0, 0));
                    end = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case 'yesterday':
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    start = new Date(yesterday.setHours(0, 0, 0, 0));
                    end = new Date(yesterday.setHours(23, 59, 59, 999));
                    break;
                case 'thisWeek':
                    const weekStart = new Date();
                    const dayOfWeek = weekStart.getDay();
                    weekStart.setDate(weekStart.getDate() - dayOfWeek);
                    start = new Date(weekStart.setHours(0, 0, 0, 0));
                    end = new Date();
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'thisMonth':
                    const monthStart = new Date();
                    start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1, 0, 0, 0, 0);
                    end = new Date();
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'custom':
                    if (startDate && endDate) {
                        start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                    }
                    break;
            }
            if (start && end) {
                where.createdAt = {
                    gte: start,
                    lte: end,
                };
            }
        }
        if (search) {
            where.OR = [
                { invoiceNo: { contains: search } },
                { customer: { name: { contains: search } } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.salesInvoice.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true,
                    user: {
                        select: {
                            fullName: true,
                            username: true,
                        },
                    },
                    branch: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.salesInvoice.count({ where }),
        ]);
        const itemsWithNumbers = items.map((sale) => ({
            ...sale,
            subtotal: Number(sale.subtotal),
            total: Number(sale.total),
            totalTax: Number(sale.totalTax),
            totalDiscount: Number(sale.totalDiscount),
            platformCommission: Number(sale.platformCommission),
            costOfGoods: sale.costOfGoods ? Number(sale.costOfGoods) : undefined,
            grossProfit: sale.grossProfit ? Number(sale.grossProfit) : undefined,
            netProfit: sale.netProfit ? Number(sale.netProfit) : undefined,
            profitMargin: sale.profitMargin ? Number(sale.profitMargin) : undefined,
        }));
        return {
            data: itemsWithNumbers,
            total,
        };
    }
    async findOne(id) {
        const invoice = await this.prisma.salesInvoice.findUnique({
            where: { id },
            include: {
                branch: {
                    select: { name: true },
                },
                customer: {
                    select: { name: true, type: true },
                },
                user: {
                    select: { id: true, username: true, fullName: true },
                },
                lines: {
                    include: {
                        product: {
                            select: {
                                nameAr: true,
                                nameEn: true,
                                barcode: true,
                            },
                        },
                    },
                },
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return {
            ...invoice,
            subtotal: Number(invoice.subtotal),
            total: Number(invoice.total),
            totalTax: Number(invoice.totalTax),
            totalDiscount: Number(invoice.totalDiscount),
            platformCommission: Number(invoice.platformCommission),
            costOfGoods: invoice.costOfGoods ? Number(invoice.costOfGoods) : undefined,
            grossProfit: invoice.grossProfit ? Number(invoice.grossProfit) : undefined,
            netProfit: invoice.netProfit ? Number(invoice.netProfit) : undefined,
            profitMargin: invoice.profitMargin ? Number(invoice.profitMargin) : undefined,
            lines: invoice.lines.map((line) => ({
                ...line,
                unitPrice: Number(line.unitPrice),
                lineDiscount: Number(line.lineDiscount),
                taxRate: Number(line.taxRate),
                lineTotal: Number(line.lineTotal),
            })),
        };
    }
    async getDailySummary(branchId, date) {
        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        const invoices = await this.prisma.salesInvoice.findMany({
            where: {
                branchId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: {
                id: true,
                invoiceNo: true,
                paymentMethod: true,
                total: true,
                createdAt: true,
                user: {
                    select: {
                        fullName: true,
                    },
                },
            },
        });
        const summary = invoices.reduce((acc, invoice) => {
            const method = invoice.paymentMethod;
            if (!acc[method]) {
                acc[method] = { count: 0, total: 0 };
            }
            acc[method].count++;
            acc[method].total += Number(invoice.total);
            return acc;
        }, {});
        const grandTotal = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
        return {
            date: targetDate,
            branchId,
            summary,
            grandTotal,
            invoiceCount: invoices.length,
            recentSales: invoices.map((inv) => ({
                ...inv,
                total: Number(inv.total),
            })),
        };
    }
    async generateInvoiceNo(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new Error('Branch not found');
        }
        const today = new Date();
        const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const lastInvoice = await this.prisma.salesInvoice.findFirst({
            where: {
                branchId,
                invoiceNo: {
                    startsWith: `${branch.code}-${datePrefix}`,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        let sequence = 1;
        if (lastInvoice) {
            const lastSeq = parseInt(lastInvoice.invoiceNo.split('-').pop() || '0');
            sequence = lastSeq + 1;
        }
        return `${branch.code}-${datePrefix}-${String(sequence).padStart(4, '0')}`;
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map