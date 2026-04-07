/*
  Warnings:

  - Made the column `category_id` on table `shops` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "shops" ALTER COLUMN "category_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
