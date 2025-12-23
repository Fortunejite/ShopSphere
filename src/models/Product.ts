/* eslint-disable @typescript-eslint/no-explicit-any */
import { database } from "@/lib/db";

export interface ProductVariant {
  attributes: Record<string, string>;
  is_default: boolean;
}

export interface ProductAttributes {
  id: number;
  shop_id: number;
  category_ids: number[];

  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;

  variants: ProductVariant[];

  image: string;
  thumbnails: string[];

  is_featured: boolean;

  weight: number;
  length: number;
  width: number;
  height: number;

  stock_quantity: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  sales_count: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductWithDetails extends ProductAttributes {
  shop_name: string;
  shop_domain: string;
  category_names: string[];
}

export class Product {
  static tableName = 'products';
  static shopsTableName = 'shops';
  static categoriesTableName = 'categories';

  /**
   * Create a new product
   */
  static async create(productData: Omit<ProductAttributes, 'id' | 'created_at' | 'updated_at'>): Promise<ProductAttributes> {
    const product = {
      ...productData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const query = `
      INSERT INTO ${Product.tableName} (
        shop_id, category_ids, name, slug, description, price, discount,
        variants, image, thumbnails, is_featured, weight, length, width, height,
        stock_quantity, status, sales_count, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const values = [
      product.shop_id,
      product.category_ids,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.discount,
      JSON.stringify(product.variants),
      product.image,
      product.thumbnails,
      product.is_featured,
      product.weight,
      product.length,
      product.width,
      product.height,
      product.stock_quantity,
      product.status,
      product.sales_count,
      product.created_at,
      product.updated_at,
    ];

    const result = await database.query(query, values);
    return result.rows[0];
  }

  /**
   * Find product by ID
   */
  static async findById(id: number): Promise<ProductAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Product.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find product by ID with shop and category details
   */
  static async findByIdWithDetails(id: number): Promise<ProductWithDetails | null> {
    const query = `
      SELECT 
        p.*,
        s.name AS shop_name,
        s.domain AS shop_domain,
        COALESCE(
          ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL), 
          '{}'::text[]
        ) AS category_names
      FROM ${Product.tableName} p
      JOIN ${Product.shopsTableName} s ON p.shop_id = s.id
      LEFT JOIN ${Product.categoriesTableName} c ON c.id = ANY(p.category_ids)
      WHERE p.id = $1
      GROUP BY p.id, s.name, s.domain
    `;

    const result = await database.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find product by shop ID and slug
   */
  static async findByShopAndSlug(shop_id: number, slug: string): Promise<ProductAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Product.tableName} WHERE shop_id = $1 AND slug = $2`,
      [shop_id, slug]
    );
    return result.rows[0] || null;
  }

  /**
   * Find products by shop ID
   */
  static async findByShopId(
    shop_id: number, 
    limit: number = 10, 
    offset: number = 0,
    status?: string
  ): Promise<ProductAttributes[]> {
    let query = `
      SELECT * FROM ${Product.tableName} 
      WHERE shop_id = $1
    `;
    const values: any[] = [shop_id];

    if (status) {
      query += ` AND status = $${values.length + 1}`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await database.query(query, values);
    return result.rows;
  }

  /**
   * Find products by category IDs
   */
  static async findByCategoryIds(
    category_ids: number[], 
    limit: number = 10, 
    offset: number = 0
  ): Promise<ProductAttributes[]> {
    const query = `
      SELECT * FROM ${Product.tableName} 
      WHERE category_ids && $1 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const result = await database.query(query, [category_ids, limit, offset]);
    return result.rows;
  }

  /**
   * Find featured products
   */
  static async findFeatured(limit: number = 10, offset: number = 0): Promise<ProductWithDetails[]> {
    const query = `
      SELECT 
        p.*,
        s.name AS shop_name,
        s.domain AS shop_domain,
        COALESCE(
          ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL), 
          '{}'::text[]
        ) AS category_names
      FROM ${Product.tableName} p
      JOIN ${Product.shopsTableName} s ON p.shop_id = s.id
      LEFT JOIN ${Product.categoriesTableName} c ON c.id = ANY(p.category_ids)
      WHERE p.is_featured = true AND p.status = 'active'
      GROUP BY p.id, s.name, s.domain
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await database.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Search products by name or description
   */
  static async search(
    searchTerm: string,
    limit: number = 10,
    offset: number = 0,
    shop_id?: number
  ): Promise<ProductWithDetails[]> {
    let query = `
      SELECT 
        p.*,
        s.name AS shop_name,
        s.domain AS shop_domain,
        COALESCE(
          ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL), 
          '{}'::text[]
        ) AS category_names
      FROM ${Product.tableName} p
      JOIN ${Product.shopsTableName} s ON p.shop_id = s.id
      LEFT JOIN ${Product.categoriesTableName} c ON c.id = ANY(p.category_ids)
      WHERE p.status = 'active' 
        AND (p.name ILIKE $1 OR p.description ILIKE $1)
    `;

    const values: any[] = [`%${searchTerm}%`];

    if (shop_id) {
      query += ` AND p.shop_id = $${values.length + 1}`;
      values.push(shop_id);
    }

    query += `
      GROUP BY p.id, s.name, s.domain
      ORDER BY p.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);

    const result = await database.query(query, values);
    return result.rows;
  }

  /**
   * Update product
   */
  static async update(id: number, productData: Partial<ProductAttributes>): Promise<ProductAttributes | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(productData)) {
      if (value !== undefined && key !== 'id') {
        if (key === 'variants') {
          fields.push(`${key} = $${paramCount + 1}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount + 1}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE ${Product.tableName}
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await database.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Update stock quantity
   */
  static async updateStock(id: number, quantity: number): Promise<ProductAttributes | null> {
    const query = `
      UPDATE ${Product.tableName}
      SET stock_quantity = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await database.query(query, [id, quantity]);
    return result.rows[0] || null;
  }

  /**
   * Increment sales count
   */
  static async incrementSales(id: number, count: number = 1): Promise<ProductAttributes | null> {
    const query = `
      UPDATE ${Product.tableName}
      SET sales_count = sales_count + $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await database.query(query, [id, count]);
    return result.rows[0] || null;
  }

  /**
   * Delete product
   */
  static async delete(id: number): Promise<boolean> {
    const result = await database.query(
      `DELETE FROM ${Product.tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Check if product exists by shop and slug
   */
  static async existsByShopAndSlug(shop_id: number, slug: string): Promise<boolean> {
    const result = await database.query(
      `SELECT EXISTS(SELECT 1 FROM ${Product.tableName} WHERE shop_id = $1 AND slug = $2)`,
      [shop_id, slug]
    );
    return result.rows[0].exists;
  }

  /**
   * Get all products with pagination
   */
  static async findAll(limit: number = 10, offset: number = 0): Promise<ProductWithDetails[]> {
    const query = `
      SELECT 
        p.*,
        s.name AS shop_name,
        s.domain AS shop_domain,
        COALESCE(
          ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL), 
          '{}'::text[]
        ) AS category_names
      FROM ${Product.tableName} p
      JOIN ${Product.shopsTableName} s ON p.shop_id = s.id
      LEFT JOIN ${Product.categoriesTableName} c ON c.id = ANY(p.category_ids)
      GROUP BY p.id, s.name, s.domain
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await database.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Count total products
   */
  static async count(shop_id?: number): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${Product.tableName}`;
    const values: any[] = [];

    if (shop_id) {
      query += ' WHERE shop_id = $1';
      values.push(shop_id);
    }

    const result = await database.query(query, values);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get products with low stock
   */
  static async findLowStock(threshold: number = 5, shop_id?: number): Promise<ProductAttributes[]> {
    let query = `
      SELECT * FROM ${Product.tableName} 
      WHERE stock_quantity <= $1 AND status = 'active'
    `;
    const values: any[] = [threshold];

    if (shop_id) {
      query += ` AND shop_id = $${values.length + 1}`;
      values.push(shop_id);
    }

    query += ' ORDER BY stock_quantity ASC';

    const result = await database.query(query, values);
    return result.rows;
  }

  /**
   * Get best selling products
   */
  static async findBestSelling(limit: number = 10, shop_id?: number): Promise<ProductWithDetails[]> {
    let query = `
      SELECT 
        p.*,
        s.name AS shop_name,
        s.domain AS shop_domain,
        COALESCE(
          ARRAY_AGG(c.name) FILTER (WHERE c.name IS NOT NULL), 
          '{}'::text[]
        ) AS category_names
      FROM ${Product.tableName} p
      JOIN ${Product.shopsTableName} s ON p.shop_id = s.id
      LEFT JOIN ${Product.categoriesTableName} c ON c.id = ANY(p.category_ids)
      WHERE p.status = 'active'
    `;

    const values: any[] = [];

    if (shop_id) {
      query += ` AND p.shop_id = $${values.length + 1}`;
      values.push(shop_id);
    }

    query += `
      GROUP BY p.id, s.name, s.domain
      ORDER BY p.sales_count DESC
      LIMIT $${values.length + 1}
    `;

    values.push(limit);

    const result = await database.query(query, values);
    return result.rows;
  }
}