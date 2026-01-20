import { PrismaService } from '../prisma.service';
import { AuditAction, Prisma } from '@prisma/client';
export declare class ProductAuditService {
    private prisma;
    constructor(prisma: PrismaService);
    getProductAuditHistory(productId: number): Promise<({
        product: {
            id: number;
            nameAr: string | null;
            code: string;
            nameEn: string;
        };
        user: {
            id: number;
            username: string;
            fullName: string;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        productId: number;
        action: import(".prisma/client").$Enums.AuditAction;
        oldData: Prisma.JsonValue | null;
        newData: Prisma.JsonValue | null;
    })[]>;
    getFormattedAuditHistory(productId: number): Promise<{
        id: number;
        action: import(".prisma/client").$Enums.AuditAction;
        changes: {
            field: string;
            oldValue: any;
            newValue: any;
        }[];
        user: {
            id: number;
            username: string;
            fullName: string;
        };
        timestamp: Date;
        product: {
            id: number;
            nameAr: string | null;
            code: string;
            nameEn: string;
        };
    }[]>;
    private extractChanges;
    private compareValues;
    logChange(productId: number, action: AuditAction, newData: any, oldData: any, userId: number): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        productId: number;
        action: import(".prisma/client").$Enums.AuditAction;
        oldData: Prisma.JsonValue | null;
        newData: Prisma.JsonValue | null;
    }>;
    private cleanDataForAudit;
}
