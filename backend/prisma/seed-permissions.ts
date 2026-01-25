import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
    // Dashboard
    { name: 'VIEW_DASHBOARD', description: 'Access to main dashboard' },

    // Inventory
    { name: 'VIEW_INVENTORY', description: 'View products, categories, stock' },
    { name: 'MANAGE_INVENTORY', description: 'Create/Edit products, categories, adjust stock' },

    // Sales (POS & Backoffice)
    { name: 'VIEW_SALES', description: 'View sales history' },
    { name: 'CREATE_SALES', description: 'Access POS and create sales' },
    { name: 'MANAGE_RETURNS', description: 'Process sales returns' },
    { name: 'VIEW_CUSTOMER_ACCOUNTS', description: 'View customer pending payments' },

    // Purchasing
    { name: 'VIEW_PURCHASING', description: 'View suppliers, GRNs, POs' },
    { name: 'MANAGE_PURCHASING', description: 'Create POs, GRNs, Manage Suppliers' },

    // People
    { name: 'VIEW_PEOPLE', description: 'View customers and suppliers' },
    { name: 'MANAGE_PEOPLE', description: 'Create/Edit customers and suppliers' },

    // Admin
    { name: 'VIEW_ADMIN', description: 'View users, reports, settings' },
    { name: 'MANAGE_ADMIN', description: 'Manage users, roles, platform settings' },

    // Platform Access Permissions
    { name: 'platform:normal', description: 'Access normal/offline sales channel' },
    { name: 'platform:noon', description: 'Access Noon marketplace' },
    { name: 'platform:amazon', description: 'Access Amazon marketplace' },
    { name: 'platform:jumia', description: 'Access Jumia marketplace' },
    { name: 'platform:social', description: 'Access social media sales' },
    { name: 'platform:pogba', description: 'Access Pogba platform' },
];

async function main() {
    console.log('Start seeding permissions...');

    for (const p of permissions) {
        const existing = await prisma.permission.findUnique({
            where: { name: p.name },
        });

        if (!existing) {
            await prisma.permission.create({
                data: p,
            });
            console.log(`Created permission: ${p.name}`);
        }
    }

    // Create Default Admin Role if not exists
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    if (adminRole) {
        const allPermissions = await prisma.permission.findMany();
        // Assign all permissions to Admin
        for (const p of allPermissions) {
            const exists = await prisma.rolePermission.findUnique({
                where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
            });
            if (!exists) {
                await prisma.rolePermission.create({
                    data: { roleId: adminRole.id, permissionId: p.id },
                });
            }
        }
        console.log('Assigned all permissions to Admin role');
    } else {
        // Create Admin Role
        const allPermissions = await prisma.permission.findMany();
        await prisma.role.create({
            data: {
                name: 'Admin',
                description: 'System Administrator',
                permissions: {
                    create: allPermissions.map((p: any) => ({
                        permission: { connect: { id: p.id } }
                    }))
                }
            }
        });
        console.log('Created Admin role with all permissions');
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
