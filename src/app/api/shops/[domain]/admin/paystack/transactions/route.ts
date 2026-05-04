import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import PaymentService from '@/services/payment.service';

/**
 * GET /api/shops/[domain]/admin/paystack/transactions
 * Returns paginated Paystack transactions for the shop owner.
 */
export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const parsedPage = Number(searchParams.get('page') ?? 1);
  const parsedLimit = Number(searchParams.get('limit') ?? 10);

  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(Math.floor(parsedLimit), 50)
      : 10;
      
  const res = await PaymentService.getPaystackHistory(domain, page, limit);

  return NextResponse.json(res);
});
