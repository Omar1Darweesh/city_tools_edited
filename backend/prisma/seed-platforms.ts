import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const platforms = [
    {
        platform: 'NORMAL',
        name: 'عادي',
        icon: '🏪',
        taxRate: 0,
        commission: 0,
        shippingFee: 0,
        active: true
    },
    {
        platform: 'NOON',
        name: 'نون',
        icon: '🌙',
        taxRate: 14, // 14% tax
        commission: 15, // 15% commission
        shippingFee: 25,
        active: true
    },
    {
        platform: 'AMAZON',
        name: 'أمازون',
        icon: '📦',
        taxRate: 14,
        commission: 15,
        shippingFee: 30,
        active: true
    },
    {
        platform: 'JUMIA',
        name: 'جوميا',
        icon: '🛒',
        taxRate: 14,
        commission: 20,
        shippingFee: 20,
        active: true
    },
    {
        platform: 'SOCIAL',
        name: 'سوشيال',
        icon: '📱',
        taxRate: 0,
        commission: 0,
        shippingFee: 15,
        active: true
    },
    {
        platform: 'POGBA',
        name: 'بوجبا',
        icon: '⚽',
        taxRate: 14,
        commission: 10,
        shippingFee: 20,
        active: true
    }
];

async function main() {
    console.log('🚀 Seeding platform settings...');

    for (const platform of platforms) {
        const existing = await prisma.platformSettings.findUnique({
            where: { platform: platform.platform }
        });

        if (!existing) {
            await prisma.platformSettings.create({ data: platform });
            console.log(`✅ Created platform: ${platform.name} (${platform.platform})`);
        } else {
            await prisma.platformSettings.update({
                where: { platform: platform.platform },
                data: platform
            });
            console.log(`🔄 Updated platform: ${platform.name} (${platform.platform})`);
        }
    }

    console.log('✅ Platform settings seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
