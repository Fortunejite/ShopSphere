import { errorHandler } from '@/lib/errorHandler';
import { createShopSchema } from '@/lib/schema/shop';
import { requireAuth } from '@/lib/apiAuth';
import { Shop, ShopAttributes } from '@/models/Shop';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async () => {
  const user = await requireAuth();
  const shops = await Shop.findByOwnerId(user.id);

  return NextResponse.json(shops);
});

export const POST = errorHandler(async (request) => {
  const user = await requireAuth();

  const body = await request.json();
  const shopData = createShopSchema.parse(body) as ShopAttributes;
  const newShop = await Shop.create({ ...shopData, owner_id: user.id });

  return NextResponse.json(newShop, { status: 201 });
});
