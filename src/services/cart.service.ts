import { findUnique, update, upsert } from '@/repositories/cart.repository';
import { Prisma, Shop, User } from '@prisma/client';
import { authorizeUser } from './user.service';
import ShopService from './shop.service';
import ProductService from './product.service';
import { CartItem } from '@/types';
import {
  cartItemSchema,
  mergeCartSchema,
  removeItemSchema,
  updateQuantitySchema,
} from '@/lib/schema/cart';
import z from 'zod';

class CartService {
  static async getEnhancedCartWithProducts(userId: User['id'], shopId: Shop['id']) {
    const cart = await findUnique({
      user_id_shop_id: { user_id: userId, shop_id: shopId },
    });

    if (!cart) {
      return {
        id: null,
        user_id: userId,
        shop_id: shopId,
        items: [] as CartItem[],
        total_items: 0,
        total_amount: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    const rawItems = cart.items;

    if (rawItems.length === 0) {
      return {
        ...cart,
        items: [] as CartItem[],
        total_items: 0,
        total_amount: 0,
      };
    }

    const productIds = [...new Set(rawItems.map((i) => i.product_id))];
    const products = await ProductService.getProductByIds(productIds);

    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedItems = rawItems.map((item) => {
      const product = productMap.get(item.product_id);
      if (!product) return { ...item, product: null, subtotal: 0 };

      const effectivePrice =
        product.price * (1 - (product.discount ?? 0) / 100);
      const subtotal = effectivePrice * item.quantity;

      return { ...item, product, subtotal };
    });

    const total_items = enrichedItems.reduce((sum, i) => sum + i.quantity, 0);
    const total_amount = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);

    return { ...cart, items: enrichedItems, total_items, total_amount };
  }

  static async getCurrentUserCart(domain: Shop['domain']) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    return await CartService.getEnhancedCartWithProducts(user.id, shop.id);
  }

  static async getUserPlainCart(userId: User['id'], shopId: Shop['id']) {
    return await findUnique({
      user_id_shop_id: { user_id: userId, shop_id: shopId },
    });
  }

  static async addNewItemToCart(
    domain: Shop['domain'],
    data: z.infer<typeof cartItemSchema>,
  ) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    const item = cartItemSchema.parse(data);

    // Verify product belongs to this shop
    const product = await ProductService.getProductById(item.product_id);
    if (product.shop_id !== shop.id) {
      throw { message: 'Product does not belong to this shop', status: 400 };
    }
    // Read current items and merge
    const existing = await this.getUserPlainCart(user.id, shop.id);

    const currentItems = (existing?.items as unknown as CartItem[]) ?? [];
    const idx = currentItems.findIndex(
      (i) =>
        i.product_id === item.product_id &&
        i.variant_index === item.variant_index,
    );

    const updatedItems: CartItem[] =
      idx >= 0
        ? currentItems.map((i, n) =>
            n === idx ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...currentItems, item];

    await upsert({
      where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
      create: {
        items: updatedItems as unknown as Prisma.InputJsonValue,

        // connect relations
        user: { connect: { id: user.id } },
        shop: { connect: { id: shop.id } },
      },
      update: { items: updatedItems as unknown as Prisma.InputJsonValue },
    });

    return await CartService.getEnhancedCartWithProducts(user.id, shop.id);
  }

  static async updateCartItemQuantity(
    domain: Shop['domain'],
    data: z.infer<typeof updateQuantitySchema>,
  ) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    const { product_id, quantity, variant_index } =
      updateQuantitySchema.parse(data);

    const existing = await this.getUserPlainCart(user.id, shop.id);

    if (!existing) {
      throw { message: 'Cart not found', status: 404 };
    }

    const currentItems = existing.items;

    // quantity === 0 removes the item; otherwise update it
    const updatedItems =
      quantity === 0
        ? currentItems.filter(
            (i) =>
              !(
                i.product_id === product_id && i.variant_index === variant_index
              ),
          )
        : currentItems.map((i) =>
            i.product_id === product_id && i.variant_index === variant_index
              ? { ...i, quantity }
              : i,
          );

    await update(
      { id: existing.id },
      { items: updatedItems as unknown as Prisma.InputJsonValue },
    );

    return await CartService.getEnhancedCartWithProducts(user.id, shop.id);
  }

  static async removeItemFromCart(
    domain: Shop['domain'],
    data: z.infer<typeof removeItemSchema>,
  ) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    const { product_id, variant_index } = removeItemSchema.parse(data);

    const existing = await this.getUserPlainCart(user.id, shop.id);

    if (!existing) {
      throw { message: 'Cart not found', status: 404 };
    }

    const currentItems = existing.items as unknown as CartItem[];

    const updatedItems = currentItems.filter(
      (i) =>
        !(i.product_id === product_id && i.variant_index === variant_index),
    );

    await update(
      { id: existing.id },
      { items: updatedItems as unknown as Prisma.InputJsonValue },
    );

    return await CartService.getEnhancedCartWithProducts(user.id, shop.id);
  }

  static async mergeLocalCartWithServerCart(
    domain: Shop['domain'],
    data: z.infer<typeof mergeCartSchema>,
  ) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    const { items: sourceItems } = mergeCartSchema.parse(data);

    // Verify all items belong to this shop in one query
    if (sourceItems.length > 0) {
      const productIds = [...new Set(sourceItems.map((i) => i.product_id))];
      const validProducts = await ProductService.getProductByIds(productIds);
      const hasNonShopItems = validProducts.some((p) => p.shop_id !== shop.id);
      if (hasNonShopItems) {
        throw {
          message: 'Some products do not belong to this shop',
          status: 400,
        };
      }
    }

    const existing = await this.getUserPlainCart(user.id, shop.id);

    const targetItems = existing?.items || [];

    // Merge: accumulate quantities for matching product+variant, append the rest
    const mergedItems = [...targetItems];
    for (const src of sourceItems) {
      const idx = mergedItems.findIndex(
        (i) =>
          i.product_id === src.product_id &&
          i.variant_index === src.variant_index,
      );
      if (idx >= 0) {
        mergedItems[idx] = {
          ...mergedItems[idx],
          quantity: mergedItems[idx].quantity + src.quantity,
        };
      } else {
        mergedItems.push(src);
      }
    }

    await upsert({
      where: { user_id_shop_id: { user_id: user.id, shop_id: shop.id } },
      create: {
        items: mergedItems as unknown as Prisma.InputJsonValue,

        // connect relations
        user: { connect: { id: user.id } },
        shop: { connect: { id: shop.id } },
      },
      update: { items: mergedItems as unknown as Prisma.InputJsonValue },
    });

    return await CartService.getEnhancedCartWithProducts(user.id, shop.id);
  }
}

export default CartService;
