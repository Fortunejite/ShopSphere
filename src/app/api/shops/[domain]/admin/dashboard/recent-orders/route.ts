import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Shop } from '@/models/Shop';
import { Order } from '@/models/Order';

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = params;
    const shop = await Shop.findByDomain(domain);
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

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
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
