/**
 * Saved payment card helpers.
 *
 * GreenScore never stores a full card number or a security code (CVV): only
 * the last four digits, the expiry month and the cardholder name are kept so
 * a user can recognise a card. A real deployment would hand payment details
 * to a PCI-compliant payment provider instead.
 */
import { charLength } from './validator';

/** A calendar month. `month` is 1–12. */
export interface YearMonth {
  year: number;
  month: number;
}

export function digits(number: string): string {
  return number.replace(/\D/g, '');
}

/** Luhn checksum used by all major card schemes. */
export function passesLuhn(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  let sum = 0;
  let double = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let d = Number(value[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function lastFour(number: string): string {
  return digits(number).slice(-4);
}

export function mask(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

/** Parse an expiry given as YYYY-MM (month input) or YYYY-MM-DD (date input). */
export function parseExpiry(value: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { year, month };
}

/** The first day of the month as YYYY-MM-01, the format stored in the database. */
export function toSqlDate({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

/** A card is valid until the end of its expiry month. */
export function isExpired(expiry: YearMonth, now: Date = new Date()): boolean {
  const current = now.getFullYear() * 12 + now.getMonth();
  return expiry.year * 12 + (expiry.month - 1) < current;
}

/** Validate the editable details of a saved card (expiry and name). */
export function validateDetails(expiry: string, holder: string, now?: Date): string[] {
  const errors: string[] = [];
  const parsed = parseExpiry(expiry);
  if (parsed === null) errors.push('Enter a valid expiry date.');
  else if (isExpired(parsed, now)) errors.push('That card has expired.');

  const name = holder.trim();
  if (name === '' || charLength(name) > 100) errors.push('Enter the cardholder name (up to 100 characters).');
  return errors;
}

/** Validate a new card. Returns a list of error messages (empty if valid). */
export function validateNew(number: string, expiry: string, holder: string, now?: Date): string[] {
  const errors: string[] = [];
  const d = digits(number);
  if (d.length < 12 || d.length > 19 || !passesLuhn(d)) errors.push('Enter a valid card number.');
  return [...errors, ...validateDetails(expiry, holder, now)];
}
