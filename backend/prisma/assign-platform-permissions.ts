import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Assigning platform permissions to roles...');

    // Admin gets all platforms
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    const platformPerms = await prisma.permission.findMany({
        where: { name: { startsWith: 'platform:' } }
    });

    if (adminRole) {
        for (const perm of platformPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRole.id,
                        permissionId: perm.id
                    }
                },
                create: {
                    roleId: adminRole.id,
                    permissionId: perm.id
                },
                update: {}
            });
        }
        console.log('✅ Assigned all platforms to Admin');
    }

    // Cashier gets only normal/offline
    const cashierRole = await prisma.role.findUnique({ where: { name: 'Cashier' } });
    const normalPlatform = await prisma.permission.findUnique({ where: { name: 'platform:normal' } });

    if (cashierRole && normalPlatform) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: cashierRole.id,
                    permissionId: normalPlatform.id
                }
            },
            create: {
                roleId: cashierRole.id,
                permissionId: normalPlatform.id
            },
            update: {}
        });
        console.log('✅ Assigned normal platform to Cashier');
    }

    console.log('✅ Platform permissions assigned!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
