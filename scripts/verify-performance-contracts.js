const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const verifyStaticContracts = () => {
  const pages = ['main.html', 'brand.html', 'gallery.html', 'space.html', 'update.html', 'consultation.html', 'store.html', 'os.html'];
  const styles = ['css/main.css', 'css/brand-base.css', 'css/update-base.css', 'css/tokens.css'];
  const runtimeSources = [...pages, ...styles].map(read).join('\n');
  assert(!/assets\/fonts\/[^)'"?]+\.(?:ttf|otf)/i.test(runtimeSources), 'Legacy font formats remain referenced');
  assert(pages.every((page) => !read(page).includes('/assets/logo/Favicon.png')), 'Oversized favicon remains referenced');
  assert(pages.every((page) => read(page).includes('href="/favicon.svg"')), 'SVG favicon is not referenced by every page');
  assert(pages.every((page) => read(page).includes('href="/site.webmanifest"')), 'PWA manifest is not referenced by every page');
  assert(read('os-login.html').includes('href="/site.webmanifest"'), 'OS login shell is missing the PWA manifest');
  const pngDimensions = (file) => { const data = fs.readFileSync(path.join(root, file)); assert(data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${file} is not a PNG`); return [data.readUInt32BE(16), data.readUInt32BE(20)]; };
  assert.deepStrictEqual(pngDimensions('favicon-16x16.png'), [16, 16]);
  assert.deepStrictEqual(pngDimensions('favicon-32x32.png'), [32, 32]);
  assert.deepStrictEqual(pngDimensions('favicon-192x192.png'), [192, 192]);
  assert.deepStrictEqual(pngDimensions('favicon-512x512.png'), [512, 512]);
  assert.deepStrictEqual(pngDimensions('apple-touch-icon.png'), [180, 180]);
  assert(fs.readFileSync(path.join(root, 'favicon.ico')).subarray(0, 4).equals(Buffer.from([0, 0, 1, 0])), 'favicon.ico is not an ICO container');
  assert(!read('favicon.svg').includes('<image'), 'SVG favicon has an external raster dependency');
  assert(read('os.html').includes('href="css/os.css"'), 'OS stylesheet was not externalized');
  assert(read('os.html').includes('src="js/os.js"'), 'OS runtime was not externalized');
  assert(!read('os.html').includes('<style>'), 'OS still contains its stable inline stylesheet');
  assert(read('css/os.css').includes('--os-bottom-safe-inset: var(--os-safe-bottom)'), 'Browser bottom safe-area fallback was lost');
  assert(read('css/os.css').includes('html[data-os-standalone] { --os-bottom-safe-inset: var(--os-visual-bottom-inset); }'), 'Standalone OS bottom gap must use the single visual viewport source');
  const osRuntime = read('js/os.js');
  const osLogin = read('os-login.html');
  assert(osRuntime.includes('window.innerHeight || document.documentElement.clientHeight || root.getBoundingClientRect().height'), 'OS fixed-position layout viewport measurement was lost');
  assert(osRuntime.includes('const visibleBottom = viewport ? Math.min(layoutHeight, viewport.offsetTop + viewport.height) : layoutHeight'), 'OS VisualViewport bottom anchor calculation was lost');
  assert(osLogin.includes('window.innerHeight || document.documentElement.clientHeight || root.getBoundingClientRect().height'), 'OS login fixed-position layout viewport measurement was lost');
  assert(osLogin.includes('const visibleBottom = viewport ? Math.min(layoutHeight, viewport.offsetTop + viewport.height) : layoutHeight'), 'OS login VisualViewport bottom anchor calculation was lost');
  assert(osRuntime.indexOf('window.innerHeight || document.documentElement.clientHeight') < osRuntime.indexOf('const visibleBottom ='), 'OS layout viewport must be measured before the 100dvh root height');
  assert(osLogin.indexOf('window.innerHeight || document.documentElement.clientHeight') < osLogin.indexOf('const visibleBottom ='), 'OS login layout viewport must be measured before the 100dvh root height');
  assert(osRuntime.includes("root.toggleAttribute('data-os-standalone', isStandaloneApp)"), 'OS standalone coordinate mode is not shared');
  assert(osLogin.includes("root.toggleAttribute('data-os-standalone', isStandaloneApp)"), 'OS login standalone coordinate mode is not shared');
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
