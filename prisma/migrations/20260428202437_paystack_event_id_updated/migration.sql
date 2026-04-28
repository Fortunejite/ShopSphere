/*
  Warnings:

  - The primary key for the `paystack_event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `event_id` on the `paystack_event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "paystack_event" DROP CONSTRAINT "paystack_event_pkey",
DROP COLUMN "event_id",
ADD COLUMN     "event_id" INTEGER NOT NULL,
ADD CONSTRAINT "paystack_event_pkey" PRIMARY KEY ("event_id");
