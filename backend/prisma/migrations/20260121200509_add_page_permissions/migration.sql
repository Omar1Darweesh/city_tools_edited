-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(50),
    "route" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_pages" (
    "role_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,

    CONSTRAINT "role_pages_pkey" PRIMARY KEY ("role_id","page_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_key_key" ON "pages"("key");

-- AddForeignKey
ALTER TABLE "role_pages" ADD CONSTRAINT "role_pages_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_pages" ADD CONSTRAINT "role_pages_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
