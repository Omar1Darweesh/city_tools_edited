import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(params?: { skip?: number; take?: number; branchId?: number }) {
    const { skip = 0, take = 50, branchId } = params || {};
    const where: any = {};
    if (branchId) where.branchId = branchId;

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

  async create(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        fullName: data.fullName,
        passwordHash,
        branchId: data.branchId || 1, // Default branch
        active: true,
        roles: data.roleId ? {
          create: { roleId: Number(data.roleId) }
        } : undefined,
      },
      include: {
        roles: { include: { role: true } }
      }
    });
  }

  async update(id: number, data: any) {
    // Handle password hashing if provided and not empty
    if (data.password && data.password.trim() !== '') {
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
        roles: roleId ? {
          deleteMany: {},
          create: { roleId: Number(roleId) }
        } : undefined
      },
      include: {
        roles: { include: { role: true } }
      }
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
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
}
