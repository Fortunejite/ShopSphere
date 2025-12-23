import { requireAuth } from '@/lib/apiAuth';
import { errorHandler } from '@/lib/errorHandler';
import { getShopByDomain } from '@/lib/shop';
import { createAccountLink } from '@/services/stripe/account';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const user = await requireAuth();
  const shop = await getShopByDomain(domain!);
  
  if (shop.owner_email !== user.email) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  const url = await createAccountLink(shop.stripe_account_id, domain!);

  if (!url) {
    throw new Error('Failed to create Stripe account link');
  }

  return NextResponse.json({ url });
})