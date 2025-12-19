import { errorHandler } from '@/lib/errorHandler';
import { createShopSchema } from '@/lib/schema/shop';
import { getShopByDomain } from '@/lib/shop';
import { Shop } from '@/models/Shop';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;

  const shop = await Shop.findByDomain(domain!);

  if (!shop)
    return NextResponse.json({ message: 'Shop not found.' }, { status: 404 });

  return NextResponse.json(shop);
});

export const PUT = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const body = await request.json();

  const shop = await getShopByDomain(domain!);
  const validatedData = createShopSchema.parse(body);
  
  // Extract domain separately since it might have a different name
  const { domain: newDomain, ...updateData } = validatedData;
  
  const updatedShop = await Shop.update(shop.id, { 
    ...updateData, 
    domain: newDomain 
  });
  return NextResponse.json(updatedShop);
});

export const DELETE = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  const shop = await getShopByDomain(domain!);

  await Shop.delete(shop.id);
  return NextResponse.json({ message: 'Shop deleted successfully.' });
});
