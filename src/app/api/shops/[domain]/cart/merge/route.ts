import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { errorHandler } from '@/lib/errorHandler';
import { requireAuth } from '@/lib/apiAuth';
import { getShopByDomain } from '@/lib/shop';
import { Prisma } from '@prisma/client';

interface CartItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
}

const mergeCartSchema = z.object({
  items: z.array(z.object({
    product_id: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
    variant_index: z.number().int().min(0).optional(),
  })),
});

/**
 * POST /api/shops/[domain]/cart/merge
 * Merge local storage cart items into the user's server-side cart
 */
export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }

  const user = await requireAuth();
  const shop = await getShopByDomain(domain);

  const { items: sourceItems } = mergeCartSchema.parse(await request.json());

  // Verify all items belong to this shop in one query
  if (sourceItems.length > 0) {
    const productIds = [...new Set(sourceItems.map((i) => i.product_id))];
    const validProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, shop_id: shop.id },
      select: { id: true },
    });
    if (validProducts.length !== productIds.length) {
      throw Object.assign(new Error('Some products do not belong to this shop'), { status: 400 });
    }
  }

  // Fetch existing server-side cart
  const existing = await prisma.cart.findUnique({
    where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
  });

  const targetItems = (existing?.items as unknown as CartItem[]) ?? [];

  // Merge: accumulate quantities for matching product+variant, append the rest
  const mergedItems = [...targetItems];
  for (const src of sourceItems) {
    const idx = mergedItems.findIndex(
      (i) => i.product_id === src.product_id && i.variant_index === src.variant_index,
    );
    if (idx >= 0) {
      mergedItems[idx] = { ...mergedItems[idx], quantity: mergedItems[idx].quantity + src.quantity };
    } else {
      mergedItems.push(src);
    }
  }

  await prisma.cart.upsert({
    where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
    create: {
      user_id: user.id,
      shop_id: shop.id,
      items: mergedItems as unknown as Prisma.InputJsonValue,
    },
    update: { items: mergedItems as unknown as Prisma.InputJsonValue },
  });

  // Return the enriched cart
  const productIds = [...new Set(mergedItems.map((i) => i.product_id))];
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
  const enrichedItems = mergedItems.map((item) => {
    const product = productMap.get(item.product_id);
    if (!product) return { ...item, product: null, subtotal: 0 };
    const effectivePrice = product.price * (1 - (product.discount ?? 0) / 100);
    return { ...item, product, subtotal: effectivePrice * item.quantity };
  });

  const total_items = enrichedItems.reduce((sum, i) => sum + i.quantity, 0);
  const total_amount = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);

  return NextResponse.json({
    success: true,
    message: 'Cart merged successfully',
    cart: {
      user_id: user.id,
      shop_id: shop.id,
      items: enrichedItems,
      total_items,
      total_amount,
    },
  });
});
