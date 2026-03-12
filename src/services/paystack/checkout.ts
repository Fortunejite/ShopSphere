import { CartItemWithProduct } from '@/models/Cart';
import { UserAttributes } from '@/models/User';
import { generateURL } from '@/lib/domain';
import { paystack } from '.';
import { amountInSmallestCurrencyUnit } from '@/lib/currency';

interface CheckoutItemsParams {
  items: CartItemWithProduct[];
  domain: string;
  currency: string;
  user: UserAttributes;
  paystackAccountId: string;
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
  paystackAccountId,
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
    subaccount: paystackAccountId,
    bearer: 'subaccount',
    callback_url: `${generateURL(domain)}/orders/${trackingId}`,
    currency: currency.toUpperCase(),
  });

  if (!checkout.status || !checkout.data) {
    throw new Error('Paystack checkout initialization failed');
  }
  return checkout.data.authorization_url;
};
