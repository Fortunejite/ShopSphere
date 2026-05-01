/*
  Warnings:

  - You are about to drop the column `shop_id` on the `paystack_transactions` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `paystack_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "paystack_transactions" DROP CONSTRAINT "paystack_transactions_shop_id_fkey";

-- AlterTable
ALTER TABLE "paystack_transactions" DROP COLUMN "shop_id",
ADD COLUMN     "account_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "paystack_transactions" ADD CONSTRAINT "paystack_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "shops"("paystack_account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
