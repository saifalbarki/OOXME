const withTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try { return await fetch(url, { ...options, signal: controller.signal }); } finally { clearTimeout(timer); }
};
const { gmailApi, calendarApi, driveApi } = require('./google');
const { query } = require('./db');
const short = (value, limit) => String(value || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
const messageHeaders = message => Object.fromEntries((message.payload?.headers || []).map(({ name, value }) => [String(name).toLowerCase(), value]));

const website = async () => {
  try {
    let response = await withTimeout('https://ooxme.com', { method: 'HEAD', redirect: 'follow' });
    if (response.status === 405) response = await withTimeout('https://ooxme.com', { method: 'GET', redirect: 'follow' });
    return { state: response.ok ? 'healthy' : 'error', label: response.ok ? 'Healthy' : `HTTP ${response.status}`, detail: `HTTP ${response.status}` };
  } catch { return { state: 'error', label: 'Unavailable', detail: 'Health check failed' }; }
};

const vercel = async () => {
  const token = process.env.OOXME_OS_VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID || process.env.OOXME_OS_VERCEL_PROJECT_ID;
  if (!token || !projectId) return { state: 'unavailable', label: 'Not configured', detail: 'Server-side Vercel access required' };
  try {
    const response = await withTimeout(`https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(projectId)}&target=production&limit=1`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return { state: 'error', label: `API HTTP ${response.status}`, detail: 'Deployment status unavailable' };
    const deployment = (await response.json()).deployments?.[0];
    if (!deployment) return { state: 'unavailable', label: 'No deployment', detail: 'No Production deployment found' };
    return { state: String(deployment.readyState || 'UNKNOWN').toLowerCase(), label: String(deployment.readyState || 'Unknown'), detail: deployment.createdAt ? new Date(deployment.createdAt).toISOString() : 'Time unavailable', url: deployment.url ? `https://${deployment.url}` : undefined };
  } catch { return { state: 'error', label: 'Unavailable', detail: 'Deployment check failed' }; }
};

const github = async () => {
  const token = process.env.OOXME_OS_GITHUB_TOKEN;
  const owner = process.env.OOXME_OS_GITHUB_OWNER || 'saifalbarki';
  const repository = process.env.OOXME_OS_GITHUB_REPOSITORY || 'OOXME-WEBSITE';
  if (!token) return { state: 'unavailable', label: 'Not configured', detail: 'Server-side GitHub access required' };
  const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };
  try {
    const [repositoryResponse, commitsResponse, activityResponse, pullsResponse, issuesResponse] = await Promise.all([withTimeout(base, { headers }), withTimeout(`${base}/commits?per_page=1`, { headers }), withTimeout(`${base}/activity?per_page=3`, { headers }), withTimeout(`${base}/pulls?state=open&per_page=100`, { headers }), withTimeout(`https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${owner}/${repository} is:issue is:open`)}`, { headers })]);
    if (!repositoryResponse.ok || !commitsResponse.ok) return { state: 'error', label: `API HTTP ${repositoryResponse.ok ? commitsResponse.status : repositoryResponse.status}`, detail: 'Repository status unavailable' };
    const repo = await repositoryResponse.json(), commit = (await commitsResponse.json())[0], activity = activityResponse.ok ? await activityResponse.json() : [], pulls = pullsResponse.ok ? await pullsResponse.json() : [], issues = issuesResponse.ok ? await issuesResponse.json() : { total_count: null };
    const date = commit?.commit?.author?.date ? new Date(commit.commit.author.date).toISOString() : 'Date unavailable', author = commit?.commit?.author?.name || commit?.author?.login || 'Unknown author';
    return { state: repo.archived || repo.disabled ? 'error' : 'ready', label: repo.archived ? 'Archived' : repo.disabled ? 'Disabled' : 'Active', detail: `${repo.default_branch} · ${author} · ${date}`, branch: repo.default_branch, latestCommit: commit?.sha?.slice(0, 7) || 'Unavailable', author, date, activity: activity.map(event => event.type).filter(Boolean).join(', ') || 'No recent activity', pullRequests: pulls.length, issues: Number.isInteger(issues.total_count) ? issues.total_count : 'Unavailable' };
  } catch { return { state: 'error', label: 'Unavailable', detail: 'GitHub status check failed' }; }
};

const gmail = async () => {
  try {
    await gmailApi('/users/me/profile');
    const [unread, recent] = await Promise.all([
      gmailApi(`/users/me/messages?${new URLSearchParams({ q: 'is:unread {is:important newer_than:14d}', maxResults: '100' })}`),
      gmailApi(`/users/me/messages?${new URLSearchParams({ q: '{is:important newer_than:14d}', maxResults: '3' })}`)
    ]);
    const messages = await Promise.all((recent.messages || []).map(({ id }) => gmailApi(`/users/me/messages/${encodeURIComponent(id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`)));
    return {
      state: 'ready', label: 'Connected', detail: `Unread: ${Number(unread.resultSizeEstimate || 0)}`,
      unread: Number(unread.resultSizeEstimate || 0),
      messages: messages.map(message => {
        const headers = messageHeaders(message);
        return { sender: short(headers.from, 80) || 'Unknown sender', subject: short(headers.subject, 100) || '(No subject)', date: short(headers.date, 48) || 'Date unavailable', preview: short(message.snippet, 160) || 'No preview available' };
      })
    };
  } catch {
    return { state: 'error', label: 'Unavailable', detail: 'Gmail status check failed' };
  }
};

const calendar = async () => {
  try { const id = process.env.GOOGLE_CALENDAR_ID; if (!id) return { state: 'unavailable', label: 'Not configured', detail: 'Calendar ID required' }; const result = await calendarApi(`/calendars/${encodeURIComponent(id)}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(new Date().toISOString())}&maxResults=5`); return { state: 'ready', label: 'Connected', detail: `Upcoming: ${(result.items || []).length}` }; } catch { return { state: 'error', label: 'Unavailable', detail: 'Calendar status check failed' }; }
};
const drive = async () => {
  try { const result = await driveApi('/about?fields=storageQuota'); const quota = result.storageQuota || {}; return { state: 'ready', label: 'Connected', detail: quota.limit ? `Storage: ${Math.round((Number(quota.usage || 0) / Number(quota.limit)) * 100)}% used` : 'Storage available' }; } catch { return { state: 'error', label: 'Unavailable', detail: 'Drive status check failed' }; }
};
const neon = async () => {
  try { await query('SELECT 1'); return { state: 'ready', label: 'Connected', detail: 'Read-only health check passed' }; } catch { return { state: 'error', label: 'Unavailable', detail: 'Database status check failed' }; }
};
const openai = async () => {
  const token = process.env.OPENAI_API_KEY; if (!token) return { state: 'unavailable', label: 'Not configured', detail: 'Server-side OpenAI key required' };
  try { const response = await withTimeout('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) return { state: 'error', label: `API HTTP ${response.status}`, detail: 'OpenAI status unavailable' }; const body = await response.json(); return { state: 'ready', label: 'Connected', detail: `Models available: ${(body.data || []).length}` }; } catch { return { state: 'error', label: 'Unavailable', detail: 'OpenAI status check failed' }; }
};
const graph = async (path) => { const token = process.env.META_GRAPH_ACCESS_TOKEN; if (!token) throw new Error('unconfigured'); const response = await withTimeout(`https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0'}/${path}`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new Error(String(response.status)); return response.json(); };
const facebook = async () => { try { const id = process.env.FACEBOOK_PAGE_ID; if (!id) return { state:'unavailable',label:'Not configured',detail:'Page ID required' }; const page = await graph(`${encodeURIComponent(id)}?fields=name,fan_count`); return { state:'ready',label:'Connected',detail:`Followers: ${Number(page.fan_count || 0)}` }; } catch { return {state:'error',label:'Unavailable',detail:'Facebook status check failed'}; } };
const instagram = async () => { try { const id = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID; if (!id) return { state:'unavailable',label:'Not configured',detail:'Business account ID required' }; const account = await graph(`${encodeURIComponent(id)}?fields=username,followers_count,media_count`); return { state:'ready',label:'Connected',detail:`Followers: ${Number(account.followers_count || 0)} · Media: ${Number(account.media_count || 0)}` }; } catch { return {state:'error',label:'Unavailable',detail:'Instagram status check failed'}; } };
const whatsapp = async () => { try { const id=process.env.WHATSAPP_PHONE_NUMBER_ID, token=process.env.WHATSAPP_ACCESS_TOKEN; if(!id||!token)return {state:'unavailable',label:'Not configured',detail:'Server-side WhatsApp access required'}; const response=await withTimeout(`https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_API_VERSION||'v22.0'}/${encodeURIComponent(id)}?fields=verified_name,quality_rating,code_verification_status`,{headers:{Authorization:`Bearer ${token}`}}); if(!response.ok)throw new Error(); const body=await response.json(); return {state:'ready',label:'Connected',detail:`Quality: ${body.quality_rating||'Unavailable'}`}; } catch{return {state:'error',label:'Unavailable',detail:'WhatsApp status check failed'};} };
const ycloud = async () => { const token=process.env.YCLOUD_API_KEY; if(!token)return {state:'unavailable',label:'Not configured',detail:'Server-side YCloud key required'}; try { const response=await withTimeout('https://api.ycloud.com/v2/whatsapp/phoneNumbers?limit=1&includeTotal=true',{headers:{'X-API-Key':token}}); if(!response.ok)throw new Error(); const body=await response.json(); return {state:'ready',label:'Connected',detail:`Registered senders: ${Number(body.total || body.totalCount || (body.data||[]).length || 0)}`}; } catch{return {state:'error',label:'Unavailable',detail:'YCloud status check failed'};} };

module.exports = { website, vercel, github, gmail, calendar, drive, neon, openai, ycloud, whatsapp, facebook, instagram };
