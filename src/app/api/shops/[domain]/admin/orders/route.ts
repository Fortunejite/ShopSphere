import { NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';

/**
 * GET /api/shops/[domain]/admin/orders
 * Get all orders for shop admin/owner
 */
export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  // Check if user is shop owner/admin
  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  // Get query parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const status = url.searchParams.get('status') || undefined;
  const offset = (page - 1) * limit;

  // Get shop's orders
  const orders = await Order.findByShopId(shop.id, limit, offset, status);

  // Get total count for pagination
  const totalOrders = await Order.countByShopId(shop.id, status);

  // Get shop statistics
  const stats = await Order.getShopStats(shop.id, 30); // Last 30 days

  return NextResponse.json({
    orders,
    stats,
    pagination: {
      page,
      limit,
      total: totalOrders,
      pages: Math.ceil(totalOrders / limit),
    },
  });
});
