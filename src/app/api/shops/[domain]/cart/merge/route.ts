import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Cart } from '@/models/Cart';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { database } from '@/lib/db'

const mergeCartSchema = z.object({
  items: z.array(z.object({
    product_id: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
    variant_index: z.number().int().min(0).optional(),
  })),
});

/**
 * POST /api/shops/[domain]/cart/merge
 * Merge local storage cart with user's cart
 */
export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  // Parse request body
  const body = await request.json();
  const { items } = mergeCartSchema.parse(body);

  // Validate that all items belong to this shop by checking product shop_id
  // This prevents users from adding products from other shops
  if (items.length > 0) {
    const productIds = [... new Set(items.map(item => item.product_id))];
    const productCheck = await database.query(
      `SELECT id FROM products WHERE id = ANY($1) AND shop_id = $2`,
      [productIds, shop.id]
    )
    if (productCheck.rows.length !== productIds.length) {
      throw Object.assign(new Error('Some products do not belong to this shop'), { status: 400 });
    }
  }

  // Merge the local storage cart items with user's cart
  const mergedCart = await Cart.mergeCarts(
    user.id,
    shop.id,
    items // Pass the items from local storage
  );

  // Get the updated cart with product details
  const cartWithProducts = mergedCart ? 
    await Cart.findByShopAndUserId(shop.id, user.id) : 
    null;

  return NextResponse.json({
    success: true,
    message: 'Cart merged successfully',
    cart: cartWithProducts || {
      id: null,
      user_id: user.id,
      shop_id: shop.id,
      items: [],
      total_items: 0,
      total_amount: 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
});
