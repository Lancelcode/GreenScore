import 'server-only';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * One-off toast messages that survive a redirect ("Your tip has been
 * posted!"). An action calls `flash()`; the next page render reads it with
 * `readFlash()` and <FlashToast> shows it, then deletes the cookie.
 */

export const FLASH_COOKIE = 'gs_flash';

export type FlashType = 'success' | 'error' | 'warning' | 'info';

export interface Flash {
  id: string;
  type: FlashType;
  message: string;
}

export async function flash(type: FlashType, message: string): Promise<void> {
  const value: Flash = { id: randomUUID(), type, message };
  (await cookies()).set(FLASH_COOKIE, JSON.stringify(value), {
    path: '/',
    sameSite: 'strict',
    maxAge: 60,
    // Read by the browser so it can delete the cookie once the toast is shown.
    httpOnly: false,
  });
}

export async function readFlash(): Promise<Flash | null> {
  const raw = (await cookies()).get(FLASH_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Flash>;
    const types: FlashType[] = ['success', 'error', 'warning', 'info'];
    if (typeof parsed.id === 'string' && typeof parsed.message === 'string' && types.includes(parsed.type as FlashType)) {
      return { id: parsed.id, type: parsed.type as FlashType, message: parsed.message.slice(0, 500) };
    }
  } catch {
    // Ignore a malformed cookie.
  }
  return null;
}
