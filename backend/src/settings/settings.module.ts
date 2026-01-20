import { Module } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { PlatformSettingsController } from './platform-settings.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [PlatformSettingsController],
    providers: [PlatformSettingsService, PrismaService],
    exports: [PlatformSettingsService],
})
export class SettingsModule { }
