const crypto = require('crypto');
const { query } = require('./db');

const requestId = (request) => String(request.headers?.['x-request-id'] || crypto.randomUUID()).slice(0, 128);

const recordAudit = async ({ request, action, resourceType, resourceId = null, actor = 'admin', beforeState = null, afterState = null, result = 'success', metadata = {} }) => {
  await query(`INSERT INTO os_admin_audit_log
    (id, request_id, action, resource_type, resource_id, actor, before_state, after_state, result, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
    crypto.randomUUID(), requestId(request), action, resourceType, resourceId, actor,
    beforeState, afterState, result, JSON.stringify(metadata)
  ]);
};

const setRequestId = (request, response) => {
  const id = requestId(request);
  request.osRequestId = id;
  response.setHeader('X-Request-ID', id);
  return id;
};

module.exports = { recordAudit, requestId, setRequestId };
