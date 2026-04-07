import z from 'zod';
import { PLATFORM_FEE_PERCENTAGE } from './constants';
import { Shop } from '@prisma/client';
import { accountConnectSchema } from '@/lib/schema/paystack';
import { paystack } from '.';
import { Bank, PaystackSubAccount } from '@/types';
import { authorizeUser } from '../user.service';
import ShopService from '../shop.service';

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

export const getSubAccountDetails = async (domain: Shop['domain']) => {
  const user = await authorizeUser();
  const shop = await ShopService.getShopByDomain(domain);

  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }

  if (!shop.paystack_account_id) {
    throw { message: 'No Paystack account linked', status: 404 };
  }
  const subAccount = await paystack.subAccount.fetch(shop.paystack_account_id);
  if (!subAccount.data)
    throw {
      message: 'Failed to fetch Paystack sub-account details',
      status: 500,
    };
  return {
    account_number: subAccount.data.account_number,
    settlement_bank: subAccount.data.settlement_bank,
  } as PaystackSubAccount;
};

export const getAvailableBanks = async () => {
  const bankRes = await paystack.misc.banks();
  if (!bankRes.data)
    throw { message: 'Failed to fetch banks from Paystack', status: 500 };
  const banks: Bank[] = bankRes.data.map((bank) => ({
    id: bank.id,
    name: bank.name,
    slug: bank.slug,
    code: bank.code,
    country: bank.country,
  }));
  return banks;
};
