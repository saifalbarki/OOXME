const crypto = require('crypto');
const { query, withTransaction } = require('./db');

const durations = new Set([45, 60, 90]);
const inputError = () => Object.assign(new Error('invalid_promotion_input'), { code: 'invalid_promotion_input' });
const values = ({ code, discount, duration, allowedUses, name, description }) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const discountValue = Number(discount);
  const durationValue = Number(duration);
  const rawUses = String(allowedUses ?? '').trim();
  const usageLimit = rawUses === '' ? null : Number(rawUses);
  if (!/^[A-Z0-9]{1,64}$/.test(normalizedCode) || !Number.isFinite(discountValue) || discountValue < 0 || discountValue > 100 || !durations.has(durationValue) || (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 0))) throw inputError();
  return { code: normalizedCode, discount: discountValue, duration: durationValue, allowedUses: usageLimit, name: String(name || '').trim() || null, description: String(description || '').trim() || null };
};

const list = async () => (await query(`SELECT id, discount_display_code, name, description, code_normalized, status, version, discount_type, discount_value, duration_restrictions, total_usage_limit FROM promotions WHERE promotion_type = 'public_promo' ORDER BY created_at DESC`)).rows;

const create = async (input) => {
  const promotion = values(input);
  return (await query(
    `INSERT INTO promotions (id, code_normalized, name, description, status, total_usage_limit, service_restrictions, duration_restrictions, discount_type, discount_value, promotion_type, source_restrictions)
     VALUES ($1, $2, $3, $4, 'active', $5, '["consultation"]'::jsonb, $6::jsonb, 'percentage', $7, 'public_promo', '["promo_input"]'::jsonb) RETURNING id`,
    [crypto.randomUUID(), promotion.code, promotion.name, promotion.description, promotion.allowedUses, JSON.stringify([promotion.duration]), promotion.discount]
  )).rows[0].id;
};

const update = async ({ id, expectedVersion, ...input }) => {
  const promotion = values(input);
  const result = await query(
    `UPDATE promotions SET code_normalized = $1, name = COALESCE($2, name), description = COALESCE($3, description), total_usage_limit = $4, duration_restrictions = $5::jsonb, discount_type = 'percentage', discount_value = $6, version = version + 1, updated_at = now()
      WHERE id = $7 AND promotion_type = 'public_promo' AND ($8::integer IS NULL OR version = $8) RETURNING id`,
    [promotion.code, promotion.name, promotion.description, promotion.allowedUses, JSON.stringify([promotion.duration]), promotion.discount, id, expectedVersion ?? null]
  );
  if (!result.rowCount) { const error = new Error('promotion_not_found'); error.code = 'promotion_not_found'; throw error; }
  return result.rows[0].id;
};

const remove = async (id) => withTransaction(async (client) => {
  const promotion = await client.query('SELECT id FROM promotions WHERE id = $1 FOR UPDATE', [id]);
  if (!promotion.rowCount) { const error = new Error('promotion_not_found'); error.code = 'promotion_not_found'; throw error; }
  const references = await client.query(`SELECT (SELECT count(*) FROM bookings WHERE promotion_id = $1)::int AS bookings, (SELECT count(*) FROM promotion_redemptions WHERE promotion_id = $1)::int AS redemptions, (SELECT count(*) FROM offer_tokens WHERE promotion_id = $1)::int AS offers`, [id]);
  const counts = references.rows[0];
  if (counts.bookings || counts.redemptions || counts.offers) {
    await client.query("UPDATE promotions SET status = 'archived', archived_at = now(), version = version + 1, updated_at = now() WHERE id = $1", [id]);
    return { outcome: 'archived' };
  }
  await client.query('DELETE FROM promotions WHERE id = $1', [id]);
  return { outcome: 'deleted' };
});

module.exports = { create, list, remove, update };
