import { Pool } from 'pg';
import { database } from '@/lib/db';

export abstract class BaseModel {
  protected static pool: Pool = database;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Execute a query with parameters
   */
  protected static async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Find a record by ID
   */
  protected static async findById(tableName: string, id: number): Promise<any> {
    const result = await this.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Find records with conditions
   */
  protected static async findWhere(
    tableName: string,
    conditions: Record<string, any>,
    orderBy = 'id',
    limit?: number,
    offset?: number,
  ): Promise<any[]> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    let query = `SELECT * FROM ${tableName}`;
    
    if (keys.length > 0) {
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    if (offset) {
      query += ` OFFSET ${offset}`;
    }

    const result = await this.query(query, values);
    return result.rows;
  }

  /**
   * Create a new record
   */
  protected static async create(tableName: string, data: Record<string, any>): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows[0];
  }

  /**
   * Update a record
   */
  protected static async update(
    tableName: string,
    id: number,
    data: Record<string, any>
  ): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.query(query, [id, ...values]);
    return result.rows[0];
  }

  /**
   * Delete a record
   */
  protected static async delete(tableName: string, id: number): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Check if a record exists
   */
  protected static async exists(tableName: string, conditions: Record<string, any>): Promise<boolean> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const query = `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${whereClause})`;
    
    const result = await this.query(query, values);
    return result.rows[0].exists;
  }

  /**
   * Count records
   */
  protected static async count(tableName: string, conditions?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${tableName}`;
    let values: any[] = [];

    if (conditions) {
      const keys = Object.keys(conditions);
      values = Object.values(conditions);
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    const result = await this.query(query, values);
    return parseInt(result.rows[0].count);
  }
}
