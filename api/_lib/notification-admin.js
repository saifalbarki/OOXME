const crypto = require('crypto');
const { query } = require('./db');

const audiences = new Set(['clients', 'employees', 'everyone']);
const statuses = new Set(['published', 'archived']);
const value = input => String(input || '').trim();
const date = input => {
  const parsed = new Date(input);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
};
const row = input => ({ ...input, publish_date: new Date(input.publish_date).toISOString() });

const list = async () => (await query('SELECT id, title, body, publish_date, audience, status, created_at, updated_at FROM notifications ORDER BY publish_date DESC, created_at DESC')).rows.map(row);
const forAudience = async (accountType) => (await query(
  `SELECT id, title, body, publish_date, audience
     FROM notifications
    WHERE status = 'published' AND publish_date <= now() AND audience IN ($1, 'everyone')
    ORDER BY publish_date DESC, created_at DESC
    LIMIT 3`,
  [accountType === 'employee' ? 'employees' : 'clients']
)).rows.map(row);
const forPublic = async () => (await query(
  `SELECT id, title, body, publish_date, audience
     FROM notifications
    WHERE status = 'published' AND publish_date <= now() AND audience = 'everyone'
    ORDER BY publish_date DESC, created_at DESC
    LIMIT 3`
)).rows.map(row);

const create = async ({ title, body, publishDate, audience, status = 'published' }) => {
  const published = date(publishDate);
  if (!value(title) || !value(body) || !published || !audiences.has(audience) || !statuses.has(status)) {
    const error = new Error('invalid_notification_input'); error.code = 'invalid_notification_input'; throw error;
  }
  const result = await query(
    `INSERT INTO notifications (id, title, body, publish_date, audience, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, body, publish_date, audience, status, created_at, updated_at`,
    [crypto.randomUUID(), value(title), value(body), published, audience, status]
  );
  return row(result.rows[0]);
};

const update = async ({ id, title, body, publishDate, audience, status = 'published' }) => {
  const published = date(publishDate);
  if (!id || !value(title) || !value(body) || !published || !audiences.has(audience) || !statuses.has(status)) {
    const error = new Error('invalid_notification_input'); error.code = 'invalid_notification_input'; throw error;
  }
  const result = await query(
    `UPDATE notifications SET title = $1, body = $2, publish_date = $3, audience = $4, status = $5, updated_at = now()
      WHERE id = $6
      RETURNING id, title, body, publish_date, audience, status, created_at, updated_at`,
    [value(title), value(body), published, audience, status, id]
  );
  if (!result.rowCount) { const error = new Error('notification_not_found'); error.code = 'notification_not_found'; throw error; }
  return row(result.rows[0]);
};

const remove = async (id) => {
  const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING id', [id]);
  if (!result.rowCount) { const error = new Error('notification_not_found'); error.code = 'notification_not_found'; throw error; }
};

module.exports = { create, forAudience, forPublic, list, remove, update };
