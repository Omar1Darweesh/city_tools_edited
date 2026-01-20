"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PlatformSettingsService = class PlatformSettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllPlatforms() {
        return this.prisma.platformSettings.findMany({
            orderBy: { platform: 'asc' },
        });
    }
    async getPlatform(platform) {
        return this.prisma.platformSettings.findUnique({
            where: { platform },
        });
    }
    async upsertPlatform(data) {
        return this.prisma.platformSettings.upsert({
            where: { platform: data.platform },
            update: {
                taxRate: data.taxRate,
                commission: data.commission,
                active: data.active,
                ...(data.name && { name: data.name }),
                ...(data.icon && { icon: data.icon }),
            },
            create: {
                platform: data.platform,
                name: data.name || data.platform,
                icon: data.icon || '🏪',
                taxRate: data.taxRate,
                commission: data.commission,
                active: data.active,
            },
        });
    }
    async deletePlatform(platform) {
        return this.prisma.platformSettings.delete({
            where: { platform },
        });
    }
    async getTaxRate(platform) {
        const settings = await this.prisma.platformSettings.findUnique({
            where: { platform },
        });
        return settings?.taxRate ? Number(settings.taxRate) : 15;
    }
    async initializeDefaultPlatforms() {
        const platforms = [
            { platform: 'NORMAL', name: 'عادي', icon: '🏪', taxRate: 15, commission: 0, active: true },
            { platform: 'NOON', name: 'نون', icon: '🌙', taxRate: 15, commission: 12, active: true },
            { platform: 'AMAZON', name: 'أمازون', icon: '📦', taxRate: 15, commission: 15, active: true },
            { platform: 'SALLA', name: 'سلة', icon: '🛍️', taxRate: 15, commission: 8, active: true },
            { platform: 'ZID', name: 'زد', icon: '⚡', taxRate: 15, commission: 8, active: true },
        ];
        for (const platform of platforms) {
            await this.upsertPlatform(platform);
        }
        return platforms;
    }
};
exports.PlatformSettingsService = PlatformSettingsService;
exports.PlatformSettingsService = PlatformSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlatformSettingsService);
//# sourceMappingURL=platform-settings.service.js.map