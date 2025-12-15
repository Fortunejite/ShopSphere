import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Order } from '@/models/Order';
import { errorHandler } from '@/lib/errorHandler';
import { getShopByDomain } from '@/lib/shop';

export const GET = errorHandler( async (req, { params}) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }
  const shop = await getShopByDomain(domain);

  // Check if user is shop owner
  if (shop.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use existing method from Order model
  const recentOrders = await Order.getRecentOrders(shop.id, 10);

  // Format the response to match the expected interface
  const formattedOrders = recentOrders.map(order => ({
    id: order.id,
    tracking_id: order.tracking_id,
    customer_name: ((order as unknown) as Record<string, string>)['user_name'] || ((order as unknown) as Record<string, string>)['user_email'] || 'Guest Customer',
    total_amount: parseFloat(order.total_amount.toString()),
    status: order.status,
    created_at: order.created_at,
    items_count: order.total_items || 0
  }));

  return NextResponse.json(formattedOrders);
});