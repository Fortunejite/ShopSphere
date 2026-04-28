-- CreateTable
CREATE TABLE "paystack_event" (
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paystack_event_pkey" PRIMARY KEY ("event_id")
);
