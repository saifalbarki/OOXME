const crypto = require('crypto');
const { promisify } = require('util');
const { query } = require('./db');

const scrypt = promisify(crypto.scrypt);
const sessionCookieName = 'ooxme_account_session';
const sessionLifetimeMs = 1000 * 60 * 60 * 8;
const tokenHash = (token) => crypto.createHash('sha256').update(String(token || '')).digest('hex');
const cookies = (header = '') => Object.fromEntries(header.split(';').map((value) => value.trim().split(/=(.*)/s)).filter(([key]) => key));

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await scrypt(String(password), salt, 64);
  return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

async function verifyPassword(password, encoded) {
  const [scheme, salt, expected] = String(encoded || '').split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = await scrypt(String(password), Buffer.from(salt, 'base64url'), 64);
  const target = Buffer.from(expected, 'base64url');
  return target.length === actual.length && crypto.timingSafeEqual(target, actual);
}

async function authenticate(username, password, execute = query) {
  const result = await execute(
    "SELECT id, username, password_hash, account_type, status FROM users WHERE lower(username) = lower($1) LIMIT 1",
    [String(username || '').trim()]
  );
  const user = result.rows[0];
  if (!user || user.status !== 'active' || !(await verifyPassword(password, user.password_hash))) return null;
  return { id: user.id, username: user.username, accountType: user.account_type };
}

async function createSession(userId, execute = query) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  await execute('INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)', [crypto.randomUUID(), userId, tokenHash(token), expiresAt]);
  await execute('UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1', [userId]);
  return { token, expiresAt };
}

async function sessionForToken(token, execute = query) {
  if (!token) return null;
  const result = await execute(
    `SELECT users.id, users.username, users.account_type, users.status
       FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = $1 AND sessions.revoked_at IS NULL AND sessions.expires_at > now()
      LIMIT 1`,
    [tokenHash(token)]
  );
  const user = result.rows[0];
  if (!user || user.status !== 'active') return null;
  return { id: user.id, username: user.username, accountType: user.account_type };
}

const sessionCookie = (token) => `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionLifetimeMs / 1000}${process.env.VERCEL ? '; Secure' : ''}`;
const clearSessionCookie = () => `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.VERCEL ? '; Secure' : ''}`;
const sessionFromRequest = (request) => sessionForToken(cookies(request.headers.cookie)[sessionCookieName]);

module.exports = { authenticate, clearSessionCookie, createSession, hashPassword, sessionCookie, sessionFromRequest, sessionForToken, verifyPassword };
