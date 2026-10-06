const { Pool } = require('pg');

let pool;

const databaseUrl = () => {
  const value = process.env.DATABASE_URL;
  if (!value) throw Object.assign(new Error('Missing required environment variable: DATABASE_URL'), { code: 'database_unconfigured' });
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
      min: process.env.NODE_ENV === 'production' ? 0 : 1,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000
    });
    pool.on('error', (error) => {
      if (error?.code || error?.message) console.error('PostgreSQL idle connection error', error.code || error.message);
    });
  }
  return pool;
};

const isTransientConnectionError = (error) => {
  const code = String(error?.code || '');
  const message = String(error?.message || '').toLowerCase();
  return ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN', '57P01', '08001', '08006'].includes(code)
    || message.includes('connection terminated')
    || message.includes('timeout expired');
};

const query = async (text, values, attempt = 0) => {
  try {
    return await getPool().query(text, values);
  } catch (error) {
    if (attempt || !isTransientConnectionError(error) || !pool) throw error;
    const stalePool = pool;
    pool = undefined;
    await stalePool.end().catch(() => undefined);
    return query(text, values, attempt + 1);
  }
};

const timedQuery = async (text, values, timing, attempt = 0) => {
  const totalStartedAt = process.hrtime.bigint();
  let client;
  try {
    const connectStartedAt = process.hrtime.bigint();
    try { client = await getPool().connect(); }
    finally { timing?.add('db_connect', Number(process.hrtime.bigint() - connectStartedAt) / 1e6); }
    const queryStartedAt = process.hrtime.bigint();
    try { return await client.query(text, values); }
    finally { timing?.add('db_query', Number(process.hrtime.bigint() - queryStartedAt) / 1e6); }
  } catch (error) {
    if (attempt || !isTransientConnectionError(error) || !pool) throw error;
    client?.release();
    client = undefined;
    const stalePool = pool;
    pool = undefined;
    await stalePool.end().catch(() => undefined);
    return timedQuery(text, values, timing, attempt + 1);
  } finally {
    client?.release();
    timing?.add('db', Number(process.hrtime.bigint() - totalStartedAt) / 1e6);
  }
};

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

module.exports = { databaseUrl, getPool, query, timedQuery, withTransaction, closeDatabase };
