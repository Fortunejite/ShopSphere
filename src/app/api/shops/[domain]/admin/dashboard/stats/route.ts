import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Database } from '@/lib/db';
import { Product } from '@/models/Product';
import { errorHandler } from '@/lib/errorHandler';
import { getShopByDomain } from '@/lib/shop';

export const GET = errorHandler(async (req, { params }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { domain } = await params;
  if (!domain) {
    return NextResponse.json(
      { error: 'Shop domain is required' },
      { status: 400 },
    );
  }
  const shop = await getShopByDomain(domain);

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  // Check if user is shop owner
  if (shop.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get current date info for month calculations
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Total revenue
  const totalRevenueResult = await Database.query(
    `
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders 
      WHERE shop_id = $1 AND status NOT IN ('cancelled', 'refunded', 'pending')
    `,
    [shop.id],
  );

  // Monthly revenue (current month)
  const monthlyRevenueResult = await Database.query(
    `
      SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue
      FROM orders 
      WHERE shop_id = $1 
        AND status NOT IN ('cancelled', 'refunded', 'pending')
        AND EXTRACT(YEAR FROM created_at) = $2 
        AND EXTRACT(MONTH FROM created_at) = $3
    `,
    [shop.id, currentYear, currentMonth],
  );

  // Previous month revenue for growth calculation
  const lastMonthRevenueResult = await Database.query(
    `
      SELECT COALESCE(SUM(total_amount), 0) as last_month_revenue
      FROM orders 
      WHERE shop_id = $1 
        AND status NOT IN ('cancelled', 'refunded', 'pending')
        AND EXTRACT(YEAR FROM created_at) = $2 
        AND EXTRACT(MONTH FROM created_at) = $3
    `,
    [shop.id, lastMonthYear, lastMonth],
  );

  // Total orders
  const totalOrdersResult = await Database.query(
    `
      SELECT COUNT(*) as total_orders
      FROM orders 
      WHERE shop_id = $1
    `,
    [shop.id],
  );

  // Monthly orders (current month)
  const monthlyOrdersResult = await Database.query(
    `
      SELECT COUNT(*) as monthly_orders
      FROM orders 
      WHERE shop_id = $1 
        AND EXTRACT(YEAR FROM created_at) = $2 
        AND EXTRACT(MONTH FROM created_at) = $3
    `,
    [shop.id, currentYear, currentMonth],
  );

  // Previous month orders for growth calculation
  const lastMonthOrdersResult = await Database.query(
    `
      SELECT COUNT(*) as last_month_orders
      FROM orders 
      WHERE shop_id = $1 
        AND EXTRACT(YEAR FROM created_at) = $2 
        AND EXTRACT(MONTH FROM created_at) = $3
    `,
    [shop.id, lastMonthYear, lastMonth],
  );

  // Use existing model methods for product counts
  const totalProducts = await Product.count(shop.id);
  const activeProducts = await Product.findByShopId(shop.id, 1000, 0, 'active');
  const activeProductCount = activeProducts.length;

  // Total customers (unique users who placed orders)
  const totalCustomersResult = await Database.query(
    `
      SELECT COUNT(DISTINCT user_id) as total_customers
      FROM orders 
      WHERE shop_id = $1
    `,
    [shop.id],
  );

  // Monthly customers (unique users who placed orders this month)
  const monthlyCustomersResult = await Database.query(
    `
      SELECT COUNT(DISTINCT user_id) as monthly_customers
      FROM orders 
      WHERE shop_id = $1 
        AND EXTRACT(YEAR FROM created_at) = $2 
        AND EXTRACT(MONTH FROM created_at) = $3
    `,
    [shop.id, currentYear, currentMonth],
  );

  // Confirmed orders
  const confirmedOrdersResult = await Database.query(
    `
      SELECT COUNT(*) as confirmed_orders
      FROM orders 
      WHERE shop_id = $1 AND status = 'confirmed'
    `,
    [shop.id],
  );

  // Low stock products (using existing model method)
  const lowStockProducts = await Product.findLowStock(10, shop.id);
  const lowStockCount = lowStockProducts.length;

  // Calculate growth percentages
  const currentRevenue = monthlyRevenueResult.rows[0]?.monthly_revenue || 0;
  const lastRevenue = lastMonthRevenueResult.rows[0]?.last_month_revenue || 0;
  const revenueGrowth =
    lastRevenue > 0
      ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
      : currentRevenue > 0
      ? 100
      : 0;

  const currentOrders = monthlyOrdersResult.rows[0]?.monthly_orders || 0;
  const lastOrders = lastMonthOrdersResult.rows[0]?.last_month_orders || 0;
  const orderGrowth =
    lastOrders > 0
      ? ((currentOrders - lastOrders) / lastOrders) * 100
      : currentOrders > 0
      ? 100
      : 0;

  const stats = {
    totalRevenue: totalRevenueResult.rows[0]?.total_revenue || 0,
    monthlyRevenue: currentRevenue,
    totalOrders: totalOrdersResult.rows[0]?.total_orders || 0,
    monthlyOrders: currentOrders,
    totalProducts: totalProducts,
    activeProducts: activeProductCount,
    totalCustomers: totalCustomersResult.rows[0]?.total_customers || 0,
    monthlyCustomers: monthlyCustomersResult.rows[0]?.monthly_customers || 0,
    confirmedOrders: confirmedOrdersResult.rows[0]?.confirmed_orders || 0,
    lowStockProducts: lowStockCount,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10, // Round to 1 decimal place
    orderGrowth: Math.round(orderGrowth * 10) / 10,
  };

  return NextResponse.json(stats);
});
