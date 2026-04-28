import { errorHandler } from '@/lib/errorHandler';
import { stripeWebhookHandler, verifyStripeSignature } from '@/services/stripe/webhook';
import { NextResponse } from 'next/server';

export const POST = errorHandler(async (req) => {
  const event = await verifyStripeSignature(
    await req.text(),
    req.headers.get('stripe-signature') || ''
  );

  await stripeWebhookHandler(event);

  return NextResponse.json({ received: true });
});
