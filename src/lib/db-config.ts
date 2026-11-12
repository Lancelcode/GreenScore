/**
 * Database connection settings, read from environment variables. Shared by
 * the app (src/server/db.ts) and scripts/create-admin.mts, and kept free of
 * imports so Node.js can run it directly.
 */

type Env = Record<string, string | undefined>;

export interface TlsOptions {
  minVersion: 'TLSv1.2';
  rejectUnauthorized: true;
  ca?: string;
}

export interface ConnectionSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: TlsOptions;
}

export function isTruthy(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value ?? '').trim().toLowerCase());
}

/**
 * Hosted databases (TiDB Cloud, Aiven and similar) only accept encrypted
 * connections. DB_SSL=1 turns TLS on and always verifies the server's
 * certificate. Providers with their own certificate authority give you a CA
 * file: put its contents in DB_SSL_CA (literal "\n" sequences are allowed, for
 * dashboards that only take one line).
 */
export function tlsOptions(env: Env): TlsOptions | undefined {
  if (!isTruthy(env.DB_SSL)) return undefined;
  const ca = env.DB_SSL_CA?.trim().replace(/\\n/g, '\n');
  return { minVersion: 'TLSv1.2', rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}

export function connectionSettings(env: Env): ConnectionSettings {
  const ssl = tlsOptions(env);
  return {
    host: env.DB_HOST || '127.0.0.1',
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER || 'greenscore',
    password: env.DB_PASSWORD ?? '',
    database: env.DB_NAME || 'gradedunit',
    ...(ssl ? { ssl } : {}),
  };
}
