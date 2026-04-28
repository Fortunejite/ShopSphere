import { errorHandler } from '@/lib/errorHandler';
import { paystackWebhookHandler, verifyPaystackSignature } from '@/services/paystack/webhook';
import { NextResponse } from 'next/server';

export const POST = errorHandler(async (req) => {
  const body = await req.text();
  const eventType = (() => {
    try {
      return JSON.parse(body)?.event ?? 'unknown';
    } catch {
      return 'invalid-json';
    }
  })();

  console.info('Paystack webhook received', {
    eventType,
    signaturePresent: Boolean(req.headers.get('x-paystack-signature')),
    payloadSize: body.length,
  });

  const isSignatureValid = verifyPaystackSignature(
    body,
    req.headers.get('x-paystack-signature'),
  );
  if (!isSignatureValid) {
    console.warn('Paystack webhook signature rejected', {
      eventType,
    });
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 },
    );
  }

  console.info('Paystack webhook signature verified', {
    eventType,
  });

  await paystackWebhookHandler(JSON.parse(body));

  console.info('Paystack webhook processed', {
    eventType,
  });

  return NextResponse.json({ received: true });
});
