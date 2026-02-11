import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { skip?: number; take?: number; branchId?: number }) {
    const MAX_TAKE = 500;
    const MAX_SKIP = 100000;
    const { skip = 0, take = 50, branchId } = params || {};

    // ✅ FIXED: Add max limits to prevent resource exhaustion
    const validatedTake = Math.min(Math.max(1, Number(take) || 50), MAX_TAKE);
    const validatedSkip = Math.min(Math.max(0, Number(skip) || 0), MAX_SKIP);

    const where: any = {};
    if (branchId) where.branchId = branchId;

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: validatedSkip,
        take: validatedTake,
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

  async create(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw new ConflictException('Username already exists');
    }

    // Validate password is not empty or whitespace
    if (!data.password || data.password.trim() === '') {
      throw new ConflictException('Password cannot be empty');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        fullName: data.fullName,
        passwordHash,
        branchId: data.branchId || 1, // Default branch
        active: true,
        roles: data.roleId
          ? {
              create: { roleId: Number(data.roleId) },
            }
          : undefined,
      },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async update(id: number, data: any) {
    // Handle password hashing if provided and not empty
    if (data.password) {
      if (data.password.trim() === '') {
        throw new ConflictException('Password cannot be empty');
      }
      data.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Always remove password field as it's not in Prisma schema (or not to be updated directly)
    delete data.password;

    // Handle roleId extraction
    const roleId = data.roleId;
    delete data.roleId; // Remove from data passed to user.update

    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        roles: roleId
          ? {
              deleteMany: {},
              create: { roleId: Number(roleId) },
            }
          : undefined,
      },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
                pages: {
                  // ✅ ADD THIS
                  include: {
                    page: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
