import { database } from '@/lib/db';
import { ProductAttributes } from './Product';

export interface CartItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
}

export interface CartAttributes {
  id: number;
  user_id: number;
  shop_id: number;
  items: CartItem[];
  created_at: Date;
  updated_at: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: ProductAttributes;
  subtotal: number;
}

export interface CartWithProducts extends Omit<CartAttributes, 'items'> {
  items: CartItemWithProduct[];
  total_items: number;
  total_amount?: number;
}

export class Cart {
  static tableName = 'carts';
  static productTableName = 'products';

  /**
   * Find cart by ID
   */
  static async findById(id: number): Promise<CartAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Cart.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find cart by user ID with products
   */
  static async findByUserId(userId: number): Promise<CartWithProducts[]> {
    const query = `
      SELECT 
        c.*,
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
              'product', row_to_json(p.*),
              'variant_price', CASE 
                WHEN item->>'variant_index' IS NOT NULL AND p.variants IS NOT NULL
                THEN (p.variants->(item->>'variant_index')::integer->>'price')::decimal
                ELSE p.price
              END,
              'subtotal', p.price * 
                  (1 - COALESCE(p.discount, 0) / 100) * 
                  (item->>'quantity')::integer
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Cart.tableName} c
      LEFT JOIN jsonb_array_elements(c.items) as item ON true
      LEFT JOIN ${Cart.productTableName} p ON p.id = (item->>'product_id')::integer
      WHERE c.user_id = $1
      GROUP BY c.id, c.user_id, c.shop_id, c.items, c.created_at, c.updated_at
      ORDER BY c.updated_at DESC
    `;

    const result = await database.query(query, [userId]);
    
    return result.rows.map(row => ({
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0) || 0,
    }));
  }

  /**
   * Find cart by shop ID and user ID with products
   */
  static async findByShopAndUserId(shopId: number, userId: number): Promise<CartWithProducts | null> {
    const query = `
      SELECT 
        c.*,
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
              'product', row_to_json(p.*),
              'variant_price', CASE 
                WHEN item->>'variant_index' IS NOT NULL AND p.variants IS NOT NULL
                THEN (p.variants->(item->>'variant_index')::integer->>'price')::decimal
                ELSE p.price
              END,
              'subtotal', p.price * 
                (1 - COALESCE(p.discount, 0) / 100) * 
                (item->>'quantity')::integer
            )
          ) FILTER (WHERE item IS NOT NULL),
          '[]'::json
        ) as enriched_items
      FROM ${Cart.tableName} c
      LEFT JOIN jsonb_array_elements(c.items) as item ON true
      LEFT JOIN ${Cart.productTableName} p ON p.id = (item->>'product_id')::integer
      WHERE c.shop_id = $1 AND c.user_id = $2
      GROUP BY c.id, c.user_id, c.shop_id, c.items, c.created_at, c.updated_at
    `;

    const result = await database.query(query, [shopId, userId]);
    
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return {
      ...row,
      items: row.enriched_items || [],
      total_items: row.enriched_items?.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0) || 0,
      total_amount: row.enriched_items?.reduce((sum: number, item: CartItemWithProduct) => sum + item.subtotal, 0) || 0,
    };
  }

  /**
   * Add item to cart
   */
  static async addItem(user_id: number, shop_id: number, item: CartItem): Promise<CartAttributes> {
    const existingCart = await database.query(
      `SELECT * FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
      [user_id, shop_id]
    );

    if (existingCart.rows.length > 0) {
      // Update existing cart - merge quantities if same product and variant
      const cart = existingCart.rows[0];
      const items = cart.items || [];
      
      const existingItemIndex = items.findIndex((cartItem: CartItem) => 
        cartItem.product_id === item.product_id && 
        cartItem.variant_index === item.variant_index
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        updatedItems = [...items, item];
      }
      
      const updateResult = await database.query(
        `UPDATE ${Cart.tableName} 
         SET items = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 RETURNING *`,
        [JSON.stringify(updatedItems), cart.id]
      );
      return updateResult.rows[0];
    } else {
      // Create new cart
      const insertResult = await database.query(
        `INSERT INTO ${Cart.tableName} (user_id, shop_id, items, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        [user_id, shop_id, JSON.stringify([item])]
      );
      return insertResult.rows[0];
    }
  }

  /**
   * Update item quantity in cart
   */
  static async updateItemQuantity(
    user_id: number, 
    shop_id: number, 
    product_id: number, 
    quantity: number,
    variant_index?: number
  ): Promise<CartAttributes | null> {
    const existingCart = await database.query(
      `SELECT * FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
      [user_id, shop_id]
    );

    if (existingCart.rows.length === 0) {
      return null;
    }

    const cart = existingCart.rows[0];
    const items = cart.items || [];
    
    const updatedItems = items.map((item: CartItem) => {
      if (item.product_id === product_id && item.variant_index === variant_index) {
        return { ...item, quantity: Math.max(0, quantity) };
      }
      return item;
    }).filter((item: CartItem) => item.quantity > 0); // Remove items with 0 quantity

    const updateResult = await database.query(
      `UPDATE ${Cart.tableName} 
       SET items = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(updatedItems), cart.id]
    );
    return updateResult.rows[0];
  }

  /**
   * Remove item from cart
   */
  static async removeItem(
    user_id: number, 
    shop_id: number, 
    product_id: number, 
    variant_index?: number
  ): Promise<CartAttributes | null> {
    const existingCart = await database.query(
      `SELECT * FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
      [user_id, shop_id]
    );

    if (existingCart.rows.length === 0) {
      return null;
    }

    const cart = existingCart.rows[0];
    const items = cart.items || [];
    const updatedItems = items.filter((item: CartItem) => 
      !(item.product_id === product_id && item.variant_index === variant_index)
    );

    const updateResult = await database.query(
      `UPDATE ${Cart.tableName} 
       SET items = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(updatedItems), cart.id]
    );
    return updateResult.rows[0];
  }

  /**
   * Clear all items from cart
   */
  static async clearCart(user_id: number, shop_id: number): Promise<CartAttributes | null> {
    const updateResult = await database.query(
      `UPDATE ${Cart.tableName} 
       SET items = '[]'::jsonb, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND shop_id = $2 RETURNING *`,
      [user_id, shop_id]
    );
    return updateResult.rows[0] || null;
  }

  /**
   * Delete cart entirely
   */
  static async deleteCart(user_id: number, shop_id: number): Promise<boolean> {
    const result = await database.query(
      `DELETE FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
      [user_id, shop_id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Get cart item count
   */
  static async getItemCount(user_id: number, shop_id: number): Promise<number> {
    const result = await database.query(
      `SELECT 
        COALESCE(
          (SELECT SUM((item->>'quantity')::integer) 
           FROM jsonb_array_elements(items) as item), 
          0
        ) as total_items
       FROM ${Cart.tableName} 
       WHERE user_id = $1 AND shop_id = $2`,
      [user_id, shop_id]
    );
    return parseInt(result.rows[0]?.total_items || '0');
  }

  /**
   * Get cart total amount
   */
  static async getCartTotal(user_id: number, shop_id: number): Promise<number> {
    const query = `
      SELECT 
        COALESCE(
          SUM(p.price * 
            (1 - COALESCE(p.discount, 0) / 100) * 
            (item->>'quantity')::integer
          )), 
          0
        ) as total_amount
      FROM ${Cart.tableName} c
      LEFT JOIN jsonb_array_elements(c.items) as item ON true
      LEFT JOIN ${Cart.productTableName} p ON p.id = (item->>'product_id')::integer
      WHERE c.user_id = $1 AND c.shop_id = $2
    `;

    const result = await database.query(query, [user_id, shop_id]);
    return parseFloat(result.rows[0]?.total_amount || '0');
  }

  /**
   * Validate cart items (check stock, prices, etc.)
   */
  static async validateCart(user_id: number, shop_id: number): Promise<{
    valid: boolean;
    errors: string[];
    updated_items: CartItem[];
  }> {
    const cart = await Cart.findByShopAndUserId(shop_id, user_id);
    
    if (!cart) {
      return { valid: true, errors: [], updated_items: [] };
    }

    const errors: string[] = [];
    const updated_items: CartItem[] = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      if (!product) {
        errors.push(`Product with ID ${cartItem.product_id} no longer exists`);
        continue;
      }

      if (product.status !== 'active') {
        errors.push(`Product "${product.name}" is no longer available`);
        continue;
      }

      const availableStock = product.stock_quantity;

      // Check stock availability
      if (availableStock < cartItem.quantity) {
        errors.push(`Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${cartItem.quantity}`);
        // Update to available quantity
        updated_items.push({
          ...cartItem,
          quantity: availableStock
        });
      } else {
        updated_items.push(cartItem);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      updated_items: updated_items.filter(item => item.quantity > 0)
    };
  }

  /**
   * Merge carts - can merge from source cart data or between user carts
   */
  static async mergeCarts(
    target_user_id: number, 
    shop_id: number,
    source_items?: CartItem[], // Items from local storage or another cart
    source_user_id?: number   // For merging between authenticated users
  ): Promise<CartAttributes | null> {
    let sourceItems: CartItem[] = [];

    // If source_items provided (from local storage), use those
    if (source_items) {
      sourceItems = source_items;
    } 
    // Otherwise, get items from source user's cart
    else if (source_user_id) {
      const sourceCart = await database.query(
        `SELECT * FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
        [source_user_id, shop_id]
      );

      if (sourceCart.rows.length > 0) {
        sourceItems = sourceCart.rows[0].items || [];
      }
    }

    // If no source items, nothing to merge
    if (sourceItems.length === 0) {
      const targetCart = await database.query(
        `SELECT * FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
        [target_user_id, shop_id]
      );
      return targetCart.rows[0] || null;
    }

    // Get or create target cart
    const targetCart = await database.query(
      `SELECT * FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
      [target_user_id, shop_id]
    );

    let targetItems: CartItem[] = [];
    let cartId: number;

    if (targetCart.rows.length === 0) {
      // Create new cart for target user
      const insertResult = await database.query(
        `INSERT INTO ${Cart.tableName} (user_id, shop_id, items, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        [target_user_id, shop_id, JSON.stringify(sourceItems)]
      );
      return insertResult.rows[0];
    } else {
      // Merge with existing cart
      targetItems = targetCart.rows[0].items || [];
      cartId = targetCart.rows[0].id;
    }

    // Merge items - combine quantities for same product/variant
    const mergedItems = [...targetItems];

    for (const sourceItem of sourceItems) {
      const existingIndex = mergedItems.findIndex((item: CartItem) => 
        item.product_id === sourceItem.product_id && 
        item.variant_index === sourceItem.variant_index
      );

      if (existingIndex >= 0) {
        mergedItems[existingIndex].quantity += sourceItem.quantity;
      } else {
        mergedItems.push(sourceItem);
      }
    }

    // Update target cart
    const updateResult = await database.query(
      `UPDATE ${Cart.tableName} 
       SET items = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(mergedItems), cartId]
    );

    // If merging from another user's cart, delete source cart
    if (source_user_id) {
      await database.query(
        `DELETE FROM ${Cart.tableName} WHERE user_id = $1 AND shop_id = $2`,
        [source_user_id, shop_id]
      );
    }

    return updateResult.rows[0];
  }
}