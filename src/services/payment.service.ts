import { CartItemWithProduct } from '@/types';
import ShopService from './shop.service';
import { checkoutItems as stripeCheckout } from './stripe/checkout';
import { authorizeUser } from './user.service';
import { Shop } from '@prisma/client';
import z from 'zod';
import { accountConnectSchema } from '@/lib/schema/paystack';
import { createPaystackAccount } from './paystack/account';
import { update as shopUpdate } from '@/repositories/shop.repository';
import { createStripeAccountLink } from './stripe/account';
import { paystackCheckout } from './paystack/checkout';

interface CheckoutItemsParams {
  items: CartItemWithProduct[];
  domain: string;
  trackingId: string;
}

class PaymentService {
  static async getCheckoutLink({
    items,
    domain,
    trackingId,
  }: CheckoutItemsParams) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (!shop.stripe_account_connected && !shop.paystack_account_connected) {
      throw {
        message: 'Shop not connected to a payment method',
        status: 400,
      };
    }

    const checkoutParams = {
      items,
      domain,
      trackingId,
      currency: shop.currency,
      user,
      accountId: shop.paystack_account_connected ? shop.paystack_account_id! : shop.stripe_account_id!,
    };

    const url = shop.paystack_account_connected
      ? await paystackCheckout(checkoutParams)
      : await stripeCheckout(checkoutParams);

    if (!url) {
      throw {
        message: 'Failed to create checkout session',
        status: 500,
      };
    }

    return url;
  }

  static async createPaystackAccount(
    domain: Shop['domain'],
    data: z.infer<typeof accountConnectSchema>,
  ) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (shop.owner_id !== user.id) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    const bankDetails = accountConnectSchema.parse(data);

    const account = await createPaystackAccount(shop, bankDetails);

    if (!account) {
      throw new Error('Failed to create Paystack account');
    }

    await shopUpdate(shop.id, {
      paystack_account_id: account.subaccount_code,
      paystack_account_connected: true,
    });

    return account;
  }

  static async linkStripeAccount(domain: Shop['domain']) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (shop.owner.email !== user.email) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    const url = await createStripeAccountLink(shop.stripe_account_id, domain!);

    if (!url) {
      throw new Error('Failed to create Stripe account link');
    }

    return url;
  }
}

export default PaymentService;
