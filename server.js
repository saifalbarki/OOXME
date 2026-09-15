const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = __dirname;

// The LAN development server must be able to execute the real booking API
// locally. Node does not load dotenv files automatically, while Vercel injects
// these values for production functions. Load the ignored local env files only
// for non-production runs, without overriding explicitly provided variables.
if (process.env.NODE_ENV !== 'production' && typeof process.loadEnvFile === 'function') {
  for (const file of ['.env.local', '.env.development.local']) {
    const envPath = path.join(root, file);
    if (fs.existsSync(envPath)) {
      try { process.loadEnvFile(envPath); } catch (_) { /* keep explicit env values */ }
    }
  }
}

const pageRoutes = {
  '/': 'main.html',
  '/bm': 'brand.html',
  '/rpn': 'rpn.html',
  '/update': 'update.html',
  '/consultation': 'consultation.html',
  '/store': 'store.html',
  '/os': 'os.html'
};
const publicRoots = ['assets', 'css', 'js', 'public'];
const publicRootFiles = new Set(['favicon.svg', 'site.webmanifest']);
const apiRoutes = {
  '/api/booking/available-slots': './api/booking/available-slots',
  '/api/booking/availability': './api/booking/availability',
  '/api/booking/confirm': './api/booking/confirm',
  '/api/promo/validate': './api/promo/validate'
};
const productionOrigin = process.env.OOXME_PRODUCTION_ORIGIN || 'https://www.ooxme.com';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
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

const readRequestBody = (request) => new Promise((resolve, reject) => {
  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => { body += chunk; });
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
    if (request.method === 'POST') request.body = await readRequestBody(request);
    const handler = require(modulePath);
    await handler(request, createApiResponse(response));
  } catch (error) {
    if (!response.headersSent) send(response, 400, 'application/json; charset=utf-8', JSON.stringify({ error: 'invalid_request' }));
  }
  return true;
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const requestPath = decodeURIComponent(requestUrl.pathname);
  if (apiRoutes[requestPath]) {
    void handleApiRequest(request, response, requestUrl);
    return;
  }
  const page = pageRoutes[requestPath];

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
    send(response, 200, types[path.extname(target).toLowerCase()] || 'application/octet-stream', content);
  });
});

const port = Number(process.env.PORT || 3000);
const activeLanIpv4 = () => Object.values(os.networkInterfaces())
  .flat()
  .find((address) => address && address.family === 'IPv4' && !address.internal)?.address;

server.listen(port, '0.0.0.0', () => {
  const lanAddress = activeLanIpv4();
  console.log(`OOXME static preview: http://localhost:${port}`);
  if (lanAddress) console.log(`OOXME LAN preview: http://${lanAddress}:${port}`);
});
