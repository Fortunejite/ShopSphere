import { errorHandler } from '@/lib/errorHandler';
import { prisma } from '@/lib/prisma';
import { createShopSchema } from '@/lib/schema/shop';
import { getShopByDomain } from '@/lib/shop';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;

  const shop = await getShopByDomain(domain!);
  return NextResponse.json(shop);
});

export const PUT = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const body = await request.json();

  const shop = await getShopByDomain(domain!);
  const validatedData = createShopSchema.parse(body);
  
  // Extract domain separately since it might have a different name
  const { domain: newDomain, ...updateData } = validatedData;

  const updatedShop = await prisma.shop.update({
    where: { id: shop.id },
    data: {
      ...updateData,
      domain: newDomain
    }
  });
  return NextResponse.json(updatedShop);
});

export const DELETE = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  const shop = await getShopByDomain(domain!);

  await prisma.shop.delete({ where: { id: shop.id } });
  return NextResponse.json({ message: 'Shop deleted successfully.' });
});
