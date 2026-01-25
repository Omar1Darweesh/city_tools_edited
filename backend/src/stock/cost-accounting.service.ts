import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CostAccountingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Updates the Weighted Average Cost (WAC) for a product.
   * Formula: ((CurrentQty * CurrentAvgCost) + (NewBatchQty * NewBatchCost)) / (CurrentQty + NewBatchQty)
   * Note: CurrentQty refers to the quantity BEFORE the new batch is added.
   */
  async updateWeightedAverageCost(
    productId: number,
    newBatchQty: number,
    newBatchCost: number,
    tx: any = this.prisma,
  ) {
    if (newBatchQty <= 0) return;

    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { costAvg: true, id: true, cost: true },
    });

    if (!product) return;

    // Get current total valid stock across all locations
    // Get current total valid stock across all locations (logic below uses movements directly)

    // Calculate current total qty
    const movements = await tx.stockMovement.aggregate({
      where: { productId },
      _sum: { qtyChange: true },
    });

    const currentTotalQty = movements._sum.qtyChange || 0;

    // If current qty is negative (oversold), we just assume 0 for WAC purposes to avoid weird math
    // Or we just strictly apply the formula. Standard is: if qty <= 0, new cost becomes the WAC.

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

    // Update Product
    await tx.product.update({
      where: { id: productId },
      data: {
        costAvg: newAvgCost,
        cost: newAvgCost,
      },
    });
  }
}
