const fs = require('fs/promises');
const path = require('path');
const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { authenticateAndIssueCsrf, changeCredentials, login, logout, requireAdmin, requireCsrf } = require('../_lib/os-auth');
const { setRequestId } = require('../_lib/os-audit');

const root = path.resolve(__dirname, '..', '..');

const escapeHtmlAttribute = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const sendHtml = (response, content, status = 200) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(content);
};

const isPageRequest = (request) => {
  const url = new URL(request.url || '/', 'http://localhost');
  return url.searchParams.get('view') === 'page';
};

const sendAuthenticatedPage = async (request, response) => {
  const session = await authenticateAndIssueCsrf(request);
  const file = session ? 'os.html' : 'os-login.html';
  let content = await fs.readFile(path.join(root, file), 'utf8');
  if (session) {
    content = content.replace(
      'data-os-auth-state="pending"',
      `data-os-auth-state="authenticated" data-os-auth-ready="true" data-os-csrf-token="${escapeHtmlAttribute(session.csrfToken)}"`
    );
  }
  sendHtml(response, content);
};

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  setRequestId(request, response);
  try {
    if (request.method === 'GET' && isPageRequest(request)) {
      return await sendAuthenticatedPage(request, response);
    }
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
