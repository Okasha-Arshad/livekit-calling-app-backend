import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({
  path: path.resolve(process.cwd(), 'config', `.env.${process.env.NODE_ENV || 'development'}`),
});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export async function testConnection() {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
  console.log(':white_check_mark: Database connected successfully');
}
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        short_id VARCHAR(8) UNIQUE DEFAULT substr(gen_random_uuid()::text, 1, 8),
        username VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query('COMMIT');
    console.log(':white_check_mark: Database initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(':x: Database initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool,
};