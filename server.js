const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { authenticateAndIssueCsrf } = require('./api/_lib/os-auth');

const root = __dirname;

// The LAN development server must be able to execute the real booking API
// locally. Node does not load dotenv files automatically, while Vercel injects
// these values for production functions. Load the ignored local env files only
// for non-production runs, without overriding explicitly provided variables.
if (process.env.NODE_ENV !== 'production' && typeof process.loadEnvFile === 'function') {
  const explicitEnv = new Set(Object.keys(process.env).filter((key) => process.env[key]));
  for (const file of ['.env.local', '.env.development.local']) {
    const envPath = path.join(root, file);
    if (fs.existsSync(envPath)) {
      try { process.loadEnvFile(envPath); } catch (_) { /* keep explicit env values */ }
    }
  }
  const osEnvPath = path.join(root, '.env.os.local');
  if (fs.existsSync(osEnvPath)) {
    // The OS file intentionally overrides same-name legacy provider values,
    // while variables explicitly supplied by the process still win.
    for (const line of fs.readFileSync(osEnvPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
      if (match && !explicitEnv.has(match[1])) delete process.env[match[1]];
    }
    try { process.loadEnvFile(osEnvPath); } catch (_) { /* keep explicit env values */ }
  }
}

const pageRoutes = {
  '/': 'main.html',
  '/bm': 'brand.html',
  '/gallery': 'gallery.html',
  '/space': 'space.html',
  '/update': 'update.html',
  '/consultation': 'consultation.html',
  '/store': 'store.html',
  '/os': 'os.html'
};
const legacyRoutes = { '/service': '/bm', '/start': '/update', '/scale': '/consultation', '/system': '/os', '/rpn': '/space' };
const publicRoots = ['assets', 'css', 'js', 'public'];
const publicRootFiles = new Set(['site.webmanifest', 'os.webmanifest']);
const apiRoutes = {
  '/api/booking/available-slots': './api/public',
  '/api/booking/availability': './api/public',
  '/api/booking/confirm': './api/booking/confirm',
  '/api/promo/validate': './api/public',
  '/api/products': './api/public',
  '/api/notifications/active': './api/public',
  '/api/runtime/bootstrap': './api/public',
  '/api/os/notifications': './api/os/notifications',
  '/api/os/promo-codes': './api/os/promo-codes',
  '/api/os/page-controls': './api/os/page-controls',
  '/api/os/insights': './api/os/insights',
  '/api/os/products': './api/os/products',
  '/api/os/consultations': './api/os/consultations',
  '/api/os/setup': './api/os/setup',
  '/api/os/auth': './api/os/auth',
  '/api/cron/insights-uptime': './api/cron/insights-uptime',
  '/api/cron/consultation-reminders': './api/cron/consultation-reminders'
};
const productionOrigin = process.env.OOXME_PRODUCTION_ORIGIN || 'https://www.ooxme.com';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const send = (response, status, type, body) => {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  response.end(body);
};

const compressibleType = (type) => /^(?:text\/|application\/(?:javascript|json|manifest\+json)|image\/svg\+xml)/i.test(type);
const sendStatic = (response, request, status, type, body) => {
  const source = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  const accepted = String(request.headers?.['accept-encoding'] || '');
  const finish = (encoding, error, output) => {
    const content = error ? source : output;
    const headers = {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
      'Content-Length': content.length
    };
    if (!error && encoding) {
      headers['Content-Encoding'] = encoding;
      headers.Vary = 'Accept-Encoding';
    }
    response.writeHead(status, headers);
    response.end(content);
  };
  if (!compressibleType(type) || source.length < 1024) return finish('', null, source);
  if (/\bbr\b/i.test(accepted)) {
    zlib.brotliCompress(source, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }, (error, output) => finish('br', error, output));
    return;
  }
  if (/\bgzip\b/i.test(accepted)) {
    zlib.gzip(source, { level: 6 }, (error, output) => finish('gzip', error, output));
    return;
  }
  finish('', null, source);
};

const sendOsHtml = (response, request, body, status = 200) => {
  const source = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  if (/\bbr\b/i.test(String(request.headers?.['accept-encoding'] || ''))) {
    const compressed = zlib.brotliCompressSync(source, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } });
    response.writeHead(status, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Encoding': 'br',
      'Vary': 'Accept-Encoding',
      'Content-Length': compressed.length
    });
    response.end(compressed);
    return;
  }
  if (/\bgzip\b/i.test(String(request.headers?.['accept-encoding'] || ''))) {
    const compressed = zlib.gzipSync(source);
    response.writeHead(status, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Encoding': 'gzip',
      'Vary': 'Accept-Encoding',
      'Content-Length': compressed.length
    });
    response.end(compressed);
    return;
  }
  response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(source);
};

// The login shell is a public document. Keep OS data and API routes protected,
// but return the shell as a successful document so browsers render its form
// instead of treating the unauthenticated navigation as a failed page load.
const sendOsLoginPage = (response, status = 200, request) => {
  fs.readFile(path.join(root, 'os-login.html'), (error, content) => {
    if (error) return send(response, 503, 'text/plain; charset=utf-8', 'OS login unavailable');
    sendOsHtml(response, request, content, status);
  });
};

const escapeHtmlAttribute = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const sendOsAuthenticatedPage = async (response, request, session) => {
  try {
    const content = await fs.promises.readFile(path.join(root, 'os.html'), 'utf8');
    const authenticatedDocument = content
      .replace('data-os-auth-state="pending"', `data-os-auth-state="authenticated" data-os-auth-ready="true" data-os-csrf-token="${escapeHtmlAttribute(session.csrfToken)}"`);
    sendOsHtml(response, request, authenticatedDocument);
  } catch (error) {
    send(response, 503, 'text/plain; charset=utf-8', 'OS authentication unavailable');
  }
};


const sendOsSetup = (response) => {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OOXME OS Setup</title><style>html,body{margin:0;min-height:100%;background:#fff;color:#111;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Rounded","Helvetica Neue",sans-serif}body{display:grid;place-items:center;padding:24px;box-sizing:border-box}.setup{width:min(100%,380px);display:grid;gap:16px}.setup h1{margin:0;font-size:20px;font-weight:500}.setup p{margin:0;color:#666;font-size:13px;line-height:1.4}.setup form{display:grid;gap:12px}.setup input,.setup button{box-sizing:border-box;width:100%;min-height:48px;border:1px solid #d8dbe2;border-radius:16px;padding:0 16px;font:inherit;font-size:16px}.setup button{border:0;background:#111;color:#fff;cursor:pointer}.error{min-height:1.2em;color:#9b3131;font-size:13px}</style></head><body><main class="setup"><h1>OOXME OS admin setup</h1><p>Set the admin password locally. Only a server-side scrypt hash is stored.</p><form><input type="password" name="password" autocomplete="new-password" minlength="12" placeholder="Password (12+ characters)" required><input type="password" name="confirm" autocomplete="new-password" minlength="12" placeholder="Confirm password" required><button type="submit">Configure securely</button><div class="error" role="alert"></div></form></main><script>const form=document.querySelector('form'),error=document.querySelector('.error');form.addEventListener('submit',async event=>{event.preventDefault();error.textContent='';const data=new FormData(form);if(data.get('password')!==data.get('confirm')){error.textContent='Passwords do not match';return}try{const response=await fetch('/api/os/setup',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({password:data.get('password')})});const body=await response.json();if(!response.ok)throw new Error(body.error||'setup_failed');form.reset();location.href='/os'}catch(exception){error.textContent=exception.message==='password_too_short'?'Use at least 12 characters':'Setup unavailable'}})</script></body></html>`;
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(body);
};

const readRequestBody = (request) => new Promise((resolve, reject) => {
  let body = '';
  let size = 0;
  const limit = 1024 * 1024;
  request.setEncoding('utf8');
  request.on('data', (chunk) => { size += Buffer.byteLength(chunk); if (size > limit) { reject(Object.assign(new Error('request_body_too_large'), { status: 413 })); request.destroy(); return; } body += chunk; });
  request.on('end', () => {
    if (!body) return resolve({});
    try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
  });
  request.on('error', reject);
});

const createApiResponse = (response) => ({
  status(statusCode) { response.statusCode = statusCode; return this; },
  setHeader(name, value) { response.setHeader(name, value); return this; },
  send(body) { response.end(body); }
});

const proxyProductionAvailability = async (response, requestUrl) => {
  try {
    const upstream = await fetch(`${productionOrigin}/api/booking/available-slots${requestUrl.search}`, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
    });
    const body = await upstream.text();
    response.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    response.end(body);
  } catch (error) {
    send(response, 503, 'application/json; charset=utf-8', JSON.stringify({ error: 'availability_proxy_unavailable' }));
  }
};

const hasLocalCalendarConfig = () => Boolean(
  process.env.GOOGLE_CALENDAR_ID
  && process.env.GOOGLE_OAUTH_CLIENT_ID
  && process.env.GOOGLE_OAUTH_CLIENT_SECRET
  && process.env.GOOGLE_OAUTH_REFRESH_TOKEN
);

const handleApiRequest = async (request, response, requestUrl) => {
  const modulePath = apiRoutes[requestUrl.pathname];
  if (!modulePath) return false;
  if (requestUrl.pathname === '/api/booking/available-slots' && process.env.NODE_ENV !== 'production' && !hasLocalCalendarConfig()) {
    await proxyProductionAvailability(response, requestUrl);
    return true;
  }
  try {
    request.query = Object.fromEntries(requestUrl.searchParams.entries());
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) request.body = await readRequestBody(request);
    const handler = require(modulePath);
    await handler(request, createApiResponse(response));
  } catch (error) {
    if (!response.headersSent) send(response, Number(error.status) || 400, 'application/json; charset=utf-8', JSON.stringify({ error: Number(error.status) === 413 ? 'request_body_too_large' : 'invalid_request' }));
  }
  return true;
};

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const requestPath = decodeURIComponent(requestUrl.pathname);
  if (apiRoutes[requestPath]) {
    void handleApiRequest(request, response, requestUrl);
    return;
  }
  if (legacyRoutes[requestPath]) {
    response.writeHead(308, { Location: `${legacyRoutes[requestPath]}${requestUrl.search}`, 'Cache-Control': 'no-cache' });
    response.end();
    return;
  }
  const page = pageRoutes[requestPath];

  if (requestPath === '/os/setup') {
    if (String(request.socket?.remoteAddress || '') === '127.0.0.1' || String(request.socket?.remoteAddress || '') === '::1' || String(request.socket?.remoteAddress || '') === '::ffff:127.0.0.1') return sendOsSetup(response);
    return send(response, 403, 'text/plain; charset=utf-8', 'Local setup only');
  }

  if (requestPath === '/os') {
    try {
      const session = await authenticateAndIssueCsrf(request);
       if (!session) return sendOsLoginPage(response, 200, request);
       return void sendOsAuthenticatedPage(response, request, session);
    } catch (error) {
      return send(response, Number(error.status) || 503, 'text/plain; charset=utf-8', 'OS authentication unavailable');
    }
  }

  let relative = page;
  if (!relative) {
    const cleanPath = requestPath.replace(/^\/+/, '');
    const firstSegment = cleanPath.split('/')[0];
    if (!publicRoots.includes(firstSegment) && !publicRootFiles.has(cleanPath)) {
      send(response, 404, 'text/plain; charset=utf-8', 'Not found');
      return;
    }
    relative = cleanPath;
  }

  const target = path.resolve(root, relative);
  if (!target.startsWith(`${root}${path.sep}`)) {
    send(response, 403, 'text/plain; charset=utf-8', 'Forbidden');
    return;
  }

  fs.readFile(target, (error, content) => {
    if (error) {
      send(response, 404, 'text/plain; charset=utf-8', 'Not found');
      return;
    }
    sendStatic(response, request, 200, types[path.extname(target).toLowerCase()] || 'application/octet-stream', content);
  });
});

const port = Number(process.env.PORT || 3000);
const activeLanIpv4 = () => Object.values(os.networkInterfaces())
  .flat()
  .find((address) => address && address.family === 'IPv4' && !address.internal)?.address;

const startServer = () => {
  server.listen(port, '0.0.0.0', () => {
    if (process.env.DATABASE_URL) {
      void require('./api/_lib/db').getPool().query('SELECT 1')
        .catch((error) => console.warn(`OOXME PostgreSQL warmup skipped: ${error.code || 'unavailable'}`));
    }
    if (process.env.OOXME_STARTUP_FLOW === '1') return;
    const lanAddress = activeLanIpv4();
    console.log(`OOXME static preview: http://localhost:${port}`);
    if (lanAddress) console.log(`OOXME LAN preview: http://${lanAddress}:${port}`);
  });
};

startServer();
