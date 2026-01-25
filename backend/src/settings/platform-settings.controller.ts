import { Controller, Get, Put, Post, Delete, Body, Param } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';

@Controller('settings/platforms')
export class PlatformSettingsController {
    constructor(private platformSettingsService: PlatformSettingsService) { }

    @Get()
    getAllPlatforms() {
        return this.platformSettingsService.getAllPlatforms();
    }

    @Get(':platform')
    getPlatform(@Param('platform') platform: string) {
        return this.platformSettingsService.getPlatform(platform);
    }

    @Post()
    createPlatform(
        @Body()
        body: {
            platform: string;
            name: string;
            icon?: string;
            taxRate: number;
            commission: number;
            shippingFee: number; // ✅ ADD THIS
            active: boolean;
        },
    ) {
        return this.platformSettingsService.upsertPlatform(body);
    }

    @Put(':platform')
    updatePlatform(
        @Param('platform') platform: string,
        @Body()
        body: {
            name?: string;
            icon?: string;
            taxRate: number;
            commission: number;
            shippingFee: number; // ✅ ADD THIS
            active: boolean;
        },
    ) {
        return this.platformSettingsService.upsertPlatform({
            platform,
            ...body,
        });
    }

    @Delete(':platform')
    deletePlatform(@Param('platform') platform: string) {
        return this.platformSettingsService.deletePlatform(platform);
    }

    @Put('initialize/defaults')
    initializeDefaults() {
        return this.platformSettingsService.initializeDefaultPlatforms();
    }
}
