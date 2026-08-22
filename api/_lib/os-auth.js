const crypto = require('crypto');

const cookieName = 'ooxme_os_session';
const maxAgeSeconds = 60 * 60 * 8;

const config = () => ({
  username: process.env.OOXME_OS_ADMIN_USERNAME,
  password: process.env.OOXME_OS_ADMIN_PASSWORD,
  secret: process.env.OOXME_OS_SESSION_SECRET
});

const configured = () => {
  const values = config();
  return Boolean(values.username && values.password && values.secret && values.secret.length >= 32);
};

const equal = (left, right) => {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const sign = (value, secret) => crypto.createHmac('sha256', secret).update(value).digest('base64url');

const issue = () => {
  const { secret } = config();
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + maxAgeSeconds * 1000 })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
};

const readCookie = (header = '') => Object.fromEntries(header.split(';').map(item => item.trim().split(/=(.*)/s)).filter(([key]) => key));

const valid = (request) => {
  if (!configured()) return false;
  const token = readCookie(request.headers.cookie)[cookieName];
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!equal(sign(payload, config().secret), signature)) return false;
  try { return Number(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp) > Date.now(); } catch { return false; }
};

const credentialsValid = (username, password) => {
  if (!configured()) return false;
  const values = config();
  return equal(username, values.username) && equal(password, values.password);
};

// Deliberately omit Max-Age/Expires: OS authentication ends with the browser
// session, while the signed token still enforces its server-side expiry.
const sessionCookie = () => `${cookieName}=${issue()}; Path=/; HttpOnly; SameSite=Strict${process.env.VERCEL ? '; Secure' : ''}`;
const clearCookie = () => `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.VERCEL ? '; Secure' : ''}`;

module.exports = { configured, valid, credentialsValid, sessionCookie, clearCookie };
