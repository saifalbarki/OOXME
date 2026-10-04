const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { authResponse, login, logout, requireAdmin, requireCsrf, sessionFromRequest } = require('../_lib/os-auth');
const { setRequestId } = require('../_lib/os-audit');
const crypto = require('crypto');
const { query } = require('../_lib/db');
const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  setRequestId(request, response);
  try {
    if (request.method === 'GET') {
      const session = await sessionFromRequest(request);
      if (!session) return json(response, 200, { success: true, data: { authenticated: false } });
      const csrfToken = crypto.randomBytes(32).toString('base64url');
      await query('UPDATE os_admin_sessions SET csrf_token_hash = $2, last_seen_at = now() WHERE session_id_hash = $1', [session.session_id_hash, sha256(csrfToken)]);
      return json(response, 200, { success: true, data: { authenticated: true, csrfToken } });
    }
    if (request.method !== 'POST') return methodNotAllowed(response, ['GET', 'POST']);
    const body = await readJson(request);
    const action = String(body.action || 'login');
    if (action === 'logout') {
      const session = await requireAdmin(request);
      requireCsrf(request, session);
      await logout(request, response);
      return json(response, 200, { success: true });
    }
    const result = await login(request, body.password);
    response.setHeader('Set-Cookie', result.cookie);
    return json(response, 200, { success: true, data: { authenticated: true, csrfToken: result.csrf, expiresIn: result.expiresIn } });
  } catch (error) {
    const status = Number(error.status) || 503;
    if (status >= 500) console.error('OS authentication request failed', error.code || error.message);
    return json(response, status, { success: false, error: status >= 500 ? 'authentication_unavailable' : error.code || 'authentication_failed' });
  }
};
