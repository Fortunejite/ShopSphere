import { errorHandler } from '@/lib/errorHandler';
import PaymentService from '@/services/payment.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  const account = await PaymentService.generatePaystackAccount(
    domain!,
    await request.json(),
  );
  return NextResponse.json({ account });
});
