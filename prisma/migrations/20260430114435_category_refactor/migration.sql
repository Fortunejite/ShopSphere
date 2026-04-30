/*
  Warnings:

  - You are about to drop the column `parent_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `shops` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_category_id_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "parent_id",
ADD COLUMN     "shop_id" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "category_id";

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
