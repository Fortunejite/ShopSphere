import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import CartService from '@/services/cart.service';

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const cart = await CartService.getCurrentUserCart(domain);

  return NextResponse.json(cart);
});

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const newCart = await CartService.addNewItemToCart(
    domain,
    await request.json(),
  );
  return NextResponse.json({
    message: 'Item added to cart successfully',
    cart: newCart,
  });
});

export const PUT = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const updatedCart = await CartService.updateCartItemQuantity(
    domain,
    await request.json(),
  );

  return NextResponse.json({
    message: 'Cart updated successfully',
    cart: updatedCart,
  });
});

export const DELETE = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const updatedCart = await CartService.removeItemFromCart(
    domain,
    await request.json(),
  );

  return NextResponse.json({
    message: 'Item removed from cart successfully',
    cart: updatedCart,
  });
});
