import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import OrderService from '@/services/order.service';

/**
 * GET /api/shops/[domain]/orders/[trackingId]
 * Get order details by tracking ID, with enriched product info
 */
export const GET = errorHandler(async (_, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), { status: 400 });
  }
  const data = await OrderService.getOrderByTrackingId(domain, trackingId);

  return NextResponse.json({
    order: data,
  });
});

/**
 * DELETE /api/shops/[domain]/orders/[trackingId]
 * Cancel an order (customer or shop owner)
 */
export const DELETE = errorHandler(async (request, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  const cancelledOrder = await OrderService.cancelOrder(domain, trackingId, body);

  return NextResponse.json({
    message: 'Order cancelled successfully',
    order: cancelledOrder,
  });
});
