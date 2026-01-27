const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixData() {
    console.log('--- Starting Data Correction ---');

    // 1. Fix invoices with no refunds but netRevenue = 0
    const invoicesToFix = await prisma.salesInvoice.findMany({
        where: {
            totalRefunded: 0,
            OR: [
                { netRevenue: 0 },
                { netRevenue: null }
            ]
        }
    });

    console.log(`Fixing ${invoicesToFix.length} invoices with netRevenue = 0 and no refunds...`);
    for (const inv of invoicesToFix) {
        await prisma.salesInvoice.update({
            where: { id: inv.id },
            data: { netRevenue: inv.total }
        });
    }

    // 2. Recalculate invoices that HAVE returns
    const invoicesWithReturns = await prisma.salesInvoice.findMany({
        where: {
            returns: { some: {} }
        },
        include: {
            returns: { include: { lines: { include: { product: true } } } },
            lines: { include: { product: true } }
        }
    });

    console.log(`Recalculating ${invoicesWithReturns.length} invoices that have returns...`);

    for (const invoice of invoicesWithReturns) {
        // This logic mimics SalesService.recalculateProfitAfterReturn
        const totalRefunded = invoice.returns.reduce(
            (sum, ret) => sum + Number(ret.totalRefund || 0),
            0,
        );

        const originalTotal = Number(invoice.total);
        const netRevenue = originalTotal - totalRefunded;

        let returnedCost = 0;
        for (const returnRecord of invoice.returns) {
            for (const returnLine of returnRecord.lines) {
                const product = returnLine.product;
                if (product && product.costAvg) {
                    returnedCost += Number(product.costAvg) * returnLine.qtyReturned;
                }
            }
        }

        const originalCost = Number(invoice.costOfGoods || 0);
        const remainingCost = originalCost - returnedCost;

        const remainingProportion = originalTotal > 0 ? netRevenue / originalTotal : 1;
        const adjustedTax = Number(invoice.totalTax || 0) * remainingProportion;
        const adjustedCommission = Number(invoice.platformCommission || 0) * remainingProportion;
        const adjustedShipping = Number(invoice.shippingFee || 0) * remainingProportion;

        const actualRevenue = netRevenue - adjustedTax;
        const grossProfit = actualRevenue - remainingCost;
        const netProfit = grossProfit - adjustedCommission - adjustedShipping;
        const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

        await prisma.salesInvoice.update({
            where: { id: invoice.id },
            data: {
                totalRefunded,
                netRevenue,
                costOfGoods: remainingCost,
                grossProfit,
                netProfit,
                profitMargin,
            }
        });
        console.log(`- Updated ${invoice.invoiceNo}: Refunded=${totalRefunded}, NetRev=${netRevenue}`);
    }

    console.log('--- Data Correction Complete ---');
    process.exit(0);
}

fixData().catch(err => {
    console.error(err);
    process.exit(1);
});
