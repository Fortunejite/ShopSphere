import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { OrderStatus } from '@prisma/client';

interface StoredOrderItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
  unit_price_at_purchase: number;
  discount_at_purchase: number;
  subtotal: number;
}

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  admin_notes: z.string().optional(),
});

async function enrichOrder(trackingId: string) {
  const order = await prisma.order.findUnique({ where: { tracking_id: trackingId } });
  if (!order) return null;

  const storedItems = order.items as unknown as StoredOrderItem[];
  const productIds = [...new Set(storedItems.map((i) => i.product_id))];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, image: true, slug: true, status: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  return {
    ...order,
    items: storedItems.map((item) => ({
      ...item,
      product: productMap.get(item.product_id) ?? null,
    })),
    total_items: storedItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}

function timestampsForStatus(status: OrderStatus) {
  return {
    ...(status === 'shipped'   && { shipped_at: new Date() }),
    ...(status === 'delivered' && { delivered_at: new Date() }),
    ...(status === 'cancelled' && { cancelled_at: new Date() }),
  };
}

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

  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  const order = await enrichOrder(trackingId);
  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

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

  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  const existingOrder = await prisma.order.findUnique({ where: { tracking_id: trackingId } });
  if (!existingOrder) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  if (existingOrder.shop_id !== shop.id) {
    throw Object.assign(new Error('Order not found in this shop'), { status: 404 });
  }

  const { status, admin_notes } = updateOrderSchema.parse(await request.json());

  const data: Parameters<typeof prisma.order.update>[0]['data'] = {};

  if (status && status !== existingOrder.status) {
    data.status = status;
    Object.assign(data, timestampsForStatus(status as OrderStatus));
  }

  if (admin_notes !== undefined) {
    data.admin_notes = existingOrder.admin_notes
      ? `${existingOrder.admin_notes}\n${admin_notes}`
      : admin_notes;
  }

  if (Object.keys(data).length > 0) {
    await prisma.order.update({ where: { id: existingOrder.id }, data });
  }

  return NextResponse.json({
    message: 'Order updated successfully',
    order: await enrichOrder(trackingId),
  });
});
