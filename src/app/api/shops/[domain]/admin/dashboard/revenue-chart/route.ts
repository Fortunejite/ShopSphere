import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import StatsService from '@/services/stats.service';

export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);
  const validDays = [7, 30, 90].includes(days) ? days : 30;

  const data = await StatsService.getRevenueChartData(domain, validDays);
  return NextResponse.json(data);
});
