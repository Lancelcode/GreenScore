import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { connectionSettings, tlsOptions } from '@/lib/db-config';
import { DEMO_ACCOUNTS, RESET_TABLES, isDemoAccount, isDemoMode, schemaStatements, seedStatements } from '@/lib/demo';

describe('database connection settings', () => {
  it('defaults to a local database without TLS', () => {
    expect(connectionSettings({})).toEqual({
      host: '127.0.0.1',
      port: 3306,
      user: 'greenscore',
      password: '',
      database: 'gradedunit',
    });
  });

  it('turns on verified TLS for hosted databases', () => {
    const settings = connectionSettings({ DB_HOST: 'db.example.com', DB_PORT: '4000', DB_SSL: '1' });
    expect(settings.port).toBe(4000);
    expect(settings.ssl).toEqual({ minVersion: 'TLSv1.2', rejectUnauthorized: true });
  });

  it('accepts a provider CA certificate written on one line', () => {
    const ssl = tlsOptions({ DB_SSL: 'true', DB_SSL_CA: '-----BEGIN CERTIFICATE-----\\nABC\\n-----END CERTIFICATE-----' });
    expect(ssl?.ca).toBe('-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----');
  });

  it('leaves TLS off unless asked', () => {
    expect(tlsOptions({ DB_SSL: '0' })).toBeUndefined();
    expect(tlsOptions({ DB_SSL: '' })).toBeUndefined();
  });
});

describe('demo mode', () => {
  it('is off unless DEMO_MODE is set', () => {
    expect(isDemoMode({})).toBe(false);
    expect(isDemoMode({ DEMO_MODE: '1' })).toBe(true);
    expect(isDemoMode({ DEMO_MODE: 'no' })).toBe(false);
  });

  it('recognises the shared demo accounts', () => {
    expect(isDemoAccount('hello@ecoventures.com')).toBe(true);
    expect(isDemoAccount(' Admin@GreenScore.com ')).toBe(true);
    expect(isDemoAccount('info@carbonco.com')).toBe(false);
  });

  it('restores every seed table from the schema dump', () => {
    const dump = readFileSync(join(process.cwd(), 'database/gradedunit.sql'), 'utf8');
    const statements = seedStatements(dump);
    const tables = statements.map((s) => /^INSERT INTO `(\w+)`/.exec(s)?.[1]);
    expect(tables.sort()).toEqual(['community_tips', 'credit_cards', 'feedback', 'green_calculator_results', 'new_users']);
    for (const statement of statements) {
      expect(statement.trimEnd().endsWith(');')).toBe(true);
    }
    // Every table the reset empties is either refilled or meant to start empty.
    for (const table of tables) expect(RESET_TABLES).toContain(table);
  });

  it('splits the whole schema dump into runnable statements', () => {
    const dump = readFileSync(join(process.cwd(), 'database/gradedunit.sql'), 'utf8');
    const statements = schemaStatements(dump);
    expect(statements.filter((s) => s.startsWith('CREATE TABLE'))).toHaveLength(7);
    expect(statements.filter((s) => s.startsWith('INSERT INTO'))).toHaveLength(5);
    expect(statements.filter((s) => s.includes('FOREIGN KEY') && s.startsWith('ALTER TABLE'))).toHaveLength(4);
    // No statement was cut in half or left with a comment in it.
    for (const s of statements) {
      expect(s).not.toMatch(/^--/m);
      expect(s.endsWith(';')).toBe(false);
    }
  });

  it('has demo accounts that exist in the seed data', () => {
    const dump = readFileSync(join(process.cwd(), 'database/gradedunit.sql'), 'utf8');
    for (const account of DEMO_ACCOUNTS) expect(dump).toContain(`'${account.email}'`);
  });
});
