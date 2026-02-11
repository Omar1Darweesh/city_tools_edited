-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "shipping_fee" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sales_invoices" ADD COLUMN     "shipping_fee" DECIMAL(10,2) NOT NULL DEFAULT 0;
