import Stripe from 'stripe';
import { amountInSmallestCurrencyUnit } from '@/lib/currency';
import { PLATFORM_FEE_PERCENTAGE } from './constants';
import { generateURL } from '@/lib/domain';
import { stripe } from '.';
import { User } from '@prisma/client';
import { CartItemWithProduct } from '@/types';

interface CheckoutItemsParams {
  items: CartItemWithProduct[];
  domain: string;
  currency: string;
  user: User;
  accountId: string;
  trackingId: string;
}
export const checkoutItems = async ({
  items,
  domain,
  currency,
  user,
  trackingId,
  accountId,
}: CheckoutItemsParams) => {
  const lineItems = items.map((item) => {
    const price = item.subtotal / item.quantity;
    return {
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.product.name,
          images: [item.product.image],
        },
        unit_amount: amountInSmallestCurrencyUnit(price, currency),
      },
      quantity: item.quantity,
    };
  }) as Stripe.Checkout.SessionCreateParams.LineItem[];

  const platformFee = items.reduce((total, item) => {
    const price = item.subtotal;
    const fee = (price * PLATFORM_FEE_PERCENTAGE) / 100;
    return total + fee;
  }, 0);

  const checkoutData = {
    customer_email: user.email,
    success_url: `${generateURL(domain)}/orders/${trackingId}?success=true`,
    cancel_url: `${generateURL(domain)}/orders/${trackingId}?success=false`,
    mode: 'payment',
    line_items: lineItems,
    invoice_creation: {
      enabled: true,
    },
    metadata: {
      userId: user.id,
      trackingId,
      domain,
    },
    payment_intent_data: {
      application_fee_amount: amountInSmallestCurrencyUnit(
        platformFee,
        currency,
      ),
    },
  } as Stripe.Checkout.SessionCreateParams;

  const checkout = await stripe.checkout.sessions.create(checkoutData, {
    stripeAccount: accountId,
  });

  if (!checkout.url) {
    throw {
      message: 'Checkout Initilazation failed',
    };
  }

  return checkout.url;
};
