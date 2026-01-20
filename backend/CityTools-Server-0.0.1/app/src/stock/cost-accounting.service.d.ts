import { PrismaService } from '../prisma.service';
export declare class CostAccountingService {
    private prisma;
    constructor(prisma: PrismaService);
    updateWeightedAverageCost(productId: number, newBatchQty: number, newBatchCost: number, tx?: any): Promise<void>;
}
