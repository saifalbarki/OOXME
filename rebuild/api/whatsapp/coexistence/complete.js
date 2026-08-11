const { json, methodNotAllowed, readJson } = require('../../_lib/http');
const { required, optional } = require('../../_lib/config');

async function exchangeCode(code) {
  const version = optional('WHATSAPP_GRAPH_API_VERSION', 'v22.0');
  const query = new URLSearchParams({ client_id: required('WHATSAPP_APP_ID'), client_secret: required('WHATSAPP_APP_SECRET'), code });
  const response = await fetch(`https://graph.facebook.com/${version}/oauth/access_token?${query}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) throw new Error(body.error?.message || 'Embedded Signup code exchange failed');
  return { token: body.access_token, version };
}

async function subscribeApp(wabaId, token, version) {
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(wabaId)}/subscribed_apps`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || 'Could not subscribe the app to this WABA');
  return body;
}

module.exports = async (request, response) => {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  try {
    const input = await readJson(request);
    const code = String(input.code || '');
    const wabaId = String(input.wabaId || '');
    const phoneNumberId = String(input.phoneNumberId || '');
    if (!code || !wabaId || !phoneNumberId) return json(response, 400, { error: 'missing_embedded_signup_result' });
    const { token, version } = await exchangeCode(code);
    await subscribeApp(wabaId, token, version);
    // Never return or persist the short-lived code-exchange token in a browser response.
    return json(response, 200, {
      connected: true,
      wabaId,
      phoneNumberId,
      existingIntegrationMatches: optional('WHATSAPP_WABA_ID') === wabaId && optional('WHATSAPP_PHONE_NUMBER_ID') === phoneNumberId
    });
  } catch (error) {
    console.error('coexistence completion failed', error.message);
    return json(response, 502, { error: 'coexistence_completion_failed' });
  }
};
