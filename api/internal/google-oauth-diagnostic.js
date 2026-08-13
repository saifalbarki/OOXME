const crypto = require('crypto');
const { json, methodNotAllowed } = require('../_lib/http');

const noStore = (response) => response.setHeader('Cache-Control', 'no-store, max-age=0');

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

const googleRequest = async (url, accessToken, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
};

const testApi = async (url, accessToken) => {
  const { response, body } = await googleRequest(url, accessToken);
  return response.ok
    ? { status: 'PASS', httpStatus: response.status }
    : { status: 'FAIL', ...sanitizedError(response.status, body) };
};

module.exports = async (request, response) => {
  noStore(response);
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  if (process.env.VERCEL_ENV !== 'production') return json(response, 404, { error: 'not_found' });
  if (!matchesSecret(request.headers['x-ooxme-diagnostic-secret'], process.env.GOOGLE_OAUTH_DIAGNOSTIC_SECRET)) {
    return json(response, 401, { error: 'unauthorized' });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    return json(response, 200, { tokenExchange: { status: 'FAIL', httpStatus: null, error: { code: 'missing_configuration', message: 'Required Google OAuth configuration is missing.' } } });
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
  });
  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenBody.access_token) {
    return json(response, 200, { tokenExchange: { status: 'FAIL', ...sanitizedError(tokenResponse.status, tokenBody) } });
  }

  const token = tokenBody.access_token;
  // An empty send payload is intentionally invalid: a 400 response confirms Gmail accepted the bearer token and reached payload validation without sending any email.
  const gmailProbe = await googleRequest('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', token, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
  });
  const gmail = gmailProbe.response.status === 400
    ? { status: 'PASS', httpStatus: 400 }
    : gmailProbe.response.ok
      ? { status: 'FAIL', httpStatus: gmailProbe.response.status, error: { code: 'unexpected_success', message: 'Gmail probe unexpectedly accepted an empty payload.' } }
      : { status: 'FAIL', ...sanitizedError(gmailProbe.response.status, gmailProbe.body) };

  const [calendar, drive] = await Promise.all([
    testApi('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', token),
    testApi('https://www.googleapis.com/drive/v3/about?fields=user(permissionId)', token)
  ]);

  return json(response, 200, {
    tokenExchange: { status: 'PASS', httpStatus: tokenResponse.status },
    gmailSendAccess: gmail,
    calendarAccess: calendar,
    driveAccess: drive
  });
};
