import { PlatformSettingsService } from './platform-settings.service';
export declare class PlatformSettingsController {
    private platformSettingsService;
    constructor(platformSettingsService: PlatformSettingsService);
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
    createPlatform(body: {
        platform: string;
        name: string;
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
    updatePlatform(platform: string, body: {
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
    initializeDefaults(): Promise<{
        platform: string;
        name: string;
        icon: string;
        taxRate: number;
        commission: number;
        active: boolean;
    }[]>;
}
