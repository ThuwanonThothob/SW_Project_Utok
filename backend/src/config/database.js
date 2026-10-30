import pg from "pg";

const { Pool } = pg;

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30_000,
    })
  : null;

export async function databaseStatus() {
  if (!pool) return { mode: "memory", connected: true };
  try {
    await pool.query("SELECT 1");
    return { mode: "postgresql", connected: true };
  } catch (error) {
    return { mode: "postgresql", connected: false, error: error.message };
  }
}
