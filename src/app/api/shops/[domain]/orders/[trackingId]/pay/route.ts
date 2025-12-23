import { requireAuth } from "@/lib/apiAuth";
import { errorHandler } from "@/lib/errorHandler";
import { getShopByDomain } from "@/lib/shop";
import { Order } from "@/models/Order";
import { checkoutItems } from "@/services/stripe/checkout";
import { NextResponse } from "next/server";

export const GET = errorHandler(async (request, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  if (!shop.stripe_account_connected) {
    throw Object.assign(new Error('Shop is not connected to Stripe'), { status: 400 });
  }

  // Create the order
  const order = await Order.findByTrackingIdWithProducts(trackingId);
  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }
  let checkoutUrl: string | null = null;

  try {
    checkoutUrl = await checkoutItems({
      items: order.items,
      domain: shop.domain,
      currency: shop.currency,
      user,
      stripeAccountId: shop.stripe_account_id,
      trackingId: order.tracking_id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }

  if (!checkoutUrl) {
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
  return NextResponse.json(
    {
      checkoutUrl,
    }
  );
});