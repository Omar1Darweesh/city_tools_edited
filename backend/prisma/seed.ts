import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // ========================================
    // 1. CREATE BRANCHES
    // ========================================
    console.log('🏢 Creating branches...');
    const mainBranch = await prisma.branch.upsert({
        where: { code: 'BR001' },
        update: {},
        create: {
            name: 'Main Branch',
            code: 'BR001',
            address: '123 Main Street, City',
            active: true,
        },
    });
    console.log('✅ Branch created\n');


    // ========================================
    // 2. CREATE STOCK LOCATIONS
    // ========================================
    console.log('📍 Creating stock locations...');

    // Main Warehouse
    const existingMainWarehouse = await prisma.stockLocation.findFirst({
        where: {
            branchId: mainBranch.id,
            name: 'Main Warehouse'
        }
    });

    if (!existingMainWarehouse) {
        await prisma.stockLocation.create({
            data: {
                branchId: mainBranch.id,
                name: 'Main Warehouse',
                active: true,
            },
        });
    }

    // Showroom
    const existingShowroom = await prisma.stockLocation.findFirst({
        where: {
            branchId: mainBranch.id,
            name: 'Showroom'
        }
    });

    if (!existingShowroom) {
        await prisma.stockLocation.create({
            data: {
                branchId: mainBranch.id,
                name: 'Showroom',
                active: true,
            },
        });
    }

    console.log('✅ 2 stock locations created\n');


    // ========================================
    // 2. CREATE DEFAULT CATEGORIES
    // ========================================
    console.log('📦 Creating default categories...');
    const categories = [
        { name: 'Mixed', nameAr: 'مختلط', active: true },
        { name: 'Defective', nameAr: 'تلافيات', active: true },
    ];

    for (const cat of categories) {
        const existing = await prisma.category.findFirst({
            where: { name: cat.name }
        });

        if (!existing) {
            await prisma.category.create({
                data: cat,
            });
        }
    }
    console.log(`✅ ${categories.length} categories created\n`);


    // ========================================
    // 2. CREATE PERMISSIONS
    // ========================================
    console.log('🔐 Creating permissions...');
    const permissions = [
        { name: 'products:read', description: 'View products' },
        { name: 'products:write', description: 'Create/edit products' },
        { name: 'sales:create', description: 'Create sales' },
        { name: 'sales:read', description: 'View sales' },
        { name: 'stock:read', description: 'View stock' },
        { name: 'stock:adjust', description: 'Adjust stock levels' },
        { name: 'purchasing:read', description: 'View purchases' },
        { name: 'purchasing:write', description: 'Create purchases' },
        { name: 'users:manage', description: 'Manage users and roles' },
        { name: 'settings:manage', description: 'Manage system settings' },
    ];

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: perm,
            create: perm,
        });
    }
    console.log(`✅ ${permissions.length} permissions created\n`);

    // ========================================
    // 3. CREATE ROLES
    // ========================================
    console.log('📋 Creating roles...');
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'Full system access',
            isSystem: true  // ✅ Mark as system role
        },
    });

    await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: {
            name: 'MANAGER',
            description: 'Branch manager',
            isSystem: true  // ✅ Mark as system role
        },
    });

    await prisma.role.upsert({
        where: { name: 'STOREKEEPER' },
        update: {},
        create: {
            name: 'STOREKEEPER',
            description: 'Inventory management',
            isSystem: false  // Not a system role
        },
    });

    await prisma.role.upsert({
        where: { name: 'CASHIER' },
        update: {},
        create: {
            name: 'CASHIER',
            description: 'POS operations',
            isSystem: false  // Not a system role
        },
    });
    console.log('✅ 4 roles created\n');

    // ========================================
    // 4. ASSIGN PERMISSIONS TO ADMIN ROLE
    // ========================================
    console.log('🔗 Assigning permissions to ADMIN...');
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
    console.log(`✅ Assigned ${allPermissions.length} permissions to ADMIN\n`);

    // ========================================
    // 5. CREATE PAGES
    // ========================================
    console.log('📄 Creating pages...');
    const pages = [
        // Transactions (المعاملات)
        { key: 'sales', nameAr: 'المبيعات', nameEn: 'Sales', route: '/sales', category: 'transactions', icon: 'ShoppingCart', sortOrder: 1 },
        { key: 'returns', nameAr: 'المرتجعات', nameEn: 'Returns', route: '/returns', category: 'transactions', icon: 'RotateCcw', sortOrder: 2 },
        { key: 'customer-payments', nameAr: 'حسابات العملاء', nameEn: 'Customer Payments', route: '/customer-payments', category: 'transactions', icon: 'DollarSign', sortOrder: 3 },
        { key: 'receive-goods', nameAr: 'استلام بضاعة', nameEn: 'Receive Goods', route: '/receive-goods', category: 'transactions', icon: 'Package', sortOrder: 4 },
        { key: 'transfers', nameAr: 'التحويلات', nameEn: 'Transfers', route: '/transfers', category: 'transactions', icon: 'Plane', sortOrder: 5 },

        // Inventory (المخزون)
        { key: 'products', nameAr: 'المنتجات', nameEn: 'Products', route: '/products', category: 'inventory', icon: 'Box', sortOrder: 6 },
        { key: 'categories', nameAr: 'التصنيفات', nameEn: 'Categories', route: '/categories', category: 'inventory', icon: 'Tags', sortOrder: 7 },
        { key: 'stock-adjustments', nameAr: 'تسوية المخزون', nameEn: 'Stock Adjustments', route: '/stock-adjustments', category: 'inventory', icon: 'ClipboardList', sortOrder: 8 },
        { key: 'price-management', nameAr: 'إدارة الأسعار', nameEn: 'Price Management', route: '/price-management', category: 'inventory', icon: 'DollarSign', sortOrder: 9 },

        // People (الأشخاص)
        { key: 'customers', nameAr: 'العملاء', nameEn: 'Customers', route: '/customers', category: 'people', icon: 'Users', sortOrder: 11 },
        { key: 'suppliers', nameAr: 'الموردين', nameEn: 'Suppliers', route: '/suppliers', category: 'people', icon: 'Truck', sortOrder: 12 },

        // Admin (الإدارة)
        { key: 'users', nameAr: 'المستخدمين', nameEn: 'Users', route: '/users', category: 'admin', icon: 'UserCog', sortOrder: 13 },
        { key: 'roles', nameAr: 'الأدوار والصلاحيات', nameEn: 'Roles', route: '/roles', category: 'admin', icon: 'Shield', sortOrder: 14 },
        { key: 'platform-settings', nameAr: 'إعدادات المنصات', nameEn: 'Platform Settings', route: '/platform-settings', category: 'admin', icon: 'Settings', sortOrder: 15 },
        { key: 'reports', nameAr: 'التقارير', nameEn: 'Reports', route: '/reports', category: 'admin', icon: 'BarChart3', sortOrder: 16 },
    ];


    for (const page of pages) {
        await prisma.page.upsert({
            where: { key: page.key },
            update: { ...page, active: true },
            create: { ...page, active: true },
        });
    }
    console.log(`✅ ${pages.length} pages created\n`);

    // ========================================
    // 6. ASSIGN ALL PAGES TO ADMIN ROLE
    // ========================================
    console.log('🔗 Assigning pages to ADMIN role...');
    const allPages = await prisma.page.findMany();

    for (const page of allPages) {
        await prisma.rolePage.upsert({
            where: {
                roleId_pageId: {
                    roleId: adminRole.id,
                    pageId: page.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                pageId: page.id,
            },
        });
    }
    console.log(`✅ Assigned ${allPages.length} pages to ADMIN\n`);


    // ========================================
    // 7. ASSIGN PAGES TO CASHIER ROLE
    // ========================================
    console.log('🔗 Assigning pages to CASHIER role...');

    // Get the CASHIER role
    const cashierRole = await prisma.role.findUnique({
        where: { name: 'CASHIER' }
    });

    if (cashierRole) {
        // Pages that CASHIER can access
        const cashierPageKeys = ['sales', 'customers', 'products'];

        for (const pageKey of cashierPageKeys) {
            const page = await prisma.page.findUnique({
                where: { key: pageKey }
            });

            if (page) {
                await prisma.rolePage.upsert({
                    where: {
                        roleId_pageId: {
                            roleId: cashierRole.id,
                            pageId: page.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: cashierRole.id,
                        pageId: page.id,
                    },
                });
            }
        }

        console.log(`✅ Assigned ${cashierPageKeys.length} pages to CASHIER\n`);
    }

    // ========================================
    // 8. CREATE DEFAULT CASHIER USER
    // ========================================
    console.log('👤 Creating default cashier user...');
    const cashierPasswordHash = await bcrypt.hash('123456', 10);


    const cashierUser = await prisma.user.upsert({
        where: { username: 'cashier' },
        update: {},
        create: {
            username: 'cashier',
            fullName: 'Cashier User',
            passwordHash: cashierPasswordHash,
            branchId: mainBranch.id,
            active: true,
        },
    });

    // Assign CASHIER role to user
    if (cashierRole) {
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
    }
    console.log('✅ Cashier user created (username: cashier, password: 123456)\n');

    // ========================================
    // 7. CREATE DEFAULT ADMIN USER
    // ========================================
    console.log('👤 Creating default admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            fullName: 'System Administrator',
            passwordHash,
            branchId: mainBranch.id,
            active: true,
        },
    });

    // Assign ADMIN role to user
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

    console.log('✅ Admin user created (username: admin, password: admin123)\n');

    console.log('🎉 Seed complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Branches: 1`);
    console.log(`   - Categories: 2`);
    console.log(`   - Roles: 4`);
    console.log(`   - Permissions: ${permissions.length}`);
    console.log(`   - Pages: ${pages.length}`);
    console.log(`   - Users: 2 (admin, cashier)`);
    console.log('\n✅ Login credentials:');
    console.log('   👨‍💼 Admin: admin / admin123');
    console.log('   💰 Cashier: cashier / 123456');

}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
