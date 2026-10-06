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
  assert(pages.every((page) => read(page).includes('href="/assets/logo/Favicon.png"')), 'Original logo/Favicon.png is not referenced by every page');
  assert(pages.every((page) => !/href="\/(?:favicon(?:\.svg|\.ico|-\d+x\d+\.png)|apple-touch-icon\.png)/.test(read(page))), 'Generated favicon variants remain referenced');
  assert(pages.filter((page) => page !== 'os.html').every((page) => read(page).includes('href="/site.webmanifest"')), 'Website PWA manifest is not referenced by every public page');
  assert(read('os.html').includes('href="/os.webmanifest"'), 'OS is not using its dedicated PWA manifest');
  assert(read('os-login.html').includes('href="/os.webmanifest"'), 'OS login shell is missing the dedicated PWA manifest');
  const favicon = fs.readFileSync(path.join(root, 'assets/logo/Favicon.png'));
  assert(favicon.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'Original Favicon.png is not a PNG');
  assert.deepStrictEqual([favicon.readUInt32BE(16), favicon.readUInt32BE(20)], [4000, 4000]);
  assert(read('os.html').includes('href="css/os.css"'), 'OS stylesheet was not externalized');
  assert(read('os.html').includes('src="js/os.js"'), 'OS runtime was not externalized');
  assert(!read('os.html').includes('<style>'), 'OS still contains its stable inline stylesheet');
  assert(read('css/os.css').includes('--os-bottom-safe-inset: var(--os-safe-bottom)'), 'Browser bottom safe-area fallback was lost');
  assert(read('css/os.css').includes('html[data-os-standalone] { --os-bottom-safe-inset: var(--os-visual-bottom-inset); }'), 'Standalone OS bottom gap must use the single visual viewport source');
  const osRuntime = read('js/os.js');
  const osLogin = read('os-login.html');
  assert(osRuntime.includes('window.innerHeight || document.documentElement.clientHeight || root.getBoundingClientRect().height'), 'OS fixed-position layout viewport measurement was lost');
  assert(osRuntime.includes("root.style.setProperty('--os-viewport-height', `${layoutHeight}px`);"), 'OS standalone geometry must use the measured layout viewport height');
  assert(osRuntime.includes('const visibleBottom = viewport ? Math.min(layoutHeight, viewport.offsetTop + viewport.height) : layoutHeight'), 'OS VisualViewport bottom anchor calculation was lost');
  assert(osLogin.includes('window.innerHeight || document.documentElement.clientHeight || root.getBoundingClientRect().height'), 'OS login fixed-position layout viewport measurement was lost');
  assert(osLogin.includes("root.style.setProperty('--os-viewport-height', `${layoutHeight}px`);"), 'OS login standalone geometry must use the measured layout viewport height');
  assert(osLogin.includes('const visibleBottom = viewport ? Math.min(layoutHeight, viewport.offsetTop + viewport.height) : layoutHeight'), 'OS login VisualViewport bottom anchor calculation was lost');
  assert(osRuntime.indexOf('window.innerHeight || document.documentElement.clientHeight') < osRuntime.indexOf('const visibleBottom ='), 'OS layout viewport must be measured before the 100dvh root height');
  assert(osLogin.indexOf('window.innerHeight || document.documentElement.clientHeight') < osLogin.indexOf('const visibleBottom ='), 'OS login layout viewport must be measured before the 100dvh root height');
  assert(osRuntime.includes("root.toggleAttribute('data-os-standalone', isStandaloneApp)"), 'OS standalone coordinate mode is not shared');
  assert(osLogin.includes("root.toggleAttribute('data-os-standalone', isStandaloneApp)"), 'OS login standalone coordinate mode is not shared');
  assert(osLogin.indexOf('data-os-auth-form') < osLogin.indexOf('class="os-auth-separator"'), 'Login baseline must follow the form');
  assert(osRuntime.includes('authComposition.append(authForm, authSeparator)'), 'Authenticated OS baseline must follow the form');
  assert(read('css/os.css').includes('bottom: var(--os-bottom-gap); left: var(--os-outer-gap); display: grid; width: auto'), 'OS auth composition must use the shared bottom baseline');
  assert(read('css/os.css').includes('gap: calc(var(--x-spacing) - 4px)'), 'OS auth baseline spacing must match the Admin baseline spacing');
  assert(read('css/os.css').includes('right: 0; bottom: var(--x-spacing); left: 0; display: grid; align-content: end; width: auto; margin: 0'), 'Admin form must share the standard panel width');
  assert(read('css/os.css').includes('.os-admin-form .os-notification-main-action { justify-self: stretch; width: 100%;'), 'Admin action must share the standard panel width');
  assert(read('css/os.css').includes('.os-auth-composition { position: fixed; right: var(--os-outer-gap); bottom: var(--os-bottom-gap); left: var(--os-outer-gap); display: grid; width: auto;'), 'Login form must share the standard panel width');
  assert(read('css/os.css').includes('.os-auth-form > button[type="submit"] { justify-self: stretch; width: 100%;'), 'Login action must share the standard panel width');
  assert(read('css/os.css').includes('mask-image: url("/assets/icons/hugeicons/plus-sign.svg")'), 'OS Add actions must use the official PlusSignIcon asset');
  assert(osRuntime.includes('const statusLabel ='), 'OS generated statuses must use the localization helper');
  assert(osRuntime.includes('const durationLabel ='), 'OS generated duration values must use the localization helper');
  assert(osRuntime.includes('const nextLocalMinute ='), 'Notification forms must default to the next local minute');
  assert(osRuntime.includes('const localScheduleToIso ='), 'Notification scheduling must preserve the browser local timezone');
  assert(osRuntime.includes("Date.parse(publishAt) <= Date.now()"), 'Notification scheduling must reject past datetimes in the client');
  assert(osRuntime.includes("input[name=\"publishDate\"], input[name=\"publishTime\"]"), 'Notification schedule validation must clear when fields change');
  const osStyles = read('css/os.css');
  assert(osStyles.includes('--os-divider-spacing: calc(var(--x-spacing) * .5)'), 'OS dividers must use the shared spacing token');
  assert(osStyles.includes('.os-consultation-list { display: grid; gap: var(--os-divider-spacing);'), 'Consultation dividers must use shared spacing');
  assert(osStyles.includes('.os-promo-list { display: grid; gap: var(--os-divider-spacing);'), 'Promo dividers must use shared spacing');
  assert(osStyles.includes('.os-notification-list { display: grid; gap: var(--os-divider-spacing);'), 'Notification dividers must use shared spacing');
  const notificationsApi = read('api/os/notifications.js');
  assert(notificationsApi.includes("date.getTime() <= Date.now()"), 'Notification scheduling must reject past datetimes in the API');
  assert(read('css/space.css').includes('width: calc(100% - 2px)'), 'Space card tail width contract was lost');
  const databaseRuntime = read('api/_lib/db.js');
  const pooledQuery = databaseRuntime.slice(databaseRuntime.indexOf('const query ='), databaseRuntime.indexOf('const timedQuery ='));
  assert(!/\bclient\b/.test(pooledQuery), 'Pool query retry references an undefined client');
  const manifest = JSON.parse(read('site.webmanifest'));
  assert(manifest.icons.every((icon) => icon.src === '/assets/logo/Favicon.png' && icon.sizes === '4000x4000'), 'Website manifest is not using the original Favicon.png');
  const osManifest = JSON.parse(read('os.webmanifest'));
  assert.strictEqual(osManifest.id, '/os');
  assert.strictEqual(osManifest.start_url, '/os');
  assert.strictEqual(osManifest.scope, '/os');
  assert(osManifest.icons.every((icon) => icon.src === '/assets/logo/Favicon.png' && icon.sizes === '4000x4000'), 'OS manifest is not using the original Favicon.png');
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
