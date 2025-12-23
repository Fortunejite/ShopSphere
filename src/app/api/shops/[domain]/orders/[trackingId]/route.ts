import { NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';

/**
 * GET /api/shops/[domain]/orders/[trackingId]
 * Get order details by tracking ID
 */
export const GET = errorHandler(async (_, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  // Get order by tracking ID
  const order = await Order.findByTrackingIdWithProducts(trackingId);
  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  // Verify order belongs to this shop
  if (order.shop_id !== shop.id) {
    throw Object.assign(new Error('Order not found in this shop'), { status: 404 });
  }

  // Check if user owns this order or is shop owner/admin
  const isOwner = order.user_id === user.id;
  const isShopOwner = shop.owner_id === user.id;
  
  if (!isOwner && !isShopOwner) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  return NextResponse.json({ order });
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

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  // Get order by tracking ID
  const order = await Order.findByTrackingId(trackingId);
  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  // Verify order belongs to this shop
  if (order.shop_id !== shop.id) {
    throw Object.assign(new Error('Order not found in this shop'), { status: 404 });
  }

  // Check if user owns this order or is shop owner
  const isOwner = order.user_id === user.id;
  const isShopOwner = shop.owner_id === user.id;
  
  if (!isOwner && !isShopOwner) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  // Check if order can be cancelled
  if (!['pending'].includes(order.status)) {
    throw Object.assign(new Error('Order cannot be cancelled in current status'), { status: 400 });
  }

  // Get cancellation reason from request body
  const body = await request.json().catch(() => ({}));
  const reason = body.reason || 'Cancelled by user';

  // Cancel the order
  const cancelledOrder = await Order.cancelOrder(order.id, reason);
  if (!cancelledOrder) {
    throw Object.assign(new Error('Failed to cancel order'), { status: 500 });
  }

  return NextResponse.json({
    message: 'Order cancelled successfully',
    order: cancelledOrder,
  });
});
