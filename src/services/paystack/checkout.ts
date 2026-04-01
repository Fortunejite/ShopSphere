import { generateURL } from '@/lib/domain';
import { paystack } from '.';
import { amountInSmallestCurrencyUnit } from '@/lib/currency';
import { CartItemWithProduct } from '@/types';
import { User } from '@prisma/client';

interface CheckoutItemsParams {
  items: CartItemWithProduct[];
  domain: string;
  currency: string;
  user: User;
  accountId: string;
  trackingId: string;
}

const channels = [
  'card',
  'bank',
  'apple_pay',
  'ussd',
  'qr',
  'mobile_money',
  'bank_transfer',
  'eft',
  'capitec_pay',
  'payattitude',
];

export const paystackCheckout = async ({
  items,
  domain,
  currency,
  user,
  trackingId,
  accountId,
}: CheckoutItemsParams) => {
  const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);

  const checkout = await paystack.transaction.initialize({
    amount: amountInSmallestCurrencyUnit(totalAmount, currency).toString(),
    email: user.email,
    channels,
    metadata: {
      userId: user.id,
      trackingId,
      domain,
    },
    subaccount: accountId,
    bearer: 'subaccount',
    callback_url: `${generateURL(domain)}/orders/${trackingId}`,
    currency: currency.toUpperCase(),
  });

  if (!checkout.status || !checkout.data) {
    throw new Error('Paystack checkout initialization failed');
  }
  return checkout.data.authorization_url;
};