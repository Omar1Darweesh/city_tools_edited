import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
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
              },
            },
          },
        },
      },
    });

    if (!user || !user.active) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      branchId: user.branchId,
    };

    const permissions = user.roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.name),
    );

    const roles = user.roles.map((ur: any) => ur.role.name);

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        branch: user.branch,
        roles,
        permissions,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // ✅ Step 1: Verify JWT signature
      const payload = this.jwtService.verify(refreshToken);

      // ✅ Step 2: Lookup user in database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
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
                },
              },
            },
          },
        },
      });

      // ✅ Step 3: Check if user exists
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // ✅ Step 4: Check if user is active
      if (!user.active) {
        throw new UnauthorizedException('User account is deactivated');
      }

      // ✅ Step 5: Create new tokens with fresh data
      const newPayload = {
        sub: user.id,
        username: user.username,
        branchId: user.branchId,
      };

      // ✅ Step 6: Return new tokens with updated user info
      const permissions = user.roles.flatMap((ur: any) =>
        ur.role.permissions.map((rp: any) => rp.permission.name),
      );

      const roles = user.roles.map((ur: any) => ur.role.name);

      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          branch: user.branch,
          roles,
          permissions,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = user.roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.name),
    );

    const roles = user.roles.map((ur: any) => ur.role.name);

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      branch: user.branch,
      roles,
      permissions,
    };
  }
}
