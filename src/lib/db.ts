/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, types } from 'pg'

types.setTypeParser(1700, (val) => val === null ? null : parseFloat(val));

// dev
// const pool = new Pool({
//   user: 'fortune',
//   host: 'localhost',
//   database: 'shop_sphere',
//   password: '1234',
//   port: 5432,
// })

const pool = new Pool({ connectionString: process.env.DATABASE_CONNECTION_STRING });

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
