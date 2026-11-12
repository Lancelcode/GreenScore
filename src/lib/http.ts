import { isIP } from 'node:net';

/**
 * The visitor's IP address, used for login rate limiting.
 *
 * Next.js passes the address it received the connection from in
 * X-Forwarded-For, but only when the request did not already carry that
 * header. Behind Caddy that is never a problem: Caddy replaces any
 * client-supplied value with the address it actually saw, so the right-most
 * entry is the real visitor. Without a proxy a client could send its own
 * header, which is why logins are also limited per account (see
 * src/server/rate-limit.ts).
 */
export function clientIp(forwardedFor: string | null | undefined): string {
  if (forwardedFor) {
    const candidate = forwardedFor.split(',').map((part) => part.trim()).at(-1) ?? '';
    if (isIP(candidate) !== 0) {
      return candidate;
    }
  }
  return '0.0.0.0';
}
