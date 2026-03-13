import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { Prisma, OrderStatus } from '@prisma/client';

/**
 * GET /api/shops/[domain]/admin/orders
 * Get all orders for shop admin/owner with stats
 */
export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const statusParam = url.searchParams.get('status') || undefined;
  const offset = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    shop_id: shop.id,
    ...(statusParam ? { status: statusParam as OrderStatus } : {}),
  };

  // Orders + count in one round-trip
  const [totalOrders, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: { select: { email: true, username: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    }),
  ]);

  // Shop stats for the last 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [statsRaw, confirmed, completed, cancelled] = await prisma.$transaction([
    prisma.order.aggregate({
      where: { shop_id: shop.id, created_at: { gte: since } },
      _count: { id: true },
      _sum: { final_amount: true },
    }),
    prisma.order.count({
      where: { shop_id: shop.id, created_at: { gte: since }, status: 'processing' },
    }),
    prisma.order.count({
      where: { shop_id: shop.id, created_at: { gte: since }, status: 'delivered' },
    }),
    prisma.order.count({
      where: { shop_id: shop.id, created_at: { gte: since }, status: 'cancelled' },
    }),
  ]);

  const stats = {
    total_orders:     statsRaw._count.id,
    total_revenue:    statsRaw._sum.final_amount ?? 0,
    confirmed_orders: confirmed,
    completed_orders: completed,
    cancelled_orders: cancelled,
  };

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
