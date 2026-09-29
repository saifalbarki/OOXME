const crypto = require('crypto');
const { query } = require('./db');

const consultationPrices = new Map([[45, 30], [60, 50], [90, 75], [120, 100]]);
const normalizePromoCode = (value) => String(value || '').trim().toUpperCase();
const hashToken = (rawToken) => crypto.createHash('sha256').update(String(rawToken || '')).digest('hex');
const hashOfferSession = (session) => crypto.createHash('sha256').update(String(session || '')).digest('hex');
const money = (amount) => Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
const RESERVATION_TTL_MINUTES = 15;

function getBasePrice({ serviceCode = 'consultation', durationMinutes } = {}) {
  const duration = Number(durationMinutes);
  const amount = serviceCode === 'consultation' ? consultationPrices.get(duration) : undefined;
  if (amount === undefined) throw Object.assign(new Error('Unsupported service or consultation duration'), { code: 'unsupported_price' });
  return { amount, currency: 'USD', durationMinutes: duration, serviceCode };
}

function calculateQuote(basePrice, { discountType, discountValue, currency }) {
  if (discountType === 'fixed' && currency && currency.trim() !== basePrice.currency) {
    throw Object.assign(new Error('Promotion currency does not match the service currency'), { code: 'promotion_currency_mismatch' });
  }
  const raw = discountType === 'percentage'
    ? basePrice.amount * (Number(discountValue) / 100)
    : Number(discountValue);
  const discountAmount = money(Math.min(basePrice.amount, Math.max(0, raw)));
  return {
    baseAmount: basePrice.amount,
    discountAmount,
    finalAmount: money(basePrice.amount - discountAmount),
    currency: basePrice.currency,
    durationMinutes: basePrice.durationMinutes,
    serviceCode: basePrice.serviceCode
  };
}

async function loadPromotion(code, execute = query) {
  const result = await execute(
    `SELECT id, code_normalized, status, campaign_source, starts_at, ends_at,
            total_usage_limit, per_customer_limit, service_restrictions,
            duration_restrictions, discount_type, discount_value, currency
       FROM promotions WHERE code_normalized = $1`,
    [normalizePromoCode(code)]
  );
  return result.rows[0] || null;
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; }
  }
  return [];
}

function validatePromotionForRequest(promo, { source = 'promo_input', serviceCode, durationMinutes }) {
  if (!promo || promo.status !== 'active') return null;
  const now = Date.now();
  if ((promo.starts_at && new Date(promo.starts_at).getTime() > now) || (promo.ends_at && new Date(promo.ends_at).getTime() <= now)) return null;
  if (promo.campaign_source && promo.campaign_source !== source) return null;
  const services = parseJsonArray(promo.service_restrictions);
  const durations = parseJsonArray(promo.duration_restrictions).map(Number);
  if (services.length && !services.includes(serviceCode)) return null;
  if (durations.length && !durations.includes(Number(durationMinutes))) return null;
  const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), {
    discountType: promo.discount_type,
    discountValue: Number(promo.discount_value),
    currency: promo.currency
  });
  return {
    valid: true,
    type: 'promotion',
    promotionId: promo.id,
    promoCode: promo.code_normalized,
    maxUses: promo.total_usage_limit == null ? null : Number(promo.total_usage_limit),
    perCustomerLimit: promo.per_customer_limit == null ? null : Number(promo.per_customer_limit),
    quote
  };
}

async function ensurePromoUsageAvailable(promotion, execute, customerHash = null) {
  const result = await execute(
    `SELECT count(*) FILTER (
              WHERE status = 'redeemed' OR (status = 'pending' AND reservation_expires_at > now())
            )::int AS total,
            count(*) FILTER (
              WHERE customer_identity_hash = $2 AND
                    (status = 'redeemed' OR (status = 'pending' AND reservation_expires_at > now()))
            )::int AS customer
       FROM promotion_redemptions WHERE promotion_id = $1`,
    [promotion.promotionId, customerHash]
  );
  const counts = result.rows[0];
  if ((promotion.maxUses !== null && counts.total >= promotion.maxUses) ||
      (customerHash && promotion.perCustomerLimit !== null && counts.customer >= promotion.perCustomerLimit)) {
    return { valid: false, error: 'promotion_limit_reached' };
  }
  return promotion;
}

async function validateOfferToken({ offerToken, offerSession, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (!offerToken) return null;
  const result = await execute(
    `SELECT id, campaign_source, service_code, promo_code_normalized, issued_session_hash
       FROM offer_tokens WHERE token_hash = $1 AND status = 'issued' AND expires_at > now()`,
    [hashToken(offerToken)]
  );
  const token = result.rows[0];
  if (!token || token.service_code !== serviceCode || !offerSession || token.issued_session_hash !== hashOfferSession(offerSession)) return { valid: false, error: 'offer_unavailable' };
  const promo = await loadPromotion(token.promo_code_normalized, execute);
  const validated = validatePromotionForRequest(promo, { source: 'plan_cta', serviceCode, durationMinutes });
  if (!validated) return { valid: false, error: 'offer_unavailable' };
  return { ...validated, type: 'offer_token', offerTokenId: token.id, campaignSource: token.campaign_source };
}

async function validatePromotionInput({ promoCode, offerToken, offerSession, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (promoCode && offerToken) return { valid: false, error: 'multiple_promotions_not_allowed' };
  await execute(
    `UPDATE promotion_redemptions
        SET status = 'released', released_at = now()
      WHERE status = 'pending' AND reservation_expires_at <= now()`
  );
  const basePrice = getBasePrice({ serviceCode, durationMinutes });
  const offer = await validateOfferToken({ offerToken, offerSession, serviceCode, durationMinutes, execute });
  if (offer) return offer.valid ? ensurePromoUsageAvailable(offer, execute) : offer;
  if (promoCode) {
    const promo = await loadPromotion(promoCode, execute);
    const promotion = validatePromotionForRequest(promo, { source: 'promo_input', serviceCode, durationMinutes });
    return promotion ? ensurePromoUsageAvailable(promotion, execute) : { valid: false, error: 'promotion_unavailable' };
  }
  return { valid: true, type: 'none', quote: calculateQuote(basePrice, { discountType: 'fixed', discountValue: 0 }) };
}

const validatePromoOrToken = ({ serviceId, ...input }) => validatePromotionInput({ ...input, serviceCode: serviceId || input.serviceCode || 'consultation' });

module.exports = {
  RESERVATION_TTL_MINUTES,
  calculateQuote,
  getBasePrice,
  hashOfferSession,
  hashToken,
  loadPromotion,
  normalizePromoCode,
  validatePromoOrToken,
  validatePromotionInput
};
