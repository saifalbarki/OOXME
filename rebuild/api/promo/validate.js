const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { validatePromotionInput } = require('../_lib/promo-engine');

module.exports = async (request, response) => {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  try {
    const input = await readJson(request);
    const result = await validatePromotionInput({
      promoCode: input.promoCode,
      offerToken: input.offerToken,
      offerSession: input.offerSession,
      serviceCode: input.serviceCode || 'consultation',
      durationMinutes: input.durationMinutes
    });
    if (!result.valid) return json(response, 400, { success: false, error: result.error });
    return json(response, 200, {
      success: true,
      data: {
        type: result.type,
        campaignSource: result.campaignSource || null,
        grantedDurationMinutes: result.grantedDurationMinutes || null,
        quote: result.quote
      }
    });
  } catch (error) {
    const status = error.code === 'unsupported_price' || error.code === 'promotion_currency_mismatch' ? 400 : 503;
    return json(response, status, { success: false, error: error.code || 'promotion_validation_unavailable' });
  }
};
