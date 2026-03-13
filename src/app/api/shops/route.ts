import { errorHandler } from '@/lib/errorHandler';
import { createShopSchema } from '@/lib/schema/shop';
import { requireAuth } from '@/lib/apiAuth';
import { NextResponse } from 'next/server';
import { createAccount } from '@/services/stripe/account';
import { prisma } from '@/lib/prisma';
import { Shop } from '@prisma/client';

export const GET = errorHandler(async () => {
  const user = await requireAuth();
  const shops = await prisma.shop.findMany({
    where: { owner_id: user.id },
    include: {
      owner: { select: { email: true, username: true } },
      category: true,
    },
  });

  return NextResponse.json(shops);
});

export const POST = errorHandler(async (request) => {
  const user = await requireAuth();

  const body = await request.json();
  const shopData = createShopSchema.parse(body) as Omit<
    Shop,
    'light_theme' | 'dark_theme'
  > & {
    light_theme?: Shop['light_theme'];
    dark_theme?: Shop['dark_theme'];
  };

  const account = await createAccount(shopData.name, user.email);
  if (!account) {
    throw new Error('Failed to create Stripe account');
  }

  const newShop = await prisma.shop.create({
    data: {
      ...shopData,
      light_theme: shopData.light_theme || {},
      dark_theme: shopData.dark_theme || {},
      owner_id: user.id,
      stripe_account_id: account.id,
    },
  });

  return NextResponse.json(newShop, { status: 201 });
});
