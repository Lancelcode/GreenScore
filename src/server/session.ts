import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { Role } from '@/lib/auth';
import { execute, queryOne } from './db';

/**
 * Database-backed sessions.
 *
 * The browser holds a random 256-bit token in an HttpOnly cookie; the
 * database stores only its SHA-256 hash, so a leaked database backup cannot
 * be used to hijack sessions. Each request re-reads the user's role and
 * status, so promoting, demoting or deactivating an account takes effect
 * immediately — a deactivated user is signed out on their next click.
 */

export const SESSION_COOKIE = 'gs_session';
/** Signed out after 30 minutes without activity… */
const IDLE_MINUTES = 30;
/** …and after 12 hours regardless. */
const ABSOLUTE_HOURS = 12;

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  role: Role;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Secure cookies whenever the site is served over HTTPS (directly or behind Caddy). */
async function isHttps(): Promise<boolean> {
  if (process.env.COOKIE_SECURE !== undefined) {
    return ['1', 'true', 'yes', 'on'].includes(process.env.COOKIE_SECURE.toLowerCase());
  }
  const proto = (await headers()).get('x-forwarded-proto');
  return process.env.TRUST_PROXY === '1' && proto === 'https';
}

/** Start a fresh session for a user who has just proved their password. */
export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  await execute('INSERT INTO sessions (id, user_id) VALUES (?, ?)', [hashToken(token), userId]);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // never readable from JavaScript
    sameSite: 'strict', // never sent on cross-site requests
    secure: await isHttps(),
    path: '/',
    // No maxAge: a browser-session cookie, gone when the browser closes.
  });
}

/** End the current session, in the database and in the browser. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await execute('DELETE FROM sessions WHERE id = ?', [hashToken(token)]);
  }
  jar.delete(SESSION_COOKIE);
}

interface SessionRow extends SessionUser {
  stale: 0 | 1;
}

/**
 * The signed-in user, or null. Cached for the duration of one request, so
 * layouts, pages and actions can all call it without extra queries.
 */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const id = hashToken(token);
  const row = await queryOne<SessionRow>(
    `SELECT u.id, u.username, u.email, u.role,
            (s.last_seen_at < NOW() - INTERVAL 1 MINUTE) AS stale
       FROM sessions s
       JOIN new_users u ON u.id = s.user_id
      WHERE s.id = ?
        AND u.status <> 'deactivated'
        AND s.last_seen_at > NOW() - INTERVAL ${IDLE_MINUTES} MINUTE
        AND s.created_at > NOW() - INTERVAL ${ABSOLUTE_HOURS} HOUR`,
    [id],
  );
  if (!row) return null;

  // Record activity at most once a minute to keep writes cheap.
  if (row.stale) {
    await execute('UPDATE sessions SET last_seen_at = NOW() WHERE id = ?', [id]);
  }
  return { id: row.id, username: row.username, email: row.email, role: row.role };
});

/**
 * Role of the user behind a raw session token, or null if the session is not
 * valid. Used by src/proxy.ts, which runs before the page and cannot use
 * `cookies()`.
 */
export async function roleForToken(token: string | undefined): Promise<Role | null> {
  if (!token || token.length > 100) return null;
  const row = await queryOne<{ role: Role }>(
    `SELECT u.role
       FROM sessions s
       JOIN new_users u ON u.id = s.user_id
      WHERE s.id = ?
        AND u.status <> 'deactivated'
        AND s.last_seen_at > NOW() - INTERVAL ${IDLE_MINUTES} MINUTE
        AND s.created_at > NOW() - INTERVAL ${ABSOLUTE_HOURS} HOUR`,
    [hashToken(token)],
  );
  return row?.role ?? null;
}

/** For member pages: the signed-in user, or a redirect to the login page. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * For admin pages and actions. Non-admins never reach the page itself
 * (src/proxy.ts answers 403 first); this is the second line of defence.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/');
  return user;
}

/** Remove expired sessions. Called occasionally from login. */
export async function purgeExpiredSessions(): Promise<void> {
  await execute(
    `DELETE FROM sessions
      WHERE last_seen_at < NOW() - INTERVAL ${IDLE_MINUTES} MINUTE
         OR created_at < NOW() - INTERVAL ${ABSOLUTE_HOURS} HOUR`,
  );
}
