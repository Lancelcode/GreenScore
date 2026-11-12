import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEMO_LOCKED, RESET_TABLES, isDemoAccount, isDemoMode, schemaStatements, seedStatements } from '@/lib/demo';
import { pool, queryOne } from './db';

export interface ResetSummary {
  /** True when the tables did not exist yet and were created by this call. */
  installed: boolean;
  statements: number;
  users: number;
}

/**
 * Create the tables and load the demo data into an empty database, by running
 * database/gradedunit.sql statement by statement. This is what makes a fresh
 * hosted database usable without importing the file by hand.
 */
async function installSchema(dump: string): Promise<number> {
  const statements = schemaStatements(dump);
  const connection = await pool().getConnection();
  try {
    // Clear out anything a half-finished earlier attempt left behind.
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of RESET_TABLES) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    // Trusted SQL shipped with the app, not user input.
    for (const statement of statements) {
      await connection.query(statement);
    }
  } finally {
    connection.release();
  }
  return statements.length;
}

/**
 * Put every table back to the demo data in database/gradedunit.sql. On an
 * empty database it creates the tables first.
 */
export async function resetDemoData(): Promise<ResetSummary> {
  const dump = await readFile(join(process.cwd(), 'database', 'gradedunit.sql'), 'utf8');
  const inserts = seedStatements(dump);
  if (inserts.length === 0) throw new Error('No demo data found in database/gradedunit.sql');

  const existing = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'new_users'`,
  );
  if (Number(existing?.total ?? 0) === 0) {
    const statements = await installSchema(dump);
    const created = await queryOne<{ total: number }>('SELECT COUNT(*) AS total FROM new_users');
    return { installed: true, statements, users: Number(created?.total ?? 0) };
  }

  const connection = await pool().getConnection();
  try {
    await connection.beginTransaction();
    // Rows are removed and re-inserted in table order, so relax the foreign
    // key checks for this transaction only.
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of RESET_TABLES) {
      await connection.query(`DELETE FROM ${table}`);
    }
    // Trusted SQL shipped with the app, not user input.
    for (const statement of inserts) {
      await connection.query(statement);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    connection.release();
  }

  const users = await queryOne<{ total: number }>('SELECT COUNT(*) AS total FROM new_users');
  return { installed: false, statements: inserts.length, users: Number(users?.total ?? 0) };
}

/**
 * On the demo site, refuse changes to the shared demo accounts. Returns the
 * error message to show, or null when the change is allowed.
 */
export async function demoAccountLock(userId: number): Promise<string | null> {
  if (!isDemoMode()) return null;
  const user = await queryOne<{ email: string }>('SELECT email FROM new_users WHERE id = ?', [userId]);
  return user && isDemoAccount(user.email) ? DEMO_LOCKED : null;
}
