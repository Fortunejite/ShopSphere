import { ShopAttributes } from '@/models/Shop';
import { paystack } from '.';
import { PLATFORM_FEE_PERCENTAGE } from './constants';

interface BankDetails {
  bankCode: string;
  accountNumber: string;
}

export const createPaystackAccount = async (
  shopData: ShopAttributes,
  bankDetails: BankDetails,
) => {
  const subAccount = await paystack.subAccount.create({
    business_name: shopData.name,
    description: `Sub-account for ${shopData.name}`,
    settlement_bank: bankDetails.bankCode,
    account_number: bankDetails.accountNumber,
    percentage_charge: PLATFORM_FEE_PERCENTAGE,
    primary_contact_email: shopData.email,
  });

  if (!subAccount || !subAccount.status) {
    throw new Error('Failed to create Paystack sub-account');
  }
  return subAccount.data;
};
