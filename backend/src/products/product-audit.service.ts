import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditAction, Prisma } from '@prisma/client';

@Injectable()
export class ProductAuditService {
  constructor(private prisma: PrismaService) { }

  async getProductAuditHistory(productId: number) {
    return this.prisma.productAudit.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        product: {
          select: {
            id: true,
            code: true,
            nameEn: true,
            nameAr: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFormattedAuditHistory(productId: number) {
    const audits = await this.getProductAuditHistory(productId);
    return audits.map((audit) => {
      const changes = this.extractChanges(audit.oldData, audit.newData);
      return {
        id: audit.id,
        action: audit.action,
        changes,
        user: audit.user,
        timestamp: audit.createdAt,
        product: audit.product,
      };
    });
  }

  private extractChanges(oldData: any, newData: any): Array<{ field: string, oldValue: any, newValue: any }> {
    if (!oldData || !newData) return [];

    const changes = [];
    const fieldsToTrack = [
      'nameEn', 'nameAr', 'barcode', 'code',
      'priceRetail', 'priceWholesale', 'cost',
      'brand', 'unit', 'active', 'minQty', 'maxQty'
    ];

    for (const field of fieldsToTrack) {
      const oldValue = oldData[field];
      const newValue = newData[field];

      const areEqual = this.compareValues(oldValue, newValue);

      if (!areEqual) {
        changes.push({
          field,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
    }

    return changes;
  }

  private compareValues(val1: any, val2: any): boolean {
    if (val1 == null && val2 == null) return true;
    if (val1 == null || val2 == null) return false;

    if (typeof val1 === 'number' || typeof val2 === 'number') {
      return Number(val1) === Number(val2);
    }

    if (typeof val1 === 'boolean' || typeof val2 === 'boolean') {
      return Boolean(val1) === Boolean(val2);
    }

    return String(val1) === String(val2);
  }

  async logChange(
    productId: number,
    action: AuditAction,
    newData: any,
    oldData: any,
    userId: number,
  ) {
    try {
      const cleanNewData = this.cleanDataForAudit(newData);
      const cleanOldData = this.cleanDataForAudit(oldData);

      console.log('📝 Creating audit log:', {
        productId,
        action,
        userId,
        changes: this.extractChanges(cleanOldData, cleanNewData),
      });

      const audit = await this.prisma.productAudit.create({
        data: {
          productId,
          action,
          newData: cleanNewData as Prisma.InputJsonValue,
          oldData: cleanOldData as Prisma.InputJsonValue,
          userId,
        },
      });

      console.log('✅ Audit log created successfully:', audit.id);
      return audit;
    } catch (error) {
      console.error('❌ Failed to create audit log:', error);
      throw error;
    }
  }

  private cleanDataForAudit(data: any) {
    if (!data) return undefined;

    return {
      id: data.id,
      code: data.code,
      barcode: data.barcode,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      brand: data.brand,
      unit: data.unit,
      cost: Number(data.cost),
      priceRetail: Number(data.priceRetail),
      priceWholesale: Number(data.priceWholesale),
      minQty: data.minQty,
      maxQty: data.maxQty,
      active: data.active,
      categoryId: data.categoryId,
      itemTypeId: data.itemTypeId,
    };
  }
}
