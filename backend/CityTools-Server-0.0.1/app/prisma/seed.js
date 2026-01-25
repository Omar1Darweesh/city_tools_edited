"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const branch = await prisma.branch.upsert({
        where: { code: 'BR001' },
        update: {},
        create: {
            name: 'Main Branch',
            code: 'BR001',
            address: '123 Main Street, City',
            active: true,
        },
    });
    console.log('✅ Created branch:', branch.name);
    const stockLocation = await prisma.stockLocation.upsert({
        where: { id: 1 },
        update: {},
        create: {
            branchId: branch.id,
            name: 'Main Store',
            active: true,
        },
    });
    console.log('✅ Created stock location:', stockLocation.name);
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'Full system access',
        },
    });
    const managerRole = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: {
            name: 'MANAGER',
            description: 'Branch manager with elevated permissions',
        },
    });
    const storekeeperRole = await prisma.role.upsert({
        where: { name: 'STOREKEEPER' },
        update: {},
        create: {
            name: 'STOREKEEPER',
            description: 'Inventory and receiving management',
        },
    });
    const cashierRole = await prisma.role.upsert({
        where: { name: 'CASHIER' },
        update: {},
        create: {
            name: 'CASHIER',
            description: 'POS operations only',
        },
    });
    console.log('✅ Created roles');
    const permissions = [
        { name: 'products:read', description: 'View products' },
        { name: 'products:write', description: 'Create/edit products' },
        { name: 'sales:create', description: 'Create sales' },
        { name: 'sales:read', description: 'View sales' },
        { name: 'stock:read', description: 'View stock' },
        { name: 'stock:adjust', description: 'Adjust stock' },
        { name: 'purchasing:read', description: 'View purchases' },
        { name: 'purchasing:write', description: 'Create purchases' },
        { name: 'users:manage', description: 'Manage users' },
        { name: 'settings:manage', description: 'Manage settings' },
    ];
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: perm,
        });
    }
    console.log('✅ Created permissions');
    const allPermissions = await prisma.permission.findMany();
    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: perm.id,
            },
        });
    }
    const managerPerms = allPermissions.filter((p) => !p.name.includes('users:manage'));
    for (const perm of managerPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: managerRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: managerRole.id,
                permissionId: perm.id,
            },
        });
    }
    const storekeeperPerms = allPermissions.filter((p) => ['products:read', 'stock:read', 'stock:adjust', 'purchasing:read', 'purchasing:write'].includes(p.name));
    for (const perm of storekeeperPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: storekeeperRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: storekeeperRole.id,
                permissionId: perm.id,
            },
        });
    }
    const cashierPerms = allPermissions.filter((p) => ['products:read', 'sales:create', 'sales:read'].includes(p.name));
    for (const perm of cashierPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: cashierRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: cashierRole.id,
                permissionId: perm.id,
            },
        });
    }
    console.log('✅ Assigned permissions to roles');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: hashedPassword,
            fullName: 'System Administrator',
            branchId: branch.id,
            active: true,
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });
    console.log('✅ Created admin user (username: admin, password: admin123)');
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashierUser = await prisma.user.upsert({
        where: { username: 'cashier' },
        update: {},
        create: {
            username: 'cashier',
            passwordHash: cashierPassword,
            fullName: 'John Cashier',
            branchId: branch.id,
            active: true,
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: cashierUser.id,
                roleId: cashierRole.id,
            },
        },
        update: {},
        create: {
            userId: cashierUser.id,
            roleId: cashierRole.id,
        },
    });
    console.log('✅ Created cashier user (username: cashier, password: cashier123)');
    const category1 = await prisma.category.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Electronics',
            nameAr: 'إلكترونيات',
            active: true,
        },
    });
    const category2 = await prisma.category.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Food & Beverages',
            nameAr: 'طعام ومشروبات',
            active: true,
        },
    });
    console.log('✅ Created product categories');
    const product1 = await prisma.product.upsert({
        where: { barcode: '1234567890123' },
        update: {},
        create: {
            code: 'PROD001',
            barcode: '1234567890123',
            nameEn: 'Wireless Mouse',
            nameAr: 'ماوس لاسلكي',
            categoryId: category1.id,
            brand: 'Logitech',
            unit: 'PCS',
            cost: 15.00,
            priceRetail: 25.00,
            priceWholesale: 20.00,
            minQty: 10,
            maxQty: 100,
            active: true,
        },
    });
    const product2 = await prisma.product.upsert({
        where: { barcode: '1234567890124' },
        update: {},
        create: {
            code: 'PROD002',
            barcode: '1234567890124',
            nameEn: 'USB Cable',
            nameAr: 'كابل يو اس بي',
            categoryId: category1.id,
            brand: 'Generic',
            unit: 'PCS',
            cost: 2.00,
            priceRetail: 5.00,
            priceWholesale: 4.00,
            minQty: 50,
            maxQty: 500,
            active: true,
        },
    });
    const product3 = await prisma.product.upsert({
        where: { barcode: '1234567890125' },
        update: {},
        create: {
            code: 'PROD003',
            barcode: '1234567890125',
            nameEn: 'Bottled Water',
            nameAr: 'مياه معبأة',
            categoryId: category2.id,
            brand: 'Aquafina',
            unit: 'BTL',
            cost: 0.50,
            priceRetail: 1.00,
            priceWholesale: 0.80,
            minQty: 100,
            maxQty: 1000,
            active: true,
        },
    });
    console.log('✅ Created sample products');
    const supplier = await prisma.supplier.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Tech Supplies Inc.',
            contact: 'Ahmed Ali',
            phone: '+1234567890',
            email: 'contact@techsupplies.com',
            address: '456 Supplier St., Industrial Area',
            paymentTerms: 'Net 30 days',
            active: true,
        },
    });
    console.log('✅ Created sample supplier');
    console.log('');
    console.log('🎉 Seeding completed successfully!');
    console.log('');
    console.log('📝 Test Credentials:');
    console.log('   Admin    - username: admin    password: admin123');
    console.log('   Cashier  - username: cashier  password: cashier123');
    console.log('');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map