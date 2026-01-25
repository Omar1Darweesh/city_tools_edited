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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let StockService = class StockService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStockOnHand(params) {
        const { productId, stockLocationId, branchId } = params;
        const where = {};
        if (productId)
            where.productId = productId;
        if (stockLocationId)
            where.stockLocationId = stockLocationId;
        if (branchId) {
            where.stockLocation = { branchId };
        }
        const movements = await this.prisma.stockMovement.findMany({
            where,
            include: {
                product: true,
                stockLocation: {
                    include: {
                        branch: true,
                    },
                },
            },
        });
        const stockMap = {};
        movements.forEach((movement) => {
            const key = `${movement.productId}-${movement.stockLocationId}`;
            if (!stockMap[key]) {
                stockMap[key] = {
                    product: movement.product,
                    stockLocation: movement.stockLocation,
                    onHandQty: 0,
                };
            }
            stockMap[key].onHandQty += movement.qtyChange;
        });
        return Object.values(stockMap);
    }
    async createAdjustment(data) {
        const product = await this.prisma.product.findUnique({
            where: { id: data.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const location = await this.prisma.stockLocation.findUnique({
            where: { id: data.stockLocationId },
        });
        if (!location) {
            throw new common_1.NotFoundException('Stock location not found');
        }
        return this.prisma.stockMovement.create({
            data: {
                productId: data.productId,
                stockLocationId: data.stockLocationId,
                qtyChange: data.qtyChange,
                movementType: client_1.MovementType.ADJUSTMENT,
                notes: data.notes,
                createdBy: data.userId,
            },
            include: {
                product: true,
                stockLocation: true,
            },
        });
    }
    async getLocations(branchId) {
        return this.prisma.stockLocation.findMany({
            where: branchId ? { branchId, active: true } : { active: true },
            include: {
                branch: true,
            },
        });
    }
    async getMovementHistory(params) {
        const { productId, stockLocationId, movementType, skip = 0, take = 50, } = params;
        const where = {};
        if (productId)
            where.productId = productId;
        if (stockLocationId)
            where.stockLocationId = stockLocationId;
        if (movementType)
            where.movementType = movementType;
        const [total, movements] = await Promise.all([
            this.prisma.stockMovement.count({ where }),
            this.prisma.stockMovement.findMany({
                where,
                skip,
                take,
                include: {
                    product: true,
                    stockLocation: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data: movements,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
        };
    }
    async createBatchAdjustment(data) {
        return this.prisma.$transaction(async (tx) => {
            const movements = [];
            for (const adj of data.adjustments) {
                const movement = await tx.stockMovement.create({
                    data: {
                        productId: adj.productId,
                        stockLocationId: data.stockLocationId,
                        qtyChange: adj.qtyChange,
                        movementType: client_1.MovementType.ADJUSTMENT,
                        notes: data.notes,
                        createdBy: data.userId,
                    },
                    include: {
                        product: true,
                        stockLocation: true,
                    },
                });
                movements.push(movement);
            }
            return movements;
        });
    }
    async createTransfer(data) {
        const fromLocation = await this.prisma.stockLocation.findUnique({
            where: { id: data.fromStockLocationId },
        });
        const toLocation = await this.prisma.stockLocation.findUnique({
            where: { id: data.toStockLocationId },
        });
        if (!fromLocation || !toLocation) {
            throw new common_1.NotFoundException('Stock location not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const transferOut = [];
            const transferIn = [];
            for (const item of data.items) {
                const outMovement = await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        stockLocationId: data.fromStockLocationId,
                        qtyChange: -item.qty,
                        movementType: client_1.MovementType.TRANSFER_OUT,
                        notes: data.notes,
                        createdBy: data.userId,
                    },
                });
                transferOut.push(outMovement);
                const inMovement = await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        stockLocationId: data.toStockLocationId,
                        qtyChange: item.qty,
                        movementType: client_1.MovementType.TRANSFER_IN,
                        notes: data.notes,
                        createdBy: data.userId,
                        refTable: 'stock_movements',
                        refId: outMovement.id,
                    },
                });
                transferIn.push(inMovement);
            }
            return {
                transferOut,
                transferIn,
                fromLocation,
                toLocation,
            };
        });
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockService);
//# sourceMappingURL=stock.service.js.map