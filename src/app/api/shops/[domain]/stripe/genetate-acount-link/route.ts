import { errorHandler } from '@/lib/errorHandler';
import PaymentService from '@/services/payment.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  const url = await PaymentService.linkStripeAccount(domain!);

  return NextResponse.json({ url });
});
