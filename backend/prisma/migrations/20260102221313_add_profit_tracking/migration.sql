/*
  Warnings:

  - You are about to drop the column `costOfGoods` on the `sales_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `grossProfit` on the `sales_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `netProfit` on the `sales_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `profitMargin` on the `sales_invoices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sales_invoices" DROP COLUMN "costOfGoods",
DROP COLUMN "grossProfit",
DROP COLUMN "netProfit",
DROP COLUMN "profitMargin",
ADD COLUMN     "cost_of_goods" DECIMAL(10,2),
ADD COLUMN     "gross_profit" DECIMAL(10,2),
ADD COLUMN     "net_profit" DECIMAL(10,2),
ADD COLUMN     "profit_margin" DECIMAL(5,2);
