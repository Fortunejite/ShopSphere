import { errorHandler } from '@/lib/errorHandler';
import ShopService from '@/services/shop.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;

  const shop = await ShopService.getShopByDomain(domain!);
  return NextResponse.json(shop);
});

export const PUT = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const body = await request.json();

  const updatedShop = await ShopService.updateShop(domain!, body);
  return NextResponse.json(updatedShop);
});

export const DELETE = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  await ShopService.deleteShop(domain!);
  return NextResponse.json({ message: 'Shop deleted successfully.' });
});
