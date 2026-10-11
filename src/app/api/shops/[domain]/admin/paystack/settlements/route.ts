import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import { getShopSettlements } from '@/services/paystack/settlement';

/**
 * GET /api/shops/[domain]/admin/paystack/settlements
 *
 * Query params:
 *   page    – page number (default 1)
 *   perPage – records per page, max 50 (default 10)
 *
 * Returns paginated Paystack settlement records for the shop's sub-account.
 */
export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;

  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const rawPage = Number(searchParams.get('page') ?? 1);
  const rawPerPage = Number(searchParams.get('perPage') ?? 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const perPage =
    Number.isFinite(rawPerPage) && rawPerPage > 0
      ? Math.min(Math.floor(rawPerPage), 50)
      : 10;

  const result = await getShopSettlements(domain, page, perPage);

  return NextResponse.json(result);
});
