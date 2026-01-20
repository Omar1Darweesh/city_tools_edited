import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        name: string;
        phone?: string;
        type: 'RETAIL' | 'WHOLESALE';
        createdBy: number;
    }) {
        return this.prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone || null,
                type: data.type,
                active: true,
                //createdBy: data.createdBy,
            },
        });
    }

    async findAll(params?: { skip?: number; take?: number; active?: boolean }) {
        const { skip = 0, take = 50, active } = params || {};
        const where: any = {};
        if (active !== undefined) where.active = active;

        const [total, customers] = await Promise.all([
            this.prisma.customer.count({ where }),
            this.prisma.customer.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' },
            }),
        ]);

        return {
            data: customers,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
        };
    }

    async findOne(id: number) {
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async update(id: number, data: any) {
        return this.prisma.customer.update({ where: { id }, data });
    }
}
