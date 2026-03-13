import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';

interface StoredOrderItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
  unit_price_at_purchase: number;
  discount_at_purchase: number;
  subtotal: number;
}

/**
 * GET /api/shops/[domain]/orders/[trackingId]
 * Get order details by tracking ID, with enriched product info
 */
export const GET = errorHandler(async (_, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  const order = await prisma.order.findUnique({
    where: { tracking_id: trackingId },
  });

  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  if (order.shop_id !== shop.id) {
    throw Object.assign(new Error('Order not found in this shop'), { status: 404 });
  }

  const isOwner = order.user_id === user.id;
  const isShopOwner = shop.owner_id === user.id;

  if (!isOwner && !isShopOwner) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  // Enrich stored JSON items with current product details
  const storedItems = order.items as unknown as StoredOrderItem[];
  const productIds = [...new Set(storedItems.map((i) => i.product_id))];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, image: true, slug: true, status: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const enrichedItems = storedItems.map((item) => ({
    ...item,
    product: productMap.get(item.product_id) ?? null,
  }));

  const total_items = storedItems.reduce((sum, i) => sum + i.quantity, 0);

  return NextResponse.json({
    order: {
      ...order,
      items: enrichedItems,
      total_items,
    },
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

  const order = await prisma.order.findUnique({
    where: { tracking_id: trackingId },
  });

  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  if (order.shop_id !== shop.id) {
    throw Object.assign(new Error('Order not found in this shop'), { status: 404 });
  }

  const isOwner = order.user_id === user.id;
  const isShopOwner = shop.owner_id === user.id;

  if (!isOwner && !isShopOwner) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  if (order.status !== 'pending') {
    throw Object.assign(new Error('Order cannot be cancelled in current status'), { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reason: string = body.reason || 'Cancelled by user';

  const cancelledOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'cancelled',
      cancelled_at: new Date(),
      admin_notes: order.admin_notes
        ? `${order.admin_notes}\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`,
    },
  });

  return NextResponse.json({
    message: 'Order cancelled successfully',
    order: cancelledOrder,
  });
});
