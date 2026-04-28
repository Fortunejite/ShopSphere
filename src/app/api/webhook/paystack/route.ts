import { errorHandler } from '@/lib/errorHandler';
import { paystackWebhookHandler, verifyPaystackSignature } from '@/services/paystack/webhook';
import { NextResponse } from 'next/server';

export const POST = errorHandler(async (req) => {
  const body = await req.json()
  const isSignatureValid = verifyPaystackSignature(
    await body.toString(),
    req.headers.get('x-paystack-signature'),
  );
  if (!isSignatureValid) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 },
    );
  }

  await paystackWebhookHandler(body);

  return NextResponse.json({ received: true });
});
