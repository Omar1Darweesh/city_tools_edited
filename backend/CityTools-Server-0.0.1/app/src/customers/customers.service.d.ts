import { PrismaService } from '../prisma.service';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        taxNumber: string | null;
    }>;
    findAll(params?: {
        skip?: number;
        take?: number;
        active?: boolean;
    }): Promise<{
        data: {
            id: number;
            name: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            taxNumber: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        taxNumber: string | null;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        type: import(".prisma/client").$Enums.CustomerType;
        taxNumber: string | null;
    }>;
}
