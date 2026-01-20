const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixInvoices() {
    console.log('🔍 Checking for inconsistent invoices...');
    const invoices = await prisma.salesInvoice.findMany({
        include: { payments: true }
    });

    for (const inv of invoices) {
        const total = Number(inv.total);
        const totalPaid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Math.max(0, total - totalPaid);

        let status = inv.paymentStatus;
        if (remaining <= 0) {
            status = 'PAID';
        } else if (totalPaid > 0) {
            status = 'PARTIAL';
        } else {
            status = 'UNPAID';
        }

        if (Number(inv.paidAmount) !== totalPaid || Number(inv.remainingAmount) !== remaining || inv.paymentStatus !== status) {
            console.log(`Fixing Invoice ${inv.invoiceNo}:`);
            console.log(`  Total: ${total}, Old Paid: ${inv.paidAmount}, New Paid: ${totalPaid}`);
            console.log(`  Old Remaining: ${inv.remainingAmount}, New Remaining: ${remaining}`);
            console.log(`  Old Status: ${inv.paymentStatus}, New Status: ${status}`);

            await prisma.salesInvoice.update({
                where: { id: inv.id },
                data: {
                    paidAmount: totalPaid,
                    remainingAmount: remaining,
                    paymentStatus: status
                }
            });
        }
    }
    console.log('✅ Invoices fixed!');
    process.exit(0);
}

fixInvoices().catch(err => {
    console.error(err);
    process.exit(1);
});
