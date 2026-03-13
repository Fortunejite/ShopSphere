import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
}

// ─── Shared helper ────────────────────────────────────────────────────────────

/**
 * Fetch a cart, join product details, compute subtotals,
 * and return a fully enriched cart response — or an empty-cart shape.
 */
async function enrichCart(userId: number, shopId: number) {
  const cart = await prisma.cart.findUnique({
    where: { user_id_shop_id: { user_id: userId, shop_id: shopId } },
  });

  if (!cart) {
    return {
      id: null,
      user_id: userId,
      shop_id: shopId,
      items: [],
      total_items: 0,
      total_amount: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  const rawItems = cart.items as unknown as CartItem[];

  if (rawItems.length === 0) {
    return { ...cart, items: [], total_items: 0, total_amount: 0 };
  }

  const productIds = [...new Set(rawItems.map((i) => i.product_id))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      price: true,
      discount: true,
      variants: true,
      stock_quantity: true,
      status: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const enrichedItems = rawItems.map((item) => {
    const product = productMap.get(item.product_id);
    if (!product) return { ...item, product: null, subtotal: 0 };

    const effectivePrice = product.price * (1 - (product.discount ?? 0) / 100);
    const subtotal = effectivePrice * item.quantity;

    return { ...item, product, subtotal };
  });

  const total_items = enrichedItems.reduce((sum, i) => sum + i.quantity, 0);
  const total_amount = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);

  return { ...cart, items: enrichedItems, total_items, total_amount };
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const cartItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  variant_index: z.number().int().min(0).optional(),
});

const updateQuantitySchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(0).max(99),
  variant_index: z.number().int().min(0).optional(),
});

const removeItemSchema = z.object({
  product_id: z.number().int().positive(),
  variant_index: z.number().int().min(0).optional(),
});

// ─── Route handlers ───────────────────────────────────────────────────────────

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  return NextResponse.json(await enrichCart(user.id, shop.id));
});

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);
  const item = cartItemSchema.parse(await request.json());

  // Verify product belongs to this shop
  const product = await prisma.product.findFirst({
    where: { id: item.product_id, shop_id: shop.id },
    select: { id: true },
  });
  if (!product) {
    throw Object.assign(new Error('Product not found in this shop'), { status: 404 });
  }

  // Read current items and merge
  const existing = await prisma.cart.findUnique({
    where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
  });

  const currentItems = (existing?.items as unknown as CartItem[]) ?? [];
  const idx = currentItems.findIndex(
    (i) => i.product_id === item.product_id && i.variant_index === item.variant_index,
  );

  const updatedItems: CartItem[] =
    idx >= 0
      ? currentItems.map((i, n) =>
          n === idx ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      : [...currentItems, item];

  await prisma.cart.upsert({
    where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
    create: {
      user_id: user.id,
      shop_id: shop.id,
      items: updatedItems as unknown as Prisma.InputJsonValue,
    },
    update: { items: updatedItems as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({
    message: 'Item added to cart successfully',
    cart: await enrichCart(user.id, shop.id),
  });
});

export const PUT = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);
  const { product_id, quantity, variant_index } = updateQuantitySchema.parse(await request.json());

  const existing = await prisma.cart.findUnique({
    where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
  });

  if (!existing) {
    throw Object.assign(new Error('Cart not found'), { status: 404 });
  }

  const currentItems = existing.items as unknown as CartItem[];

  // quantity === 0 removes the item; otherwise update it
  const updatedItems =
    quantity === 0
      ? currentItems.filter(
          (i) => !(i.product_id === product_id && i.variant_index === variant_index),
        )
      : currentItems.map((i) =>
          i.product_id === product_id && i.variant_index === variant_index
            ? { ...i, quantity }
            : i,
        );

  await prisma.cart.update({
    where: { id: existing.id },
    data: { items: updatedItems as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({
    message: 'Cart updated successfully',
    cart: await enrichCart(user.id, shop.id),
  });
});

export const DELETE = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);
  const { product_id, variant_index } = removeItemSchema.parse(await request.json());

  const existing = await prisma.cart.findUnique({
    where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
  });

  if (!existing) {
    throw Object.assign(new Error('Cart not found'), { status: 404 });
  }

  const currentItems = existing.items as unknown as CartItem[];
  const updatedItems = currentItems.filter(
    (i) => !(i.product_id === product_id && i.variant_index === variant_index),
  );

  await prisma.cart.update({
    where: { id: existing.id },
    data: { items: updatedItems as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({
    message: 'Item removed from cart successfully',
    cart: await enrichCart(user.id, shop.id),
  });
});