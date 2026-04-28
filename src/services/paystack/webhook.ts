import { prisma } from '@/lib/prisma';
import OrderService from '@/services/order.service';
import {
  ChargeSuccessData,
  PaystackSubaccount,
  PaystackWebhookEvent,
} from '@/services/paystack/types';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

// ─── Signature Verification ───────────────────────────────────────────────────
const SECRET_KEY = process.env.PAYSTACK_WEBHOOK_SECRET as string;

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  return hash === signature;
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleChargeSuccess(data: ChargeSuccessData): Promise<void> {
  // Check if a subaccount was involved
  const subaccount = data.subaccount as PaystackSubaccount;
  if (!subaccount)
    throw {
      message: 'Shop not found',
      status: 404,
    };

  const trackingId = data.metadata?.trackingId;

  if (!trackingId)
    throw {
      message: 'TrackingId not found',
      status: 400,
    };
  console.log(
    `Subaccount: ${subaccount.subaccount_code} (${subaccount.business_name})`,
  );
  await OrderService.processPaidOrder(trackingId);
}

export const paystackWebhookHandler = async (body: PaystackWebhookEvent) => {
  // check if event has been processed before
  const existingEvent = await prisma.paystackEvent.findUnique({
    where: { event_id: body.data.id },
  });
  if (existingEvent) {
    console.log('Event already processed:', body.data.id);
    return;
  }

  // store the event
  await prisma.paystackEvent.create({
    data: {
      event_id: body.data.id,
      event_type: body.event,
      payload: body.data as unknown as Prisma.InputJsonValue,
      received_at: new Date(),
    },
  });

  switch (body.event) {
    case 'charge.success':
      return handleChargeSuccess(body.data as ChargeSuccessData);
    default:
      console.warn('Unhandled event type:', body.event);
  }
};
