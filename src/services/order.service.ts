import { createOrderSchema, updateOrderSchema } from '@/lib/schema/order';
import { Order, OrderStatus, Prisma, Shop } from '@prisma/client';
import z from 'zod';
import CartService from './cart.service';
import { authorizeUser } from './user.service';
import ShopService from './shop.service';
import { CartItem, CartItemWithProduct, OrderItem } from '@/types';
import {
  create,
  count,
  findMany,
  findUnique,
  update,
} from '@/repositories/order.repository';
import PaymentService from './payment.service';
import ProductService from './product.service';
import StatsService from './stats.service';

class OrderService {
  static timestampsForStatus(status: OrderStatus) {
    return {
      ...(status === 'shipped' && { shipped_at: new Date() }),
      ...(status === 'delivered' && { delivered_at: new Date() }),
      ...(status === 'cancelled' && { cancelled_at: new Date() }),
    };
  }
  static async verifyOrderOwnership(domain: Shop['domain'], order: Order) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (order.shop_id !== shop.id) {
      throw {
        message: 'Order not found in this shop',
        status: 404,
      };
    }

    const isOwner = order.user_id === user.id;
    const isShopOwner = shop.owner_id === user.id;

    if (!isOwner || !isShopOwner) {
      throw {
        message: 'Access denied',
        status: 403,
      };
    }

    return { isOwner, isShopOwner, user, shop };
  }

  static async getUserOrders(
    domain: Shop['domain'],
    params: {
      [k: string]: string;
    },
  ) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    const page = parseInt(params.page) || 1;
    const limit = Math.min(parseInt(params.limit) || 10, 50);
    const statusParam = params.status || undefined;
    const offset = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      user_id: user.id,
      shop_id: shop.id,
      ...(statusParam
        ? { status: statusParam as Prisma.EnumOrderStatusFilter }
        : {}),
    };

    const [totalOrders, orders] = await Promise.all([
      count(where),
      findMany(where, limit, offset),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
      },
    };
  }

  static async getShopOrders(
    domain: Shop['domain'],
    params: {
      [k: string]: string;
    },
  ) {
    const shop = await ShopService.getShopByDomain(domain);
    const user = await authorizeUser();

    if (shop.owner_id !== user.id) {
      throw {
        message: 'Access denied',
        status: 403,
      };
    }

    const page = parseInt(params.page) || 1;
    const limit = Math.min(parseInt(params.limit) || 10, 50);
    const statusParam = params.status || undefined;
    const offset = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      shop_id: shop.id,
      ...(statusParam
        ? { status: statusParam as Prisma.EnumOrderStatusFilter }
        : {}),
    };

    const [totalOrders, orders] = await Promise.all([
      count(where),
      findMany(where, limit, offset),
    ]);

    const stats = StatsService.getOrderStats(shop.id);

    return {
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
      },
      stats,
    };
  }

  static async getOrderByTrackingId(
    domain: Shop['domain'],
    trackingId: string,
  ) {
    const order = await findUnique({
      tracking_id: trackingId,
    });

    if (!order) {
      throw {
        message: 'Order not found',
        status: 404,
      };
    }

    await this.verifyOrderOwnership(domain, order);

    const enrichedItems = await ProductService.getEnrichedItems(
      order.items as unknown as CartItem[],
    );
    const total_items = enrichedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      ...order,
      items: enrichedItems,
      total_items,
    };
  }

  static async getOrderById(id: Order['id']) {
    const order = await findUnique({
      id,
    });

    if (!order) {
      throw {
        message: 'Order not found',
        status: 404,
      };
    }

    return order;
  }

  static generateTrackingId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  static async createOrderFromCart(
    shopDomain: Shop['domain'],
    data: z.infer<typeof createOrderSchema>,
  ) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(shopDomain);

    const validatedData = createOrderSchema.parse(data);

    const cart = await CartService.getEnhancedCartWithProducts(
      user.id,
      shop.id,
    );

    if (cart.id === null || cart.items.length === 0) {
      throw {
        message: 'Cart is empty. Cannot create order.',
        status: 400,
      };
    }

    // Validate Product Availability and Stock
    const validationErrors: string[] = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        validationErrors.push(
          `Product with ID ${item.product_id} no longer exists`,
        );
        continue;
      } else if (product.status !== 'active') {
        validationErrors.push(
          `Product "${product.name}" is no longer available`,
        );
        continue;
      }
      if (product.stock_quantity < item.quantity) {
        validationErrors.push(
          `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
        );
      }
    }

    if (validationErrors.length > 0) {
      throw {
        message: 'Validation errors for cart items',
        details: validationErrors,
        status: 400,
      };
    }

    const trackingId = this.generateTrackingId();
    const orderItems: OrderItem[] = cart.items.map((i) => {
      const product = i.product!;
      return {
        product_id: i.product_id,
        quantity: i.quantity,
        variant_index: i.variant_index,
        unit_price_at_purchase: product.price,
        discount_at_purchase: product.discount ?? 0,
        subtotal: i.subtotal,
      };
    });

    const orderData = {
      tracking_id: trackingId,
      total_amount: cart.total_amount,
      tax_amount: 0,
      shipping_amount: 0,
      final_amount: cart.total_amount,
      items: orderItems as unknown as Prisma.InputJsonValue,
      status: 'pending' as OrderStatus,
      payment_status: 'pending' as const,
      shipping_address:
        validatedData.shipping_address as unknown as Prisma.InputJsonValue,
      notes: validatedData.notes,

      // connect relations
      user: { connect: { id: user.id } },
      shop: { connect: { id: shop.id } },
    };

    const checkoutUrl = await PaymentService.getCheckoutLink({
      items: cart.items as unknown as CartItemWithProduct[],
      domain: shop.domain,
      trackingId,
    });
    await create(orderData);
    // Clear the cart after creating the order
    await CartService.clearCart(cart.id);

    return { trackingId, checkoutUrl };
  }

  static async initializePaymentForOrder(
    domain: Shop['domain'],
    trackingId: string,
  ) {
    const order = await findUnique({
      tracking_id: trackingId,
    });

    if (!order) {
      throw {
        message: 'Order not found',
        status: 404,
      };
    }

    const { shop } = await this.verifyOrderOwnership(domain, order);

    if (order.payment_status !== 'pending') {
      throw {
        message: 'Payment has already been completed for this order',
        status: 400,
      };
    }

    const enrichedItems = await ProductService.getEnrichedItems(
      order.items as unknown as OrderItem[],
    );

    return await PaymentService.getCheckoutLink({
      items: enrichedItems as unknown as CartItemWithProduct[],
      domain: shop.domain,
      trackingId,
    });
  }

  static async adminOrderUpdate(
    domain: Shop['domain'],
    trackingId: string,
    data: z.infer<typeof updateOrderSchema>,
  ) {
    const order = await findUnique({
      tracking_id: trackingId,
    });

    if (!order) {
      throw {
        message: 'Order not found',
        status: 404,
      };
    }

    await this.verifyOrderOwnership(domain, order);

    const { status, admin_notes } = updateOrderSchema.parse(data);

    const updateData: Prisma.OrderUpdateInput = {};

    if (status && status !== order.status) {
      updateData.status = status;
      Object.assign(updateData, this.timestampsForStatus(status));
    }

    if (admin_notes !== undefined) {
      updateData.admin_notes = order.admin_notes
        ? `${order.admin_notes}\n${admin_notes}`
        : admin_notes;
    }

    if (Object.keys(updateData).length === 0) {
      throw {
        message: 'No valid fields provided for update',
        status: 400,
      };
    }

    await update(order.id, updateData);

    return await this.getOrderByTrackingId(domain, trackingId);
  }

  static async cancelOrder(
    domain: Shop['domain'],
    trackingId: string,
    data: { reason?: string },
  ) {
    const order = await findUnique({
      tracking_id: trackingId,
    });

    if (!order) {
      throw {
        message: 'Order not found',
        status: 404,
      };
    }

    const { isShopOwner } = await this.verifyOrderOwnership(domain, order);

    if (order.status !== 'pending') {
      throw {
        message: 'Order cannot be cancelled in current status',
        status: 400,
      };
    }

    const reason =
      data.reason || `Cancelled by ${isShopOwner ? 'shop owner' : 'customer'}`;

    const cancelledOrder = await update(order.id, {
      status: 'cancelled',
      cancelled_at: new Date(),
      admin_notes: order.admin_notes
        ? `${order.admin_notes}\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`,
    });

    return cancelledOrder;
  }
}

export default OrderService;
