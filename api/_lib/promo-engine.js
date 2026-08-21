const crypto = require('crypto');
const { query } = require('./db');

const consultationPrices = new Map([[45, 25], [60, 40], [90, 60]]);
const normalizePromoCode = (value) => String(value || '').trim().toUpperCase();
const hashToken = (rawToken) => crypto.createHash('sha256').update(String(rawToken || '')).digest('hex');
const hashOfferSession = (session) => crypto.createHash('sha256').update(String(session || '')).digest('hex');
const money = (amount) => Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

function getBasePrice({ serviceCode = 'consultation', durationMinutes } = {}) {
  const duration = Number(durationMinutes);
  const amount = serviceCode === 'consultation' ? consultationPrices.get(duration) : undefined;
  if (amount === undefined) throw Object.assign(new Error('Unsupported service or consultation duration'), { code: 'unsupported_price' });
  return { amount, currency: 'USD', durationMinutes: duration, serviceCode };
}

function calculateQuote(basePrice, { discountType, discountValue, currency }) {
  if (discountType === 'fixed' && currency && currency !== basePrice.currency) throw Object.assign(new Error('Promotion currency does not match the service currency'), { code: 'promotion_currency_mismatch' });
  const raw = discountType === 'percentage' ? basePrice.amount * (Number(discountValue) / 100) : Number(discountValue);
  const discountAmount = money(Math.min(basePrice.amount, Math.max(0, raw)));
  return { baseAmount: basePrice.amount, discountAmount, finalAmount: money(basePrice.amount - discountAmount), currency: basePrice.currency, durationMinutes: basePrice.durationMinutes, serviceCode: basePrice.serviceCode };
}

const promotionColumns = `id, code_normalized, status, campaign_source, starts_at, ends_at,
  total_usage_limit, per_customer_limit, service_restrictions, duration_restrictions,
  discount_type, discount_value, currency, promotion_type, source_restrictions,
  booking_defaults, notification_mode, token_ttl_minutes`;
const asArray = (value) => Array.isArray(value) ? value : [];
const promotionFromRow = (row) => row && ({
  id: row.id,
  code: normalizePromoCode(row.code_normalized),
  status: row.status,
  campaign_source: row.campaign_source,
  starts_at: row.starts_at,
  expires_at: row.ends_at,
  max_uses: row.total_usage_limit == null ? null : Number(row.total_usage_limit),
  per_customer_limit: row.per_customer_limit == null ? null : Number(row.per_customer_limit),
  service_restrictions: asArray(row.service_restrictions),
  allowed_durations: asArray(row.duration_restrictions).map(Number),
  discount: { type: row.discount_type, value: Number(row.discount_value), currency: row.currency || null },
  type: row.promotion_type,
  source_restrictions: asArray(row.source_restrictions),
  booking_defaults: row.booking_defaults || null,
  notification_mode: row.notification_mode || 'final',
  token_ttl_minutes: row.token_ttl_minutes == null ? null : Number(row.token_ttl_minutes)
});

async function loadPromoConfig(code, execute = query) {
  const result = await execute(`SELECT ${promotionColumns} FROM promotions WHERE code_normalized = $1`, [normalizePromoCode(code)]);
  return promotionFromRow(result.rows[0]);
}

async function loadPromotionById(id, execute = query) {
  if (!id) return null;
  const result = await execute(`SELECT ${promotionColumns} FROM promotions WHERE id = $1`, [id]);
  return promotionFromRow(result.rows[0]);
}

function validateConfigForRequest(promo, { source, serviceCode, durationMinutes }) {
  const startsAt = promo?.starts_at ? Date.parse(promo.starts_at) : null;
  const endsAt = promo?.expires_at ? Date.parse(promo.expires_at) : null;
  if (!promo || promo.status !== 'active' || !promo.source_restrictions.includes(source) || (startsAt && startsAt > Date.now()) || (endsAt && endsAt < Date.now()) || (promo.service_restrictions.length && !promo.service_restrictions.includes(serviceCode)) || (promo.allowed_durations.length && !promo.allowed_durations.includes(Number(durationMinutes)))) return null;
  const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), { discountType: promo.discount.type, discountValue: promo.discount.value, currency: promo.discount.currency });
  return { valid: true, promotionId: promo.id, type: promo.type === 'private_offer' ? 'offer_token' : 'promo', promoCode: promo.code, grantedDurationMinutes: promo.allowed_durations.length === 1 ? promo.allowed_durations[0] : null, bookingDefaults: promo.booking_defaults, notificationMode: promo.notification_mode, maxUses: promo.max_uses, perCustomerLimit: promo.per_customer_limit, quote };
}

async function validatePromotion({ promoCode, serviceCode = 'consultation', durationMinutes, execute = query }) {
  const promo = await loadPromoConfig(promoCode, execute);
  return validateConfigForRequest(promo, { source: 'promo_input', serviceCode, durationMinutes });
}

async function validateOfferToken({ offerToken, offerSession, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (!offerToken) return null;
  const result = await execute(
    `SELECT id, campaign_source, service_code, promotion_id, issued_session_hash
       FROM offer_tokens WHERE token_hash = $1 AND status = 'issued' AND expires_at > now()`,
    [hashToken(offerToken)]
  );
  const token = result.rows[0];
  if (!token || token.service_code !== serviceCode || !offerSession || token.issued_session_hash !== hashOfferSession(offerSession)) return { valid: false, error: 'offer_unavailable' };
  const promo = await loadPromotionById(token.promotion_id, execute);
  const validated = validateConfigForRequest(promo, { source: 'plan_cta', serviceCode, durationMinutes });
  if (!validated || promo.type !== 'private_offer') return { valid: false, error: 'offer_unavailable' };
  return { ...validated, offerTokenId: token.id, campaignSource: token.campaign_source };
}

async function validatePromotionInput({ promoCode, offerToken, offerSession, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (promoCode && offerToken) return { valid: false, error: 'multiple_promotions_not_allowed' };
  const offer = await validateOfferToken({ offerToken, offerSession, serviceCode, durationMinutes, execute });
  if (offer) return offer.valid ? ensurePromoUsageAvailable(offer, execute) : offer;
  if (promoCode) {
    const promotion = await validatePromotion({ promoCode, serviceCode, durationMinutes, execute });
    return promotion ? ensurePromoUsageAvailable(promotion, execute) : { valid: false, error: 'promotion_unavailable' };
  }
  return { valid: true, type: 'none', quote: calculateQuote(getBasePrice({ serviceCode, durationMinutes }), { discountType: 'fixed', discountValue: 0 }) };
}

async function ensurePromoUsageAvailable(promotion, execute) {
  if (promotion.maxUses === null) return promotion;
  const result = await execute(`SELECT count(*)::int AS total FROM promotion_redemptions WHERE promotion_id = $1 AND status IN ('pending', 'redeemed')`, [promotion.promotionId]);
  return result.rows[0].total >= promotion.maxUses ? { valid: false, error: 'promotion_limit_reached' } : promotion;
}

const validatePromoOrToken = ({ serviceId, ...input }) => validatePromotionInput({ ...input, serviceCode: serviceId || input.serviceCode || 'consultation' });
module.exports = { calculateQuote, getBasePrice, hashOfferSession, hashToken, loadPromoConfig, normalizePromoCode, validatePromotion, validatePromoOrToken, validatePromotionInput };
