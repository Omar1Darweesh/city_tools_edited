
import { PrismaClient, AuditAction } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    console.log('Checking Prisma Client properties...');

    if ('customer' in prisma) {
        console.log('SUCCESS: prisma.customer exists');
    } else {
        console.log('FAILURE: prisma.customer MISSING');
    }

    if ('productAudit' in prisma) {
        console.log('SUCCESS: prisma.productAudit exists');
    } else {
        console.log('FAILURE: prisma.productAudit MISSING');
    }

    if (AuditAction) {
        console.log('SUCCESS: AuditAction enum exists');
    } else {
        console.log('FAILURE: AuditAction enum MISSING');
    }

    console.log('Done.');
    await prisma.$disconnect();
}

main().catch(e => console.error(e));
