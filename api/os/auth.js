const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { authenticateAndIssueCsrf, changeCredentials, login, logout, requireAdmin, requireCsrf } = require('../_lib/os-auth');
const { setRequestId } = require('../_lib/os-audit');

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  setRequestId(request, response);
  try {
    if (request.method === 'GET') {
      const session = await authenticateAndIssueCsrf(request);
      if (!session) return json(response, 200, { success: true, data: { authenticated: false } });
      return json(response, 200, { success: true, data: { authenticated: true, csrfToken: session.csrfToken } });
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
    if (action === 'change_credentials') {
      const session = await requireAdmin(request);
      requireCsrf(request, session);
      await changeCredentials(request, response, body.currentPassword, body.user, body.newPassword, body.confirmPassword);
      return json(response, 200, { success: true, data: { authenticated: false } });
    }
    const result = await login(request, body.user, body.password);
    response.setHeader('Set-Cookie', result.cookie);
    return json(response, 200, { success: true, data: { authenticated: true, csrfToken: result.csrf, expiresIn: result.expiresIn } });
  } catch (error) {
    const status = Number(error.status) || 503;
    if (status >= 500) console.error('OS authentication request failed', error.code || error.message);
    return json(response, status, { success: false, error: status >= 500 ? 'authentication_unavailable' : error.code || 'authentication_failed' });
  }
};
