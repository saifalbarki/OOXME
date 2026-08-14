const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { query } = require('./db');

const filePromoPath = path.join(__dirname, '..', '..', 'data', 'promos.json');
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

async function loadPromoConfig(code) {
  const source = JSON.parse(await fs.readFile(filePromoPath, 'utf8'));
  if (!Array.isArray(source)) throw new Error('Invalid promo configuration');
  const promo = source.find((entry) => normalizePromoCode(entry.code) === normalizePromoCode(code));
  if (!promo) return null;
  const discount = promo.discount || {};
  const allowedDurations = promo.allowed_durations == null ? null : promo.allowed_durations.map(Number);
  if (!promo.code || !['public_promo', 'private_offer'].includes(promo.type) || !['percentage', 'fixed'].includes(discount.type) || !Number.isFinite(Number(discount.value)) || Number(discount.value) < 0 || !Array.isArray(promo.source_restrictions) || (promo.expires_at && Number.isNaN(Date.parse(promo.expires_at))) || (promo.max_uses != null && (!Number.isInteger(Number(promo.max_uses)) || Number(promo.max_uses) < 0)) || (allowedDurations && allowedDurations.some((duration) => !Number.isInteger(duration) || duration <= 0))) throw new Error('Invalid promo configuration');
  return { ...promo, code: normalizePromoCode(promo.code), discount: { ...discount, value: Number(discount.value) }, allowed_durations: allowedDurations };
}

function validateConfigForRequest(promo, { source, serviceCode, durationMinutes }) {
  if (!promo || !promo.active || !promo.source_restrictions.includes(source) || (promo.expires_at && Date.parse(promo.expires_at) < Date.now()) || (promo.allowed_durations && !promo.allowed_durations.includes(Number(durationMinutes)))) return null;
  const quote = calculateQuote(getBasePrice({ serviceCode, durationMinutes }), { discountType: promo.discount.type, discountValue: promo.discount.value, currency: promo.discount.currency });
  return { valid: true, type: promo.type === 'private_offer' ? 'offer_token' : 'file_promo', promoCode: promo.code, grantedDurationMinutes: promo.allowed_durations?.length === 1 ? promo.allowed_durations[0] : null, bookingDefaults: promo.booking_defaults || null, notificationMode: promo.notification_mode || 'final', maxUses: promo.max_uses == null ? null : Number(promo.max_uses), perCustomerLimit: promo.per_customer_limit == null ? null : Number(promo.per_customer_limit), quote };
}

async function validateFilePromotion({ promoCode, serviceCode = 'consultation', durationMinutes }) {
  const promo = await loadPromoConfig(promoCode);
  return validateConfigForRequest(promo, { source: 'promo_input', serviceCode, durationMinutes });
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
  const promo = await loadPromoConfig(token.promo_code_normalized);
  const validated = validateConfigForRequest(promo, { source: 'plan_cta', serviceCode, durationMinutes });
  if (!validated || promo.type !== 'private_offer') return { valid: false, error: 'offer_unavailable' };
  return { ...validated, offerTokenId: token.id, campaignSource: token.campaign_source };
}

async function validatePromotionInput({ promoCode, offerToken, offerSession, serviceCode = 'consultation', durationMinutes, execute = query }) {
  if (promoCode && offerToken) return { valid: false, error: 'multiple_promotions_not_allowed' };
  const offer = await validateOfferToken({ offerToken, offerSession, serviceCode, durationMinutes, execute });
  if (offer) return offer.valid ? ensurePromoUsageAvailable(offer, execute) : offer;
  if (promoCode) {
    const promotion = await validateFilePromotion({ promoCode, serviceCode, durationMinutes });
    return promotion ? ensurePromoUsageAvailable(promotion, execute) : { valid: false, error: 'promotion_unavailable' };
  }
  return { valid: true, type: 'none', quote: calculateQuote(getBasePrice({ serviceCode, durationMinutes }), { discountType: 'fixed', discountValue: 0 }) };
}

async function ensurePromoUsageAvailable(promotion, execute) {
  if (promotion.maxUses === null) return promotion;
  const result = await execute(`SELECT count(*)::int AS total FROM file_promo_redemptions WHERE promo_code_normalized = $1 AND status IN ('pending', 'redeemed')`, [promotion.promoCode]);
  return result.rows[0].total >= promotion.maxUses ? { valid: false, error: 'promotion_limit_reached' } : promotion;
}

const validatePromoOrToken = ({ serviceId, ...input }) => validatePromotionInput({ ...input, serviceCode: serviceId || input.serviceCode || 'consultation' });
module.exports = { calculateQuote, getBasePrice, hashOfferSession, hashToken, loadPromoConfig, normalizePromoCode, validateFilePromotion, validatePromoOrToken, validatePromotionInput };
