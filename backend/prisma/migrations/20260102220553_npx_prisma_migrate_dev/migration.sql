-- AlterTable
ALTER TABLE "sales_invoices" ADD COLUMN     "costOfGoods" DECIMAL(10,2),
ADD COLUMN     "grossProfit" DECIMAL(10,2),
ADD COLUMN     "netProfit" DECIMAL(10,2),
ADD COLUMN     "profitMargin" DECIMAL(5,2);
