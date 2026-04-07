import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import CartService from '@/services/cart.service';

/**
 * POST /api/shops/[domain]/cart/merge
 * Merge local storage cart items into the user's server-side cart
 */
export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const updatedCart = await CartService.mergeLocalCartWithServerCart(
    domain,
    await request.json(),
  );

  return NextResponse.json({
    success: true,
    message: 'Cart merged successfully',
    cart: updatedCart,
  });
});
