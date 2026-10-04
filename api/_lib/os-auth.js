const crypto = require('crypto');
const { query } = require('./db');

const SESSION_COOKIE = 'ooxme_os_session';
const SESSION_DAYS = 8;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

const required = (name) => {
  const value = process.env[name];
  if (!value) throw Object.assign(new Error(`${name}_missing`), { code: 'admin_auth_not_configured' });
  return value;
};

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const timingEqual = (left, right) => {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
};

const parseCookies = (request) => Object.fromEntries(String(request.headers?.cookie || '').split(';').map((part) => {
  const index = part.indexOf('=');
  return index < 0 ? ['', ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
}).filter(([key]) => key));

const passwordMatches = async (password, encoded) => {
  const [algorithm, nRaw, rRaw, pRaw, salt, expected] = String(encoded || '').split('$');
  if (algorithm !== 'scrypt' || !nRaw || !rRaw || !pRaw || !salt || !expected) return false;
  const derived = await new Promise((resolve, reject) => crypto.scrypt(String(password || ''), salt, 64, { N: Number(nRaw), r: Number(rRaw), p: Number(pRaw), maxmem: 128 * 1024 * 1024 }, (error, value) => error ? reject(error) : resolve(value.toString('hex'))));
  return timingEqual(derived, expected);
};

// Local LAN preview is plain HTTP even when legacy Vercel env markers are loaded.
// Only production HTTPS sessions should receive the Secure cookie attribute.
const cookie = (value, maxAge = SESSION_DAYS * 86400) => `${SESSION_COOKIE}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

const requestIp = (request) => String(request.headers?.['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim();
const rateKey = (request) => requestIp(request).slice(0, 128);

const attemptState = async (key) => {
  const result = await query('SELECT failed_attempts, locked_until FROM os_admin_login_attempts WHERE attempt_key = $1', [key]);
  const row = result.rows[0];
  if (!row || (row.locked_until && new Date(row.locked_until).getTime() <= Date.now())) return { failures: 0, lockedUntil: 0 };
  return { failures: Number(row.failed_attempts) || 0, lockedUntil: row.locked_until ? new Date(row.locked_until).getTime() : 0 };
};

const registerFailure = async (key) => {
  await query(`INSERT INTO os_admin_login_attempts (attempt_key, failed_attempts, locked_until, updated_at)
    VALUES ($1, 1, NULL, now())
    ON CONFLICT (attempt_key) DO UPDATE SET
      failed_attempts = os_admin_login_attempts.failed_attempts + 1,
      locked_until = CASE WHEN os_admin_login_attempts.failed_attempts + 1 >= $2 THEN now() + ($3 * interval '1 minute') ELSE os_admin_login_attempts.locked_until END,
      updated_at = now()`, [key, MAX_FAILURES, LOCK_MINUTES]);
};

const clearFailures = async (key) => { await query('DELETE FROM os_admin_login_attempts WHERE attempt_key = $1', [key]); };

const sessionFromRequest = async (request) => {
  const raw = parseCookies(request)[SESSION_COOKIE];
  if (!raw) return null;
  const result = await query(`SELECT session_id_hash, csrf_token_hash, expires_at
                                FROM os_admin_sessions
                               WHERE session_id_hash = $1
                                 AND revoked_at IS NULL
                                 AND expires_at > now()`, [sha256(raw)]);
  const session = result.rows[0];
  if (!session) return null;
  await query('UPDATE os_admin_sessions SET last_seen_at = now() WHERE session_id_hash = $1', [session.session_id_hash]);
  return { ...session, raw };
};

const requireAdmin = async (request) => {
  const session = await sessionFromRequest(request);
  if (!session) throw Object.assign(new Error('unauthorized'), { status: 401, code: 'unauthorized' });
  return session;
};

const requireCsrf = (request, session) => {
  const token = request.headers?.['x-csrf-token'];
  if (!token || !timingEqual(sha256(token), session.csrf_token_hash)) throw Object.assign(new Error('csrf_invalid'), { status: 403, code: 'csrf_invalid' });
};

const login = async (request, password) => {
  const key = rateKey(request);
  const current = await attemptState(key);
  if (current.lockedUntil > Date.now()) throw Object.assign(new Error('login_temporarily_locked'), { status: 429, code: 'login_temporarily_locked' });
  const valid = await passwordMatches(password, required('OS_ADMIN_PASSWORD_HASH'));
  if (!valid) {
    await registerFailure(key);
    throw Object.assign(new Error('invalid_credentials'), { status: 401, code: 'invalid_credentials' });
  }
  await clearFailures(key);
  const rawSession = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(32).toString('base64url');
  await query(`INSERT INTO os_admin_sessions (session_id_hash, csrf_token_hash, expires_at)
               VALUES ($1, $2, now() + ($3 * interval '1 day'))`, [sha256(rawSession), sha256(csrf), SESSION_DAYS]);
  return { cookie: cookie(rawSession), csrf, expiresIn: SESSION_DAYS * 86400 };
};

const logout = async (request, response) => {
  const raw = parseCookies(request)[SESSION_COOKIE];
  if (raw) await query('UPDATE os_admin_sessions SET revoked_at = now() WHERE session_id_hash = $1', [sha256(raw)]);
  response.setHeader('Set-Cookie', cookie('', 0));
};

const authResponse = (response, status, body) => {
  response.status(status).setHeader('Cache-Control', 'no-store');
  response.send(JSON.stringify(body));
};

module.exports = { SESSION_COOKIE, authResponse, login, logout, requireAdmin, requireCsrf, sessionFromRequest, requestIp };
