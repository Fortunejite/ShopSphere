import { errorHandler } from '@/lib/errorHandler';
import { paystackWebhookHandler, verifyPaystackSignature } from '@/services/paystack/webhook';
import { NextResponse } from 'next/server';

export const POST = errorHandler(async (req) => {
  const isSignatureValid = verifyPaystackSignature(
    await req.text(),
    req.headers.get('x-paystack-signature'),
  );
  if (!isSignatureValid) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 },
    );
  }

  await paystackWebhookHandler(await req.json())

  return NextResponse.json({ received: true });
});
