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
exports.PurchasingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
const cost_accounting_service_1 = require("../stock/cost-accounting.service");
let PurchasingService = class PurchasingService {
    constructor(prisma, costAccountingService) {
        this.prisma = prisma;
        this.costAccountingService = costAccountingService;
    }
    async createSupplier(createSupplierDto) {
        return this.prisma.supplier.create({
            data: createSupplierDto,
        });
    }
    async findAllSuppliers(params) {
        const { skip = 0, take = 50, active, search } = params || {};
        const where = {};
        if (active !== undefined)
            where.active = active;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { contact: { contains: search } },
                { phone: { contains: search } }
            ];
        }
        const [total, suppliers] = await Promise.all([
            this.prisma.supplier.count({ where }),
            this.prisma.supplier.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data: suppliers,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
        };
    }
    async findOneSupplier(id) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
        return supplier;
    }
    async updateSupplier(id, data) {
        await this.findOneSupplier(id);
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }
    async removeSupplier(id) {
        await this.findOneSupplier(id);
        return this.prisma.supplier.delete({ where: { id } });
    }
    async createGRN(createGRNDto, userId) {
        const { supplierId, branchId, relatedPoId, lines, notes, stockLocationId } = createGRNDto;
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
        if (!supplier) {
            throw new common_1.NotFoundException('Supplier not found');
        }
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
        for (const line of lines) {
            const product = await this.prisma.product.findUnique({
                where: { id: line.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${line.productId} not found`);
            }
        }
        const grnNo = await this.generateGRNNo(branchId);
        return this.prisma.$transaction(async (tx) => {
            let subtotal = 0;
            const taxRateVal = createGRNDto.taxRate !== undefined ? createGRNDto.taxRate : 14;
            lines.forEach((l) => {
                subtotal += l.qty * l.cost;
            });
            const taxAmount = (subtotal * taxRateVal) / 100;
            const total = subtotal + taxAmount;
            const grn = await tx.goodsReceipt.create({
                data: {
                    grnNo,
                    supplierId,
                    branchId,
                    relatedPoId,
                    notes,
                    createdBy: userId,
                    paymentTerm: createGRNDto.paymentTerm || 'CASH',
                    taxRate: taxRateVal,
                    subtotal,
                    taxAmount,
                    total,
                    lines: {
                        create: lines.map((line) => ({
                            productId: line.productId,
                            qty: line.qty,
                            cost: line.cost,
                        })),
                    },
                },
                include: {
                    lines: {
                        include: {
                            product: true,
                        },
                    },
                    supplier: true,
                },
            });
            for (const line of lines) {
                await this.costAccountingService.updateWeightedAverageCost(line.productId, line.qty, line.cost, tx);
                await tx.stockMovement.create({
                    data: {
                        productId: line.productId,
                        stockLocationId: locationId,
                        qtyChange: line.qty,
                        movementType: client_1.MovementType.GRN,
                        refTable: 'goods_receipts',
                        refId: grn.id,
                        createdBy: userId,
                    },
                });
            }
            return grn;
        });
    }
    async findOneGRN(id) {
        const grn = await this.prisma.goodsReceipt.findUnique({
            where: { id },
            include: {
                supplier: true,
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
                        product: true,
                    },
                },
            },
        });
        if (!grn) {
            throw new common_1.NotFoundException('GRN not found');
        }
        return grn;
    }
    async findAllGRNs(params) {
        const { skip = 0, take = 50, branchId } = params || {};
        const where = {};
        if (branchId !== undefined)
            where.branchId = branchId;
        const [total, grns] = await Promise.all([
            this.prisma.goodsReceipt.count({ where }),
            this.prisma.goodsReceipt.findMany({
                where,
                skip,
                take,
                include: {
                    supplier: true,
                    branch: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data: grns,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
        };
    }
    async generateGRNNo(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new Error('Branch not found');
        }
        const today = new Date();
        const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const lastGRN = await this.prisma.goodsReceipt.findFirst({
            where: {
                branchId,
                grnNo: {
                    startsWith: `GRN-${branch.code}-${datePrefix}`,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        let sequence = 1;
        if (lastGRN) {
            const lastSeq = parseInt(lastGRN.grnNo.split('-').pop() || '0');
            sequence = lastSeq + 1;
        }
        return `GRN-${branch.code}-${datePrefix}-${String(sequence).padStart(4, '0')}`;
    }
};
exports.PurchasingService = PurchasingService;
exports.PurchasingService = PurchasingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cost_accounting_service_1.CostAccountingService])
], PurchasingService);
//# sourceMappingURL=purchasing.service.js.map