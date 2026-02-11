
import { PrismaClient } from '@prisma/client';
import { ReportsService } from '../src/reports/reports.service';
import { PrismaService } from '../src/prisma.service';

// Mock PrismaService to use the real PrismaClient
class MockPrismaService extends PrismaService {
    async onModuleInit() {
        await this.$connect();
    }
}

async function run() {
    const prisma = new MockPrismaService();
    const reportsService = new ReportsService(prisma);

    console.log('Fetching Top Products...');
    try {
        const topProducts = await reportsService.getTopProducts({ limit: 5 });
        console.log(JSON.stringify(topProducts, null, 2));
    } catch (error) {
        console.error('Error fetching top products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

run();
