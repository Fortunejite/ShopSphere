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
 * GET /api/shops/[domain]/admin/orders/[trackingId]
 * Get order details for admin
 */
export const GET = errorHandler(async (_, { params }) => {
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
  const order = await Order.findByTrackingIdWithProducts(trackingId);
  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  // Verify order belongs to this shop
  if (order.shop_id !== shop.id) {
    throw Object.assign(new Error('Order not found in this shop'), { status: 404 });
  }

  return NextResponse.json({ order });
});

/**
 * PATCH /api/shops/[domain]/admin/orders/[trackingId]
 * Update order status and details (admin only)
 */
export const PATCH = errorHandler(async (request, { params }) => {
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

  // Get updated order with products
  const orderWithProducts = await Order.findByTrackingIdWithProducts(trackingId);

  return NextResponse.json({
    message: 'Order updated successfully',
    order: orderWithProducts,
  });
});
