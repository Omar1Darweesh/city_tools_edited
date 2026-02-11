/*
  Warnings:

  - You are about to drop the `sales_invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales_returns` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('STOCK', 'DEFECTIVE');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_sales_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_invoices" DROP CONSTRAINT "sales_invoices_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_invoices" DROP CONSTRAINT "sales_invoices_created_by_fkey";

-- DropForeignKey
ALTER TABLE "sales_invoices" DROP CONSTRAINT "sales_invoices_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_lines" DROP CONSTRAINT "sales_lines_sales_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_return_lines" DROP CONSTRAINT "sales_return_lines_return_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_returns" DROP CONSTRAINT "sales_returns_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_returns" DROP CONSTRAINT "sales_returns_created_by_fkey";

-- AlterTable
ALTER TABLE "sales_return_lines" ADD COLUMN     "return_type" "ReturnType" NOT NULL DEFAULT 'STOCK';

-- DropTable
DROP TABLE "sales_invoices";

-- DropTable
DROP TABLE "sales_returns";

-- CreateTable
CREATE TABLE "salesinvoices" (
    "id" SERIAL NOT NULL,
    "invoiceno" VARCHAR(50) NOT NULL,
    "branchid" INTEGER NOT NULL,
    "customerid" INTEGER,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totaltax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totaldiscount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountamount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "platformcommission" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "channel" VARCHAR(50),
    "paymentstatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "paymentmethod" "PaymentMethod" NOT NULL,
    "notes" TEXT,
    "createdby" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "costofgoods" DECIMAL(10,2),
    "grossprofit" DECIMAL(10,2),
    "netprofit" DECIMAL(10,2),
    "profitmargin" DECIMAL(5,2),
    "totalrefunded" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netrevenue" DECIMAL(10,2),
    "shippingfee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliverydate" TIMESTAMP(3),
    "paidamount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remainingamount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "salesinvoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salesreturns" (
    "id" SERIAL NOT NULL,
    "returnno" VARCHAR(50) NOT NULL,
    "salesinvoiceid" INTEGER NOT NULL,
    "branchid" INTEGER NOT NULL,
    "totalrefund" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reason" TEXT,
    "createdby" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salesreturns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salesinvoices_invoiceno_key" ON "salesinvoices"("invoiceno");

-- CreateIndex
CREATE INDEX "salesinvoices_createdat_branchid_idx" ON "salesinvoices"("createdat", "branchid");

-- CreateIndex
CREATE UNIQUE INDEX "salesreturns_returnno_key" ON "salesreturns"("returnno");

-- CreateIndex
CREATE INDEX "salesreturns_createdat_branchid_idx" ON "salesreturns"("createdat", "branchid");

-- CreateIndex
CREATE INDEX "sales_return_lines_return_type_idx" ON "sales_return_lines"("return_type");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "salesinvoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salesinvoices" ADD CONSTRAINT "salesinvoices_branchid_fkey" FOREIGN KEY ("branchid") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salesinvoices" ADD CONSTRAINT "salesinvoices_createdby_fkey" FOREIGN KEY ("createdby") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salesinvoices" ADD CONSTRAINT "salesinvoices_customerid_fkey" FOREIGN KEY ("customerid") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_lines" ADD CONSTRAINT "sales_lines_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "salesinvoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salesreturns" ADD CONSTRAINT "salesreturns_branchid_fkey" FOREIGN KEY ("branchid") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salesreturns" ADD CONSTRAINT "salesreturns_createdby_fkey" FOREIGN KEY ("createdby") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salesreturns" ADD CONSTRAINT "salesreturns_salesinvoiceid_fkey" FOREIGN KEY ("salesinvoiceid") REFERENCES "salesinvoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_return_lines" ADD CONSTRAINT "sales_return_lines_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "salesreturns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
