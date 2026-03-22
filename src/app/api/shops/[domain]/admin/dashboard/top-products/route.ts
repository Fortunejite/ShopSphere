import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import StatsService from '@/services/stats.service';

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const formattedProducts = await StatsService.getTopProducts(domain, 5);

  return NextResponse.json(formattedProducts);
});
