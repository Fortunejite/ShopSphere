/*
  Warnings:

  - You are about to drop the column `city` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `free_shipping_threshold` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `postal_code` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shops" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "free_shipping_threshold",
DROP COLUMN "postal_code",
DROP COLUMN "state";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "city";
