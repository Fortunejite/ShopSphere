import { errorHandler } from '@/lib/errorHandler';
import { Shop } from '@/models/Shop';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;

  const shop = await Shop.findByDomain(domain!)

  if (!shop)
    return NextResponse.json({ message: 'Shop not found.' }, { status: 404 });

  return NextResponse.json(shop);
});
