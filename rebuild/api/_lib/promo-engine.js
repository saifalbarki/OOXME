const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { query } = require('./db');

const filePromoPath = path.join(__dirname, '..', '..', 'data', 'promos.json');

const consultationPrices = new Map([
  [45, 25],
  [60, 40],
  [90, 60]
]);

const normalizePromoCode = (value) => String(value || '').trim().toUpperCase();
const hashToken = (rawToken) => crypto.createHash('sha256').update(String(rawToken || '')).digest('hex');

function getBasePrice({ serviceCode = 'consultation', durationMinutes } = {}) {
  const duration = Number(durationMinutes);
  const amount = serviceCode === 'consultation' ? consultationPrices.get(duration) : undefined;
  if (amount === undefined) {
    const error = new Error('Unsupported service or consultation duration');
    error.code = 'unsupported_price';
    throw error;
  }
  return { amount, currency: 'USD', durationMinutes: duration, serviceCode };
}

const appliesTo = (restrictions, value) => !Array.isArray(restrictions) || restrictions.length === 0 || restrictions.includes(value);
const money = (amount) => Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

function calculateQuote(basePrice, { discountType, discountValue, currency }) {
  if (discountType === 'fixed' && currency && currency !== basePrice.currency) {
    const error = new Error('Promotion currency does not match the service currency');
    error.code = 'promotion_currency_mismatch';
    throw error;
  }
  const rawDiscount = discountType === 'percentage'
    ? basePrice.amount * (Number(discountValue) / 100)
    : Number(discountValue);
  const discountAmount = money(Math.min(basePrice.amount, Math.max(0, rawDiscount)));
  return {
    baseAmount: basePrice.amount,
    discountAmount,
    finalAmount: money(basePrice.amount - discountAmount),
    currency: basePrice.currency,
    durationMinutes: basePrice.durationMinutes,
    serviceCode: basePrice.serviceCode
  };
}

const hashOfferSession = (session) => crypto.createHash('sha256').update(String(session || '')).digest('hex');

async function validateFilePromotion({ promoCode, serviceCode = 'consultation', durationMinutes }) {
  const code = normalizePromoCode(promoCode);
  if (!code) return null;
  const source = await fs.readFile(filePromoPath, 'utf8');
  const promotions = JSON.parse(source);
  if (!Array.isArray(promotions)) throw new Error('Invalid promo configuration');
  const promotion = promotions.find((entry) => normalizePromoCode(entry.code) === code && entry.active === true);
  if (!promotion) return null;
  const requiredDuration = promotion.duration_minutes == null ? null : Number(promotion.duration_minutes);
  if (!Number.isInteger(requiredDuration) || requiredDuration <= 0) {
    if (promotion.duration_minutes != null) throw new Error('Invalid promo configuration');
  }
  if (requiredDuration !== null && requiredDuration !== Number(durationMinutes)) {
    return { valid: false, error: 'promotion_unavailable' };
  }
  const discount = Number(promotion.discount);
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) throw new Error('Invalid promo configuration');
  const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), {
    discountType: 'percentage',
    discountValue: discount,
    currency: 'USD'
  });
  return { valid: true, type: 'file_promo', promoCode: code, discountPercent: discount, grantedDurationMinutes: requiredDuration, quote };
}

async function validateOfferToken({ offerToken, offerSession, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (!offerToken) return null;
  const result = await execute(
    `SELECT id, campaign_source, service_code, granted_duration_minutes, discount_type, discount_value, currency, issued_session_hash
       FROM offer_tokens
      WHERE token_hash = $1
        AND status = 'issued'
        AND expires_at > now()`,
    [hashToken(offerToken)]
  );
  const token = result.rows[0];
  if (!token || token.service_code !== serviceCode || Number(token.granted_duration_minutes) !== Number(durationMinutes) || !offerSession || token.issued_session_hash !== hashOfferSession(offerSession)) {
    return { valid: false, error: 'offer_unavailable' };
  }
  const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), {
    discountType: token.discount_type,
    discountValue: token.discount_value,
    currency: token.currency
  });
  return { valid: true, type: 'offer_token', offerTokenId: token.id, campaignSource: token.campaign_source, grantedDurationMinutes: Number(token.granted_duration_minutes), quote };
}

async function validatePublicPromotion({ promoCode, serviceCode = 'consultation', durationMinutes, execute = query }) {
  const code = normalizePromoCode(promoCode);
  if (!code) return null;
  const result = await execute(
    `SELECT id, code_normalized, service_restrictions, duration_restrictions, discount_type, discount_value, currency
       FROM promotions
      WHERE code_normalized = $1
        AND status = 'active'
        AND (starts_at IS NULL OR starts_at <= now())
        AND (ends_at IS NULL OR ends_at >= now())`,
    [code]
  );
  const promotion = result.rows[0];
  if (promotion) {
    if (!appliesTo(promotion.service_restrictions, serviceCode) || !appliesTo(promotion.duration_restrictions, Number(durationMinutes))) {
      return { valid: false, error: 'promotion_unavailable' };
    }
    const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), {
      discountType: promotion.discount_type,
      discountValue: promotion.discount_value,
      currency: promotion.currency
    });
    return { valid: true, type: 'public_promo', promotionId: promotion.id, promoCode: promotion.code_normalized, quote };
  }

  const legacyPromotion = await findLegacyPromo(code, execute);
  if (!legacyPromotion) return { valid: false, error: 'promotion_unavailable' };
  if (!isLegacyPromoActive(legacyPromotion) || !appliesTo(legacyPromotion.serviceRestrictions, serviceCode) || !appliesTo(legacyPromotion.durationRestrictions, Number(durationMinutes))) {
    return { valid: false, error: 'promotion_unavailable' };
  }
  const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), legacyPromotion);
  return { valid: true, type: 'public_promo', promotionId: legacyPromotion.id || null, promoCode: legacyPromotion.code, quote };
}

const legacyValue = (record, ...keys) => keys.map((key) => record[key]).find((value) => value !== undefined && value !== null);
const toArray = (value) => Array.isArray(value) ? value : value == null || value === '' ? [] : [value];

function isLegacyPromoActive(promotion) {
  if (promotion.status && String(promotion.status).toLowerCase() !== 'active') return false;
  if (promotion.isActive === false || String(promotion.isActive).toLowerCase() === 'false') return false;
  const now = Date.now();
  const startsAt = promotion.startsAt && Date.parse(promotion.startsAt);
  const endsAt = promotion.endsAt && Date.parse(promotion.endsAt);
  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
}

async function findLegacyPromo(code, execute) {
  try {
    // Some earlier deployments used a `promos` table. Keep it as a read-only
    // compatibility source while `promotions` remains the primary schema.
    const result = await execute(
      `SELECT to_jsonb(p) AS promo
         FROM promos p
        WHERE UPPER(COALESCE(to_jsonb(p)->>'code_normalized', to_jsonb(p)->>'code', to_jsonb(p)->>'promo_code')) = $1
        LIMIT 1`,
      [code]
    );
    const source = result.rows[0] && result.rows[0].promo;
    if (!source) return null;
    const percentage = legacyValue(source, 'discount_percent', 'discount_percentage', 'percentage', 'percent_off');
    const discountValue = legacyValue(source, 'discount_value', 'discount', 'amount') ?? percentage;
    return {
      id: legacyValue(source, 'id'),
      code,
      status: legacyValue(source, 'status'),
      isActive: legacyValue(source, 'is_active', 'active'),
      startsAt: legacyValue(source, 'starts_at', 'start_date', 'start_at'),
      endsAt: legacyValue(source, 'ends_at', 'end_date', 'end_at'),
      serviceRestrictions: toArray(legacyValue(source, 'service_restrictions', 'services', 'service_code')),
      durationRestrictions: toArray(legacyValue(source, 'duration_restrictions', 'durations', 'duration_minutes')),
      discountType: legacyValue(source, 'discount_type') || (percentage !== undefined ? 'percentage' : 'fixed'),
      discountValue,
      currency: legacyValue(source, 'currency')
    };
  } catch (error) {
    // PostgreSQL 42P01 means this compatibility table is not present.
    if (error.code === '42P01') return null;
    throw error;
  }
}

async function validatePromotionInput({ promoCode, offerToken, offerSession, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (promoCode && offerToken) return { valid: false, error: 'multiple_promotions_not_allowed' };
  const offer = await validateOfferToken({ offerToken, offerSession, serviceCode, durationMinutes, execute });
  if (offer) return offer;
  if (promoCode) {
    const filePromotion = await validateFilePromotion({ promoCode, serviceCode, durationMinutes });
    return filePromotion || { valid: false, error: 'promotion_unavailable' };
  }
  const promotion = await validatePublicPromotion({ promoCode, serviceCode, durationMinutes, execute });
  if (promotion) return promotion;
  return { valid: true, type: 'none', quote: calculateQuote(getBasePrice({ serviceCode, durationMinutes }), { discountType: 'fixed', discountValue: 0 }) };
}

const validatePromoOrToken = ({ serviceId, ...input }) => validatePromotionInput({ ...input, serviceCode: serviceId || input.serviceCode || 'consultation' });

module.exports = { calculateQuote, getBasePrice, hashOfferSession, hashToken, normalizePromoCode, validateFilePromotion, validatePromoOrToken, validatePromotionInput };
