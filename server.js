const http = require('http');
const fs = require('fs');
const path = require('path');
const { configured, valid, credentialsValid, sessionCookie, clearCookie } = require('./api/_lib/os-auth');
const { login, dashboard } = require('./api/_lib/os-page');
const { allStatuses } = require('./api/_lib/os-status');
const accountAdmin = require('./api/_lib/account-admin');
const accountApi = require('./api/accounts/index');
const osApi = require('./api/os/index');

const root = __dirname;
const pageRoutes = { '/': 'index.html', '/brands': 'studio.html', '/gallery': 'selected-works.html', '/brand': 'brand-management-new.html', '/consultation': 'consultation.html', '/x': 'x.html', '/z': 'z.html' };
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const send = (response, status, headers, body = '') => { response.writeHead(status, headers); response.end(body); return true; };
const readBody = (request) => new Promise((resolve, reject) => { let raw = ''; request.on('data', chunk => { raw += chunk; if (raw.length > 10_000) request.destroy(); }); request.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (error) { reject(error); } }); request.on('error', reject); });
const localApiResponse = response => {
  let statusCode = 200;
  return {
    status(code) { statusCode = code; return this; },
    setHeader(name, value) { response.setHeader(name, value); return this; },
    json(body) { response.statusCode = statusCode; response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(body)); return this; },
    send(body) { response.statusCode = statusCode; response.end(body); return this; }
  };
};
const handleAccount = async (request, response, requestPath, query) => {
  if (!['/api/accounts/index', '/api/accounts/login', '/api/accounts/session', '/api/accounts/profile'].includes(requestPath)) return false;
  request.query = Object.fromEntries(query.entries());
  if (requestPath === '/api/accounts/login') request.query.route = 'login';
  if (requestPath === '/api/accounts/session') request.query.route = 'session';
  if (requestPath === '/api/accounts/profile') request.query.route = 'profile';
  if (request.method !== 'GET') request.body = await readBody(request);
  await accountApi(request, localApiResponse(response));
  return true;
};
const handleOs = async (request, response, requestPath, query) => {
  if (requestPath === '/os' || requestPath === '/os/') {
    if (!valid(request)) return send(response, 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Cookie' }, login());
    return send(response, 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Cookie' }, dashboard()); // Local preview only; production remains gated by api/os/index.js.
  }
  if (requestPath === '/api/os/login' && request.method === 'POST') {
    if (!configured()) return send(response, 503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"os_unconfigured"}');
    const body = await readBody(request);
    if (!credentialsValid(body.username, body.password)) return send(response, 401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"invalid_credentials"}');
    return send(response, 204, { 'Set-Cookie': sessionCookie(), 'Cache-Control': 'no-store' });
  }
  if (requestPath === '/api/os/logout' && request.method === 'POST') return send(response, 303, { Location: '/os', 'Set-Cookie': clearCookie(), 'Cache-Control': 'no-store' });
  if (requestPath === '/api/os/index' && query.get('route') === 'status' && request.method === 'GET') {
    if (!valid(request)) return send(response, 401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"unauthorized"}');
    return send(response, 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, JSON.stringify(await allStatuses()));
  }
  const osRoutes = { '/api/os/accounts': 'accounts', '/api/os/tasks': 'tasks', '/api/os/promotions': 'promotions', '/api/os/notifications': 'notifications' };
  if (osRoutes[requestPath]) {
    request.query = { route: osRoutes[requestPath] };
    if (request.method !== 'GET') request.body = await readBody(request);
    if (!valid(request)) return send(response, 401, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"unauthorized"}');
    await osApi(request, localApiResponse(response));
    return true;
  }
  return false;
};
const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const requestPath = decodeURIComponent(requestUrl.pathname);
  handleAccount(request, response, requestPath, requestUrl.searchParams).then(handled => { if (handled) return true; return handleOs(request, response, requestPath, requestUrl.searchParams); }).then(handled => { if (handled) return;
  if (path.extname(requestPath).toLowerCase() === '.html' || (!path.extname(requestPath) && !Object.hasOwn(pageRoutes, requestPath))) {
    return send(response, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not found');
  }
  const relative = pageRoutes[requestPath] || requestPath.replace(/^\/+/, '');
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
  const cleanRoute = !path.extname(relative) ? path.resolve(root, `${relative}.html`) : resolved;
  const target = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()
    ? path.join(resolved, 'index.html')
    : (fs.existsSync(resolved) ? resolved : cleanRoute);
  fs.readFile(target, (error, content) => {
    if (error) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Not found'); return; }
    const isHtml = path.extname(target).toLowerCase() === '.html';
    const isStandalonePreview = path.basename(target).toLowerCase() === 'x.html';
    const sharedTypography = '<script src="js/arabic-typography.js" defer></script>';
    const sharedNumericTypography = '<script src="js/numeric-typography.js" defer></script>';
    const pageWithTypography = isHtml && !isStandalonePreview && !content.includes(sharedTypography) ? content.toString('utf8').replace('</head>', sharedTypography + '</head>') : content;
    const page = isHtml && !isStandalonePreview && !pageWithTypography.includes(sharedNumericTypography) ? pageWithTypography.replace('</head>', sharedNumericTypography + '</head>') : pageWithTypography;
    response.writeHead(200, { 'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(page);
  });
  }).catch(() => send(response, 400, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, '{"error":"invalid_request"}'));
});
const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log(`OOXME static preview: http://localhost:${port}`));
