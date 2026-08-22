const crypto = require('crypto');
const { query, withTransaction } = require('./db');

const durations = new Set([45, 60, 90]);
const inputError = () => Object.assign(new Error('invalid_promotion_input'), { code: 'invalid_promotion_input' });
const values = ({ code, discount, duration, allowedUses }) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const discountValue = Number(discount);
  const durationValue = Number(duration);
  const rawUses = String(allowedUses ?? '').trim();
  const usageLimit = rawUses === '' ? null : Number(rawUses);
  if (!/^[A-Z0-9]{1,64}$/.test(normalizedCode) || !Number.isFinite(discountValue) || discountValue < 0 || discountValue > 100 || !durations.has(durationValue) || (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 0))) throw inputError();
  return { code: normalizedCode, discount: discountValue, duration: durationValue, allowedUses: usageLimit };
};

const list = async () => (await query(
  `SELECT id, code_normalized, status, discount_type, discount_value, duration_restrictions, total_usage_limit
     FROM promotions
    WHERE promotion_type = 'public_promo'
    ORDER BY created_at DESC`
)).rows;

const create = async (input) => {
  const promotion = values(input);
  return (await query(
    `INSERT INTO promotions (id, code_normalized, status, total_usage_limit, service_restrictions, duration_restrictions, discount_type, discount_value, promotion_type, source_restrictions)
     VALUES ($1, $2, 'active', $3, '["consultation"]'::jsonb, $4::jsonb, 'percentage', $5, 'public_promo', '["promo_input"]'::jsonb)
     RETURNING id`,
    [crypto.randomUUID(), promotion.code, promotion.allowedUses, JSON.stringify([promotion.duration]), promotion.discount]
  )).rows[0].id;
};

const update = async ({ id, ...input }) => {
  const promotion = values(input);
  const result = await query(
    `UPDATE promotions SET code_normalized = $1, total_usage_limit = $2, duration_restrictions = $3::jsonb, discount_type = 'percentage', discount_value = $4, updated_at = now()
      WHERE id = $5 AND promotion_type = 'public_promo'
      RETURNING id`,
    [promotion.code, promotion.allowedUses, JSON.stringify([promotion.duration]), promotion.discount, id]
  );
  if (!result.rowCount) {
    const error = new Error('promotion_not_found');
    error.code = 'promotion_not_found';
    throw error;
  }
  return result.rows[0].id;
};

const remove = async (id) => withTransaction(async (client) => {
  const promotion = await client.query('SELECT id FROM promotions WHERE id = $1 FOR UPDATE', [id]);
  if (!promotion.rowCount) {
    const error = new Error('promotion_not_found');
    error.code = 'promotion_not_found';
    throw error;
  }
  const references = await client.query(
    `SELECT
       (SELECT count(*) FROM bookings WHERE promotion_id = $1)::int AS bookings,
       (SELECT count(*) FROM promotion_redemptions WHERE promotion_id = $1)::int AS redemptions,
       (SELECT count(*) FROM offer_tokens WHERE promotion_id = $1)::int AS offers`,
    [id]
  );
  const counts = references.rows[0];
  if (counts.bookings || counts.redemptions || counts.offers) {
    await client.query("UPDATE promotions SET status = 'archived', updated_at = now() WHERE id = $1", [id]);
    return { outcome: 'archived' };
  }
  await client.query('DELETE FROM promotions WHERE id = $1', [id]);
  return { outcome: 'deleted' };
});

module.exports = { create, list, remove, update };
