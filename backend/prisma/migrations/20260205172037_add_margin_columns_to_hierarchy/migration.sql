-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "default_retail_margin" DOUBLE PRECISION,
ADD COLUMN     "default_wholesale_margin" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "item_types" ADD COLUMN     "default_retail_margin" DOUBLE PRECISION,
ADD COLUMN     "default_wholesale_margin" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "retail_margin" DOUBLE PRECISION,
ADD COLUMN     "wholesale_margin" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "default_retail_margin" DOUBLE PRECISION,
ADD COLUMN     "default_wholesale_margin" DOUBLE PRECISION;
