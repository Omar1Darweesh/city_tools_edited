import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        pages: {
          include: {
            page: true,
          },
        },
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
        pages: {
          include: {
            page: true,
          },
        },
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

  async create(data: {
    name: string;
    description?: string;
    pageIds?: number[];
    platformPermissionIds?: number[];
  }) {
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
        pages: {
          create: (data.pageIds || []).map((id) => ({
            page: { connect: { id } },
          })),
        },
        permissions: {
          create: (data.platformPermissionIds || []).map((id) => ({
            permission: { connect: { id } },
          })),
        },
      },
      include: {
        pages: {
          include: {
            page: true,
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      pageIds?: number[];
      platformPermissionIds?: number[];
    },
  ) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (data.name && data.name !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new BadRequestException('Role name already taken');
      }
    }

    // Handle pages update
    if (data.pageIds !== undefined) {
      await this.prisma.rolePage.deleteMany({
        where: { roleId: id },
      });
    }

    // Handle platform permissions update
    if (data.platformPermissionIds !== undefined) {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ...(data.pageIds !== undefined && {
          pages: {
            create: data.pageIds.map((pageId) => ({
              page: { connect: { id: pageId } },
            })),
          },
        }),
        ...(data.platformPermissionIds !== undefined && {
          permissions: {
            create: data.platformPermissionIds.map((permId) => ({
              permission: { connect: { id: permId } },
            })),
          },
        }),
      },
      include: {
        pages: {
          include: {
            page: true,
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // ✅ Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // ✅ PREVENT deletion of system roles
    if (role.isSystem) {
      throw new BadRequestException(
        `Cannot delete system role "${role.name}". System roles are protected.`,
      );
    }
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

  // Get all pages grouped by category
  async getPages() {
    const pages = await this.prisma.page.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Group by category
    const grouped = pages.reduce(
      (acc, page) => {
        if (!acc[page.category]) {
          acc[page.category] = [];
        }
        acc[page.category].push(page);
        return acc;
      },
      {} as Record<string, typeof pages>,
    );

    return grouped;
  }

  // Get platform permissions only (those starting with "platform:")
  async getPlatformPermissions() {
    return this.prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'platform:',
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Legacy: kept for backward compatibility
  async getPermissions() {
    return this.prisma.permission.findMany();
  }
}
