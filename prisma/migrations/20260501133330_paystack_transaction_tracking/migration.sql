-- CreateEnum
CREATE TYPE "PaystackTransactionType" AS ENUM ('credit', 'debit');

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "paystack_account_balance" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "paystack_transactions" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "type" "PaystackTransactionType" NOT NULL,
    "order_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paystack_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "paystack_transactions_reference_id_key" ON "paystack_transactions"("reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "paystack_transactions_order_id_key" ON "paystack_transactions"("order_id");

-- AddForeignKey
ALTER TABLE "paystack_transactions" ADD CONSTRAINT "paystack_transactions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paystack_transactions" ADD CONSTRAINT "paystack_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
