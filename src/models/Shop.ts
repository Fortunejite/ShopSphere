import { database } from '@/lib/db';

export interface ShopAttributes {
  id: string;
  owner_id: string;
  name: string;
  domain: string;
  category: string;
  description?: string;
  status: 'active' | 'inactive' | 'suspended';
  currency: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShopWithOwner extends ShopAttributes {
  owner_email: string;
  owner_username: string;
}

export class Shop {
  static tableName = 'shops';
  static usersTableName = 'users';

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
      INSERT INTO ${Shop.tableName} (owner_id, name, domain, category, description, status, currency, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      shop.owner_id,
      shop.name,
      shop.domain,
      shop.category,
      shop.description,
      shop.status,
      shop.currency,
      shop.created_at,
      shop.updated_at,
    ];

    const result = await database.query(query, values);
    return result.rows[0];
  }

  /**
   * Find shop by ID
   */
  static async findById(id: string): Promise<ShopWithOwner | null> {
    const result = await database.query(
      `SELECT
      s.*,
      u.id AS owner_id,
      u.email AS owner_email,
      u.username AS owner_username
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
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
      u.username AS owner_username
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
      WHERE s.domain = $1`,
      [domain]
    );
    return result.rows[0] || null;
  }

  /**
   * Find shop by owner ID
   */
  static async findByOwnerId(owner_id: string): Promise<ShopWithOwner[] | null> {
    const result = await database.query(
      `SELECT
      s.*,
      u.id AS owner_id,
      u.email AS owner_email,
      u.username AS owner_username
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
      WHERE s.owner_id = $1`,
      [owner_id]
    );
    return result.rows || null;
  }

  /**
   * Update shop
   */
  static async update(id: string, shopData: Partial<ShopAttributes>): Promise<ShopAttributes | null> {
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
  static async delete(id: string): Promise<boolean> {
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
      u.username AS owner_username
      FROM ${Shop.tableName} s
      JOIN ${Shop.usersTableName} u ON s.owner_id = u.id
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