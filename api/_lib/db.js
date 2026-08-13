const { Pool } = require('pg');

let pool;

const databaseUrl = () => {
  const value = process.env.DATABASE_URL;
  if (!value) {
    const error = new Error('Missing required environment variable: DATABASE_URL');
    error.code = 'database_unconfigured';
    throw error;
  }
  return value;
};

const shouldUseSsl = (url) => !/(localhost|127\.0\.0\.1|::1)/i.test(url);

const getPool = () => {
  if (!pool) {
    const connectionString = databaseUrl();
    pool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000
    });
  }
  return pool;
};

const query = (text, values) => getPool().query(text, values);

async function withTransaction(work) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

const closeDatabase = async () => {
  if (!pool) return;
  const activePool = pool;
  pool = undefined;
  await activePool.end();
};

module.exports = { databaseUrl, getPool, query, withTransaction, closeDatabase };
