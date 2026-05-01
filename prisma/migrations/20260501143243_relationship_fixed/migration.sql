/*
  Warnings:

  - You are about to drop the column `order_id` on the `paystack_transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tracking_id]` on the table `paystack_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "paystack_transactions" DROP CONSTRAINT "paystack_transactions_order_id_fkey";

-- DropIndex
DROP INDEX "paystack_transactions_order_id_key";

-- AlterTable
ALTER TABLE "paystack_transactions" DROP COLUMN "order_id",
ADD COLUMN     "tracking_id" TEXT,
ALTER COLUMN "reference_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "paystack_transactions_tracking_id_key" ON "paystack_transactions"("tracking_id");

-- AddForeignKey
ALTER TABLE "paystack_transactions" ADD CONSTRAINT "paystack_transactions_tracking_id_fkey" FOREIGN KEY ("tracking_id") REFERENCES "orders"("tracking_id") ON DELETE SET NULL ON UPDATE CASCADE;
