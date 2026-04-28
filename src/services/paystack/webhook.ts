import { prisma } from '@/lib/prisma';
import OrderService from '@/services/order.service';
import PaymentService from '@/services/payment.service';
import {
  ChargeSuccessData,
  PaystackSubaccount,
  PaystackWebhookEvent,
  SubaccountEventData,
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

async function handleSubaccountCreated(
  data: SubaccountEventData,
): Promise<void> {
  console.log(
    `🏦 Subaccount created — code: ${data.subaccount_code}, business: ${data.business_name}`,
  );
  console.log(
    `   Bank: ${data.settlement_bank}, Account: ${data.account_number}`,
  );
  console.log(
    `   Split: ${data.percentage_charge}%, Schedule: ${data.settlement_schedule}`,
  );

  const shopId = data.metadata?.shopId;
  if (!shopId)
    throw {
      message: 'Shop not found',
      status: 404,
    };

  await PaymentService.linkPaystackAccount(
    shopId,
    data.subaccount_code,
    data.is_verified && data.active,
  );
}

async function handleSubaccountUpdated(
  data: SubaccountEventData,
): Promise<void> {
  console.log(`🔄 Subaccount updated — code: ${data.subaccount_code}`);
  console.log(`   Active: ${data.active}, Verified: ${data.is_verified}`);

  const shopId = data.metadata?.shopId;
  if (!shopId)
    throw {
      message: 'Shop not found',
      status: 404,
    };

  await PaymentService.linkPaystackAccount(
    shopId,
    data.subaccount_code,
    data.is_verified && data.active,
  );
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
    case 'subaccount.created':
      return handleSubaccountCreated(body.data as SubaccountEventData);
    case 'subaccount.updated':
      return handleSubaccountUpdated(body.data as SubaccountEventData);
    default:
      console.warn('Unhandled event type:', body.event);
  }
};
