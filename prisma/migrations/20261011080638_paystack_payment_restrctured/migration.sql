/*
  Warnings:

  - You are about to drop the column `paystack_account_balance` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the `paystack_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "paystack_transactions" DROP CONSTRAINT "paystack_transactions_account_id_fkey";

-- DropForeignKey
ALTER TABLE "paystack_transactions" DROP CONSTRAINT "paystack_transactions_tracking_id_fkey";

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "paystack_account_balance";

-- DropTable
DROP TABLE "paystack_transactions";

-- DropEnum
DROP TYPE "PaystackTransactionStatus";

-- DropEnum
DROP TYPE "PaystackTransactionType";
