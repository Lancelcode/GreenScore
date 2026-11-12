import { query } from '@/server/db';

/**
 * Liveness/readiness probe for Docker and the reverse proxy.
 * 200 "ok" when the app is running and the database answers, 503 otherwise.
 */
export const dynamic = 'force-dynamic';

const headers = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    await query('SELECT 1');
    return new Response('ok\n', { headers });
  } catch {
    return new Response('database unavailable\n', { status: 503, headers });
  }
}
