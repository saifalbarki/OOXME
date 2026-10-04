const crypto = require('crypto');
const { query } = require('./db');

const normalize = (value) => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce((result, key) => { result[key] = normalize(value[key]); return result; }, {});
  return value;
};
const canonical = (value) => JSON.stringify(normalize(value));
const begin = async (request, scope, body) => {
  const key = String(request.headers?.['idempotency-key'] || body.idempotencyKey || '').trim().slice(0, 128);
  if (!key) return null;
  const hash = crypto.createHash('sha256').update(canonical(body)).digest('hex');
  const inserted = await query(`INSERT INTO os_admin_idempotency (scope,idempotency_key,request_hash)
    VALUES ($1,$2,$3) ON CONFLICT (scope,idempotency_key) DO NOTHING RETURNING scope`, [scope, key, hash]);
  if (inserted.rowCount) return { scope, key, hash };
  const existing = await query('SELECT request_hash,response_status,response_body,resource_type,resource_id FROM os_admin_idempotency WHERE scope=$1 AND idempotency_key=$2', [scope, key]);
  const row = existing.rows[0];
  if (!row || row.request_hash !== hash) throw Object.assign(new Error('idempotency_key_reused'), { status: 409 });
  if (row.response_body) return { replay: true, status: row.response_status, body: row.response_body };
  throw Object.assign(new Error('request_already_processing'), { status: 409 });
};
const complete = async (entry, { status, body, resourceType = null, resourceId = null }) => {
  if (!entry || entry.replay) return;
  await query(`UPDATE os_admin_idempotency SET response_status=$3,response_body=$4,resource_type=$5,resource_id=$6 WHERE scope=$1 AND idempotency_key=$2`, [entry.scope, entry.key, status, body, resourceType, resourceId]);
};
module.exports = { begin, complete };
