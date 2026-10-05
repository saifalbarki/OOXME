const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { requireAdmin } = require('./api/_lib/os-auth');

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
const publicRootFiles = new Set(['favicon.svg', 'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'site.webmanifest']);
const apiRoutes = {
  '/api/booking/available-slots': './api/public',
  '/api/booking/availability': './api/public',
  '/api/booking/confirm': './api/booking/confirm',
  '/api/promo/validate': './api/public',
  '/api/products': './api/public',
  '/api/notifications/active': './api/public',
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

const sendOsLogin = (response, status = 401) => {
  const body = `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#ffffff" data-os-theme-color><meta name="apple-mobile-web-app-status-bar-style" content="default" data-os-status-bar-style><title>OOXME OS</title><style>
:root{--os-outer-gap:max(18px,calc((100vw - 660px)/4));--x-spacing:var(--os-outer-gap);--os-viewport-height:100dvh;--os-closed-height:min(calc(var(--x-spacing)*5),var(--os-open-height));--os-open-height:calc(var(--os-viewport-height) - (var(--os-outer-gap)*2));--os-font-en:"SF Pro Rounded",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--os-font-ar:"SF Arabic Rounded","SF Arabic","SF Pro Rounded",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--os-font-family:var(--os-font-en);--os-page-background:#fff;--os-panel-background:#F1F3F7;--os-panel-color:#000;--os-control-color:var(--os-panel-color)}html[dir="rtl"]{--os-font-family:var(--os-font-ar)}html[data-theme="dark"]{--os-page-background:#000;--os-panel-background:#161616;--os-panel-color:#f5f5f5;--os-control-color:var(--os-panel-color)}@supports not (height:100dvh){:root{--os-viewport-height:100vh}}*{box-sizing:border-box}html,body{width:100%;height:100%;min-height:var(--os-viewport-height);margin:0;overflow:hidden;overscroll-behavior:none;background:var(--os-page-background);color:var(--os-control-color);font-family:var(--os-font-family);transition:background-color .24s ease,color .24s ease}body{touch-action:manipulation}.gate{position:fixed;right:var(--os-outer-gap);bottom:var(--os-outer-gap);left:var(--os-outer-gap);display:flex;box-sizing:border-box;width:auto;height:var(--os-closed-height);min-width:0;padding:calc(var(--x-spacing)*1.25) calc(var(--x-spacing)*1.5);align-items:center;justify-content:center;border-radius:clamp(42px,6vw,72px);background:var(--os-panel-background);color:var(--os-panel-color)}.gate form{display:grid;width:min(100%,280px);gap:8px}.gate input,.gate button{box-sizing:border-box;width:100%;font-family:var(--os-font-family);-webkit-tap-highlight-color:transparent;-webkit-appearance:none;appearance:none}.gate input{min-height:38px;padding:0 13px;border:1px solid color-mix(in srgb,var(--os-control-color) 14%,transparent);border-radius:14px;outline:0;background:transparent;color:var(--os-control-color);font-size:16px;font-weight:500;line-height:1}.gate input::placeholder{color:color-mix(in srgb,var(--os-control-color) 52%,transparent);opacity:1}.gate input:focus{border-color:color-mix(in srgb,var(--os-control-color) 34%,transparent);outline:0}.gate button{min-height:38px;padding:10px 14px;border:0;border-radius:999px;background:color-mix(in srgb,var(--os-panel-color) 8%,transparent);color:inherit;cursor:pointer;font-size:10px;font-weight:500;line-height:1}.gate button:focus:not(:focus-visible){outline:0;box-shadow:none}.error{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:480px){.gate{padding:calc(var(--x-spacing)*1.25) var(--x-spacing)}.gate form{width:100%}}@media (orientation:landscape) and (max-height:520px){.gate{height:auto;min-height:calc(var(--x-spacing)*3.5);padding:var(--x-spacing)}.gate form{grid-template-columns:minmax(0,1fr) auto;align-items:center;width:min(100%,420px)}.gate button{width:auto;min-width:84px}}:root{--os-x:18px;--os-outer-gap:var(--os-x);--x-spacing:var(--os-x)}
</style></head><body><main class="gate"><form><input type="password" name="password" autocomplete="current-password" aria-label="Admin password" placeholder="Password" required><button type="submit">Unlock</button><div class="error" role="alert" aria-live="polite"></div></form></main><script>
(()=>{const root=document.documentElement,themeColor=document.querySelector('[data-os-theme-color]'),statusBarStyle=document.querySelector('[data-os-status-bar-style]');try{const language=localStorage.getItem('ooxme-os-language')==='ar'?'ar':'en';root.lang=language;root.dir=language==='ar'?'rtl':'ltr';const theme=localStorage.getItem('ooxme-os-theme');const resolvedTheme=theme==='dark'||theme==='light'?theme:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');root.dataset.theme=resolvedTheme;themeColor?.setAttribute('content',resolvedTheme==='dark'?'#000000':'#ffffff');statusBarStyle?.setAttribute('content',resolvedTheme==='dark'?'black-translucent':'default')}catch(_){const resolvedTheme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';root.dataset.theme=resolvedTheme;themeColor?.setAttribute('content',resolvedTheme==='dark'?'#000000':'#ffffff');statusBarStyle?.setAttribute('content',resolvedTheme==='dark'?'black-translucent':'default')}const input=document.querySelector('input'),button=document.querySelector('button');const arabic=root.lang==='ar';input.placeholder=arabic?'كلمة المرور':'Password';input.setAttribute('aria-label',arabic?'كلمة المرور':'Admin password');button.textContent=arabic?'فتح':'Unlock';const form=document.querySelector('form'),error=document.querySelector('.error');form.addEventListener('submit',async event=>{event.preventDefault();error.textContent='';try{const response=await fetch('/api/os/auth',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'same-origin',body:JSON.stringify({action:'login',password:new FormData(form).get('password')})});const body=await response.json();if(!response.ok)throw new Error(body.error||'authentication_failed');location.reload()}catch(exception){error.textContent=exception.message==='login_temporarily_locked'?'Try again later':'Invalid password'}})})();
</script></body></html>`;
  response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(body);
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
      await requireAdmin(request);
    } catch (error) {
      if (Number(error.status) === 401) return sendOsLogin(response, 401);
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
