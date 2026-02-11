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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_settings_service_1 = require("./platform-settings.service");
let PlatformSettingsController = class PlatformSettingsController {
    constructor(platformSettingsService) {
        this.platformSettingsService = platformSettingsService;
    }
    getAllPlatforms() {
        return this.platformSettingsService.getAllPlatforms();
    }
    getPlatform(platform) {
        return this.platformSettingsService.getPlatform(platform);
    }
    createPlatform(body) {
        return this.platformSettingsService.upsertPlatform(body);
    }
    updatePlatform(platform, body) {
        return this.platformSettingsService.upsertPlatform({
            platform,
            ...body,
        });
    }
    deletePlatform(platform) {
        return this.platformSettingsService.deletePlatform(platform);
    }
    initializeDefaults() {
        return this.platformSettingsService.initializeDefaultPlatforms();
    }
};
exports.PlatformSettingsController = PlatformSettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformSettingsController.prototype, "getAllPlatforms", null);
__decorate([
    (0, common_1.Get)(':platform'),
    __param(0, (0, common_1.Param)('platform')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformSettingsController.prototype, "getPlatform", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlatformSettingsController.prototype, "createPlatform", null);
__decorate([
    (0, common_1.Put)(':platform'),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlatformSettingsController.prototype, "updatePlatform", null);
__decorate([
    (0, common_1.Delete)(':platform'),
    __param(0, (0, common_1.Param)('platform')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformSettingsController.prototype, "deletePlatform", null);
__decorate([
    (0, common_1.Put)('initialize/defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformSettingsController.prototype, "initializeDefaults", null);
exports.PlatformSettingsController = PlatformSettingsController = __decorate([
    (0, common_1.Controller)('settings/platforms'),
    __metadata("design:paramtypes", [platform_settings_service_1.PlatformSettingsService])
], PlatformSettingsController);
//# sourceMappingURL=platform-settings.controller.js.map