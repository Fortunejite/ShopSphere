import { database } from '@/lib/db';
import { ProductAttributes } from './Product';
import { CartItemWithProduct } from './Cart';

export interface OrderItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
  unit_price_at_purchase: number;
  discount_at_purchase: number;
  subtotal: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product: ProductAttributes;
}

export interface AddressInfo {
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderAttributes {
  id: number;
  user_id: number;
  shop_id: number;
  tracking_id: string;
  
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  final_amount: number;
  
  items: OrderItem[];
  
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  
  shipping_address?: AddressInfo;
  billing_address?: AddressInfo;
  
  notes?: string;
  admin_notes?: string;
  
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  
  created_at: Date;
  updated_at: Date;
}

export interface OrderWithProducts extends Omit<OrderAttributes, 'items'> {
  items: OrderItemWithProduct[];
  total_items: number;
}

export interface CreateOrderData {
  user_id: number;
  shop_id: number;
  items: CartItemWithProduct[];
  shipping_address: AddressInfo;
  billing_address?: AddressInfo;
  payment_method?: string;
  notes?: string;
  tax_rate?: number;
  shipping_cost?: number;
  discount_amount?: number;
}

export class Order {
  static tableName = 'orders';
  static productsTableName = 'products';
  static usersTableName = 'users';
  static shopsTableName = 'shops';

  /**
   * Generate unique tracking ID
   */
  static generateTrackingId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Create a new order from cart items
   */
  static async create(orderData: CreateOrderData): Promise<OrderAttributes> {
    const {
      user_id,
      shop_id,
      items,
      shipping_address,
      billing_address,
      payment_method,
      notes,
      tax_rate = 0,
      shipping_cost = 0,
      discount_amount = 0,
    } = orderData;

    // Calculate totals
    const total_amount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax_amount = total_amount * (tax_rate / 100);
    const final_amount = total_amount + tax_amount + shipping_cost - discount_amount;

    // Convert cart items to order items
    const orderItems: OrderItem[] = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      variant_index: item.variant_index,
      unit_price_at_purchase: item.variant_price || item.product.price,
      discount_at_purchase: item.variant_index !== undefined && item.product.variants?.[item.variant_index]
        ? item.product.variants[item.variant_index].discount || 0
        : item.product.discount || 0,
      subtotal: item.subtotal,
    }));

    const tracking_id = Order.generateTrackingId();

    const query = `
      INSERT INTO ${Order.tableName} (
        user_id, shop_id, tracking_id, total_amount, discount_amount, tax_amount, 
        shipping_amount, final_amount, items, status, payment_status, payment_method,
        shipping_address, billing_address, notes, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      user_id,
      shop_id,
      tracking_id,
      total_amount,
      discount_amount,
      tax_amount,
      shipping_cost,
      final_amount,
      JSON.stringify(orderItems),
      'pending',
      'pending',
      payment_method,
      JSON.stringify(shipping_address),
      billing_address ? JSON.stringify(billing_address) : null,
      notes,
    ];

    const result = await database.query(query, values);
    return result.rows[0];
  }

  /**
   * Find order by ID
   */
  static async findById(id: number): Promise<OrderAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Order.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find order by tracking ID
   */
  static async findByTrackingId(trackingId: string): Promise<OrderAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Order.tableName} WHERE tracking_id = $1`,
      [trackingId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find order by ID with product details
   */
  static async findByIdWithProducts(id: number): Promise<OrderWithProducts | null> {
    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', (item->>'product_id')::integer,
              'quantity', (item->>'quantity')::integer,
              'variant_index', CASE 
                WHEN item->>'variant_index' IS NOT NULL 
                THEN (item->>'variant_index')::integer 
                ELSE NULL 
              END,
              'unit_price_at_purchase', (item->>'unit_price_at_purchase')::decimal,
              'discount_at_purchase', (item->>'discount_at_purchase')::decimal,
              'subtotal', (item->>'subtotal')::decimal,
              'product', row_to_json(p.*)
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Order.tableName} o
      LEFT JOIN jsonb_array_elements(o.items) as item ON true
      LEFT JOIN ${Order.productsTableName} p ON p.id = (item->>'product_id')::integer
      WHERE o.id = $1
      GROUP BY o.id
    `;

    const result = await database.query(query, [id]);
    
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: OrderItemWithProduct) => sum + item.quantity, 0) || 0,
    };
  }

  /**
   * Find order by tracking ID with product details
   */
  static async findByTrackingIdWithProducts(trackingId: string): Promise<OrderWithProducts | null> {
    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', (item->>'product_id')::integer,
              'quantity', (item->>'quantity')::integer,
              'variant_index', CASE 
                WHEN item->>'variant_index' IS NOT NULL 
                THEN (item->>'variant_index')::integer 
                ELSE NULL 
              END,
              'unit_price_at_purchase', (item->>'unit_price_at_purchase')::decimal,
              'discount_at_purchase', (item->>'discount_at_purchase')::decimal,
              'subtotal', (item->>'subtotal')::decimal,
              'product', row_to_json(p.*)
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Order.tableName} o
      LEFT JOIN jsonb_array_elements(o.items) as item ON true
      LEFT JOIN ${Order.productsTableName} p ON p.id = (item->>'product_id')::integer
      WHERE o.tracking_id = $1
      GROUP BY o.id
    `;

    const result = await database.query(query, [trackingId]);
    
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: OrderItemWithProduct) => sum + item.quantity, 0) || 0,
    };
  }

  /**
   * Find orders by user ID with product details
   */
  static async findByUserId(
    userId: number,
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<OrderWithProducts[]> {
    let whereClause = 'WHERE o.user_id = $1';
    const values: (string | number)[] = [userId];

    if (status) {
      whereClause += ` AND o.status = $${values.length + 1}`;
      values.push(status);
    }

    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', (item->>'product_id')::integer,
              'quantity', (item->>'quantity')::integer,
              'variant_index', CASE 
                WHEN item->>'variant_index' IS NOT NULL 
                THEN (item->>'variant_index')::integer 
                ELSE NULL 
              END,
              'unit_price_at_purchase', (item->>'unit_price_at_purchase')::decimal,
              'discount_at_purchase', (item->>'discount_at_purchase')::decimal,
              'subtotal', (item->>'subtotal')::decimal,
              'product', row_to_json(p.*)
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Order.tableName} o
      LEFT JOIN jsonb_array_elements(o.items) as item ON true
      LEFT JOIN ${Order.productsTableName} p ON p.id = (item->>'product_id')::integer
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);
    const result = await database.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: OrderItemWithProduct) => sum + item.quantity, 0) || 0,
    }));
  }

  /**
   * Find orders by shop ID with product details
   */
  static async findByShopId(
    shopId: number,
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<OrderWithProducts[]> {
    let whereClause = 'WHERE o.shop_id = $1';
    const values: (string | number)[] = [shopId];

    if (status) {
      whereClause += ` AND o.status = $${values.length + 1}`;
      values.push(status);
    }

    const query = `
      SELECT 
        o.*,
        u.email as user_email,
        u.username as user_name,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', (item->>'product_id')::integer,
              'quantity', (item->>'quantity')::integer,
              'variant_index', CASE 
                WHEN item->>'variant_index' IS NOT NULL 
                THEN (item->>'variant_index')::integer 
                ELSE NULL 
              END,
              'unit_price_at_purchase', (item->>'unit_price_at_purchase')::decimal,
              'discount_at_purchase', (item->>'discount_at_purchase')::decimal,
              'subtotal', (item->>'subtotal')::decimal,
              'product', row_to_json(p.*)
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Order.tableName} o
      JOIN ${Order.usersTableName} u ON o.user_id = u.id
      LEFT JOIN jsonb_array_elements(o.items) as item ON true
      LEFT JOIN ${Order.productsTableName} p ON p.id = (item->>'product_id')::integer
      ${whereClause}
      GROUP BY o.id, u.email, u.username
      ORDER BY o.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);
    const result = await database.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: OrderItemWithProduct) => sum + item.quantity, 0) || 0,
    }));
  }

  /**
   * Find orders by user ID and shop ID with product details
   */
  static async findByUserIdAndShopId(
    userId: number,
    shopId: number,
    limit: number = 10,
    offset: number = 0,
    status?: string
  ): Promise<OrderWithProducts[]> {
    let whereClause = 'WHERE o.user_id = $1 AND o.shop_id = $2';
    const values: (string | number)[] = [userId, shopId];

    if (status) {
      whereClause += ` AND o.status = $${values.length + 1}`;
      values.push(status);
    }

    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', (item->>'product_id')::integer,
              'quantity', (item->>'quantity')::integer,
              'variant_index', CASE 
                WHEN item->>'variant_index' IS NOT NULL 
                THEN (item->>'variant_index')::integer 
                ELSE NULL 
              END,
              'unit_price_at_purchase', (item->>'unit_price_at_purchase')::decimal,
              'discount_at_purchase', (item->>'discount_at_purchase')::decimal,
              'subtotal', (item->>'subtotal')::decimal,
              'product', row_to_json(p.*)
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Order.tableName} o
      LEFT JOIN jsonb_array_elements(o.items) as item ON true
      LEFT JOIN ${Order.productsTableName} p ON p.id = (item->>'product_id')::integer
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);
    const result = await database.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: OrderItemWithProduct) => sum + item.quantity, 0) || 0,
    }));
  }

  /**
   * Update order status
   */
  static async updateStatus(
    id: number, 
    status: OrderAttributes['status'],
    adminNotes?: string
  ): Promise<OrderAttributes | null> {
    const updates: string[] = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const values: (number | string)[] = [id, status];

    // Set timestamps based on status
    if (status === 'shipped') {
      updates.push('shipped_at = CURRENT_TIMESTAMP');
    } else if (status === 'delivered') {
      updates.push('delivered_at = CURRENT_TIMESTAMP');
    } else if (status === 'cancelled') {
      updates.push('cancelled_at = CURRENT_TIMESTAMP');
    }

    if (adminNotes) {
      updates.push(`admin_notes = $${values.length + 1}`);
      values.push(adminNotes);
    }

    const query = `
      UPDATE ${Order.tableName} 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await database.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    id: number,
    paymentStatus: OrderAttributes['payment_status'],
    paymentMethod?: string
  ): Promise<OrderAttributes | null> {
    const updates: string[] = ['payment_status = $2', 'updated_at = CURRENT_TIMESTAMP'];
    const values: (number | string)[] = [id, paymentStatus];

    if (paymentMethod) {
      updates.push(`payment_method = $${values.length + 1}`);
      values.push(paymentMethod);
    }

    // If payment is successful, also update order status to confirmed
    if (paymentStatus === 'paid') {
      updates.push('status = $' + (values.length + 1));
      values.push('confirmed');
    }

    const query = `
      UPDATE ${Order.tableName} 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await database.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(id: number, reason?: string): Promise<OrderAttributes | null> {
    const updates = ['status = $2', 'cancelled_at = CURRENT_TIMESTAMP', 'updated_at = CURRENT_TIMESTAMP'];
    const values: (number | string)[] = [id, 'cancelled'];

    if (reason) {
      updates.push(`admin_notes = COALESCE(admin_notes, '') || $${values.length + 1}`);
      values.push(`\nCancellation reason: ${reason}`);
    }

    const query = `
      UPDATE ${Order.tableName} 
      SET ${updates.join(', ')}
      WHERE id = $1 AND status IN ('pending', 'confirmed', 'processing')
      RETURNING *
    `;

    const result = await database.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Count orders by user ID
   */
  static async countByUserId(userId: number, status?: string): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${Order.tableName} WHERE user_id = $1`;
    const values: (number | string)[] = [userId];

    if (status) {
      query += ` AND status = $${values.length + 1}`;
      values.push(status);
    }

    const result = await database.query(query, values);
    return parseInt(result.rows[0].count);
  }

  /**
   * Count orders by shop ID
   */
  static async countByShopId(shopId: number, status?: string): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${Order.tableName} WHERE shop_id = $1`;
    const values: (number | string)[] = [shopId];

    if (status) {
      query += ` AND status = $${values.length + 1}`;
      values.push(status);
    }

    const result = await database.query(query, values);
    return parseInt(result.rows[0].count);
  }

  /**
   * Count orders by user ID and shop ID
   */
  static async countByUserIdAndShopId(userId: number, shopId: number, status?: string): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${Order.tableName} WHERE user_id = $1 AND shop_id = $2`;
    const values: (number | string)[] = [userId, shopId];

    if (status) {
      query += ` AND status = $${values.length + 1}`;
      values.push(status);
    }

    const result = await database.query(query, values);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get order statistics for a shop
   */
  static async getShopStats(shopId: number, days: number = 30): Promise<{
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status IN ('delivered', 'completed') THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM ${Order.tableName}
      WHERE shop_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
    `;

    const result = await database.query(query, [shopId]);
    const row = result.rows[0];
    
    return {
      total_orders: parseInt(row.total_orders),
      total_revenue: parseFloat(row.total_revenue),
      pending_orders: parseInt(row.pending_orders),
      completed_orders: parseInt(row.completed_orders),
      cancelled_orders: parseInt(row.cancelled_orders),
    };
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(shopId?: number, limit: number = 10): Promise<OrderWithProducts[]> {
    let whereClause = '';
    const values: (number | string)[] = [];

    if (shopId) {
      whereClause = 'WHERE o.shop_id = $1';
      values.push(shopId);
    }

    const query = `
      SELECT 
        o.*,
        u.email as user_email,
        u.username as user_name,
        s.name as shop_name,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', (item->>'product_id')::integer,
              'quantity', (item->>'quantity')::integer,
              'variant_index', CASE 
                WHEN item->>'variant_index' IS NOT NULL 
                THEN (item->>'variant_index')::integer 
                ELSE NULL 
              END,
              'unit_price_at_purchase', (item->>'unit_price_at_purchase')::decimal,
              'discount_at_purchase', (item->>'discount_at_purchase')::decimal,
              'subtotal', (item->>'subtotal')::decimal,
              'product', row_to_json(p.*)
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Order.tableName} o
      JOIN ${Order.usersTableName} u ON o.user_id = u.id
      JOIN ${Order.shopsTableName} s ON o.shop_id = s.id
      LEFT JOIN jsonb_array_elements(o.items) as item ON true
      LEFT JOIN ${Order.productsTableName} p ON p.id = (item->>'product_id')::integer
      ${whereClause}
      GROUP BY o.id, u.email, u.username, s.name
      ORDER BY o.created_at DESC
      LIMIT $${values.length + 1}
    `;

    values.push(limit);
    const result = await database.query(query, values);
    
    return result.rows.map(row => ({
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: OrderItemWithProduct) => sum + item.quantity, 0) || 0,
    }));
  }

  /**
   * Delete order by ID
   */
  static async delete(id: number): Promise<void> {
    const query = `DELETE FROM ${Order.tableName} WHERE id = $1`;
    await database.query(query, [id]);
  }
}
