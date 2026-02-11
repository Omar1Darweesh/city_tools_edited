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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { skip = 0, take = 50, branchId } = params || {};
        const where = {};
        if (branchId)
            where.branchId = branchId;
        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take,
                include: {
                    branch: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data: users,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
        };
    }
    async create(data) {
        const existing = await this.prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existing) {
            throw new common_1.ConflictException('Username already exists');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                username: data.username,
                fullName: data.fullName,
                passwordHash,
                branchId: data.branchId || 1,
                active: true,
            },
        });
    }
    async update(id, data) {
        if (data.password) {
            data.passwordHash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.user.update({
            where: { id },
            data: { active: false },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map