import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) { }

  async getStockOnHand(params: {
    productId?: number;
    stockLocationId?: number;
    branchId?: number;
  }) {
    const { productId, stockLocationId, branchId } = params;

    const where: any = {};
    if (productId) where.productId = productId;
    if (stockLocationId) where.stockLocationId = stockLocationId;

    // If branchId is provided, filter by stock locations in that branch
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

    // Aggregate by product and location
    const stockMap: Record<string, any> = {};

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

  async createAdjustment(data: {
    productId: number;
    stockLocationId: number;
    qtyChange: number;
    notes?: string;
    userId: number;
  }) {
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const location = await this.prisma.stockLocation.findUnique({
      where: { id: data.stockLocationId },
    });

    if (!location) {
      throw new NotFoundException('Stock location not found');
    }

    return this.prisma.stockMovement.create({
      data: {
        productId: data.productId,
        stockLocationId: data.stockLocationId,
        qtyChange: data.qtyChange,
        movementType: MovementType.ADJUSTMENT,
        notes: data.notes,
        createdBy: data.userId,
      },
      include: {
        product: true,
        stockLocation: true,
      },
    });
  }

  async getLocations(branchId?: number) {
    return this.prisma.stockLocation.findMany({
      where: branchId ? { branchId, active: true } : { active: true },
      include: {
        branch: true,
      },
    });
  }

  async getMovementHistory(params: {
    productId?: number;
    stockLocationId?: number;
    movementType?: MovementType;
    skip?: number;
    take?: number;
  }) {
    const {
      productId,
      stockLocationId,
      movementType,
      skip = 0,
      take = 50,
    } = params;

    const where: any = {};
    if (productId) where.productId = productId;
    if (stockLocationId) where.stockLocationId = stockLocationId;
    if (movementType) where.movementType = movementType;

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

  async createBatchAdjustment(data: {
    stockLocationId: number;
    adjustments: Array<{
      productId: number;
      qtyChange: number;
    }>;
    notes?: string;
    userId: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const movements = [];

      for (const adj of data.adjustments) {
        const movement = await tx.stockMovement.create({
          data: {
            productId: adj.productId,
            stockLocationId: data.stockLocationId,
            qtyChange: adj.qtyChange,
            movementType: MovementType.ADJUSTMENT,
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

  async createTransfer(data: {
    fromStockLocationId: number;
    toStockLocationId: number;
    items: Array<{
      productId: number;
      qty: number;
    }>;
    notes?: string;
    userId: number;
  }) {
    // Validate locations exist
    const fromLocation = await this.prisma.stockLocation.findUnique({
      where: { id: data.fromStockLocationId },
    });
    const toLocation = await this.prisma.stockLocation.findUnique({
      where: { id: data.toStockLocationId },
    });

    if (!fromLocation || !toLocation) {
      throw new NotFoundException('Stock location not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const transferOut = [];
      const transferIn = [];

      for (const item of data.items) {
        // Create outbound movement
        const outMovement = await tx.stockMovement.create({
          data: {
            productId: item.productId,
            stockLocationId: data.fromStockLocationId,
            qtyChange: -item.qty, // negative for outbound
            movementType: MovementType.TRANSFER_OUT,
            notes: data.notes,
            createdBy: data.userId,
          },
        });
        transferOut.push(outMovement);

        // Create inbound movement
        const inMovement = await tx.stockMovement.create({
          data: {
            productId: item.productId,
            stockLocationId: data.toStockLocationId,
            qtyChange: item.qty, // positive for inbound
            movementType: MovementType.TRANSFER_IN,
            notes: data.notes,
            createdBy: data.userId,
            refTable: 'stock_movements',
            refId: outMovement.id, // Link to outbound
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
}
