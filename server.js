const http = require('http');
const fs = require('fs');
const path = require('path');
const { configured, valid, credentialsValid, sessionCookie, clearCookie } = require('./api/_lib/os-auth');
const { login, dashboard, accountManagement } = require('./api/_lib/os-page');
const { allStatuses } = require('./api/_lib/os-status');
const accountAdmin = require('./api/_lib/account-admin');

const distRoot = path.join(__dirname, 'dist');
const root = fs.existsSync(distRoot) ? distRoot : __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const send = (response, status, headers, body = '') => { response.writeHead(status, headers); response.end(body); };
const readBody = (request) => new Promise((resolve, reject) => { let raw = ''; request.on('data', chunk => { raw += chunk; if (raw.length > 10_000) request.destroy(); }); request.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (error) { reject(error); } }); request.on('error', reject); });
const handleOs = async (request, response, requestPath, query) => {
  if (requestPath === '/os' || requestPath === '/os/') {
    if (!valid(request)) return send(response, 303, { Location: '/os/login', 'Cache-Control': 'no-store' });
    return send(response, 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, dashboard());
  }
  if (requestPath === '/os/login' && request.method === 'GET') return send(response, 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, login());
  if (requestPath === '/os/accounts' && request.method === 'GET') {
    if (!valid(request)) return send(response, 303, { Location: '/os/login', 'Cache-Control': 'no-store' });
    return send(response, 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }, accountManagement());
  }
  if (requestPath === '/api/os/login' && request.method === 'POST') {
    if (!configured()) return send(response, 503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"os_unconfigured"}');
    const body = await readBody(request);
    if (!credentialsValid(body.username, body.password)) return send(response, 401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"invalid_credentials"}');
    return send(response, 204, { 'Set-Cookie': sessionCookie(), 'Cache-Control': 'no-store' });
  }
  if (requestPath === '/api/os/logout' && request.method === 'POST') return send(response, 303, { Location: query.get('returnTo') === '/' ? '/' : '/os/login', 'Set-Cookie': clearCookie(), 'Cache-Control': 'no-store' });
  if (requestPath === '/api/os/index' && query.get('route') === 'status' && request.method === 'GET') {
    if (!valid(request)) return send(response, 401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"unauthorized"}');
    return send(response, 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, JSON.stringify(await allStatuses()));
  }
  if (requestPath === '/api/os/accounts') {
    if (!valid(request)) return send(response, 401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"unauthorized"}');
    try {
      if (request.method === 'GET') return send(response, 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, JSON.stringify(await accountAdmin.list()));
      if (request.method !== 'POST') return send(response, 405, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"method_not_allowed"}');
      const body = await readBody(request);
      const actions = { create: accountAdmin.create, update: accountAdmin.update, reset_password: accountAdmin.resetPassword, set_status: accountAdmin.setStatus, delete: accountAdmin.remove };
      if (!actions[body.action]) return send(response, 400, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"invalid_account_action"}');
      const id = await actions[body.action](body);
      return send(response, 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, JSON.stringify({ ok: true, ...(id ? { id } : {}) }));
    } catch (error) {
      const status = error.code === '23505' ? 409 : error.code === 'account_not_found' ? 404 : 400;
      return send(response, status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, JSON.stringify({ error: error.code || 'account_action_failed' }));
    }
  }
  return false;
};
const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const requestPath = decodeURIComponent(requestUrl.pathname);
  handleOs(request, response, requestPath, requestUrl.searchParams).then(handled => { if (handled !== false) return;
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
  const cleanRoute = !path.extname(relative) ? path.resolve(root, `${relative}.html`) : resolved;
  const target = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()
    ? path.join(resolved, 'index.html')
    : (fs.existsSync(resolved) ? resolved : cleanRoute);
  fs.readFile(target, (error, content) => {
    if (error) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(content);
  });
  }).catch(() => send(response, 400, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"invalid_request"}'));
});
const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log(`OOXME static preview: http://localhost:${port}`));
