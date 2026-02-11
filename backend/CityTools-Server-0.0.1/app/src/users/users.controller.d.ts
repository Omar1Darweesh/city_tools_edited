import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(skip?: string, take?: string, branchId?: string): Promise<{
        data: ({
            branch: {
                id: number;
                name: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                address: string | null;
            };
            roles: ({
                role: {
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                };
            } & {
                roleId: number;
                userId: number;
            })[];
        } & {
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: number;
            username: string;
            passwordHash: string;
            fullName: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    create(data: any): Promise<{
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        username: string;
        passwordHash: string;
        fullName: string;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        username: string;
        passwordHash: string;
        fullName: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        branchId: number;
        username: string;
        passwordHash: string;
        fullName: string;
    }>;
}
