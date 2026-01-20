import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }

    async findOne(id: number) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async create(data: { name: string; description?: string; permissionIds: number[] }) {
        const existing = await this.prisma.role.findUnique({
            where: { name: data.name },
        });

        if (existing) {
            throw new BadRequestException('Role already exists');
        }

        return this.prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                permissions: {
                    create: data.permissionIds.map((id) => ({
                        permission: { connect: { id } },
                    })),
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }

    async update(id: number, data: { name?: string; description?: string; permissionIds?: number[] }) {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (data.name && data.name !== role.name) {
            const existing = await this.prisma.role.findUnique({ where: { name: data.name } });
            if (existing) {
                throw new BadRequestException('Role name already taken');
            }
        }

        // Handle permissions update if provided
        let permissionsUpdate = {};
        if (data.permissionIds) {
            // First, delete existing
            await this.prisma.rolePermission.deleteMany({
                where: { roleId: id },
            });

            // Then create new
            permissionsUpdate = {
                permissions: {
                    create: data.permissionIds.map((pid) => ({
                        permission: { connect: { id: pid } },
                    })),
                },
            };
        }

        return this.prisma.role.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                ...permissionsUpdate,
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }

    async remove(id: number) {
        // Check if any user has this role
        const userRole = await this.prisma.userRole.findFirst({
            where: { roleId: id },
        });

        if (userRole) {
            throw new BadRequestException('Cannot delete role assigned to users');
        }

        return this.prisma.role.delete({
            where: { id },
        });
    }

    async getPermissions() {
        return this.prisma.permission.findMany();
    }
}
