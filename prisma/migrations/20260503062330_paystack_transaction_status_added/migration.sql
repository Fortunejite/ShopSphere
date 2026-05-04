/*
  Warnings:

  - Added the required column `status` to the `paystack_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaystackTransactionStatus" AS ENUM ('pending', 'success', 'failed');

-- AlterTable
ALTER TABLE "paystack_transactions" ADD COLUMN     "status" "PaystackTransactionStatus" NOT NULL;
