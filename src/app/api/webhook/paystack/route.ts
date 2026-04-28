import { errorHandler } from '@/lib/errorHandler';
import { paystackWebhookHandler, verifyPaystackSignature } from '@/services/paystack/webhook';
import { NextResponse } from 'next/server';

export const POST = errorHandler(async (req) => {
  const body = await req.text();
  const isSignatureValid = verifyPaystackSignature(
    body,
    req.headers.get('x-paystack-signature'),
  );
  if (!isSignatureValid) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 },
    );
  }

  await paystackWebhookHandler(JSON.parse(body));

  return NextResponse.json({ received: true });
});
