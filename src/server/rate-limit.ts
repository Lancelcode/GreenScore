import 'server-only';
import { execute, queryOne } from './db';

/**
 * Login rate limiting, recorded in the login_attempts table.
 *
 *  - 5 failed attempts from one IP address in 15 minutes block that address.
 *  - 10 failed attempts against one email address in 15 minutes block that
 *    account, even if the attacker keeps changing IP address.
 */
const WINDOW_MINUTES = 15;
export const MAX_PER_IP = 5;
const MAX_PER_ACCOUNT = 10;

export const LOCKED_OUT = 'Too many failed login attempts. Please wait 15 minutes before trying again.';

async function count(column: 'ip_address' | 'email', value: string): Promise<number> {
  const row = await queryOne<{ attempts: number }>(
    `SELECT COUNT(*) AS attempts FROM login_attempts
      WHERE ${column} = ? AND attempted_at >= NOW() - INTERVAL ${WINDOW_MINUTES} MINUTE`,
    [value],
  );
  return Number(row?.attempts ?? 0);
}

export async function isLockedOut(ip: string, email: string): Promise<boolean> {
  const [byIp, byEmail] = await Promise.all([count('ip_address', ip), count('email', email)]);
  return byIp >= MAX_PER_IP || byEmail >= MAX_PER_ACCOUNT;
}

/** Record a failure and return how many attempts this IP has left. */
export async function recordFailure(ip: string, email: string): Promise<number> {
  await execute('INSERT INTO login_attempts (ip_address, email) VALUES (?, ?)', [ip, email.slice(0, 100)]);
  return MAX_PER_IP - (await count('ip_address', ip));
}

export async function clearFailures(ip: string, email: string): Promise<void> {
  await execute('DELETE FROM login_attempts WHERE ip_address = ? OR email = ?', [ip, email]);
}
