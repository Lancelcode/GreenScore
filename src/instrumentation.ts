/**
 * Runs once when the server starts. Creates any tables added since the
 * original PHP schema, so an existing database upgrades itself on deploy.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { ensureSchema } = await import('@/server/db');
  try {
    await ensureSchema();
  } catch (error) {
    // The database may still be starting; /health reports it and the next
    // start-up will try again.
    console.error('GreenScore: could not check the database schema:', error);
  }
}
