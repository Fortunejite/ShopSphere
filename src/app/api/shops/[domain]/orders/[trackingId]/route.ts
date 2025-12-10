import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Order } from '@/models/Order';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  payment_method: z.string().optional(),
  admin_notes: z.string().optional(),
});

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
 * PATCH /api/shops/[domain]/orders/[trackingId]
 * Update order status (shop owner/admin only)
 */
export const PUT = errorHandler(async (request, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  // Check if user is shop owner/admin
  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  // Get order by tracking ID
  const existingOrder = await Order.findByTrackingId(trackingId);
  if (!existingOrder) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  // Verify order belongs to this shop
  if (existingOrder.shop_id !== shop.id) {
    throw Object.assign(new Error('Order not found in this shop'), { status: 404 });
  }

  // Parse request body
  const body = await request.json();
  const validatedData = updateOrderSchema.parse(body);

  // Update order status if provided
  if (validatedData.status && validatedData.status !== existingOrder.status) {
    await Order.updateStatus(
      existingOrder.id,
      validatedData.status,
      validatedData.admin_notes
    );
  }

  // Update payment status if provided
  if (validatedData.payment_status && validatedData.payment_status !== existingOrder.payment_status) {
    await Order.updatePaymentStatus(
      existingOrder.id,
      validatedData.payment_status,
      validatedData.payment_method
    );
  }

  // Get updated order with products
  const orderWithProducts = await Order.findByTrackingIdWithProducts(trackingId);

  return NextResponse.json({
    message: 'Order updated successfully',
    order: orderWithProducts,
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
  if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
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
