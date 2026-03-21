import { CartItemWithProduct } from '@/types';
import ShopService from './shop.service';
import { checkoutItems as stripeCheckout } from './stripe/checkout';
import { authorizeUser } from './user.service';

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

    if (!shop.stripe_account_connected) {
      throw {
        message: 'Shop is not connected to Stripe',
        status: 400,
      };
    }

    const url = await stripeCheckout({
      items,
      domain,
      trackingId,
      currency: shop.currency,
      user,
      stripeAccountId: shop.stripe_account_id!,
    });

    if (!url) {
      throw {
        message: 'Failed to create checkout session',
        status: 500,
      };
    }

    return url;
  }
}

export default PaymentService;
