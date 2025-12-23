import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Order, CreateOrderData } from '@/models/Order';
import { Cart } from '@/models/Cart';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { checkoutItems } from '@/services/stripe/checkout';

const createOrderSchema = z.object({
  shipping_address: z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone is required'),
    address_line_1: z.string().min(1, 'Address is required'),
    address_line_2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  billing_address: z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone is required'),
    address_line_1: z.string().min(1, 'Address is required'),
    address_line_2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  tax_rate: z.number().min(0).max(100).optional().default(0),
  shipping_cost: z.number().min(0).optional().default(0),
  discount_amount: z.number().min(0).optional().default(0),
});

/**
 * GET /api/shops/[domain]/orders
 * Get orders for the current user in this shop
 */
export const GET = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  // Get query parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  const status = url.searchParams.get('status') || undefined;
  const offset = (page - 1) * limit;

  // Get user's orders for this shop - filter by shop ID
  const orders = await Order.findByUserIdAndShopId(user.id, shop.id, limit, offset, status);

  // Get total count for pagination
  const totalOrders = await Order.countByUserIdAndShopId(user.id, shop.id, status);

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total: totalOrders,
      pages: Math.ceil(totalOrders / limit),
    },
  });
});

/**
 * POST /api/shops/[domain]/orders
 * Create a new order from the user's cart
 */
export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  if (!shop.stripe_account_connected) {
    throw Object.assign(new Error('Shop is not connected to Stripe'), { status: 400 });
  }

  // Parse request body
  const body = await request.json();
  const validatedData = createOrderSchema.parse(body);

  // Get user's cart for this shop
  const cart = await Cart.findByShopAndUserId(shop.id, user.id);
  if (!cart || !cart.items.length) {
    throw Object.assign(new Error('Cart is empty or not found'), { status: 400 });
  }

  // Validate cart items (check stock, prices, availability)
  const validation = await Cart.validateCart(user.id, shop.id);
  if (!validation.valid) {
    return NextResponse.json(
      {
        error: 'Cart validation failed',
        details: validation.errors,
        updated_items: validation.updated_items,
      },
      { status: 400 }
    );
  }

  // Create order data
  const orderData: CreateOrderData = {
    user_id: user.id,
    shop_id: shop.id,
    items: cart.items,
    shipping_address: validatedData.shipping_address,
    billing_address: validatedData.billing_address || validatedData.shipping_address,
    payment_method: validatedData.payment_method,
    notes: validatedData.notes,
    tax_rate: validatedData.tax_rate,
    shipping_cost: validatedData.shipping_cost,
    discount_amount: validatedData.discount_amount,
  };

  // Create the order
  const order = await Order.create(orderData);
  let checkoutUrl: string | null = null;

  try {
    checkoutUrl = await checkoutItems({
      items: cart.items,
      domain: shop.domain,
      currency: shop.currency,
      user,
      stripeAccountId: shop.stripe_account_id,
      trackingId: order.tracking_id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    await Order.delete(order.id);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }

  if (!checkoutUrl) {
    await Order.delete(order.id);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }

  // Clear the user's cart after successful order creation
  await Cart.clearCart(user.id, shop.id);
  return NextResponse.json(
    {
      message: 'Order created successfully',
      checkoutUrl,
    },
    { status: 201 }
  );
});
