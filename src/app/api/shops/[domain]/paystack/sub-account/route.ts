import { errorHandler } from '@/lib/errorHandler';
import PaymentService from '@/services/payment.service';
import { getSubAccountDetails } from '@/services/paystack/account';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  const account = await getSubAccountDetails(domain!);
  return NextResponse.json(account);
});

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  const account = await PaymentService.createPaystackAccount(
    domain!,
    await request.json(),
  );
  return NextResponse.json({ account });
});

export const PUT = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  const account = await PaymentService.updatePaystackAccount(
    domain!,
    await request.json(),
  );
  return NextResponse.json({ account });
});
