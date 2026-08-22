const crypto = require('crypto');
const { json, methodNotAllowed } = require('../_lib/http');
const { query, withTransaction } = require('../_lib/db');
const { hashOfferSession, hashToken, loadPromoConfig } = require('../_lib/promo-engine');

const fingerprint = (request) => crypto.createHash('sha256')
  .update(`${request.headers['x-forwarded-for'] || request.socket?.remoteAddress || ''}\u0000${request.headers['user-agent'] || ''}`)
  .digest('hex');

module.exports = async (request, response) => {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  try {
    const promo = await loadPromoConfig('FREE');
    if (!promo || promo.status !== 'active' || promo.type !== 'private_offer' || !promo.source_restrictions.includes('plan_cta') || !promo.allowed_durations || promo.allowed_durations.length !== 1 || !promo.campaign_source || !Number.isInteger(promo.token_ttl_minutes) || promo.token_ttl_minutes <= 0) return json(response, 503, { error: 'offer_unavailable' });
    const issuedSession = crypto.randomBytes(24).toString('base64url');
    const requestFingerprint = fingerprint(request);
    const token = crypto.randomBytes(32).toString('base64url');
    const result = await withTransaction(async (client) => {
      const recent = await client.query(
        `SELECT count(*)::int AS count FROM offer_tokens
          WHERE campaign_source = $1 AND request_fingerprint_hash = $2 AND created_at > now() - interval '1 hour'`,
        [promo.campaign_source, requestFingerprint]
      );
      if (recent.rows[0].count >= 3) return null;
      const expiresAt = new Date(Date.now() + promo.token_ttl_minutes * 60_000);
      await client.query(
        `INSERT INTO offer_tokens (id, token_hash, status, campaign_source, service_code, promotion_id, promo_code_normalized, granted_duration_minutes, discount_type, discount_value, issued_session_hash, request_fingerprint_hash, expires_at)
         VALUES ($1, $2, 'issued', $3, 'consultation', $4, $5, $6, $7, $8, $9, $10, $11)`,
        [crypto.randomUUID(), hashToken(token), promo.campaign_source, promo.id, promo.code, promo.allowed_durations[0], promo.discount.type, promo.discount.value, hashOfferSession(issuedSession), requestFingerprint, expiresAt]
      );
      return { expiresAt };
    });
    if (!result) return json(response, 429, { error: 'offer_request_limited' });
    return json(response, 201, { offerToken: token, offerSession: issuedSession, expiresAt: result.expiresAt.toISOString() });
  } catch (error) {
    console.error('offer issue failed', error.message);
    return json(response, 503, { error: 'offer_unavailable' });
  }
};
