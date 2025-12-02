import { database } from '@/lib/db';

export interface CategoryAttributes {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class Category {
  static tableName = 'categories';

  /**
   * Create a new category
   */
  static async create(categoryData: Partial<CategoryAttributes>): Promise<CategoryAttributes> {
    const category = {
      ...categoryData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const query = `
      INSERT INTO ${Category.tableName} (name, slug, parent_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      category.name,
      category.slug,
      category.parent_id,
      category.created_at,
      category.updated_at,
    ];

    const result = await database.query(query, values);
    return result.rows[0];
  }

  /**
   * Find category by ID
   */
  static async findById(id: number): Promise<CategoryAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Category.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all categories
   */
  static async findAll(): Promise<CategoryAttributes[]> {
    const result = await database.query(
      `SELECT * FROM ${Category.tableName} ORDER BY name`
    );
    return result.rows;
  }

  /**
   * Find categories by parent ID
   */
  static async findByParentId(parent_id: number): Promise<CategoryAttributes[]> {
    const result = await database.query(
      `SELECT * FROM ${Category.tableName} WHERE parent_id = $1 ORDER BY name`,
      [parent_id]
    );
    return result.rows;
  }

  /**
   * Find category by slug
   */
  static async findBySlug(slug: string): Promise<CategoryAttributes | null> {
    const result = await database.query(
      `SELECT * FROM ${Category.tableName} WHERE slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }
}