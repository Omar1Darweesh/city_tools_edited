import { PrismaService } from '../prisma.service';
export declare class PlatformSettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllPlatforms(): Promise<{
        id: number;
        name: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        platform: string;
        icon: string | null;
        commission: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getPlatform(platform: string): Promise<{
        id: number;
        name: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        platform: string;
        icon: string | null;
        commission: import("@prisma/client/runtime/library").Decimal;
    } | null>;
    upsertPlatform(data: {
        platform: string;
        name?: string;
        icon?: string;
        taxRate: number;
        commission: number;
        active: boolean;
    }): Promise<{
        id: number;
        name: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        platform: string;
        icon: string | null;
        commission: import("@prisma/client/runtime/library").Decimal;
    }>;
    deletePlatform(platform: string): Promise<{
        id: number;
        name: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        platform: string;
        icon: string | null;
        commission: import("@prisma/client/runtime/library").Decimal;
    }>;
    getTaxRate(platform: string): Promise<number>;
    initializeDefaultPlatforms(): Promise<{
        platform: string;
        name: string;
        icon: string;
        taxRate: number;
        commission: number;
        active: boolean;
    }[]>;
}
