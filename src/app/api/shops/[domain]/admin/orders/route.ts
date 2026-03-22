import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import OrderService from '@/services/order.service';

/**
 * GET /api/shops/[domain]/admin/orders
 * Get all orders for shop admin/owner with stats
 */
export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }
  
  const url = new URL(request.url);

  const data = await OrderService.getShopOrders(domain, Object.fromEntries(url.searchParams.entries()));

  return NextResponse.json(data);
});
