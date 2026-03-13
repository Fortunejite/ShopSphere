import { requireAuth } from "@/lib/apiAuth";
import { errorHandler } from "@/lib/errorHandler";
import { getShopByDomain } from "@/lib/shop";
import { prisma } from "@/lib/prisma";
import { checkoutItems } from "@/services/stripe/checkout";
import { NextResponse } from "next/server";

interface StoredOrderItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
  unit_price_at_purchase: number;
  discount_at_purchase: number;
  subtotal: number;
}

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

  const order = await prisma.order.findUnique({
    where: { tracking_id: trackingId },
  });

  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  // Enrich stored JSON items with product details for checkoutItems
  const storedItems = order.items as unknown as StoredOrderItem[];
  const productIds = [...new Set(storedItems.map((i) => i.product_id))];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, image: true, price: true, discount: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const enrichedItems = storedItems.map((item) => {
    const product = productMap.get(item.product_id)!;
    return {
      ...item,
      product: {
        ...product,
        // Use the price locked at purchase time for the checkout line items
        price: item.unit_price_at_purchase,
      },
    };
  });

  let checkoutUrl: string | null = null;

  try {
    checkoutUrl = await checkoutItems({
      items: enrichedItems as unknown as Parameters<typeof checkoutItems>[0]['items'],
      domain: shop.domain,
      currency: shop.currency,
      user,
      stripeAccountId: shop.stripe_account_id,
      trackingId: order.tracking_id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  return NextResponse.json({ checkoutUrl });
});