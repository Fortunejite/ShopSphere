/*
  Warnings:

  - A unique constraint covering the columns `[stripe_account_id]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shops_stripe_account_id_key" ON "shops"("stripe_account_id");
