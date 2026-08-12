const crypto = require('crypto');
const { query } = require('./db');

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

async function validateOfferToken({ offerToken, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (!offerToken) return null;
  const result = await execute(
    `SELECT id, campaign_source, service_code, granted_duration_minutes, discount_type, discount_value, currency
       FROM offer_tokens
      WHERE token_hash = $1
        AND status = 'issued'
        AND expires_at > now()`,
    [hashToken(offerToken)]
  );
  const token = result.rows[0];
  if (!token || token.service_code !== serviceCode || Number(token.granted_duration_minutes) !== Number(durationMinutes)) {
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
  if (!promotion || !appliesTo(promotion.service_restrictions, serviceCode) || !appliesTo(promotion.duration_restrictions, Number(durationMinutes))) {
    return { valid: false, error: 'promotion_unavailable' };
  }
  const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), {
    discountType: promotion.discount_type,
    discountValue: promotion.discount_value,
    currency: promotion.currency
  });
  return { valid: true, type: 'public_promo', promotionId: promotion.id, promoCode: promotion.code_normalized, quote };
}

async function validatePromotionInput({ promoCode, offerToken, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (promoCode && offerToken) return { valid: false, error: 'multiple_promotions_not_allowed' };
  const offer = await validateOfferToken({ offerToken, serviceCode, durationMinutes, execute });
  if (offer) return offer;
  const promotion = await validatePublicPromotion({ promoCode, serviceCode, durationMinutes, execute });
  if (promotion) return promotion;
  return { valid: true, type: 'none', quote: calculateQuote(getBasePrice({ serviceCode, durationMinutes }), { discountType: 'fixed', discountValue: 0 }) };
}

const validatePromoOrToken = ({ serviceId, ...input }) => validatePromotionInput({ ...input, serviceCode: serviceId || input.serviceCode || 'consultation' });

module.exports = { calculateQuote, getBasePrice, hashToken, normalizePromoCode, validatePromoOrToken, validatePromotionInput };
