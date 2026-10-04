const crypto = require('crypto');
const fsSync = require('fs');
const fs = require('fs/promises');
const path = require('path');
const { getPool, closeDatabase } = require('../api/_lib/db');

if (process.env.NODE_ENV !== 'production' && typeof process.loadEnvFile === 'function') {
  for (const file of ['.env.local', '.env.development.local']) {
    const envPath = path.join(__dirname, '..', file);
    if (fsSync.existsSync(envPath)) { try { process.loadEnvFile(envPath); } catch (_) {} }
  }
}

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
    const requiredTables = ['bookings', 'booking_holds', 'promotions', 'promotion_redemptions', 'booking_reminders', 'notifications', 'os_products', 'os_page_controls', 'os_admin_sessions', 'os_admin_login_attempts', 'os_admin_audit_log', 'os_admin_idempotency', 'os_uptime_samples'];
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1::text[]) ORDER BY tablename", [requiredTables]);
    const missingTables = requiredTables.filter((name) => !tables.rows.some((row) => row.tablename === name));
    if (missingTables.length) throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
    const indexes = await client.query("SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname IN ('notifications_public_window_index','os_products_active_order_index','os_page_controls_page_index','os_admin_sessions_expiry_index','os_admin_audit_log_resource_index','os_admin_idempotency_expiry_index','promotion_redemptions_history_index')");
    if (indexes.rowCount < 7) throw new Error('Missing required OS indexes');
    console.log(`Verified tables: ${tables.rows.map((row) => row.tablename).join(', ')}`);
    console.log(`Verified OS indexes: ${indexes.rowCount}`);
  } finally {
    await client.query('SELECT pg_advisory_unlock(80455001)').catch(() => undefined);
    client.release();
    await closeDatabase();
  }
}

migrate().catch((error) => {
  console.error(`Migration failed: ${error.code || error.message || 'database_connection_failed'}`);
  process.exitCode = 1;
});
