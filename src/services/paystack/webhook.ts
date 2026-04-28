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
  if (!signature) {
    console.warn('Paystack webhook signature missing');
    return false;
  }

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
  if (!subaccount) {
    console.warn('Paystack charge.success missing subaccount', {
      transactionId: data.id,
      trackingId: data.metadata?.trackingId,
    });
    throw {
      message: 'Shop not found',
      status: 404,
    };
  }

  const trackingId = data.metadata?.trackingId;

  if (!trackingId) {
    console.warn('Paystack charge.success missing trackingId', {
      transactionId: data.id,
      subaccountCode: subaccount.subaccount_code,
    });
    throw {
      message: 'TrackingId not found',
      status: 400,
    };
  }

  console.info('Processing Paystack charge.success', {
    transactionId: data.id,
    trackingId,
    subaccountCode: subaccount.subaccount_code,
    businessName: subaccount.business_name,
  });

  console.log(
    `Subaccount: ${subaccount.subaccount_code} (${subaccount.business_name})`,
  );
  await OrderService.processPaidOrder(trackingId);
  console.info('Paystack charge.success completed', {
    transactionId: data.id,
    trackingId,
  });
}

export const paystackWebhookHandler = async (body: PaystackWebhookEvent) => {
  console.info('Handling Paystack webhook event', {
    eventId: body.data.id,
    eventType: body.event,
  });

  // check if event has been processed before
  const existingEvent = await prisma.paystackEvent.findUnique({
    where: { event_id: body.data.id },
  });
  if (existingEvent) {
    console.log('Paystack event already processed', {
      eventId: body.data.id,
      eventType: body.event,
    });
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

  console.info('Paystack event stored', {
    eventId: body.data.id,
    eventType: body.event,
  });

  switch (body.event) {
    case 'charge.success':
      return handleChargeSuccess(body.data as ChargeSuccessData);
    default:
      console.warn('Unhandled Paystack event type', {
        eventId: body.data.id,
        eventType: body.event,
      });
  }
};
