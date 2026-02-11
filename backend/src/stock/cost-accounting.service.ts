import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CostAccountingService {
  constructor(
    private prisma: PrismaService,
    // ❌ REMOVE THIS - Don't inject ProfitMarginService here
    // private profitMarginService: ProfitMarginService,
  ) {}

  /**
   * Update Weighted Average Cost when receiving new stock
   * Price recalculation happens separately outside transaction
   */
  async updateWeightedAverageCost(
    productId: number,
    newBatchQty: number,
    newBatchCost: number,
    tx: any = this.prisma,
  ) {
    if (newBatchQty <= 0) {
      console.log(`⚠️ Skipping WAC update: quantity is zero or negative`);
      return;
    }

    // Get current product data
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        nameEn: true,
        costAvg: true,
      },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Calculate current stock from stock_movements
    const stockData = await tx.stockMovement.aggregate({
      where: {
        productId: productId,
      },
      _sum: {
        qtyChange: true,
      },
    });

    const currentStock = Number(stockData._sum.qtyChange) || 0;
    const currentAvgCost = Number(product.costAvg) || 0;

    // Calculate new weighted average cost
    const currentValue = currentStock * currentAvgCost;
    const newBatchValue = newBatchQty * newBatchCost;
    const totalValue = currentValue + newBatchValue;
    const totalQty = currentStock + newBatchQty;
    const newAvgCost = totalQty > 0 ? totalValue / totalQty : newBatchCost;

    console.log(
      `📊 WAC Calculation for Product ${productId} (${product.nameEn}):\n` +
        `   Current: ${currentStock} units @ ${currentAvgCost.toFixed(2)} = ${currentValue.toFixed(2)}\n` +
        `   New Batch: ${newBatchQty} units @ ${newBatchCost.toFixed(2)} = ${newBatchValue.toFixed(2)}\n` +
        `   Total: ${totalQty} units = ${totalValue.toFixed(2)}\n` +
        `   New Avg Cost: ${newAvgCost.toFixed(2)}`,
    );

    // Update product cost
    await tx.product.update({
      where: { id: productId },
      data: {
        costAvg: newAvgCost,
        cost: newBatchCost, // Last purchase cost
      },
    });

    // ❌ REMOVED: Price recalculation from here - too slow for transaction
    console.log(
      `✅ Cost updated for product ${productId}. Prices will be recalculated after transaction.`,
    );

    return {
      oldAvgCost: currentAvgCost,
      newAvgCost: newAvgCost,
      currentStock: currentStock,
      newStock: totalQty,
    };
  }
}
