const head = title => `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="/css/styles.css"><link rel="stylesheet" href="/css/os.css"></head>`;

const panelHeader = () => `<header class="master-panel-header os-header"><button class="master-panel-control os-header-mark" type="button" data-language-toggle aria-label="Switch to Arabic"><img src="/assets/icons/globe-outline.svg" alt=""></button><a class="master-panel-logo" href="/" aria-label="OOXME home"><img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME"></a><a class="master-panel-control os-home-control" href="/" data-os-aria="home" aria-label="Home"></a></header>`;
const panelFooter = () => `<footer class="master-panel-footer homepage-bottom-navigation os-footer" data-authenticated-navigation><button class="master-panel-continue" type="button" data-auth-nav-trigger aria-label="Open navigation" aria-expanded="false"><span class="swipe-control"><span></span><span class="swipe-control-line"></span></span></button><nav class="homepage-bottom-menu" data-auth-nav-menu data-active="home" aria-label="Navigation"><span class="homepage-bottom-menu-indicator" aria-hidden="true"></span><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="account" data-auth-nav-destination="/os/accounts" aria-pressed="false"><img src="/assets/icons/New/PROFILE.svg" alt=""></button><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="gallery" aria-pressed="false"><img src="/assets/icons/New/GALLERY.svg" alt=""></button><button class="homepage-bottom-menu-button is-active" type="button" data-auth-nav-item="home" data-auth-nav-destination="/os" aria-pressed="true"><img src="/assets/icons/New/HOME.svg" alt=""></button><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="search" aria-pressed="false"><img src="/assets/icons/New/SEARCH.svg" alt=""></button><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="menu" aria-pressed="false"><img src="/assets/icons/New/NOTIFICATION.svg" alt=""></button></nav></footer>`;
const shell = (content, title) => `${head(title)}<body class="os-page"><main class="master-panel-experience os-experience"><section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}${content}${panelFooter()}</article></section></main><script src="/js/authenticated-navigation.js"></script></body></html>`;

const loginHeader = () => `<header class="master-panel-header os-header os-login-header"><span aria-hidden="true"></span><a class="master-panel-logo" href="/" aria-label="OOXME home"><img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME"></a><span aria-hidden="true"></span></header>`;
const login = () => `${head('OOXME OS — Sign in')}<body class="os-page"><main class="master-panel-experience os-experience"><section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${loginHeader()}<section class="master-panel-content os-content os-login-content"><form class="homepage-account-panel os-login" data-os-login><div class="homepage-account-selector" data-os-login-selector data-active="general" role="tablist" aria-label="OS login section"><span class="homepage-account-selector-indicator" aria-hidden="true"></span><button type="button" data-os-login-option="general" role="tab" aria-selected="true" data-os-text="generalStatus">General Status</button><button type="button" data-os-login-option="edit" role="tab" aria-selected="false" data-os-text="edit">Edit</button></div><div class="homepage-account-form"><label class="homepage-search-field"><input name="username" placeholder="Username" data-os-placeholder="username" autocomplete="username" required></label><label class="homepage-search-field"><input type="password" name="password" placeholder="Password" data-os-placeholder="password" autocomplete="current-password" required></label><button class="homepage-account-login" type="submit" data-os-text="login">Login</button></div><p class="os-error" data-os-error role="alert"></p></form></section>${panelFooter()}</article></section></main><script src="/js/os-language.js"></script><script>const selector=document.querySelector('[data-os-login-selector]');selector?.querySelectorAll('[data-os-login-option]').forEach(button=>button.addEventListener('click',()=>{selector.dataset.active=button.dataset.osLoginOption;selector.querySelectorAll('[data-os-login-option]').forEach(item=>item.setAttribute('aria-selected',String(item===button)));}));document.querySelector('[data-os-login]').addEventListener('submit',async event=>{event.preventDefault();const form=new FormData(event.currentTarget),error=document.querySelector('[data-os-error]');error.textContent='';try{const response=await fetch('/api/os/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password')})});if(response.ok)location.assign('/os');else error.textContent=OOXMEOS.copy[OOXMEOS.language].loginError;}catch(_){error.textContent=OOXMEOS.copy[OOXMEOS.language].loginError;}});</script><script src="/js/authenticated-navigation.js"></script></body></html>`;

const cards = items => `<section class="os-grid">${items.map(([name, key]) => `<article class="os-card" data-state="unavailable" data-os-service="${key}"><div><span class="os-card-label" data-os-text="status">STATUS</span><h2 data-os-text="${key}">${name}</h2><p data-os-status data-os-initial-status="loading">Loading…</p><small data-os-meta></small></div><span class="os-card-dot" aria-hidden="true"></span></article>`).join('')}</section>`;
const dashboardPanel = items => `<section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}<section class="master-panel-content os-content os-dashboard-content"><div class="os-title-row"><h1 data-os-text="title">OOXME OS</h1><form action="/api/os/logout" method="post"><button class="os-logout" type="submit" data-os-text="logOut">Log out</button></form></div>${cards(items)}</section>${panelFooter()}</article></section>`;

const dashboardScript = `<script>
let osStatusData={};
const setStatus=(name,value)=>{
  const card=document.querySelector('[data-os-service="'+name+'"]');
  if(!card)return;
  card.dataset.state=value.state||'error';
  card.querySelector('[data-os-status]').textContent=OOXMEOS.status(value.label);
  let detail=value.detail||'';
  if(name==='github'&&value.branch)detail=[value.branch,value.latestCommit,value.author,value.date,value.activity,(OOXMEOS.language==='ar'?'طلبات السحب ':'PR ')+value.pullRequests,(OOXMEOS.language==='ar'?'المشكلات ':'Issues ')+value.issues].join(' · ');
  if(name==='gmail'&&value.messages)detail=[(OOXMEOS.language==='ar'?'غير المقروءة: ':'Unread: ')+value.unread,...value.messages.map(message=>message.sender+' — '+message.subject+' · '+message.date+'\\n'+message.preview)].join('\\n');
  card.querySelector('[data-os-meta]').textContent=OOXMEOS.status(detail);
};
window.renderOsStatuses=()=>Object.entries(osStatusData).forEach(([name,value])=>setStatus(name,value));
const osServices=['website','github','vercel','gmail','calendar','drive','neon','gpt','ycloud','whatsapp','facebook','instagram'];
const unavailableStatus=detail=>({state:'error',label:'Unavailable',detail});
const statusController=new AbortController();
const statusTimer=setTimeout(()=>statusController.abort(),8_000);
fetch('/api/os/index?route=status',{credentials:'same-origin',signal:statusController.signal})
  .then(async response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();})
  .then(data=>{if(!data||typeof data!=='object')throw new Error('Invalid status response');osStatusData=Object.fromEntries(osServices.map(name=>[name,data[name]&&typeof data[name]==='object'?data[name]:unavailableStatus('Status response missing')]));window.renderOsStatuses();})
  .catch(()=>{osStatusData=Object.fromEntries(osServices.map(name=>[name,unavailableStatus(OOXMEOS.copy[OOXMEOS.language].statusCheckFailed)]));window.renderOsStatuses();})
  .finally(()=>clearTimeout(statusTimer));
</script>`;

const dashboard = () => `${head('OOXME OS')}<body class="os-page"><main class="master-panel-experience os-experience os-dashboard-experience"><div class="master-panel-track os-panel-track">${dashboardPanel([['Website','website'],['GitHub','github'],['Vercel','vercel'],['Neon','neon']])}${dashboardPanel([['GPT','gpt'],['Calendar','calendar'],['Gmail','gmail'],['Drive','drive']])}${dashboardPanel([['YCloud','ycloud'],['WhatsApp','whatsapp'],['Facebook','facebook'],['Instagram','instagram']])}</div></main><script src="/js/os-language.js"></script><script src="/js/authenticated-navigation.js"></script>${dashboardScript}</body></html>`;

const accountManagementScript = `<script>
(() => {
  const endpoint = '/api/os/accounts';
  const state = { accounts: [], type: 'employee', selected: null };
  const $ = selector => document.querySelector(selector);
  const t = key => (window.OOXMEOS?.copy?.[window.OOXMEOS.language]?.[key]) || key;
  const error = message => { $('[data-account-error]').textContent = message || ''; };
  const request = async (options = {}) => {
    const response = await fetch(endpoint, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    if (response.status === 401) { location.assign('/os/login'); throw new Error('unauthorized'); }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'account_action_failed');
    return body;
  };
  const updateLabels = () => {
    const profileLabel = state.type === 'employee' ? t('jobTitle') : t('companyName');
    $('[data-account-profile-label]').textContent = profileLabel;
    $('[data-account-profile]').placeholder = profileLabel;
    document.querySelectorAll('[data-account-type-tab]').forEach(button => {
      const active = button.dataset.accountTypeTab === state.type;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  const selectedProfile = account => account.account_type === 'employee' ? account.employee_display_name : account.client_display_name;
  const selectedExtra = account => account.account_type === 'employee' ? account.job_title : account.company_name;
  const accountItem = account => {
    const item = document.createElement('article'); item.className = 'os-account-item';
    const details = document.createElement('button'); details.type = 'button'; details.className = 'os-account-select';
    const name = document.createElement('strong'); name.textContent = selectedProfile(account) || account.username;
    const meta = document.createElement('span'); meta.textContent = account.username + ' · ' + (selectedExtra(account) || t(account.account_type));
    details.append(name, meta); details.addEventListener('click', () => select(account));
    const status = document.createElement('span'); status.className = 'os-account-status'; status.dataset.status = account.status; status.textContent = t(account.status);
    item.append(details, status); return item;
  };
  const render = () => {
    const list = $('[data-account-list]'); list.replaceChildren();
    const items = state.accounts.filter(account => account.account_type === state.type);
    if (!items.length) { const empty = document.createElement('p'); empty.className = 'os-account-empty'; empty.textContent = t('noAccounts'); list.append(empty); }
    else items.forEach(account => list.append(accountItem(account)));
    updateLabels();
  };
  const resetForm = () => {
    state.selected = null;
    $('[data-account-form]').reset();
    $('[data-account-form]').dataset.mode = 'create';
    $('[data-account-form-title]').textContent = t('createAccount');
    $('[data-account-submit]').textContent = t('createAccount');
    $('[data-account-password]').required = true;
    $('[data-account-password]').placeholder = t('password');
    $('[data-account-delete]').hidden = true; $('[data-account-status]').hidden = true;
    $('[data-account-type]').disabled = false; $('[data-account-type]').value = state.type;
    error(''); updateLabels();
  };
  const select = account => {
    state.selected = account; state.type = account.account_type;
    const form = $('[data-account-form]'); form.dataset.mode = 'edit';
    $('[data-account-form-title]').textContent = t('editAccount'); $('[data-account-submit]').textContent = t('saveChanges');
    $('[data-account-username]').value = account.username;
    $('[data-account-display]').value = selectedProfile(account) || '';
    $('[data-account-profile]').value = selectedExtra(account) || '';
    $('[data-account-password]').value = ''; $('[data-account-password]').required = false; $('[data-account-password]').placeholder = t('newPasswordOptional');
    $('[data-account-type]').value = account.account_type; $('[data-account-type]').disabled = true;
    $('[data-account-delete]').hidden = false; $('[data-account-status]').hidden = false;
    $('[data-account-status]').textContent = account.status === 'active' ? t('deactivate') : t('activate');
    error(''); render();
  };
  const load = async () => { state.accounts = await request(); render(); };
  const mutate = async body => { await request({ method: 'POST', body: JSON.stringify(body) }); await load(); };
  $('[data-account-form]').addEventListener('submit', async event => {
    event.preventDefault(); error(''); const form = event.currentTarget;
    const username = $('[data-account-username]').value, displayName = $('[data-account-display]').value, profile = $('[data-account-profile]').value, password = $('[data-account-password]').value;
    try {
      if (form.dataset.mode === 'create') {
        await mutate({ action: 'create', username, password, accountType: state.type, displayName, ...(state.type === 'employee' ? { jobTitle: profile } : { companyName: profile }) });
      } else {
        await mutate({ action: 'update', id: state.selected.id, username, displayName, ...(state.type === 'employee' ? { jobTitle: profile } : { companyName: profile }) });
        if (password) await mutate({ action: 'reset_password', id: state.selected.id, password });
      }
      resetForm(); await load();
    } catch (failure) { if (failure.message !== 'unauthorized') error(t(failure.message)); }
  });
  $('[data-account-delete]').addEventListener('click', async () => {
    if (!state.selected || !confirm(t('deleteConfirm'))) return;
    try { await mutate({ action: 'delete', id: state.selected.id }); resetForm(); } catch (failure) { if (failure.message !== 'unauthorized') error(t(failure.message)); }
  });
  $('[data-account-status]').addEventListener('click', async () => {
    if (!state.selected) return;
    try { await mutate({ action: 'set_status', id: state.selected.id, status: state.selected.status === 'active' ? 'inactive' : 'active' }); select(state.accounts.find(account => account.id === state.selected.id) || state.selected); } catch (failure) { if (failure.message !== 'unauthorized') error(t(failure.message)); }
  });
  $('[data-account-new]').addEventListener('click', resetForm);
  $('[data-account-type]').addEventListener('change', event => { state.type = event.currentTarget.value; updateLabels(); });
  document.querySelectorAll('[data-account-type-tab]').forEach(button => button.addEventListener('click', () => { state.type = button.dataset.accountTypeTab; resetForm(); render(); }));
  document.addEventListener('DOMContentLoaded', () => { resetForm(); load().catch(failure => { if (failure.message !== 'unauthorized') error(t('accountLoadFailed')); }); });
})();
</script>`;

const accountManagement = () => shell(`<section class="master-panel-content os-content os-account-content"><div class="os-title-row"><h1 data-os-text="accountManagement">Account Management</h1><div class="os-account-top-actions"><a class="os-account-back" href="/os" data-os-text="osDashboard">OS Dashboard</a><form action="/api/os/logout" method="post"><button class="os-logout" type="submit" data-os-text="logOut">Log out</button></form></div></div><section class="os-account-layout"><section class="os-account-directory" aria-label="Account directory"><div class="os-account-tabs" role="tablist"><button type="button" data-account-type-tab="employee" data-os-text="employees">Employees</button><button type="button" data-account-type-tab="client" data-os-text="clients">Clients</button></div><div class="os-account-list" data-account-list></div></section><section class="os-account-editor"><div class="os-account-editor-heading"><h2 data-account-form-title data-os-text="createAccount">Create account</h2><button type="button" class="os-account-new" data-account-new data-os-text="newAccount">New account</button></div><form class="os-account-form" data-account-form data-mode="create"><label><span data-os-text="accountType">Account type</span><select data-account-type><option value="employee" data-os-text="employee">Employee</option><option value="client" data-os-text="client">Client</option></select></label><label><span data-os-text="username">Username</span><input data-account-username autocomplete="username" required></label><label><span data-os-text="displayName">Display name</span><input data-account-display autocomplete="name" required></label><label><span data-account-profile-label data-os-text="jobTitle">Job title</span><input data-account-profile></label><label><span data-os-text="password">Password</span><input type="password" data-account-password autocomplete="new-password" required></label><p class="os-error" data-account-error role="alert"></p><button type="submit" class="os-account-primary" data-account-submit data-os-text="createAccount">Create account</button></form><div class="os-account-danger-actions"><button type="button" data-account-status hidden></button><button type="button" data-account-delete hidden data-os-text="deleteAccount">Delete account</button></div></section></section></section><script src="/js/os-language.js"></script>${accountManagementScript}`, 'OOXME OS — Account Management');

module.exports = { login, dashboard, accountManagement };
