const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { getPool, closeDatabase } = require('../api/_lib/db');

const migrationName = '005_neon_promotion_source.sql';
const migrationPath = path.join(__dirname, '..', 'db', 'migrations', migrationName);
const checksum = (content) => crypto.createHash('sha256').update(content).digest('hex');

async function migratePromotionSource() {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(80455005)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    const content = await fs.readFile(migrationPath, 'utf8');
    const hash = checksum(content);
    const existing = await client.query('SELECT checksum FROM schema_migrations WHERE name = $1', [migrationName]);
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== hash) throw new Error(`Migration checksum changed after application: ${migrationName}`);
      console.log(`Already applied: ${migrationName}`);
    } else {
      await client.query('BEGIN');
      try {
        await client.query(content);
        await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [migrationName, hash]);
        await client.query('COMMIT');
        console.log(`Applied: ${migrationName}`);
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      }
    }

    const result = await client.query("SELECT code_normalized, status FROM promotions WHERE code_normalized = ANY($1::text[]) ORDER BY code_normalized", [['TEST', 'R100', 'FREE']]);
    if (result.rows.length !== 3) throw new Error('Promotion migration verification failed');
    console.log(`Verified promotions: ${result.rows.map((row) => `${row.code_normalized}:${row.status}`).join(', ')}`);
  } finally {
    await client.query('SELECT pg_advisory_unlock(80455005)').catch(() => undefined);
    client.release();
    await closeDatabase();
  }
}

migratePromotionSource().catch((error) => {
  console.error(`Promotion migration failed: ${error.message}`);
  process.exitCode = 1;
});
