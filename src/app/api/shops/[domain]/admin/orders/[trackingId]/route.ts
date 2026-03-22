import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import OrderService from '@/services/order.service';

/**
 * GET /api/shops/[domain]/admin/orders/[trackingId]
 * Get order details for admin
 */
export const GET = errorHandler(async (_, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), {
      status: 400,
    });
  }

  const data = await OrderService.getOrderByTrackingId(domain, trackingId);

  return NextResponse.json({
    order: data,
  });
});

/**
 * PATCH /api/shops/[domain]/admin/orders/[trackingId]
 * Update order status and details (admin only)
 */
export const PATCH = errorHandler(async (request, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), {
      status: 400,
    });
  }

  const updatedData = await OrderService.adminOrderUpdate(
    domain,
    trackingId,
    await request.json(),
  );

  return NextResponse.json({
    message: 'Order updated successfully',
    order: updatedData,
  });
});
