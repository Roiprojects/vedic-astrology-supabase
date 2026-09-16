import { readFile } from 'node:fs/promises';
import pg from 'pg';

const { Pool } = pg;
const required = ['PG_HOST', 'PG_DATABASE', 'PG_USER', 'PG_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === 'false' ? false : { rejectUnauthorized: false },
});

const sql = await readFile(new URL('./004_runtime_schema.sql', import.meta.url), 'utf8');
const client = await pool.connect();

try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Runtime schema migration applied.');
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Runtime schema migration failed:', error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
