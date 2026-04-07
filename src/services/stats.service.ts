import { findMany as orderFindMany } from '@/repositories/order.repository';
import { Shop } from '@prisma/client';
import ShopService from './shop.service';
import { authorizeUser } from './user.service';
import { OrderItem } from '@/types';
import { prisma } from '@/lib/prisma';

class StatsService {
  // Admin only
  static async getRecentOrders(domain: Shop['domain'], limit: number = 10) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    if (shop.owner_id !== user.id) {
      throw { message: 'Access denied', status: 403 };
    }

    const recentOrders = await orderFindMany({ shop_id: shop.id }, limit, 0);

    const formattedOrders = recentOrders.map((order) => {
      const storedItems = order.items as unknown as OrderItem[];
      const items_count = storedItems.reduce((sum, i) => sum + i.quantity, 0);

      return {
        id: order.id,
        tracking_id: order.tracking_id,
        customer_name:
          order.user.username ?? order.user.email ?? 'Guest Customer',
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        items_count,
      };
    });
    return formattedOrders;
  }

  static async getTopProducts(domain: Shop['domain'], limit: number = 5) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    if (shop.owner_id !== user.id) {
      throw { message: 'Access denied', status: 403 };
    }

    const topProducts = await prisma.product.findMany({
      where: { shop_id: shop.id, status: 'active' },
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
        sales_count: true,
      },
      orderBy: { sales_count: 'desc' },
      take: limit,
    });

    return topProducts.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image || '/placeholder.png',
      sales_count: product.sales_count,
      revenue: product.sales_count * product.price,
    }));
  }

  static async getDashboardStats(domain: Shop['domain']) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    if (shop.owner_id !== user.id) {
      throw { message: 'Access denied', status: 403 };
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Statuses excluded from revenue totals
    const excludeFromRevenue = ['cancelled', 'pending'] as (
      | 'cancelled'
      | 'pending'
    )[];

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
        where: {
          shop_id: shop.id,
          created_at: { gte: lastMonthStart, lt: lastMonthEnd },
        },
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
        where: {
          shop_id: shop.id,
          status: 'active',
          stock_quantity: { lte: 10 },
        },
      }),
    ]);

    const currentRevenue = currentMonthRevenueAgg._sum?.total_amount ?? 0;
    const lastRevenue = lastMonthRevenueAgg._sum?.total_amount ?? 0;

    const revenueGrowth =
      lastRevenue > 0
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const orderGrowth =
      lastMonthOrders > 0
        ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : currentMonthOrders > 0
          ? 100
          : 0;

    return {
      totalRevenue: totalRevenueAgg._sum?.total_amount ?? 0,
      monthlyRevenue: currentRevenue,
      totalOrders,
      monthlyOrders: currentMonthOrders,
      totalProducts,
      activeProducts,
      totalCustomers: totalCustomers.length,
      monthlyCustomers: currentMonthCustomers.length,
      confirmedOrders,
      lowStockProducts,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
    };
  }

  static async getOrderStats(shopId: Shop['id']) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [statsRaw, confirmed, completed, cancelled] = await prisma.$transaction([
      prisma.order.aggregate({
        where: { shop_id: shopId, created_at: { gte: since } },
        _count: { id: true },
        _sum: { total_amount: true },
      }),
      prisma.order.count({
        where: { shop_id: shopId, created_at: { gte: since }, status: 'processing' },
      }),
      prisma.order.count({
        where: { shop_id: shopId, created_at: { gte: since }, status: 'delivered' },
      }),
      prisma.order.count({
        where: { shop_id: shopId, created_at: { gte: since }, status: 'cancelled' },
      }),
    ]);

    return {
      total_orders:     statsRaw._count.id,
      total_revenue:    statsRaw._sum.total_amount ?? 0,
      confirmed_orders: confirmed,
      completed_orders: completed,
      cancelled_orders: cancelled,
    };
  }
}

export default StatsService;
