const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function diagnose() {
    const result = {
        impossibleInvoices: [],
        globalAggregates: {},
        inconsistentNetRevenue: []
    };

    // Find invoices where totalRefunded > total
    const impossibleInvoices = await prisma.salesInvoice.findMany({
        where: {
            totalRefunded: { gt: prisma.salesInvoice.total }
        }
    });

    result.impossibleInvoices = impossibleInvoices.map(inv => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        total: Number(inv.total),
        totalRefunded: Number(inv.totalRefunded),
        netRevenue: Number(inv.netRevenue)
    }));

    // Calculate global statistics
    const [salesAgg, returnAgg] = await Promise.all([
        prisma.salesInvoice.aggregate({
            _sum: { total: true, totalRefunded: true, netRevenue: true }
        }),
        prisma.salesReturn.aggregate({
            _sum: { totalRefund: true }
        })
    ]);

    result.globalAggregates = {
        totalSales: Number(salesAgg._sum.total),
        totalRefundedOnInvoices: Number(salesAgg._sum.totalRefunded),
        netRevenueSum: Number(salesAgg._sum.netRevenue),
        sumOfSalesReturnTable: Number(returnAgg._sum.totalRefund)
    };

    fs.writeFileSync('diagnose-output.json', JSON.stringify(result, null, 2));
    process.exit(0);
}

diagnose();
