
import { PrismaClient } from '@prisma/client';
import { ReportsService } from '../src/reports/reports.service';
import { PrismaService } from '../src/prisma.service';

// Mock PrismaService
class MockPrismaService extends PrismaService {
    async onModuleInit() {
        await this.$connect();
    }
}

async function run() {
    const prisma = new MockPrismaService();
    await prisma.$connect();
    const reportsService = new ReportsService(prisma);

    console.log('Fetching Dashboard Metrics...');
    const start = process.hrtime();

    try {
        const metrics = await reportsService.getDashboardMetrics();
        const end = process.hrtime(start);
        const duration = (end[0] * 1000 + end[1] / 1e6).toFixed(2);

        console.log(`Execution time: ${duration}ms`);
        console.log('Stock Value:', metrics.inventory.totalStockValue);
        console.log('Out of Stock Count:', metrics.inventory.outOfStockCount);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

run();
