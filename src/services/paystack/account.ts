import z from 'zod';
import { PLATFORM_FEE_PERCENTAGE } from './constants';
import { Shop } from '@prisma/client';
import { accountConnectSchema } from '@/lib/schema/paystack';
import { paystack } from '.';

export const createPaystackAccount = async (
  shopData: Shop,
  bankDetails: z.infer<typeof accountConnectSchema>,
) => {
  const metadata = JSON.stringify({
    custom_fields: [
      {
        shopId: shopData.id,
      },
    ],
  });
  const subAccount = await paystack.subAccount.create({
    business_name: shopData.name,
    description: `Sub-account for ${shopData.name}`,
    settlement_bank: bankDetails.bankCode,
    account_number: bankDetails.accountNumber,
    percentage_charge: PLATFORM_FEE_PERCENTAGE,
    primary_contact_email: shopData.email,
    metadata,
  });

  if (!subAccount || !subAccount.status) {
    throw new Error('Failed to create Paystack sub-account');
  }
  return subAccount.data;
};
