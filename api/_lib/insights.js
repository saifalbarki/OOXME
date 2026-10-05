const { query } = require('./db');
const fs = require('fs');
const { calendarApi, driveApi, gmailApi } = require('./google');

const productionOrigin = () => String(process.env.OOXME_PRODUCTION_ORIGIN || 'https://www.ooxme.com').replace(/\/+$/, '');
const unknown = (reason = 'not_connected') => ({ status: 'unknown', reason });
const githubRepository = () => process.env.GITHUB_REPOSITORY
  || (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}` : 'saifalbarki/OOXME');

const githubLatest = async () => {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const url = `https://api.github.com/repos/${githubRepository()}/commits?per_page=1`;
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'OOXME-Insights', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  let response = await fetch(url, {
    headers
  });
  if ((response.status === 401 || response.status === 403) && token) response = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'OOXME-Insights' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body[0]?.sha) throw Object.assign(new Error('GitHub latest commit unavailable'), { code: `http_${response.status}` });
  return { sha: body[0].sha, committedAt: body[0].commit?.committer?.date || null };
};

const vercelLatest = async () => {
  const token = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  if (!token) throw Object.assign(new Error('Vercel read token unavailable'), { code: 'not_connected' });
  let projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) { try { projectId = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8')).projectId; } catch (_) {} }
  if (!projectId) throw Object.assign(new Error('Vercel project id unavailable'), { code: 'not_connected' });
  const params = new URLSearchParams({ projectId, limit: '1' });
  if (process.env.VERCEL_TEAM_ID) params.set('teamId', process.env.VERCEL_TEAM_ID);
  const response = await fetch(`https://api.vercel.com/v6/deployments?${params}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.deployments?.[0]) throw Object.assign(new Error('Vercel deployment metadata unavailable'), { code: `http_${response.status}` });
  const deployment = body.deployments[0];
  return { status: deployment.readyState === 'ERROR' ? 'attention' : 'operational', updatedAt: deployment.createdAt ? new Date(deployment.createdAt).toISOString() : null, deploymentId: deployment.uid || null };
};

const probeWebsite = async () => {
  const started = Date.now();
  try {
    const response = await fetch(productionOrigin(), { method: 'HEAD', redirect: 'follow' });
    return { isUp: response.ok, responseMs: Date.now() - started, statusCode: response.status };
  } catch (_) {
    return { isUp: false, responseMs: Date.now() - started, statusCode: null };
  }
};

const recordUptimeSample = async (sample) => {
  await query(
    `INSERT INTO os_uptime_samples (checked_at, is_up, response_ms, status_code)
     VALUES (now(), $1, $2, $3)`,
    [sample.isUp, sample.responseMs, sample.statusCode]
  );
};

const databaseHealth = async () => {
  try {
    await query('SELECT 1');
    return { status: 'operational', reason: null };
  } catch (_) {
    return unknown('database_unavailable');
  }
};

const uptimeSummary = async () => {
  try {
    const result = await query(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE is_up)::int AS healthy,
              max(checked_at) AS latest
         FROM os_uptime_samples
        WHERE checked_at >= now() - interval '24 hours'`
    );
    const row = result.rows[0];
    if (row.total < 288) return { value: null, reason: 'insufficient_history', samples: row.total, latest: row.latest };
    return { value: Number(((row.healthy / row.total) * 100).toFixed(2)), samples: row.total, latest: row.latest };
  } catch (_) {
    return { value: null, reason: 'monitoring_unavailable', samples: 0, latest: null };
  }
};

const providerCheck = async (name, work) => {
  try {
    await work();
    return { name, status: 'operational', reason: null };
  } catch (error) {
    return { name, ...unknown(error.code || error.providerCode || 'unavailable') };
  }
};

const serviceChecks = async (githubResult, vercelResult) => {
  const checks = [
    providerCheck('Vercel', async () => {
      if (!vercelResult && !process.env.VERCEL_GIT_COMMIT_SHA && !process.env.VERCEL_URL) throw Object.assign(new Error('Vercel deployment metadata unavailable'), { code: 'not_connected' });
    }),
    providerCheck('GitHub', async () => {
      if (!githubResult) throw Object.assign(new Error('GitHub latest commit unavailable'), { code: 'not_connected' });
    }),
    providerCheck('YCloud', async () => {
      if (!process.env.YCLOUD_API_KEY || !process.env.YCLOUD_WHATSAPP_FROM) throw Object.assign(new Error('YCloud credentials unavailable'), { code: 'not_connected' });
      const headers = { Accept: 'application/json', 'X-API-Key': process.env.YCLOUD_API_KEY };
      const accounts = await fetch('https://api.ycloud.com/v2/whatsapp/businessAccounts?limit=1', { headers });
      if (!accounts.ok) throw Object.assign(new Error('YCloud account status unavailable'), { code: `http_${accounts.status}` });
      const response = await fetch('https://api.ycloud.com/v2/whatsapp/phoneNumbers?limit=100', { headers });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw Object.assign(new Error('YCloud sender status unavailable'), { code: `http_${response.status}` });
      const numbers = body.phoneNumbers || body.items || body.data || [];
      const sender = numbers.find((item) => String(item.phoneNumber || item.displayPhoneNumber || item.number || '') === String(process.env.YCLOUD_WHATSAPP_FROM));
      if (!sender || !sender.status) throw Object.assign(new Error('YCloud sender status unavailable'), { code: 'sender_not_found' });
      if (['BANNED', 'BLOCKED', 'DISCONNECTED'].includes(String(sender.status).toUpperCase())) throw Object.assign(new Error('YCloud sender unavailable'), { code: 'sender_unavailable' });
    }),
    providerCheck('Cloudflare', async () => {
      if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_ZONE_ID) throw Object.assign(new Error('Cloudflare credentials unavailable'), { code: 'not_connected' });
      const headers = { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, Accept: 'application/json' };
      const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers });
      if (!response.ok) throw Object.assign(new Error('Cloudflare authorization failed'), { code: `http_${response.status}` });
      const account = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(process.env.CLOUDFLARE_ACCOUNT_ID)}`, { headers });
      if (!account.ok) throw Object.assign(new Error('Cloudflare account status unavailable'), { code: `http_${account.status}` });
      const zone = await fetch(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(process.env.CLOUDFLARE_ZONE_ID)}`, { headers });
      if (!zone.ok) throw Object.assign(new Error('Cloudflare zone status unavailable'), { code: `http_${zone.status}` });
    }),
    providerCheck('Gmail', async () => { await gmailApi('/users/me/profile'); }),
    providerCheck('Calendar', async () => { const body = await calendarApi('/users/me/calendarList?maxResults=1'); if (!body.items) throw new Error('calendar_unavailable'); }),
    providerCheck('Drive', async () => { await driveApi('/about?fields=user'); })
  ];
  return Promise.all(checks);
};

const insightsData = async () => {
  const sample = await probeWebsite();
  const database = await databaseHealth();
  let githubResult = null;
  try { githubResult = await githubLatest(); } catch (_) {}
  let vercelResult = null;
  try { vercelResult = await vercelLatest(); } catch (_) {}
  const [services, uptime] = await Promise.all([serviceChecks(githubResult, vercelResult), uptimeSummary()]);
  const serviceMap = Object.fromEntries(services.map((item) => [item.name, item]));
  const version = process.env.VERCEL_GIT_COMMIT_SHA || githubResult?.sha || null;
  return {
    services: serviceMap,
    database,
    website: {
      lastUpdate: vercelResult?.updatedAt || null,
      uptime: uptime.value === null ? null : `${uptime.value}%`,
      response: sample.responseMs === null ? null : `${sample.responseMs} ms`,
      version,
      responseStatus: sample.statusCode,
      uptimeSamples: uptime.samples
    }
  };
};

module.exports = { insightsData, probeWebsite, recordUptimeSample };
