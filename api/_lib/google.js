const { required } = require('./config');
const { performance } = require('perf_hooks');

let cachedToken;
let pendingToken;
const tokenIsFresh = () => cachedToken && cachedToken.expiresAt > Date.now() + 60_000;

async function googleAccessToken() {
  if (tokenIsFresh()) return cachedToken.value;
  if (!pendingToken) {
    pendingToken = (async () => {
      const clientId = required('GOOGLE_OAUTH_CLIENT_ID');
      const clientSecret = required('GOOGLE_OAUTH_CLIENT_SECRET');
      const refreshToken = required('GOOGLE_OAUTH_REFRESH_TOKEN');
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });
      const body = await response.json();
      if (!response.ok || !body.access_token) {
        throw new Error(`Google OAuth token request failed: ${body.error || response.status}`);
      }
      cachedToken = {
        value: body.access_token,
        expiresAt: Date.now() + (Number(body.expires_in || 3600) * 1000)
      };
      return cachedToken.value;
    })().finally(() => { pendingToken = undefined; });
  }
  return pendingToken;
}

async function googleFetch(url, options = {}, timing, providerMetric = 'provider') {
  const oauthStartedAt = performance.now();
  const token = await googleAccessToken();
  timing?.add('oauth', performance.now() - oauthStartedAt);
  const providerStartedAt = performance.now();
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
    });
  } finally {
    timing?.add(providerMetric, performance.now() - providerStartedAt);
  }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Google API request failed: ${body.error?.message || response.status}`);
    error.providerStatus = response.status;
    error.providerCode = body.error?.status || body.error?.code || '';
    throw error;
  }
  return body;
}

const calendarApi = (path, options, timing) => googleFetch(`https://www.googleapis.com/calendar/v3${path}`, options, timing, 'calendar');
const gmailApi = (path, options, timing) => googleFetch(`https://gmail.googleapis.com/gmail/v1${path}`, options, timing, 'gmail');
const driveApi = (path, options, timing) => googleFetch(`https://www.googleapis.com/drive/v3${path}`, options, timing, 'drive');

module.exports = { googleAccessToken, googleFetch, calendarApi, gmailApi, driveApi };
