#!/usr/bin/env node

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const readline = require('readline');
const { execFile, execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const envFile = path.join(root, '.env.os.local');
const remainingOnly = process.argv.includes('--remaining');
const googleOnly = process.argv.includes('--google-only');
const providerKeys = new Set([
  'VERCEL_API_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_TEAM_ID',
  'YCLOUD_API_KEY', 'YCLOUD_WHATSAPP_FROM', 'YCLOUD_WABA_ID',
  'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ZONE_ID',
  'GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REFRESH_TOKEN', 'GOOGLE_OAUTH_REDIRECT_URI'
]);

if (typeof process.loadEnvFile === 'function') {
  for (const file of ['.env.os.local', '.env.local', '.env.development.local']) {
    const candidate = path.join(root, file);
    if (fs.existsSync(candidate)) {
      try { process.loadEnvFile(candidate); } catch (_) { /* validation reports missing configuration */ }
    }
  }
}

const fail = (message) => { throw new Error(message); };
const text = (value) => String(value ?? '').trim();
const json = async (response) => response.json().catch(() => ({}));
const apiError = (name, response, body) => `${name} rejected the request (${response.status})${body?.error?.message || body?.message ? `: ${body.error?.message || body.message}` : ''}`;

const ask = (question, fallback = '') => new Promise((resolve, reject) => {
  const interfaceHandle = readline.createInterface({ input: process.stdin, output: process.stdout });
  interfaceHandle.question(`${question}${fallback ? ` [${fallback}]` : ''}: `, (answer) => {
    interfaceHandle.close();
    resolve(text(answer) || fallback);
  });
  interfaceHandle.on('SIGINT', () => { interfaceHandle.close(); reject(new Error('cancelled')); });
});

const askSecret = (question) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return reject(new Error('Run this setup from a visible interactive terminal.'));
  const stdin = process.stdin;
  let value = '';
  const onData = (chunk) => {
    for (const character of String(chunk)) {
      if (character === '\u0003') {
        cleanup();
        reject(new Error('cancelled'));
        return;
      }
      if (character === '\r' || character === '\n') {
        cleanup();
        process.stdout.write('\n');
        if (value) return resolve(value);
        try {
          const clipboard = process.platform === 'win32'
            ? execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', 'Get-Clipboard -Raw'], { encoding: 'utf8', windowsHide: true })
            : '';
          resolve(text(clipboard));
        } catch (_) {
          resolve('');
        }
        return;
      }
      if (character === '\u007f' || character === '\b') {
        if (value) value = value.slice(0, -1);
        continue;
      }
      if (character >= ' ') value += character;
    }
  };
  const cleanup = () => {
    stdin.removeListener('data', onData);
    stdin.setRawMode(false);
    stdin.pause();
  };
  process.stdout.write(`${question}: `);
  stdin.setRawMode(true);
  stdin.setEncoding('utf8');
  stdin.resume();
  stdin.on('data', onData);
});

const readEnvLines = async () => {
  try { return (await fsp.readFile(envFile, 'utf8')).split(/\r?\n/); } catch (_) { return []; }
};

const persist = async (values) => {
  const lines = await readEnvLines();
  const seen = new Set();
  const next = lines.map((line) => {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=/);
    if (!match || !providerKeys.has(match[1]) || !(match[1] in values)) return line;
    seen.add(match[1]);
    return `${match[1]}=${values[match[1]]}`;
  });
  for (const [key, value] of Object.entries(values)) {
    if (!seen.has(key)) next.push(`${key}=${value}`);
  }
  while (next.length && next[next.length - 1] === '') next.pop();
  next.push('');
  await fsp.writeFile(envFile, next.join('\n'), { encoding: 'utf8', mode: 0o600 });
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const body = await json(response);
  return { response, body };
};

const verifyVercel = async (values) => {
  const token = values.VERCEL_API_TOKEN;
  const project = values.VERCEL_PROJECT_ID;
  const teamQuery = values.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(values.VERCEL_TEAM_ID)}` : '';
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  const projectResult = await request(`https://api.vercel.com/v9/projects/${encodeURIComponent(project)}${teamQuery}`, { headers });
  if (!projectResult.response.ok) fail(apiError('Vercel project lookup', projectResult.response, projectResult.body));
  const deploymentQuery = new URLSearchParams({ projectId: project, limit: '1' });
  if (values.VERCEL_TEAM_ID) deploymentQuery.set('teamId', values.VERCEL_TEAM_ID);
  const deployments = await request(`https://api.vercel.com/v6/deployments?${deploymentQuery}`, { headers });
  if (!deployments.response.ok || !deployments.body.deployments?.[0]) fail(apiError('Vercel deployment lookup', deployments.response, deployments.body));
  const latest = deployments.body.deployments[0];
  return { project: projectResult.body.name || project, status: latest.readyState || 'unknown', lastUpdate: latest.createdAt || null };
};

const ycloudItems = (body, keys) => {
  for (const key of keys) if (Array.isArray(body?.[key])) return body[key];
  if (Array.isArray(body)) return body;
  return [];
};

const verifyYCloud = async (values) => {
  const headers = { Accept: 'application/json', 'X-API-Key': values.YCLOUD_API_KEY };
  const accounts = await request('https://api.ycloud.com/v2/whatsapp/businessAccounts?limit=100', { headers });
  if (!accounts.response.ok) fail(apiError('YCloud business account lookup', accounts.response, accounts.body));
  const accountItems = ycloudItems(accounts.body, ['businessAccounts', 'items', 'data']);
  const numbers = await request('https://api.ycloud.com/v2/whatsapp/phoneNumbers?limit=100', { headers });
  if (!numbers.response.ok) fail(apiError('YCloud sender lookup', numbers.response, numbers.body));
  const phoneItems = ycloudItems(numbers.body, ['phoneNumbers', 'items', 'data']);
  const sender = phoneItems.find((item) => text(item.phoneNumber || item.displayPhoneNumber || item.number) === values.YCLOUD_WHATSAPP_FROM);
  if (!sender) fail('YCloud sender was not found for the supplied from number.');
  const status = text(sender.status).toUpperCase();
  if (!status) fail('YCloud sender did not return an operational status.');
  return { accounts: accountItems.length, senderStatus: status, wabaId: sender.wabaId || sender.businessAccountId || '' };
};

const verifyCloudflare = async (values) => {
  const headers = { Authorization: `Bearer ${values.CLOUDFLARE_API_TOKEN}`, Accept: 'application/json' };
  const token = await request('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers });
  if (!token.response.ok || token.body.success === false) fail(apiError('Cloudflare token verification', token.response, token.body));
  const account = await request(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(values.CLOUDFLARE_ACCOUNT_ID)}`, { headers });
  if (!account.response.ok || account.body.success === false) fail(apiError('Cloudflare account lookup', account.response, account.body));
  const zone = await request(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(values.CLOUDFLARE_ZONE_ID)}`, { headers });
  if (!zone.response.ok || zone.body.success === false) fail(apiError('Cloudflare zone lookup', zone.response, zone.body));
  return { account: account.body.result?.name || values.CLOUDFLARE_ACCOUNT_ID, zone: zone.body.result?.name || values.CLOUDFLARE_ZONE_ID, status: zone.body.result?.status || 'unknown' };
};

const googleRequest = async (accessToken, url, options = {}) => request(url, { ...options, headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) } });
const googleScopes = [
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const googleCallback = (redirectUri, clientId) => new Promise((resolve, reject) => {
  const parsed = new URL(redirectUri);
  const state = crypto.randomBytes(24).toString('hex');
  const server = http.createServer((requestMessage, responseMessage) => {
    const callback = new URL(requestMessage.url, redirectUri);
    if (callback.pathname !== parsed.pathname) return;
    if (callback.searchParams.get('state') !== state) {
      responseMessage.writeHead(400); responseMessage.end('Invalid OAuth state.'); server.close(); reject(new Error('Google OAuth state mismatch')); return;
    }
    const error = callback.searchParams.get('error');
    if (error) { responseMessage.writeHead(400); responseMessage.end('Google authorization was not completed.'); server.close(); reject(new Error(`Google authorization failed: ${error}`)); return; }
    responseMessage.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    responseMessage.end('OOXME authorization complete. You can return to the terminal.');
    server.close();
    resolve({ code: callback.searchParams.get('code'), state });
  });
  server.on('error', reject);
  server.listen(Number(parsed.port || 80), parsed.hostname, () => {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state, scope: googleScopes.join(' ') }).toString();
    fs.writeFileSync(path.join(require('os').tmpdir(), 'ooxme-google-oauth-url.txt'), authUrl.toString(), { encoding: 'utf8', mode: 0o600 });
    process.stdout.write(`Open this URL in a browser to authorize Google:\n${authUrl.toString()}\n`);
  });
});

const verifyGoogle = async () => {
  const tokenResponse = await request('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_OAUTH_CLIENT_ID, client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET, refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN, grant_type: 'refresh_token' })
  });
  if (!tokenResponse.response.ok || !tokenResponse.body.access_token) fail(`Google token exchange failed: ${tokenResponse.body.error || tokenResponse.response.status}`);
  const accessToken = tokenResponse.body.access_token;
  const gmail = await googleRequest(accessToken, 'https://gmail.googleapis.com/gmail/v1/users/me/profile');
  if (!gmail.response.ok) fail(apiError('Gmail verification', gmail.response, gmail.body));
  const calendar = await googleRequest(accessToken, 'https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1');
  if (!calendar.response.ok) fail(apiError('Google Calendar verification', calendar.response, calendar.body));
  const drive = await googleRequest(accessToken, 'https://www.googleapis.com/drive/v3/about?fields=user');
  if (!drive.response.ok) fail(apiError('Google Drive verification', drive.response, drive.body));
  return { gmail: true, calendar: true, drive: true };
};

const runProvider = async (name, collect, validate) => {
  process.stdout.write(`\n=== ${name} ===\n`);
  try {
    const values = await collect();
    const result = await validate(values);
    await persist(values);
    for (const [key, value] of Object.entries(values)) process.env[key] = value;
    process.stdout.write(`${name}: PASS (${Object.keys(result).map((key) => `${key}=${result[key]}`).join(', ')})\n`);
    return true;
  } catch (error) {
    process.stdout.write(`${name}: FAIL — ${error.message}\n`);
    return false;
  }
};

const main = async () => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) fail('Run `node scripts/configure-os-providers.js` from a visible local terminal.');
  process.stdout.write('OOXME secure provider setup\nCredentials are entered locally, never printed, and saved only to ignored .env.os.local after validation.\nPress Ctrl+C to cancel.\n');

  if (!remainingOnly && !googleOnly) {
    await runProvider('Vercel', async () => ({
      VERCEL_API_TOKEN: await askSecret('Vercel read-only API token'),
      VERCEL_PROJECT_ID: await ask('Vercel project ID', process.env.VERCEL_PROJECT_ID || ''),
      VERCEL_TEAM_ID: await ask('Vercel team ID (leave blank if not team-owned)', process.env.VERCEL_TEAM_ID || '')
    }), verifyVercel);

    await runProvider('YCloud', async () => ({
      YCLOUD_API_KEY: await askSecret('YCloud API key'),
      YCLOUD_WHATSAPP_FROM: await ask('YCloud WhatsApp sender/from number (E.164)', process.env.YCLOUD_WHATSAPP_FROM || '')
    }), verifyYCloud);
  }

  if (!googleOnly) {
    await runProvider('Cloudflare', async () => ({
      CLOUDFLARE_API_TOKEN: await askSecret('Cloudflare API token (Account Read + Zone Read only)'),
      CLOUDFLARE_ACCOUNT_ID: await ask('Cloudflare account ID', process.env.CLOUDFLARE_ACCOUNT_ID || ''),
      CLOUDFLARE_ZONE_ID: await ask('Cloudflare zone ID', process.env.CLOUDFLARE_ZONE_ID || '')
    }), verifyCloudflare);
  }

  process.stdout.write('\n=== Google ===\n');
  const clientId = await ask('Google OAuth client ID', process.env.GOOGLE_OAUTH_CLIENT_ID || '');
  const clientSecret = await askSecret('Google OAuth client secret');
  const redirectUri = await ask('Google OAuth redirect URI (must be registered on the client)', process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://127.0.0.1:41917/oauth2/callback');
  try {
    const callback = googleCallback(redirectUri, clientId);
    const { code } = await callback;
    const token = await request('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' })
    });
    if (!token.response.ok || !token.body.refresh_token) fail(`Google authorization code exchange failed: ${token.body.error || token.response.status}`);
    process.env.GOOGLE_OAUTH_CLIENT_ID = clientId;
    process.env.GOOGLE_OAUTH_CLIENT_SECRET = clientSecret;
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN = token.body.refresh_token;
    process.env.GOOGLE_OAUTH_REDIRECT_URI = redirectUri;
    const result = await verifyGoogle();
    await persist({ GOOGLE_OAUTH_CLIENT_ID: clientId, GOOGLE_OAUTH_CLIENT_SECRET: clientSecret, GOOGLE_OAUTH_REFRESH_TOKEN: token.body.refresh_token, GOOGLE_OAUTH_REDIRECT_URI: redirectUri });
    process.stdout.write(`Google: PASS (${Object.keys(result).join(', ')})\n`);
  } catch (error) {
    process.stdout.write(`Google: FAIL — ${error.message}\n`);
  }

  process.stdout.write('\nSetup complete. Restart the OOXME local server so it loads the validated provider configuration, then refresh /os.\n');
};

main().catch((error) => { process.stderr.write(`Setup stopped: ${error.message}\n`); process.exitCode = 1; });
