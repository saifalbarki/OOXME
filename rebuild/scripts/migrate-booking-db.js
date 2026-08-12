const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { getPool, closeDatabase } = require('../api/_lib/db');

const migrationsDirectory = path.join(__dirname, '..', 'db', 'migrations');
const checksum = (content) => crypto.createHash('sha256').update(content).digest('hex');

async function migrate() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(80455001)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    const files = (await fs.readdir(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const content = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');
      const hash = checksum(content);
      const existing = await client.query('SELECT checksum FROM schema_migrations WHERE name = $1', [file]);
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== hash) throw new Error(`Migration checksum changed after application: ${file}`);
        console.log(`Already applied: ${file}`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(content);
        await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [file, hash]);
        await client.query('COMMIT');
        console.log(`Applied: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      }
    }
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1::text[]) ORDER BY tablename", [['bookings', 'promotions', 'promotion_redemptions', 'offer_tokens', 'booking_holds', 'idempotency_keys']]);
    console.log(`Verified tables: ${tables.rows.map((row) => row.tablename).join(', ') || 'none'}`);
  } finally {
    await client.query('SELECT pg_advisory_unlock(80455001)').catch(() => undefined);
    client.release();
    await closeDatabase();
  }
}

migrate().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
