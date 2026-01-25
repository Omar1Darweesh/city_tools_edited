import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing Admin Access...');

    // 1. Get the Admin Role
    const adminRole = await prisma.role.findUnique({
        where: { name: 'Admin' },
    });

    if (!adminRole) {
        console.error('❌ Admin role not found! Run seed-permissions.ts first.');
        return;
    }

    // 2. Get all users
    const users = await prisma.user.findMany({
        include: { roles: true }
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        // Check if user has roles
        if (user.roles.length === 0) {
            console.log(`Assigning Admin role to user: ${user.username}`);
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: adminRole.id,
                },
            });
        } else {
            console.log(`User ${user.username} already has roles.`);
        }
    }

    console.log('✅ Finished fixing access.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
