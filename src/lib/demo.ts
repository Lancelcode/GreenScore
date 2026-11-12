/**
 * Public demo mode (DEMO_MODE=1), for the live site linked from the CV.
 *
 * - The login page offers the demo accounts below with one click.
 * - Every page shows a short "demo site" notice.
 * - The demo accounts can't be edited, demoted, deactivated or deleted, so
 *   one visitor can't lock the next one out.
 * - All data is reset to database/gradedunit.sql every night
 *   (src/app/api/cron/reset-demo/route.ts).
 */
import { isTruthy } from './db-config';

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

/** Seeded accounts whose passwords are published in the README. */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { label: 'Demo member', email: 'hello@ecoventures.com', password: 'GreenDemo2026' },
  { label: 'Demo admin', email: 'admin@greenscore.com', password: 'GreenAdmin2026' },
];

export const DEMO_LOCKED = "The demo accounts can't be changed on the demo site.";

export function isDemoMode(env: Record<string, string | undefined> = process.env): boolean {
  return isTruthy(env.DEMO_MODE);
}

export function isDemoAccount(email: string): boolean {
  return DEMO_ACCOUNTS.some((account) => account.email === email.trim().toLowerCase());
}

/** Tables emptied by the nightly reset. */
export const RESET_TABLES = [
  'sessions',
  'login_attempts',
  'feedback',
  'community_tips',
  'credit_cards',
  'green_calculator_results',
  'new_users',
] as const;

/** The INSERT statements from the schema dump: the demo data to restore. */
export function seedStatements(sql: string): string[] {
  return sql.match(/^INSERT INTO[\s\S]*?\);$/gm) ?? [];
}

/**
 * Every statement in the schema dump (tables, demo data, foreign keys), in
 * order, without comments. Used to set up an empty database.
 */
export function schemaStatements(sql: string): string[] {
  return sql
    .split('\n')
    .filter((line) => !line.startsWith('--') && !line.startsWith('/*!'))
    .join('\n')
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement !== '');
}
