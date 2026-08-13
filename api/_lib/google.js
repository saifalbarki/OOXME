const { required, optional } = require('./config');

let cachedToken;
const tokenIsFresh = () => cachedToken && cachedToken.expiresAt > Date.now() + 60_000;

async function googleAccessToken() {
  if (tokenIsFresh()) return cachedToken.value;
  const clientId = required('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = required('GOOGLE_OAUTH_CLIENT_SECRET');
  const refreshToken = required('GOOGLE_OAUTH_REFRESH_TOKEN');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) throw new Error(`Google OAuth token request failed: ${body.error || response.status}`);
  cachedToken = { value: body.access_token, expiresAt: Date.now() + (Number(body.expires_in || 3600) * 1000) };
  return cachedToken.value;
}

async function googleFetch(url, options = {}) {
  const token = await googleAccessToken();
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Google API request failed: ${body.error?.message || response.status}`);
  return body;
}

const calendarApi = (path, options) => googleFetch(`https://www.googleapis.com/calendar/v3${path}`, options);
const gmailApi = (path, options) => googleFetch(`https://gmail.googleapis.com/gmail/v1${path}`, options);
const driveApi = (path, options) => googleFetch(`https://www.googleapis.com/drive/v3${path}`, options);

module.exports = { googleAccessToken, googleFetch, calendarApi, gmailApi, driveApi };
