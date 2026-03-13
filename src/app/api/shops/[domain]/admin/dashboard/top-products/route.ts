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

  const topProducts = await prisma.product.findMany({
    where: { shop_id: shop.id, status: 'active' },
    select: { id: true, name: true, image: true, price: true, sales_count: true },
    orderBy: { sales_count: 'desc' },
    take: 5,
  });

  const formattedProducts = topProducts.map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image || '/placeholder.png',
    sales_count: product.sales_count,
    revenue: product.sales_count * product.price,
  }));

  return NextResponse.json(formattedProducts);
});
