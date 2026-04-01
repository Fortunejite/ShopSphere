/*
  Warnings:

  - You are about to drop the column `payment_status` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paystack_account_id]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "payment_status";

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "paystack_account_connected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paystack_account_id" TEXT;

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateIndex
CREATE UNIQUE INDEX "shops_paystack_account_id_key" ON "shops"("paystack_account_id");
