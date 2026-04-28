import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import OrderService from '@/services/order.service';

/**
 * GET /api/shops/[domain]/orders
 * Get orders for the current user in this shop
 */
export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }
  const url = new URL(request.url);

  const data = await OrderService.getUserOrders(
    domain,
    Object.fromEntries(url.searchParams.entries()),
  );

  return NextResponse.json(data);
});

/**
 * POST /api/shops/[domain]/orders
 * Create a new order from the user's cart
 */
export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const body = await request.json();
  const { checkoutUrl } = await OrderService.createOrderFromCart(domain, body);

  return NextResponse.json(
    { message: 'Order created successfully', checkoutUrl },
    { status: 201 },
  );
});
