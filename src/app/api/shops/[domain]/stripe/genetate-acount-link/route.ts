import { errorHandler } from '@/lib/errorHandler';
import ShopService from '@/services/shop.service';
import { createAccountLink } from '@/services/stripe/account';
import { authorizeUser } from '@/services/user.service';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const user = await authorizeUser();
  const shop = await ShopService.getShopByDomain(domain!);
  
  if (shop.owner.email !== user.email) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  const url = await createAccountLink(shop.stripe_account_id, domain!);

  if (!url) {
    throw new Error('Failed to create Stripe account link');
  }

  return NextResponse.json({ url });
})