import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGRNDto, CreateSupplierDto } from './dto/purchasing.dto';
import { MovementType } from '@prisma/client';

import { CostAccountingService } from '../stock/cost-accounting.service';

@Injectable()
export class PurchasingService {
  constructor(
    private prisma: PrismaService,
    private costAccountingService: CostAccountingService,
  ) { }

  // ============= Suppliers =============
  async createSupplier(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAllSuppliers(params?: {
    skip?: number;
    take?: number;
    active?: boolean;
    search?: string;
  }) {
    const { skip = 0, take = 50, active, search } = params || {};
    const where: any = {};
    if (active !== undefined) where.active = active;
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

  async findOneSupplier(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async updateSupplier(id: number, data: any) {
    await this.findOneSupplier(id);
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async removeSupplier(id: number) {
    await this.findOneSupplier(id);
    // Ideally check for associated GRNs first
    return this.prisma.supplier.delete({ where: { id } });
  }

  // ============= GRN =============
  async createGRN(createGRNDto: CreateGRNDto, userId: number) {
    const { supplierId, branchId, relatedPoId, lines, notes, stockLocationId } =
      createGRNDto;

    // Validate supplier
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Find default stock location if not provided
    let locationId = stockLocationId;
    if (!locationId) {
      const defaultLocation = await this.prisma.stockLocation.findFirst({
        where: { branchId, active: true },
      });
      if (!defaultLocation) {
        throw new BadRequestException(
          'No active stock location found for this branch',
        );
      }
      locationId = defaultLocation.id;
    }

    // Validate all products exist
    for (const line of lines) {
      const product = await this.prisma.product.findUnique({
        where: { id: line.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${line.productId} not found`);
      }
    }

    // Generate GRN number
    const grnNo = await this.generateGRNNo(branchId);

    // Create GRN in transaction
    return this.prisma.$transaction(async (tx) => {
      // Calculate totals
      let subtotal = 0;
      const taxRateVal =
        createGRNDto.taxRate !== undefined ? createGRNDto.taxRate : 14;

      lines.forEach((l) => {
        subtotal += l.qty * l.cost;
      });

      const taxAmount = (subtotal * taxRateVal) / 100;
      const total = subtotal + taxAmount;

      // Create goods receipt
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

      // Create stock movements & Update Cost
      for (const line of lines) {
        // Update WAC first (using current stock before adding this GRN? No, usually after.
        // But my service logic assumes adding NEW batch to OLD stock. So call it.
        // Note: The service uses `stockMovement.aggregate` which reads DB.
        // Since we are in a transaction and haven't written movements yet,
        // the `aggregate` will return OLD stock quantity. This is EXACTLY what we want for the formula:
        // (OldQty * OldCost + NewQty * NewCost) / (OldQty + NewQty)
        await this.costAccountingService.updateWeightedAverageCost(
          line.productId,
          line.qty,
          line.cost,
          tx,
        );

        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            stockLocationId: locationId,
            qtyChange: line.qty, // positive for receipt
            movementType: MovementType.GRN,
            refTable: 'goods_receipts',
            refId: grn.id,
            createdBy: userId,
          },
        });

        // We don't need to manually update product.cost here because WAC service does it.
        // However, if we want to also track "Last Cost" explicitly as `product.cost`, the service does that too.
      }

      return grn;
    });
  }

  async findOneGRN(id: number) {
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
      throw new NotFoundException('GRN not found');
    }

    return grn;
  }

  async findAllGRNs(params?: {
    skip?: number;
    take?: number;
    branchId?: number;
  }) {
    const { skip = 0, take = 50, branchId } = params || {};
    const where: any = {};
    if (branchId !== undefined) where.branchId = branchId;

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

  private async generateGRNNo(branchId: number): Promise<string> {
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
}
