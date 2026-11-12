import { timingSafeEqual } from 'node:crypto';
import { isDemoMode } from '@/lib/demo';
import { resetDemoData } from '@/server/demo';

/**
 * Nightly reset of the public demo, called by Vercel Cron (see vercel.json)
 * or any scheduler that can send an HTTP request:
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/reset-demo
 *
 * It does nothing unless DEMO_MODE=1 and CRON_SECRET are both set, so a normal
 * deployment never exposes it.
 */
export const dynamic = 'force-dynamic';

function authorised(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header ?? '');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? '';
  if (!isDemoMode() || secret.length < 16) {
    return new Response('Not found', { status: 404 });
  }
  if (!authorised(request.headers.get('authorization'), secret)) {
    return new Response('Unauthorised', { status: 401 });
  }

  const summary = await resetDemoData();
  return Response.json({ ok: true, ...summary });
}
