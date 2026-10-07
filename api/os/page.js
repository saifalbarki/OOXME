const fs = require('fs/promises');
const path = require('path');
const { authenticateAndIssueCsrf } = require('../_lib/os-auth');

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

module.exports = async (request, response) => {
  if (request.method !== 'GET') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET');
    response.end('Method Not Allowed');
    return;
  }

  try {
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
  } catch (error) {
    console.error('OS page authentication unavailable', error.code || error.message);
    sendHtml(response, 'OS authentication unavailable', 503);
  }
};
