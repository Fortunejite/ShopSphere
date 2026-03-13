import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';

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

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  // Statuses excluded from revenue totals
  const excludeFromRevenue = ['cancelled', 'pending'] as ('cancelled' | 'pending')[];

  const [
    totalRevenueAgg,
    currentMonthRevenueAgg,
    lastMonthRevenueAgg,
    totalOrders,
    currentMonthOrders,
    lastMonthOrders,
    totalProducts,
    activeProducts,
    totalCustomers,
    currentMonthCustomers,
    confirmedOrders,
    lowStockProducts,
  ] = await prisma.$transaction([
    // Total revenue (all time, excluding cancelled/pending)
    prisma.order.aggregate({
      where: { shop_id: shop.id, status: { notIn: excludeFromRevenue } },
      _sum: { total_amount: true },
    }),
    // Current month revenue
    prisma.order.aggregate({
      where: {
        shop_id: shop.id,
        status: { notIn: excludeFromRevenue },
        created_at: { gte: currentMonthStart },
      },
      _sum: { total_amount: true },
    }),
    // Last month revenue
    prisma.order.aggregate({
      where: {
        shop_id: shop.id,
        status: { notIn: excludeFromRevenue },
        created_at: { gte: lastMonthStart, lt: lastMonthEnd },
      },
      _sum: { total_amount: true },
    }),
    // Total orders
    prisma.order.count({ where: { shop_id: shop.id } }),
    // Current month orders
    prisma.order.count({
      where: { shop_id: shop.id, created_at: { gte: currentMonthStart } },
    }),
    // Last month orders
    prisma.order.count({
      where: { shop_id: shop.id, created_at: { gte: lastMonthStart, lt: lastMonthEnd } },
    }),
    // Total products
    prisma.product.count({ where: { shop_id: shop.id } }),
    // Active products
    prisma.product.count({ where: { shop_id: shop.id, status: 'active' } }),
    // Total unique customers (distinct user_id)
    prisma.order.groupBy({
      by: ['user_id'],
      where: { shop_id: shop.id },
      orderBy: { user_id: 'asc' },
    }),
    // Current month unique customers
    prisma.order.groupBy({
      by: ['user_id'],
      where: { shop_id: shop.id, created_at: { gte: currentMonthStart } },
      orderBy: { user_id: 'asc' },
    }),
    // Processing orders
    prisma.order.count({ where: { shop_id: shop.id, status: 'processing' } }),
    // Low stock products (stock <= 10, active)
    prisma.product.count({
      where: { shop_id: shop.id, status: 'active', stock_quantity: { lte: 10 } },
    }),
  ]);

  const currentRevenue = currentMonthRevenueAgg._sum?.total_amount ?? 0;
  const lastRevenue    = lastMonthRevenueAgg._sum?.total_amount    ?? 0;

  const revenueGrowth =
    lastRevenue > 0
      ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
      : currentRevenue > 0 ? 100 : 0;

  const orderGrowth =
    lastMonthOrders > 0
      ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : currentMonthOrders > 0 ? 100 : 0;

  return NextResponse.json({
    totalRevenue:     totalRevenueAgg._sum?.total_amount ?? 0,
    monthlyRevenue:   currentRevenue,
    totalOrders,
    monthlyOrders:    currentMonthOrders,
    totalProducts,
    activeProducts,
    totalCustomers:   totalCustomers.length,
    monthlyCustomers: currentMonthCustomers.length,
    confirmedOrders,
    lowStockProducts,
    revenueGrowth:    Math.round(revenueGrowth * 10) / 10,
    orderGrowth:      Math.round(orderGrowth * 10) / 10,
  });
});

