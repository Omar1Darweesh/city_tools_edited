import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        name: createCustomerDto.name,
        phone: createCustomerDto.phone || null,
        type: createCustomerDto.type,
        taxNumber: createCustomerDto.taxNumber || null,
        address: createCustomerDto.address || null,
        active: createCustomerDto.active ?? true, // ✅ CHANGE THIS LINE
      },
    });
  }

  async findAll(params?: { skip?: number; take?: number; active?: boolean }) {
    const MAX_TAKE = 500;
    const MAX_SKIP = 100000;
    const { skip = 0, take = 50, active } = params || {};

    // ✅ FIXED: Add max limits to prevent resource exhaustion
    const validatedTake = Math.min(Math.max(1, Number(take) || 50), MAX_TAKE);
    const validatedSkip = Math.min(Math.max(0, Number(skip) || 0), MAX_SKIP);

    const where: any = {};
    if (active !== undefined) where.active = active;

    const [total, customers] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip: validatedSkip,
        take: validatedTake,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data: customers,
      total,
      page: Math.floor(validatedSkip / validatedTake) + 1,
      pageSize: validatedTake,
    };
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    // ✅ Check if customer exists
    await this.findOne(id);

    // ✅ Build update data dynamically
    const updateData: any = {};

    if (updateCustomerDto.name !== undefined) {
      updateData.name = updateCustomerDto.name;
    }

    if (updateCustomerDto.phone !== undefined) {
      updateData.phone = updateCustomerDto.phone || null;
    }

    if (updateCustomerDto.type !== undefined) {
      updateData.type = updateCustomerDto.type;
    }

    if (updateCustomerDto.taxNumber !== undefined) {
      updateData.taxNumber = updateCustomerDto.taxNumber || null;
    }

    if (updateCustomerDto.address !== undefined) {
      updateData.address = updateCustomerDto.address || null;
    }

    if (updateCustomerDto.active !== undefined) {
      updateData.active = updateCustomerDto.active; // ✅ Allow active field
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }
}
