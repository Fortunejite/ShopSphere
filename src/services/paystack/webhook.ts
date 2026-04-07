import OrderService from '@/services/order.service';
import {
  ChargeSuccessData,
  PaystackSubaccount,
  PaystackWebhookEvent,
} from '@/services/paystack/types';
import crypto from 'crypto';

// ─── Signature Verification ───────────────────────────────────────────────────

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;

  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto
    .createHmac('sha512', secret)
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

export const paystackWebhookHandler = (body: PaystackWebhookEvent) => {
  switch (body.event) {
    case 'charge.success':
      return handleChargeSuccess(body.data as ChargeSuccessData);
    default:
      console.warn('Unhandled event type:', body.event);
  }
};
