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
exports.CostAccountingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let CostAccountingService = class CostAccountingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateWeightedAverageCost(productId, newBatchQty, newBatchCost, tx = this.prisma) {
        if (newBatchQty <= 0)
            return;
        const product = await tx.product.findUnique({
            where: { id: productId },
            select: { costAvg: true, id: true, cost: true },
        });
        if (!product)
            return;
        const movements = await tx.stockMovement.aggregate({
            where: { productId },
            _sum: { qtyChange: true },
        });
        const currentTotalQty = movements._sum.qtyChange || 0;
        const currentAvgCost = Number(product.costAvg);
        const batchCost = Number(newBatchCost);
        const batchQty = Number(newBatchQty);
        let newAvgCost = batchCost;
        if (currentTotalQty > 0) {
            const oldTotalValue = currentTotalQty * currentAvgCost;
            const newBatchValue = batchQty * batchCost;
            const newTotalQty = currentTotalQty + batchQty;
            newAvgCost = (oldTotalValue + newBatchValue) / newTotalQty;
        }
        await tx.product.update({
            where: { id: productId },
            data: {
                costAvg: newAvgCost,
                cost: newAvgCost,
            },
        });
    }
};
exports.CostAccountingService = CostAccountingService;
exports.CostAccountingService = CostAccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CostAccountingService);
//# sourceMappingURL=cost-accounting.service.js.map