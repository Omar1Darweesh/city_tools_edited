import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: any): Promise<{
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
    findAll(skip?: number, take?: number, active?: boolean): Promise<{
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
    update(id: number, updateCustomerDto: any): Promise<{
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
