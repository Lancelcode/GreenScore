import 'server-only';
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import { connectionSettings } from '@/lib/db-config';

/**
 * MariaDB/MySQL connection pool. Settings come from environment variables
 * (Next.js also reads a local .env file); nothing secret is stored in code.
 *
 * Every query goes through `query`/`execute` with `?` placeholders, so values
 * are always sent separately from the SQL text (prepared statements).
 */

declare global {
  // Survives hot reloads in development so we don't open a new pool each time.
  var greenscorePool: Pool | undefined;
}

function createPool(): Pool {
  return mysql.createPool({
    ...connectionSettings(process.env),
    charset: 'utf8mb4',
    // Return DATETIME/TIMESTAMP values as the strings stored in the database.
    dateStrings: true,
    // DECIMAL columns (donation_cost) as numbers rather than strings.
    decimalNumbers: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE ?? 10),
    waitForConnections: true,
  });
}

export function pool(): Pool {
  globalThis.greenscorePool ??= createPool();
  return globalThis.greenscorePool;
}

type Param = string | number | boolean | null;

/** Run a SELECT and return its rows. */
export async function query<T>(sql: string, params: Param[] = []): Promise<T[]> {
  const [rows] = await pool().execute<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

/** Run a SELECT and return the first row, or null. */
export async function queryOne<T>(sql: string, params: Param[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** Run an INSERT/UPDATE/DELETE. */
export async function execute(sql: string, params: Param[] = []): Promise<ResultSetHeader> {
  const [result] = await pool().execute<ResultSetHeader>(sql, params);
  return result;
}

/**
 * Tables added after the original PHP schema. Created on start-up so an
 * existing production database upgrades itself (see src/instrumentation.ts);
 * fresh installs get them from database/gradedunit.sql as well.
 */
export async function ensureSchema(): Promise<void> {
  await execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id CHAR(64) NOT NULL COMMENT 'SHA-256 of the session token; the token itself is never stored',
      user_id INT(10) UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_sessions_user (user_id),
      CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES new_users (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`);
}
