import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create a demo branch
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

    // Create stock location for the branch
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

    // Create roles
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

    // Create permissions
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

    // Assign permissions to roles
    const allPermissions = await prisma.permission.findMany();

    // Admin gets all permissions
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

    // Manager gets most permissions except user management
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

    // Storekeeper permissions
    const storekeeperPerms = allPermissions.filter((p) =>
        ['products:read', 'stock:read', 'stock:adjust', 'purchasing:read', 'purchasing:write'].includes(p.name),
    );
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

    // Cashier permissions
    const cashierPerms = allPermissions.filter((p) =>
        ['products:read', 'sales:create', 'sales:read'].includes(p.name),
    );
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

    // Create admin user
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

    // Create a cashier user
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

    // ✅ CREATE SYSTEM CATEGORIES (AUTOMATIC)
    // These categories are created automatically and should not be deleted
    const defectiveCategory = await prisma.category.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'DEFECTIVE',
            nameAr: 'تالف',
            active: true,
        },
    });

    const mixedCategory = await prisma.category.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'MIXED',
            nameAr: 'منوعات',
            active: true,
        },
    });
    console.log('✅ Created system categories: DEFECTIVE (تالف), MIXED (منوعات)');
    console.log('   ⚠️  These are system categories for special products');

    // Create a supplier
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
    console.log('   Admin - username: admin password: admin123');
    console.log('   Cashier - username: cashier password: cashier123');
    console.log('');
    console.log('📦 System Categories Created:');
    console.log('   1. DEFECTIVE (تالف) - For damaged/defective products');
    console.log('   2. MIXED (منوعات) - For miscellaneous items');
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