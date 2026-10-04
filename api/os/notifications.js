const crypto = require('crypto');
const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { query } = require('../_lib/db');
const { requireAdmin, requireCsrf } = require('../_lib/os-auth');
const { recordAudit, setRequestId } = require('../_lib/os-audit');
const { begin: beginIdempotency, complete: completeIdempotency } = require('../_lib/os-idempotency');

const frequencies = new Set(['once', 'daily', 'weekly', 'session', 'recurring']);

const serialize = (row) => ({
  id: row.id,
  title: { en: row.title, ar: row.title_ar || '' },
  text: { en: row.body, ar: row.body_ar || '' },
  publishAt: row.publish_date,
  version: row.version || 1,
  status: row.status === 'published' ? 'active' : row.status === 'archived' ? 'archived' : 'inactive',
  frequency: row.frequency === 'session' ? 'daily' : row.frequency === 'recurring' ? 'weekly' : row.frequency || 'once'
});

const requiredText = (value, field) => {
  const text = String(value ?? '').trim();
  if (!text) throw Object.assign(new Error(`${field}_required`), { status: 400 });
  return text;
};

const publishAt = (value) => {
  const date = new Date(String(value || ''));
  if (!value || Number.isNaN(date.getTime())) throw Object.assign(new Error('publish_at_invalid'), { status: 400 });
  return date.toISOString();
};

const input = (body) => {
  const frequency = String(body.frequency || 'once');
  if (!frequencies.has(frequency)) throw Object.assign(new Error('frequency_invalid'), { status: 400 });
  return {
    titleEn: requiredText(body.titleEn, 'title_en'),
    titleAr: String(body.titleAr || '').trim(),
    textEn: requiredText(body.textEn, 'text_en'),
    textAr: String(body.textAr || '').trim(),
    publishAt: publishAt(body.publishAt),
    frequency,
    status: body.status === 'inactive' ? 'inactive' : 'published'
  };
};

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(response, ['GET', 'POST']);
  setRequestId(request, response);
  try {
    const session = await requireAdmin(request);
    if (request.method === 'POST') requireCsrf(request, session);
    if (request.method === 'GET') {
      const result = await query(`SELECT id,title,body,title_ar,body_ar,publish_date,status,frequency,version
                                    FROM notifications
                                   WHERE status <> 'archived'
                                   ORDER BY publish_date DESC, updated_at DESC`);
      return json(response, 200, { success: true, data: { notifications: result.rows.map(serialize) } });
    }

    const body = await readJson(request);
    const action = String(body.action || '');
    if (action === 'delete' || action === 'archive') {
      const id = requiredText(body.id, 'id');
      const expectedVersion = Number.isInteger(Number(body.version)) ? Number(body.version) : null;
      const archived = await query(`UPDATE notifications SET status = 'archived', archived_at = now(), updated_at = now(), version = version + 1 WHERE id = $1 AND status <> 'archived' AND ($2::int IS NULL OR version = $2) RETURNING id`, [id, expectedVersion]);
      if (!archived.rowCount) return json(response, expectedVersion === null ? 404 : 409, { success: false, error: expectedVersion === null ? 'notification_not_found' : 'notification_conflict' });
      await recordAudit({ request, action: 'archive', resourceType: 'notification', resourceId: id }).catch(() => undefined);
      return json(response, 200, { success: true });
    }

    const values = input(body);
    if (action === 'create') {
      const idempotency = await beginIdempotency(request, 'notification:create', body);
      if (idempotency?.replay) return json(response, idempotency.status, idempotency.body);
      const result = await query(`INSERT INTO notifications
        (id,title,body,title_ar,body_ar,publish_date,status,frequency,audience)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id,title,body,title_ar,body_ar,publish_date,status,frequency,version`, [
        crypto.randomUUID(), values.titleEn, values.textEn, values.titleAr, values.textAr,
        values.publishAt, values.status, values.frequency, 'everyone'
      ]);
      const bodyResult = { success: true, data: { notification: serialize(result.rows[0]) } };
      await completeIdempotency(idempotency, { status: 201, body: bodyResult, resourceType: 'notification', resourceId: result.rows[0].id });
      await recordAudit({ request, action: 'create', resourceType: 'notification', resourceId: result.rows[0].id, afterState: serialize(result.rows[0]) }).catch(() => undefined);
      return json(response, 201, bodyResult);
    }

    if (action === 'update') {
      const id = requiredText(body.id, 'id');
      const expectedVersion = Number.isInteger(Number(body.version)) ? Number(body.version) : null;
      const result = await query(`UPDATE notifications
                                    SET title = $2, body = $3, title_ar = $4, body_ar = $5,
                                        publish_date = $6, status = $7, frequency = $8,
                                        updated_at = now(), version = version + 1
                                  WHERE id = $1 AND ($9::int IS NULL OR version = $9)
                                  RETURNING id,title,body,title_ar,body_ar,publish_date,status,frequency,version`, [
        id, values.titleEn, values.textEn, values.titleAr, values.textAr,
        values.publishAt, values.status, values.frequency, expectedVersion
      ]);
      if (!result.rows[0]) return json(response, expectedVersion === null ? 404 : 409, { success: false, error: expectedVersion === null ? 'notification_not_found' : 'notification_conflict' });
      await recordAudit({ request, action: 'update', resourceType: 'notification', resourceId: id, afterState: serialize(result.rows[0]) }).catch(() => undefined);
      return json(response, 200, { success: true, data: { notification: serialize(result.rows[0]) } });
    }

    return json(response, 400, { success: false, error: 'notification_action_invalid' });
  } catch (error) {
    const status = Number(error.status) || 503;
    if (status >= 500) console.error('OS notifications request failed', error.message);
    return json(response, status, { success: false, error: status >= 500 ? 'notifications_unavailable' : error.message });
  }
};
