/**
 * Date formatting for values read from MariaDB.
 *
 * The database connection returns DATETIME/TIMESTAMP columns as strings
 * ("2026-05-01 19:17:11") so they are shown exactly as stored, with no
 * time-zone conversion between the database and the web server.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Parts {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
}

function parts(value: string | Date): Parts {
  if (value instanceof Date) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
      hour: value.getHours(),
      minute: value.getMinutes(),
    };
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(value);
  if (!m) throw new RangeError(`Unrecognised date: ${value}`);
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4] ?? 0),
    minute: Number(m[5] ?? 0),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');
const monthName = (month: number) => MONTHS[month - 1] ?? '';

/** "May 1, 2026" */
export function longDate(value: string | Date): string {
  const p = parts(value);
  return `${monthName(p.month)} ${p.day}, ${p.year}`;
}

/** "May 1, 2026, 7:17 pm" */
export function longDateTime(value: string | Date): string {
  const p = parts(value);
  const hour12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return `${longDate(value)}, ${hour12}:${pad(p.minute)} ${p.hour < 12 ? 'am' : 'pm'}`;
}

/** "01/05/2026" */
export function dayMonthYear(value: string | Date): string {
  const p = parts(value);
  return `${pad(p.day)}/${pad(p.month)}/${p.year}`;
}

/** "01 May 2026" */
export function shortDate(value: string | Date): string {
  const p = parts(value);
  return `${pad(p.day)} ${monthName(p.month).slice(0, 3)} ${p.year}`;
}

/** "05/2026" */
export function monthYear(value: string | Date): string {
  const p = parts(value);
  return `${pad(p.month)}/${p.year}`;
}

/** "2026-05", the value format of <input type="month">. */
export function isoMonth(value: string | Date): string {
  const p = parts(value);
  return `${p.year}-${pad(p.month)}`;
}

export function year(value: string | Date): number {
  return parts(value).year;
}

/** Certificate reference, e.g. "GS-2026-000123". */
export function certificateRef(id: number, submittedAt: string | Date): string {
  return `GS-${year(submittedAt)}-${String(id).padStart(6, '0')}`;
}

/** "1,234.50" */
export function money(amount: number): string {
  return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
