import { errorHandler } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import ShopService from '@/services/shop.service';

export const GET = errorHandler(async () => {
  const shops = await ShopService.getCurrentUserShops();
  return NextResponse.json(shops);
});

export const POST = errorHandler(async (request) => {
  const body = await request.json();
  const newShop = await ShopService.createShop(body);
  return NextResponse.json(newShop, { status: 201 });
});
