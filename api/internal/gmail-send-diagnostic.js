const crypto = require('crypto');
const { json, methodNotAllowed } = require('../_lib/http');

const matchesSecret = (provided, expected) => {
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(String(provided));
  const expectedBuffer = Buffer.from(String(expected));
  return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

const sanitizedError = (status, body) => {
  const error = body?.error || body || {};
  return {
    httpStatus: status,
    error: {
      code: String(error.code || error.status || 'google_request_failed'),
      message: String(error.message || error.error_description || error.error || 'Google request failed').slice(0, 300)
    }
  };
};

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  if (process.env.VERCEL_ENV !== 'production') return json(response, 404, { error: 'not_found' });
  if (!matchesSecret(request.headers['x-ooxme-diagnostic-secret'], process.env.GOOGLE_OAUTH_DIAGNOSTIC_SECRET)) {
    return json(response, 401, { error: 'unauthorized' });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    return json(response, 200, { send: 'FAIL', httpStatus: null, messageId: null, error: { code: 'missing_configuration', message: 'Required Google OAuth configuration is missing.' } });
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
  });
  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenBody.access_token) {
    return json(response, 200, { send: 'FAIL', ...sanitizedError(tokenResponse.status, tokenBody), messageId: null });
  }

  const message = [
    'From: hello@ooxme.com',
    'To: hello@ooxme.com',
    'Subject: OOXME Email Test',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    'OOXME Gmail integration is working.'
  ].join('\r\n');
  const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBody.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: Buffer.from(message).toString('base64url') })
  });
  const sendBody = await sendResponse.json().catch(() => ({}));
  if (!sendResponse.ok || !sendBody.id) {
    return json(response, 200, { send: 'FAIL', ...sanitizedError(sendResponse.status, sendBody), messageId: null });
  }
  return json(response, 200, { send: 'PASS', httpStatus: sendResponse.status, messageId: sendBody.id, error: null });
};
