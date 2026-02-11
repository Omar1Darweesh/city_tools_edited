import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlatformSettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllPlatforms() {
    return this.prisma.platformSettings.findMany({
      orderBy: { platform: 'asc' },
    });
  }

  async getPlatform(platform: string) {
    return this.prisma.platformSettings.findUnique({
      where: { platform },
    });
  }

  async upsertPlatform(data: {
    platform: string;
    name?: string;
    icon?: string;
    taxRate: number;
    commission: number;
    shippingFee?: number;
    active?: boolean;
  }) {
    // 1. Create or update the platform
    const platformResult = await this.prisma.platformSettings.upsert({
      where: { platform: data.platform },
      update: {
        taxRate: data.taxRate,
        commission: data.commission,
        shippingFee: data.shippingFee ?? 0, // ✅ Default to 0
        active: data.active ?? true, // ✅ Default to true
        ...(data.name && { name: data.name }),
        ...(data.icon && { icon: data.icon }),
      },
      create: {
        platform: data.platform,
        name: data.name || data.platform,
        icon: data.icon || '🏪',
        taxRate: data.taxRate,
        commission: data.commission,
        shippingFee: data.shippingFee ?? 0, // ✅ Default to 0
        active: data.active ?? true, // ✅ Default to true
      },
    });

    // 2. ✅ AUTO-CREATE PERMISSION for this platform
    // Sanitize platform name for permission (remove non-ASCII, keep only alphanumeric and underscore)
    const sanitizedPlatform = data.platform
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_') // Remove duplicate underscores
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

    const permissionName = `platform:${sanitizedPlatform}`;
    const permissionDescription = `Access ${platformResult.name} marketplace`;

    await this.prisma.permission.upsert({
      where: { name: permissionName },
      create: {
        name: permissionName,
        description: permissionDescription,
      },
      update: {
        // Update description if platform name changed
        description: permissionDescription,
      },
    });

    return platformResult;
  }

  async deletePlatform(platform: string) {
    // 1. Delete the matching permission first
    // Sanitize platform name for permission lookup
    const sanitizedPlatform = platform
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const permissionName = `platform:${sanitizedPlatform}`;
    await this.prisma.permission.deleteMany({
      where: { name: permissionName },
    });

    // 2. Delete the platform
    return this.prisma.platformSettings.delete({
      where: { platform },
    });
  }

  async getTaxRate(platform: string): Promise<number> {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { platform },
    });
    return settings?.taxRate ? Number(settings.taxRate) : 15;
  }

  async getShippingFee(platform: string): Promise<number> {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { platform },
    });
    return settings?.shippingFee ? Number(settings.shippingFee) : 0;
  }

  async initializeDefaultPlatforms() {
    const platforms = [
      {
        platform: 'offline',
        name: 'offline',
        icon: '🏪',
        taxRate: 0,
        commission: 0,
        shippingFee: 0,
        active: true,
      },
      {
        platform: 'Social',
        name: 'Social',
        icon: '📱',
        taxRate: 20,
        commission: 20,
        shippingFee: 0,
        active: true,
      },
      {
        platform: 'Noon',
        name: 'Noon',
        icon: '🌙',
        taxRate: 70,
        commission: 20,
        shippingFee: 0,
        active: true,
      },
      {
        platform: 'pogba',
        name: 'pogba',
        icon: '⚽',
        taxRate: 59,
        commission: 3,
        shippingFee: 0,
        active: true,
      },
      {
        platform: 'Amazon',
        name: 'Amazon',
        icon: '📦',
        taxRate: 15,
        commission: 0,
        shippingFee: 0,
        active: true,
      },
      {
        platform: 'Jumia',
        name: 'Jumia',
        icon: '🛍️',
        taxRate: 63,
        commission: 80,
        shippingFee: 0,
        active: true,
      },
    ];

    for (const platform of platforms) {
      await this.upsertPlatform(platform);
    }

    return platforms;
  }
}
