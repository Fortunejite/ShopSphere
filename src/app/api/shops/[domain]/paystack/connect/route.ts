import { requireAuth } from '@/lib/apiAuth';
import { errorHandler } from '@/lib/errorHandler';
import { getShopByDomain } from '@/lib/shop';
import { Shop } from '@/models/Shop';
import { createPaystackAccount } from '@/services/paystack/account';
import { NextResponse } from 'next/server';
import z from 'zod';

const bodySchema = z.object({
  bankCode: z.string(),
  accountNumber: z.string(),
})

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const user = await requireAuth();
  const shop = await getShopByDomain(domain!);
  
  if (shop.owner_email !== user.email) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  const bankDetails = bodySchema.parse(await request.json());

  const account = await createPaystackAccount(shop, bankDetails);

  if (!account) {
    throw new Error('Failed to create Paystack account');
  }

  await Shop.update(shop.id, {
    paystack_account_id: account.subaccount_code,
    paystack_account_connected: true,
  });

  return NextResponse.json({  });
})