import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { Cart } from '@/models/Cart';
import { z } from 'zod';

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

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  const cart = await Cart.findByShopAndUserId(shop.id, user.id);

  return NextResponse.json(cart || {
    id: null,
    user_id: user.id,
    shop_id: shop.id,
    items: [],
    total_items: 0,
    total_amount: 0,
    created_at: new Date(),
    updated_at: new Date(),
  });
});

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);
  const body = await request.json();

  const item = cartItemSchema.parse(body);

  await Cart.addItem(user.id, shop.id, item);
  const updatedCart = await Cart.findByShopAndUserId(shop.id, user.id);

  return NextResponse.json({
    message: 'Item added to cart successfully',
    cart: updatedCart
  });
});

export const PUT = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);
  const body = await request.json();

  const { product_id, quantity, variant_index } = updateQuantitySchema.parse(body);

  if (quantity === 0) {
    // Remove item if quantity is 0
    await Cart.removeItem(user.id, shop.id, product_id, variant_index);
  } else {
    // Update quantity
    await Cart.updateItemQuantity(user.id, shop.id, product_id, quantity, variant_index);
  }

  const updatedCart = await Cart.findByShopAndUserId(shop.id, user.id);

  return NextResponse.json({
    message: 'Cart updated successfully',
    cart: updatedCart
  });
});

export const DELETE = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);
  const body = await request.json();

  const { product_id, variant_index } = removeItemSchema.parse(body);
  await Cart.removeItem(user.id, shop.id, product_id, variant_index);
  
  const updatedCart = await Cart.findByShopAndUserId(shop.id, user.id);

  return NextResponse.json({
    message: 'Item removed from cart successfully',
    cart: updatedCart
  });
});