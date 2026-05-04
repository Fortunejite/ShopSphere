import { CartItemWithProduct } from '@/types';
import ShopService from './shop.service';
import { checkoutItems as stripeCheckout } from './stripe/checkout';
import { authorizeUser } from './user.service';
import { Shop } from '@prisma/client';
import z from 'zod';
import { accountConnectSchema } from '@/lib/schema/paystack';
import {
  createPaystackAccount,
  updatePaystackAccount,
} from './paystack/account';
import { update as shopUpdate } from '@/repositories/shop.repository';
import { createStripeAccountLink } from './stripe/account';
import { paystackCheckout } from './paystack/checkout';
import { prisma } from '@/lib/prisma';

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
      accountId: shop.paystack_account_connected
        ? shop.paystack_account_id!
        : shop.stripe_account_id!,
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

  static async updatePaystackAccount(
    domain: Shop['domain'],
    data: z.infer<typeof accountConnectSchema>,
  ) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (shop.owner_id !== user.id) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    if (!shop.paystack_account_connected || !shop.paystack_account_id) {
      throw {
        message: 'No Paystack account linked to this shop',
        status: 400,
      };
    }
    const bankDetails = accountConnectSchema.parse(data);

    const account = await updatePaystackAccount(shop, bankDetails);

    if (!account) {
      throw new Error('Failed to update Paystack account');
    }
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

  static async getPaystackHistory(
    domain: Shop['domain'],
    page: number,
    limit: number,
  ) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (shop.owner_id !== user.id) {
      throw Object.assign(new Error('Access denied'), { status: 403 });
    }

    const skip = (page - 1) * limit;

    if (!shop.paystack_account_connected || !shop.paystack_account_id) {
      return {
        transactions: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const where = {
      account_id: shop.paystack_account_id,
    };

    const [total, transactions] = await prisma.$transaction([
      prisma.paystackTransaction.count({ where }),
      prisma.paystackTransaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          reference_id: true,
          tracking_id: true,
          amount: true,
          currency: true,
          type: true,
          status: true,
          created_at: true,
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

export default PaymentService;
