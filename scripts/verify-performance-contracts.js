const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const verifyStaticContracts = () => {
  const pages = ['main.html', 'brand.html', 'gallery.html', 'space.html', 'update.html', 'consultation.html', 'store.html'];
  const styles = ['css/main.css', 'css/brand-base.css', 'css/update-base.css', 'css/tokens.css'];
  const runtimeSources = [...pages, ...styles].map(read).join('\n');
  assert(!/assets\/fonts\/[^)'"?]+\.(?:ttf|otf)/i.test(runtimeSources), 'Legacy font formats remain referenced');
  assert(pages.every((page) => !read(page).includes('/assets/logo/Favicon.png')), 'Oversized favicon remains referenced');
  assert(read('os.html').includes('href="css/os.css"'), 'OS stylesheet was not externalized');
  assert(read('os.html').includes('src="js/os.js"'), 'OS runtime was not externalized');
  assert(!read('os.html').includes('<style>'), 'OS still contains its stable inline stylesheet');
  assert(read('css/os.css').includes('--os-bottom-safe-inset: max(var(--os-safe-bottom), var(--os-visual-bottom-inset))'), 'Approved standalone bottom inset was lost');
  const osRuntime = read('js/os.js');
  const osLogin = read('os-login.html');
  assert(osRuntime.includes('document.documentElement.clientHeight || window.innerHeight || root.getBoundingClientRect().height'), 'OS fixed-position layout viewport measurement was lost');
  assert(osRuntime.includes('const visibleBottom = viewport ? viewport.offsetTop + viewport.height : layoutHeight'), 'OS VisualViewport bottom anchor calculation was lost');
  assert(osLogin.includes('document.documentElement.clientHeight || window.innerHeight || root.getBoundingClientRect().height'), 'OS login fixed-position layout viewport measurement was lost');
  assert(read('css/space.css').includes('width: calc(100% - 2px)'), 'Space card tail width contract was lost');
  const databaseRuntime = read('api/_lib/db.js');
  const pooledQuery = databaseRuntime.slice(databaseRuntime.indexOf('const query ='), databaseRuntime.indexOf('const timedQuery ='));
  assert(!/\bclient\b/.test(pooledQuery), 'Pool query retry references an undefined client');
  const manifest = JSON.parse(read('site.webmanifest'));
  assert.deepStrictEqual(manifest.icons.map((icon) => icon.sizes), ['192x192', '512x512']);
  const gallery = read('gallery.html');
  assert.strictEqual((gallery.match(/loading="eager"/g) || []).length, 1, 'Gallery must have exactly one eager project image');
  assert.strictEqual((gallery.match(/\/07\.avif/g) || []).length, 5, 'Gallery initial images must use optimized AVIF assets');
};

const verifyTokenCoalescing = async () => {
  process.env.GOOGLE_OAUTH_CLIENT_ID = 'test-client';
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'test-secret';
  process.env.GOOGLE_OAUTH_REFRESH_TOKEN = 'test-refresh';
  const originalFetch = global.fetch;
  let tokenRequests = 0;
  global.fetch = async () => {
    tokenRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return { ok: true, status: 200, json: async () => ({ access_token: 'test-token', expires_in: 3600 }) };
  };
  try {
    delete require.cache[require.resolve('../api/_lib/google')];
    const { googleAccessToken } = require('../api/_lib/google');
    const tokens = await Promise.all(Array.from({ length: 8 }, () => googleAccessToken()));
    assert(tokens.every((token) => token === 'test-token'));
    assert.strictEqual(tokenRequests, 1, 'Concurrent OAuth refreshes were not coalesced');
    await googleAccessToken();
    assert.strictEqual(tokenRequests, 1, 'Fresh OAuth token was not reused');
  } finally {
    global.fetch = originalFetch;
  }
};

const verifyServerTiming = async () => {
  const headers = new Map();
  const response = { headersSent: false, setHeader: (name, value) => headers.set(name, value) };
  const { serverTiming } = require('../api/_lib/http');
  const timing = serverTiming(response);
  await timing.measure('db_query', async () => undefined);
  timing.finish();
  assert.match(headers.get('Server-Timing') || '', /db_query;dur=/);
  assert.match(headers.get('Server-Timing') || '', /app;dur=/);
};

(async () => {
  verifyStaticContracts();
  await verifyTokenCoalescing();
  await verifyServerTiming();
  console.log('Performance contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
