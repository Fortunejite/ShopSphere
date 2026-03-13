import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { checkoutItems } from '@/services/stripe/checkout';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ─── Local types ─────────────────────────────────────────────────────────────

interface CartItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
}

interface OrderItem extends CartItem {
  unit_price_at_purchase: number;
  discount_at_purchase: number;
  subtotal: number;
}

// ─── Validation schema ────────────────────────────────────────────────────────

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
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  discount_amount: z.number().min(0).optional().default(0),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTrackingId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

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

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  const statusParam = url.searchParams.get('status') || undefined;
  const offset = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    user_id: user.id,
    shop_id: shop.id,
    ...(statusParam ? { status: statusParam as Prisma.EnumOrderStatusFilter } : {}),
  };

  const [totalOrders, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    }),
  ]);

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

  const body = await request.json();
  const validatedData = createOrderSchema.parse(body);

  // ── 1. Fetch cart ──────────────────────────────────────────────────────────
  const cart = await prisma.cart.findFirst({
    where: { user_id: user.id, shop_id: shop.id },
  });

  const rawCartItems = (cart?.items ?? []) as unknown as CartItem[];

  if (!cart || rawCartItems.length === 0) {
    throw Object.assign(new Error('Cart is empty or not found'), { status: 400 });
  }

  // ── 2. Resolve products & validate stock ───────────────────────────────────
  const productIds = [...new Set(rawCartItems.map((i) => i.product_id))];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, shop_id: shop.id },
    select: {
      id: true,
      name: true,
      image: true,
      price: true,
      discount: true,
      stock_quantity: true,
      status: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const validationErrors: string[] = [];
  const validatedCartItems: CartItem[] = [];

  for (const cartItem of rawCartItems) {
    const product = productMap.get(cartItem.product_id);

    if (!product) {
      validationErrors.push(`Product with ID ${cartItem.product_id} no longer exists`);
      continue;
    }
    if (product.status !== 'active') {
      validationErrors.push(`Product "${product.name}" is no longer available`);
      continue;
    }
    if (product.stock_quantity < cartItem.quantity) {
      validationErrors.push(
        `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${cartItem.quantity}`,
      );
      if (product.stock_quantity > 0) {
        validatedCartItems.push({ ...cartItem, quantity: product.stock_quantity });
      }
    } else {
      validatedCartItems.push(cartItem);
    }
  }

  if (validationErrors.length > 0) {
    return NextResponse.json(
      {
        error: 'Cart validation failed',
        details: validationErrors,
        updated_items: validatedCartItems.filter((i) => i.quantity > 0),
      },
      { status: 400 },
    );
  }

  // ── 3. Build enriched cart items (needed by checkoutItems) ────────────────
  const enrichedCartItems = validatedCartItems.map((cartItem) => {
    const product = productMap.get(cartItem.product_id)!;
    const effectivePrice = product.price * (1 - (product.discount ?? 0) / 100);
    const subtotal = effectivePrice * cartItem.quantity;
    return {
      ...cartItem,
      subtotal,
      product: {
        ...product,
        // Ensure shape matches what checkoutItems expects (name + image)
      },
    };
  });

  // ── 4. Calculate totals ───────────────────────────────────────────────────
  const totalAmount = enrichedCartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const discountAmount = validatedData.discount_amount ?? 0;
  const finalAmount = totalAmount - discountAmount;

  // ── 5. Build order items for JSON storage ─────────────────────────────────
  const orderItems: OrderItem[] = enrichedCartItems.map((i) => {
    const product = productMap.get(i.product_id)!;
    return {
      product_id: i.product_id,
      quantity: i.quantity,
      variant_index: i.variant_index,
      unit_price_at_purchase: product.price,
      discount_at_purchase: product.discount ?? 0,
      subtotal: i.subtotal,
    };
  });

  const trackingId = generateTrackingId();

  // ── 6. Persist the order ──────────────────────────────────────────────────
  const order = await prisma.order.create({
    data: {
      user_id: user.id,
      shop_id: shop.id,
      tracking_id: trackingId,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      tax_amount: 0,
      shipping_amount: 0,
      final_amount: finalAmount,
      items: orderItems as unknown as Prisma.InputJsonValue,
      status: 'pending',
      payment_status: 'pending',
      shipping_address: validatedData.shipping_address as unknown as Prisma.InputJsonValue,
      notes: validatedData.notes,
    },
  });

  // ── 7. Stripe checkout ────────────────────────────────────────────────────
  let checkoutUrl: string | null = null;
  try {
    checkoutUrl = await checkoutItems({
      // checkoutItems expects CartItemWithProduct[] — pass enriched items
      items: enrichedCartItems as Parameters<typeof checkoutItems>[0]['items'],
      domain: shop.domain,
      currency: shop.currency,
      user,
      stripeAccountId: shop.stripe_account_id,
      trackingId: order.tracking_id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    await prisma.order.delete({ where: { id: order.id } });
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  if (!checkoutUrl) {
    await prisma.order.delete({ where: { id: order.id } });
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  // ── 8. Clear cart ─────────────────────────────────────────────────────────
  await prisma.cart.update({
    where: { id: cart.id },
    data: { items: [] },
  });

  return NextResponse.json(
    { message: 'Order created successfully', checkoutUrl },
    { status: 201 },
  );
});
