const crypto = require('crypto');
const { query } = require('./db');

const audiences = new Set(['clients', 'employees', 'everyone']);
const statuses = new Set(['published', 'archived']);
const value = input => String(input || '').trim();
const date = input => {
  const parsed = new Date(input);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
};
const row = input => ({ ...input, publish_date: new Date(input.publish_date).toISOString(), valid_until: input.valid_until ? new Date(input.valid_until).toISOString() : null });

const list = async () => (await query('SELECT id, title, body, publish_date, valid_until, audience, status, version, created_at, updated_at FROM notifications ORDER BY publish_date DESC, created_at DESC')).rows.map(row);
const forAudience = async (accountType) => (await query(
  `SELECT id, title, body, publish_date, audience
     FROM notifications
    WHERE status = 'published' AND publish_date <= now() AND (valid_until IS NULL OR valid_until > now()) AND audience IN ($1, 'everyone')
    ORDER BY publish_date DESC, created_at DESC
    LIMIT 3`,
  [accountType === 'employee' ? 'employees' : 'clients']
)).rows.map(row);
const forPublic = async () => (await query(
  `SELECT id, title, body, publish_date, audience
     FROM notifications
    WHERE status = 'published' AND publish_date <= now() AND (valid_until IS NULL OR valid_until > now()) AND audience = 'everyone'
    ORDER BY publish_date DESC, created_at DESC
    LIMIT 3`
)).rows.map(row);

const create = async ({ title, body, publishDate, validUntil, audience, status = 'published' }) => {
  const published = date(publishDate);
  const validUntilDate = validUntil ? date(validUntil) : null;
  if (!value(title) || !value(body) || !published || (validUntil && (!validUntilDate || validUntilDate <= published)) || !audiences.has(audience) || !statuses.has(status)) {
    const error = new Error('invalid_notification_input'); error.code = 'invalid_notification_input'; throw error;
  }
  const result = await query(
    `INSERT INTO notifications (id, title, body, publish_date, valid_until, audience, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, body, publish_date, valid_until, audience, status, version, created_at, updated_at`,
    [crypto.randomUUID(), value(title), value(body), published, validUntilDate, audience, status]
  );
  return row(result.rows[0]);
};

const update = async ({ id, expectedVersion, title, body, publishDate, validUntil, audience, status = 'published' }) => {
  const published = date(publishDate);
  const validUntilDate = validUntil ? date(validUntil) : null;
  if (!id || !value(title) || !value(body) || !published || (validUntil && (!validUntilDate || validUntilDate <= published)) || !audiences.has(audience) || !statuses.has(status)) {
    const error = new Error('invalid_notification_input'); error.code = 'invalid_notification_input'; throw error;
  }
  const result = await query(
    `UPDATE notifications SET title = $1, body = $2, publish_date = $3, valid_until = $4, audience = $5, status = $6, version = version + 1, updated_at = now()
      WHERE id = $7 AND ($8::integer IS NULL OR version = $8)
      RETURNING id, title, body, publish_date, valid_until, audience, status, version, created_at, updated_at`,
    [value(title), value(body), published, validUntilDate, audience, status, id, expectedVersion ?? null]
  );
  if (!result.rowCount) { const error = new Error('notification_not_found'); error.code = 'notification_not_found'; throw error; }
  return row(result.rows[0]);
};

const remove = async (id) => {
  const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING id', [id]);
  if (!result.rowCount) { const error = new Error('notification_not_found'); error.code = 'notification_not_found'; throw error; }
};

module.exports = { create, forAudience, forPublic, list, remove, update };
