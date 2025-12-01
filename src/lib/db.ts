import { Pool } from 'pg'

const pool = new Pool({
  user: 'fortune',
  host: 'localhost',
  database: 'shop_sphere',
  password: '1234',
  port: 5432,
})

export class Database {
  static async query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  static async getClient() {
    return await pool.connect();
  }

  static async transaction(callback: (client: any) => Promise<any>) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Database;
export { pool as database };
