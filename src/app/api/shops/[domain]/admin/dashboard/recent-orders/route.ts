import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';

interface StoredOrderItem {
  quantity: number;
}

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  const recentOrders = await prisma.order.findMany({
    where: { shop_id: shop.id },
    include: { user: { select: { username: true, email: true } } },
    orderBy: { created_at: 'desc' },
    take: 10,
  });

  const formattedOrders = recentOrders.map((order) => {
    const storedItems = order.items as unknown as StoredOrderItem[];
    const items_count = storedItems.reduce((sum, i) => sum + i.quantity, 0);

    return {
      id: order.id,
      tracking_id: order.tracking_id,
      customer_name: order.user.username ?? order.user.email ?? 'Guest Customer',
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      items_count,
    };
  });

  return NextResponse.json(formattedOrders);
});