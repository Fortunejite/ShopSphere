/*
  Warnings:

  - The primary key for the `paystack_event` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "paystack_event" DROP CONSTRAINT "paystack_event_pkey",
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "paystack_event_pkey" PRIMARY KEY ("event_id");
