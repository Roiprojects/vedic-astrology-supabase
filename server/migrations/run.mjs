import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Supabase provides a direct PostgreSQL connection string as DATABASE_URL.
// Use it for running raw SQL migrations.
const dbUrl = process.env.DATABASE_URL || "";

if (!dbUrl) {
  throw new Error("DATABASE_URL is required for migrations (Supabase provides this in project settings)");
}

// Lazy-import pg only when DATABASE_URL is available
const { default: pg } = await import("pg");
const { Pool } = pg;

const pool = new Pool({ connectionString: dbUrl });

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)));
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql") && !f.startsWith("."))
    .sort();

  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    console.log(`[migrate] applying ${file} …`);
    await client.query(sql);
  }

  await client.query("COMMIT");
  console.log(`[migrate] ${files.length} migration(s) applied successfully.`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error("[migrate] failed:", error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
