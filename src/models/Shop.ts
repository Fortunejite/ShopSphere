import { database } from '@/lib/db';

export interface ShopAttributes {
  id: number;
  owner_id: number;
  name: string;
  domain: string;
  category_id: number;
  tagline?: string;
  description?: string;
  status: 'active' | 'inactive' | 'suspended';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  free_shipping_threshold?: number;
  currency: string;
  logo?: string;
  banner?: string;
  stripe_account_id: string;
  stripe_account_connected?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShopWithOwner extends ShopAttributes {
  owner_email: string;
  owner_username: string;
  category: string;
}

export class Shop {
  static tableName = 'shops';
  static usersTableName = 'users';
  static categoriesTableName = 'categories';

  /**
   * Create a new shop
   */
  static async create(shopData: ShopAttributes): Promise<ShopAttributes> {
    const shop = {
      ...shopData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const query = `
      INSERT INTO ${Shop.tableName} (
        owner_id, name, domain, category_id, tagline, description, currency, 
        email, phone, address, city, state, postal_code, country, free_shipping_threshold,
        logo, banner, stripe_account_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const values = [
      shop.owner_id,
      shop.name,
      shop.domain,
      shop.category_id,
      shop.tagline,
      shop.description,
      shop.currency,
      shop.email,
      shop.phone,
      shop.address,
      shop.city,
      shop.state,
      shop.postal_code,
      shop.country,
      shop.free_shipping_threshold,
      shop.logo,
      shop.banner,
      shop.stripe_account_id,
      shop.created_at,
      shop.updated_at,
    ];

    const result = await database.query(query, values);
    return result.rows[0];
  }

  /**
   * Find shop by ID
   */
  static async findById(id: number): Promise<ShopWithOwner | null> {
    const result = await database.query(
      `SELECT
      s.*,
      u.id AS owner_id,
      u.email AS owner_email,
      u.username AS owner_username,
      c.id AS category_id,
      c.name AS category
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
      JOIN ${Shop.categoriesTableName} c ON s.category_id = c.id
      WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find shop by Domain
   */
  static async findByDomain(domain: string): Promise<ShopWithOwner | null> {
    const result = await database.query(
      `SELECT
      s.*,
      u.id AS owner_id,
      u.email AS owner_email,
      u.username AS owner_username,
      c.id AS category_id,
      c.name AS category
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
      JOIN ${Shop.categoriesTableName} c ON s.category_id = c.id
      WHERE s.domain = $1`,
      [domain]
    );
    return result.rows[0] || null;
  }

  /**
   * Find shop by Stripe account ID
   */
  static async findByStripeAccountId(stripeAccountId: string): Promise<ShopAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Shop.tableName}
      WHERE stripe_account_id = $1`,
      [stripeAccountId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find shop by owner ID
   */
  static async findByOwnerId(owner_id: number): Promise<ShopWithOwner[] | null> {
    const result = await database.query(
      `SELECT
      s.*,
      u.id AS owner_id,
      u.email AS owner_email,
      u.username AS owner_username,
      c.id AS category_id,
      c.name AS category
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
      JOIN ${Shop.categoriesTableName} c ON s.category_id = c.id
      WHERE s.owner_id = $1`,
      [owner_id]
    );
    return result.rows || null;
  }

  /**
   * Update shop
   */
  static async update(id: number, shopData: Partial<ShopAttributes>): Promise<ShopAttributes | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(shopData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount + 1}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE shops
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await database.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Delete shop
   */
  static async delete(id: number): Promise<boolean> {
    const result = await database.query(
      'DELETE FROM shops WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Check if shop exists by domain
   */
  static async existsByDomain(domain: string): Promise<boolean> {
    const result = await database.query(
      'SELECT EXISTS(SELECT 1 FROM shops WHERE domain = $1)',
      [domain]
    );
    return result.rows[0].exists;
  }

  /**
   * Get all shops with pagination
   */
  static async findAll(limit: number = 10, offset: number = 0): Promise<ShopWithOwner[]> {
    const result = await database.query(
      `SELECT
      s.*,
      u.id AS owner_id,
      u.email AS owner_email,
      u.username AS owner_username,
      c.id AS category_id,
      c.name AS category
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
      JOIN ${Shop.categoriesTableName} c ON s.category_id = c.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Count total shops
   */
  static async count(): Promise<number> {
    const result = await database.query('SELECT COUNT(*) FROM shops');
    return parseInt(result.rows[0].count);
  }
}