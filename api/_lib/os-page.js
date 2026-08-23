const panelThreeSelectorStateScript = `<script>(()=>{const setSelector=(selector,value,key)=>{if(!selector||!value)return;selector.dataset.active=value;selector.querySelectorAll('button').forEach(button=>button.setAttribute('aria-selected',String(button.dataset[key]===value)));};document.addEventListener('click',event=>{const button=event.target.closest('[data-os-panel-three-mode-option],[data-os-panel-three-type-option]');if(!button)return;if(button.dataset.osPanelThreeModeOption)setSelector(button.closest('[data-os-panel-three-mode]'),button.dataset.osPanelThreeModeOption,'osPanelThreeModeOption');if(button.dataset.osPanelThreeTypeOption)setSelector(button.closest('[data-os-panel-three-type]'),button.dataset.osPanelThreeTypeOption,'osPanelThreeTypeOption');},true);})();</script>`;
const head = title => `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="/css/styles.css"><link rel="stylesheet" href="/css/os.css"><script src="/js/arabic-typography.js" defer></script>${panelThreeSelectorStateScript}</head>`;

const panelHeader = () => `<header class="master-panel-header os-auth-header" aria-hidden="true"></header>`;
const panelFooter = (leavesOs = false) => `<footer class="master-panel-footer homepage-bottom-navigation os-footer" data-authenticated-navigation><button class="master-panel-continue" type="button" data-auth-nav-trigger aria-label="Open navigation" aria-expanded="false"><span class="swipe-control"><span></span><span class="swipe-control-line"></span></span></button><nav class="homepage-bottom-menu" data-auth-nav-menu data-active="home" aria-label="Navigation"><span class="homepage-bottom-menu-indicator" aria-hidden="true"></span><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="account" data-auth-nav-destination="/os/accounts" aria-pressed="false"><img src="/assets/icons/New/PROFILE.svg" alt=""></button><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="gallery" data-auth-nav-destination="/studio" aria-pressed="false"><img src="/assets/icons/New/FILE.svg" alt=""></button><button class="homepage-bottom-menu-button is-active" type="button" data-auth-nav-item="home" ${leavesOs ? 'data-auth-nav-exit' : 'data-auth-nav-destination="/os"'} aria-pressed="true"><img src="/assets/icons/New/HOME.svg" alt=""></button><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="menu" aria-label="Notifications" aria-pressed="false"><img src="/assets/icons/New/NOTIFICATION.svg" alt=""></button><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="services" data-auth-nav-noop aria-label="Services" aria-pressed="false"><img src="/assets/icons/New/SERVICES.svg" alt=""></button></nav></footer>`;
const dashboardFooter = () => `<footer class="master-panel-footer homepage-bottom-navigation os-footer os-dashboard-footer" data-authenticated-navigation data-os-panel-navigation><button class="master-panel-continue" type="button" data-auth-nav-trigger aria-label="Open navigation" aria-expanded="false"><span class="swipe-control"><span></span><span class="swipe-control-line"></span></span></button><nav class="homepage-bottom-menu" data-auth-nav-menu data-active="home" aria-label="Navigation"><span class="homepage-bottom-menu-indicator" aria-hidden="true"></span><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="discount" data-auth-nav-panel="2" aria-label="Open Panel 3" aria-pressed="false"><img src="/assets/icons/New/DISCOUNT.svg" alt=""></button><button class="homepage-bottom-menu-button is-active" type="button" data-auth-nav-item="home" data-auth-nav-logout aria-label="Log out" aria-pressed="true"><img src="/assets/icons/New/HOME.svg" alt=""></button><button class="homepage-bottom-menu-button" type="button" data-auth-nav-item="users" data-auth-nav-panel="1" aria-label="Open Panel 2" aria-pressed="false"><img src="/assets/icons/New/USERS.svg" alt=""></button></nav></footer>`;
const shell = (content, title) => `${head(title)}<body class="os-page"><main class="master-panel-experience os-experience"><section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}${content}${panelFooter(true)}</article></section></main><script src="/js/authenticated-navigation.js"></script></body></html>`;

const loginHeader = () => `<header class="master-panel-header os-login-header" aria-hidden="true"></header>`;
const login = () => `${head('OOXME OS — Sign in')}<body class="os-page os-login-page"><main class="master-panel-experience os-experience"><section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${loginHeader()}<section class="master-panel-content os-content os-login-content"><form class="homepage-account-panel os-login" data-os-login><div class="homepage-account-selector" data-os-login-selector data-active="general" role="tablist" aria-label="OS login section"><span class="homepage-account-selector-indicator" aria-hidden="true"></span><button type="button" data-os-login-option="general" role="tab" aria-selected="true" data-os-text="generalStatus">General Status</button><button type="button" data-os-login-option="edit" role="tab" aria-selected="false" data-os-text="edit">Edit</button></div><div class="homepage-account-form"><label class="homepage-search-field"><input class="ooxme-writable-field" name="username" placeholder="Username" data-os-placeholder="username" autocomplete="username" required></label><label class="homepage-search-field"><input class="ooxme-writable-field" type="password" name="password" placeholder="Password" data-os-placeholder="password" autocomplete="current-password" required></label><button class="homepage-account-login" type="submit" data-os-text="login">Login</button></div><p class="os-error" data-os-error role="alert"></p></form></section></article></section></main><script src="/js/os-language.js"></script><script>const selector=document.querySelector('[data-os-login-selector]');selector?.querySelectorAll('[data-os-login-option]').forEach(button=>button.addEventListener('click',()=>{selector.dataset.active=button.dataset.osLoginOption;selector.querySelectorAll('[data-os-login-option]').forEach(item=>item.setAttribute('aria-selected',String(item===button)));}));document.querySelector('[data-os-login]').addEventListener('submit',async event=>{event.preventDefault();const form=new FormData(event.currentTarget),error=document.querySelector('[data-os-error]');error.textContent='';try{const response=await fetch('/api/os/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password')})});if(response.ok)location.assign('/os');else error.textContent=OOXMEOS.copy[OOXMEOS.language].loginError;}catch(_){error.textContent=OOXMEOS.copy[OOXMEOS.language].loginError;}});</script></body></html>`;

const cards = items => `<section class="os-grid">${items.map(([name, key]) => `<article class="os-card" data-state="unavailable" data-os-service="${key}"><div class="os-card-details"><div class="os-card-heading"><h2 data-os-text="${key}">${name}</h2><span class="os-card-dot" aria-hidden="true"></span></div><p data-os-status data-os-initial-status="loading">Loading…</p><small data-os-meta></small></div></article>`).join('')}</section>`;
const dashboardSummary = () => `<section class="os-dashboard-summary" aria-label="Current totals"><div class="os-dashboard-summary-row"><span>Current Employees</span><strong class="os-dashboard-summary-active" data-os-summary="active_employees">—</strong><strong data-os-summary="employees">—</strong></div><div class="os-dashboard-summary-row"><span>Clients</span><strong class="os-dashboard-summary-active" data-os-summary="active_clients">—</strong><strong data-os-summary="clients">—</strong></div><div class="os-dashboard-summary-row"><span>Current Discount Codes</span><strong class="os-dashboard-summary-active" data-os-summary="active_discount_codes">—</strong><strong data-os-summary="discount_codes">—</strong></div></section>`;
const dashboardPanel = (items, includeSummary = false) => `<section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}${items.length ? `<section class="master-panel-content os-content os-dashboard-content">${cards(items)}${includeSummary ? dashboardSummary() : ''}</section>` : '<section class="master-panel-content os-content os-dashboard-empty" aria-hidden="true"></section>'}${dashboardFooter()}</article></section>`;
const currentAccountsPanel = () => `<section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}<section class="master-panel-content os-content homepage-account-panel os-current-accounts-content"><div class="homepage-account-selector" data-os-accounts-mode data-active="current" role="tablist" aria-label="Account mode"><span class="homepage-account-selector-indicator" aria-hidden="true"></span><button type="button" data-os-accounts-mode-option="current" role="tab" aria-selected="true" data-os-text="current">Current</button><button type="button" data-os-accounts-mode-option="edit" role="tab" aria-selected="false" data-os-text="edit">Edit</button></div><div class="homepage-account-selector" data-os-accounts-type data-active="employee" role="tablist" aria-label="Account type"><span class="homepage-account-selector-indicator" aria-hidden="true"></span><button type="button" data-os-accounts-type-option="employee" role="tab" aria-selected="true" data-os-text="employee">Employee</button><button type="button" data-os-accounts-type-option="client" role="tab" aria-selected="false" data-os-text="client">Client</button></div><section class="os-current-accounts-list" data-os-current-accounts-list aria-live="polite"></section></section>${dashboardFooter()}</article></section>`;
const panelThreeAccountsPanel = () => `<section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}<section class="master-panel-content os-content homepage-account-panel os-current-accounts-content"><div class="homepage-account-selector" data-os-panel-three-mode data-active="current" role="tablist" aria-label="Account mode"><span class="homepage-account-selector-indicator" aria-hidden="true"></span><button type="button" data-os-panel-three-mode-option="current" role="tab" aria-selected="true" data-os-text="current">Current</button><button type="button" data-os-panel-three-mode-option="edit" role="tab" aria-selected="false" data-os-text="edit">Edit</button></div><div class="homepage-account-selector" data-os-panel-three-type data-active="discount-codes" role="tablist" aria-label="Panel 3 mode"><span class="homepage-account-selector-indicator" aria-hidden="true"></span><button type="button" data-os-panel-three-type-option="discount-codes" role="tab" aria-selected="true" data-os-text="discountCodes">Discount Codes</button><button type="button" data-os-panel-three-type-option="notifications" role="tab" aria-selected="false" data-os-text="notifications">Notifications</button></div><section class="os-current-accounts-list" data-os-panel-three-list aria-live="polite"></section></section>${dashboardFooter()}</article></section>`;

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
const loadOsStatuses=()=>{const statusController=new AbortController(),statusTimer=setTimeout(()=>statusController.abort(),8_000);return fetch('/api/os/index?route=status',{credentials:'same-origin',signal:statusController.signal})
  .then(async response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();})
  .then(data=>{if(!data||typeof data!=='object')throw new Error('Invalid status response');osStatusData=Object.fromEntries(osServices.map(name=>[name,data[name]&&typeof data[name]==='object'?data[name]:unavailableStatus('Status response missing')]));window.renderOsStatuses();})
  .catch(()=>{osStatusData=Object.fromEntries(osServices.map(name=>[name,unavailableStatus(OOXMEOS.copy[OOXMEOS.language].statusCheckFailed)]));window.renderOsStatuses();})
  .finally(()=>clearTimeout(statusTimer));};
const loadOsSummary=()=>fetch('/api/os/index?route=summary',{credentials:'same-origin'}).then(response=>response.ok?response.json():Promise.reject()).then(summary=>Object.entries(summary).forEach(([key,value])=>{const field=document.querySelector('[data-os-summary="'+key+'"]');if(field)field.textContent=Number(value);})).catch(()=>{});
loadOsStatuses();loadOsSummary();
document.querySelector('.os-dashboard-experience')?.addEventListener('os-panel-activated',event=>{if(event.detail.panel===0){loadOsStatuses();loadOsSummary();}});
</script>`;

const currentAccountsScript = `<script>
(() => {
  const list = document.querySelector('[data-os-current-accounts-list]');
  const modeSelector = document.querySelector('[data-os-accounts-mode]');
  const typeSelector = document.querySelector('[data-os-accounts-type]');
  if (!list || !modeSelector || !typeSelector) return;
  const endpoint = '/api/os/accounts';
  const state = { accounts: [], action: null, selectedId: '', deleteConfirm: false };
  const text = key => window.OOXMEOS?.copy?.[window.OOXMEOS.language]?.[key] || key;
  const type = () => typeSelector.dataset.active;
  const profileKey = () => type() === 'employee' ? 'jobTitle' : 'companyName';
  const profileValue = account => type() === 'employee' ? account.job_title : account.company_name;
  const displayValue = account => type() === 'employee' ? account.employee_display_name : account.client_display_name;
  const typeAccounts = () => state.accounts.filter(account => account.account_type === type());
  const formatDate = value => value ? new Intl.DateTimeFormat(window.OOXMEOS?.language === 'ar' ? 'ar-IQ' : 'en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value)) : '';
  const setSelector = (selector, value, attribute) => {
    selector.dataset.active = value;
    selector.querySelectorAll('button').forEach(button => button.setAttribute('aria-selected', String(button.dataset[attribute] === value)));
  };
  const request = async body => {
    const response = await fetch(endpoint, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (response.status === 401) { location.assign('/os/login'); throw new Error('unauthorized'); }
    if (!response.ok) throw new Error(result.error || 'account_action_failed');
    return result;
  };
  const load = async () => {
    const response = await fetch(endpoint, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('accounts_unavailable');
    state.accounts = await response.json();
    if (!Array.isArray(state.accounts)) state.accounts = [];
  };
  const input = (name, placeholder, value = '', inputType = 'text', required = false) => {
    const field = document.createElement('input'); field.name = name; field.type = inputType; field.placeholder = placeholder; field.value = value || ''; field.autocomplete = name === 'username' ? 'username' : inputType === 'password' ? 'new-password' : 'off'; field.required = required; return field;
  };
  const button = (label, className, handler, iconPath = '', iconOnly = false) => {
    const control = document.createElement('button'); control.type = 'button'; control.className = className; control.setAttribute('aria-label', label); control.title = label;
    if (iconPath) { const icon = document.createElement('img'); icon.src = iconPath; icon.alt = ''; control.append(icon); if (!iconOnly) { const caption = document.createElement('span'); caption.textContent = label; control.append(caption); } }
    else control.textContent = label;
    control.addEventListener('click', handler); return control;
  };
  const empty = message => { const node = document.createElement('p'); node.className = 'os-current-accounts-empty'; node.textContent = message; return node; };
  const accountSelect = onChange => {
    const select = document.createElement('select'); select.className = 'os-current-account-select'; select.name = 'account';
    const initial = document.createElement('option'); initial.value = ''; initial.textContent = text('selectAccount'); select.append(initial);
    typeAccounts().forEach(account => { const option = document.createElement('option'); option.value = account.id; option.textContent = displayValue(account) || account.username; select.append(option); });
    select.addEventListener('change', () => onChange(select.value)); return select;
  };
  const actionControls = () => {
    const controls = document.createElement('div'); controls.className = 'os-current-account-actions'; controls.dataset.active = state.action || '';
    const indicator = document.createElement('span'); indicator.className = 'os-current-account-actions-indicator'; indicator.setAttribute('aria-hidden', 'true'); controls.append(indicator);
    [['create', 'addNew', '/assets/icons/New/ADD.svg'], ['delete', 'deleteAccount', '/assets/icons/New/DELETE.svg'], ['update', 'editExisting', '/assets/icons/New/EDIT.svg']].forEach(([action, label, icon]) => {
      const control = button(text(label), 'os-current-account-action', () => { state.action = action; state.selectedId = ''; state.deleteConfirm = false; render(); }, icon, true);
      control.dataset.osAccountAction = action; control.classList.toggle('is-active', action === state.action); controls.append(control);
    });
    return controls;
  };
  const formFields = (account, withPassword) => {
    const form = document.createElement('form'); form.className = 'os-current-account-form';
    form.append(input('username', text('username'), account?.username, 'text', true));
    form.append(input('displayName', text('displayName'), account && displayValue(account), 'text', true));
    form.append(input('profile', text(profileKey()), account && profileValue(account)));
    if (withPassword) form.append(input('password', text('password'), '', 'password', true));
    return form;
  };
  const renderCurrent = () => {
    const current = typeAccounts();
    if (!current.length) { list.append(empty(text('noAccounts'))); return; }
    current.forEach(account => {
      const row = document.createElement('article'); row.className = 'os-current-account-row'; row.dataset.state = account.status === 'active' ? 'healthy' : account.status;
      const details = document.createElement('div'); details.className = 'os-current-account-details';
      const name = document.createElement('strong'); name.textContent = displayValue(account) || account.username;
      const role = document.createElement('span'); role.textContent = profileValue(account) || account.username;
      const period = document.createElement('small'); period.textContent = [formatDate(account.created_at), text('present')].filter(Boolean).join(' → ');
      const dot = document.createElement('span'); dot.className = 'os-card-dot os-current-account-dot'; dot.setAttribute('aria-hidden', 'true');
      details.append(name, role, period); row.append(details, dot); list.append(row);
    });
  };
  const renderCreate = () => {
    const form = formFields(null, true); const actions = document.createElement('div'); actions.className = 'os-current-account-confirm-actions';
    const error = empty(''); error.classList.add('os-current-account-error');
    const cancel = button(text('cancel'), 'os-current-account-cancel', () => { state.action = null; render(); });
    const confirm = button(text('confirm'), 'homepage-account-login', async () => {
      const values = new FormData(form); error.textContent = '';
      try { await request({ action: 'create', accountType: type(), username: values.get('username'), password: values.get('password'), displayName: values.get('displayName'), ...(type() === 'employee' ? { jobTitle: values.get('profile') } : { companyName: values.get('profile') }) }); await load(); state.action = null; render(); } catch (exception) { error.textContent = text(exception.message); }
    });
    actions.append(cancel, confirm); list.append(form, actions, error);
  };
  const renderDelete = () => {
    const select = accountSelect(id => { state.selectedId = id; state.deleteConfirm = false; render(); }); select.value = state.selectedId; list.append(select);
    if (!state.selectedId) return;
    if (!state.deleteConfirm) {
      const actions = document.createElement('div'); actions.className = 'os-current-account-confirm-actions';
      const cancel = button(text('cancel'), 'os-current-account-cancel', () => { state.selectedId = ''; render(); });
      const remove = button(text('deleteAccount'), 'os-current-account-delete', () => { state.deleteConfirm = true; render(); });
      actions.append(cancel, remove); list.append(actions); return;
    }
    const warning = document.createElement('section'); warning.className = 'os-current-account-warning'; warning.textContent = text('deleteConfirm');
    const actions = document.createElement('div'); actions.className = 'os-current-account-confirm-actions';
    const cancel = button(text('cancel'), 'os-current-account-cancel', () => { state.deleteConfirm = false; render(); });
    const confirm = button(text('confirm'), 'os-current-account-delete', async () => { try { await request({ action: 'delete', id: state.selectedId }); await load(); state.action = null; state.selectedId = ''; state.deleteConfirm = false; render(); } catch (exception) { list.append(empty(text(exception.message))); } });
    actions.append(cancel, confirm); list.append(warning, actions);
  };
  const renderUpdate = () => {
    const select = accountSelect(id => { state.selectedId = id; render(); }); select.value = state.selectedId; list.append(select);
    const account = typeAccounts().find(item => item.id === state.selectedId); if (!account) return;
    const form = formFields(account, false); const actions = document.createElement('div'); actions.className = 'os-current-account-confirm-actions';
    const error = empty(''); error.classList.add('os-current-account-error');
    const cancel = button(text('cancel'), 'os-current-account-cancel', () => { state.selectedId = ''; render(); });
    const confirm = button(text('confirm'), 'homepage-account-login', async () => { const values = new FormData(form); error.textContent = ''; try { await request({ action: 'update', id: account.id, username: values.get('username'), displayName: values.get('displayName'), ...(type() === 'employee' ? { jobTitle: values.get('profile') } : { companyName: values.get('profile') }) }); await load(); state.action = null; state.selectedId = ''; render(); } catch (exception) { error.textContent = text(exception.message); } });
    actions.append(cancel, confirm); list.append(form, actions, error);
  };
  const render = () => {
    list.replaceChildren();
    if (modeSelector.dataset.active === 'current') { renderCurrent(); return; }
    list.append(actionControls());
    if (state.action === 'create') renderCreate();
    if (state.action === 'delete') renderDelete();
    if (state.action === 'update') renderUpdate();
  };
  modeSelector.querySelectorAll('[data-os-accounts-mode-option]').forEach(button => button.addEventListener('click', () => { setSelector(modeSelector, button.dataset.osAccountsModeOption, 'osAccountsModeOption'); state.action = null; state.selectedId = ''; state.deleteConfirm = false; render(); }));
  typeSelector.querySelectorAll('[data-os-accounts-type-option]').forEach(button => button.addEventListener('click', () => { setSelector(typeSelector, button.dataset.osAccountsTypeOption, 'osAccountsTypeOption'); state.selectedId = ''; state.deleteConfirm = false; render(); }));
  load().then(render).catch(() => { list.replaceChildren(empty(text('accountLoadFailed'))); });
})();
</script>`;

const panelThreeDiscountScriptLive = `<script>(()=>{const mode=document.querySelector('[data-os-panel-three-mode]'),type=document.querySelector('[data-os-panel-three-type]'),list=document.querySelector('[data-os-panel-three-list]');if(!mode||!type||!list)return;const endpoint='/api/os/index?route=promotions';let action='',selectedId='',deleteConfirm=false,codes=[];const load=async()=>{const response=await fetch(endpoint,{credentials:'same-origin'});if(!response.ok)throw Error('promotion_load_failed');codes=await response.json();if(!Array.isArray(codes))codes=[];};const mutate=async body=>{const response=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json().catch(()=>({}));if(!response.ok)throw Error(result.error||'promotion_action_failed');await load();return result;};const input=(name,label,value='')=>{const field=document.createElement('input');field.name=name;field.placeholder=label;field.value=value;field.setAttribute('aria-label',label);return field;};const controls=confirm=>{const group=document.createElement('div');group.className='os-current-account-confirm-actions';const cancel=document.createElement('button');cancel.type='button';cancel.className='os-current-account-cancel';cancel.textContent='Cancel';cancel.addEventListener('click',()=>{action='';selectedId='';deleteConfirm=false;render();});const button=document.createElement('button');button.type='button';button.className='homepage-account-login';button.textContent='Confirm';button.addEventListener('click',confirm);group.append(cancel,button);return group;};const selectCode=()=>{const select=document.createElement('select');select.className='os-current-account-select';select.append(new Option('Select Discount Code',''));codes.forEach(code=>select.append(new Option(code.code_normalized,code.id)));select.value=selectedId;select.addEventListener('change',()=>{selectedId=select.value;deleteConfirm=false;render();});return select;};const formValues=code=>{const form=document.createElement('form');form.className='os-current-account-form';form.append(input('code','Code',code?.code_normalized||''),input('discount','Discount',code?.discount_value??''),input('duration','Code Duration',Array.isArray(code?.duration_restrictions)?code.duration_restrictions[0]||'':''),input('allowedUses','Allowed Uses',code?.total_usage_limit??''));return form;};const render=()=>{if(type.dataset.active!=='discount-codes')return;list.replaceChildren();if(mode.dataset.active==='current'){if(!codes.length){const empty=document.createElement('p');empty.className='os-current-accounts-empty';empty.textContent='No discount codes yet.';list.append(empty);return;}codes.forEach(code=>{const form=document.createElement('form');form.className='os-current-account-form';[['Code Symbol',code.code_normalized],['Discount Percentage',String(code.discount_value)+'%'],['Number of Uses',code.total_usage_limit==null?'Unlimited':String(code.total_usage_limit)]].forEach(([label,value])=>{const field=input('',label,value);field.readOnly=true;form.append(field);});list.append(form);});return;}const actions=document.createElement('div');actions.className='os-current-account-actions';actions.dataset.active=action;actions.append(Object.assign(document.createElement('span'),{className:'os-current-account-actions-indicator'}));[['create','ADD.svg'],['delete','DELETE.svg'],['update','EDIT.svg']].forEach(([name,icon])=>{const button=document.createElement('button');button.type='button';button.className='os-current-account-action';const image=document.createElement('img');image.src='/assets/icons/New/'+icon;image.alt='';button.append(image);button.addEventListener('click',async()=>{action=name;selectedId='';deleteConfirm=false;try{await load();}catch(_){codes=[];}render();});actions.append(button);});list.append(actions);if(action==='create'||action==='update'){if(action==='update'){list.append(selectCode());if(!selectedId)return;}const selected=codes.find(code=>code.id===selectedId);const form=formValues(selected);list.append(form,controls(async()=>{const values=new FormData(form);try{await mutate({action:action==='create'?'create':'update',id:selectedId,code:values.get('code'),discount:values.get('discount'),duration:values.get('duration'),allowedUses:values.get('allowedUses')});action='';selectedId='';render();}catch(_){}}));}if(action==='delete'){list.append(selectCode());if(!selectedId)return;list.append(controls(async()=>{if(!deleteConfirm){deleteConfirm=true;render();return;}try{await mutate({action:'delete',id:selectedId});action='';selectedId='';deleteConfirm=false;render();}catch(_){deleteConfirm=false;render();}}));}};mode.querySelectorAll('button').forEach(button=>button.addEventListener('click',async()=>{action='';selectedId='';deleteConfirm=false;try{await load();}catch(_){codes=[];}render();}));type.querySelectorAll('button').forEach(button=>button.addEventListener('click',async()=>{action='';selectedId='';deleteConfirm=false;try{await load();}catch(_){codes=[];}render();}));load().then(render).catch(()=>render());})();</script>`;
const panelThreeNotificationsScript = `<script>(()=>{const mode=document.querySelector('[data-os-panel-three-mode]'),type=document.querySelector('[data-os-panel-three-type]'),list=document.querySelector('[data-os-panel-three-list]');if(!mode||!type||!list)return;const endpoint='/api/os/index?route=notifications';let action='',selectedId='',confirmDelete=false,notifications=[];const load=async()=>{const response=await fetch(endpoint,{credentials:'same-origin'});if(!response.ok)throw new Error('notification_load_failed');notifications=await response.json();if(!Array.isArray(notifications))notifications=[];};const mutate=async body=>{const response=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||'notification_action_failed');await load();return result;};const controls=(onConfirm)=>{const group=document.createElement('div');group.className='os-current-account-confirm-actions';const cancel=document.createElement('button');cancel.type='button';cancel.className='os-current-account-cancel';cancel.textContent='Cancel';cancel.addEventListener('click',()=>{action='';selectedId='';confirmDelete=false;render();});const confirm=document.createElement('button');confirm.type='button';confirm.className='homepage-account-login';confirm.textContent='Confirm';confirm.addEventListener('click',onConfirm);group.append(cancel,confirm);return group;};const render=()=>{if(type.dataset.active!=='notifications')return;list.replaceChildren();if(mode.dataset.active==='current'){notifications.slice(0,3).forEach(note=>{const row=document.createElement('article');row.className='os-current-account-row';const details=document.createElement('div');details.className='os-current-account-details';const heading=document.createElement('strong');heading.textContent=note.title;const copy=document.createElement('span');copy.textContent=note.body;const date=document.createElement('small');date.textContent=new Date(note.publish_date).toLocaleDateString();details.append(heading,copy,date);row.append(details);list.append(row);});return;}const actions=document.createElement('div');actions.className='os-current-account-actions';actions.dataset.active=action;const indicator=document.createElement('span');indicator.className='os-current-account-actions-indicator';actions.append(indicator);[['create','ADD.svg'],['delete','DELETE.svg'],['update','EDIT.svg']].forEach(([name,icon])=>{const button=document.createElement('button');button.type='button';button.className='os-current-account-action';const image=document.createElement('img');image.src='/assets/icons/New/'+icon;image.alt='';button.append(image);button.addEventListener('click',async()=>{action=name;selectedId='';confirmDelete=false;try{await load();}catch(_){notifications=[];}render();});actions.append(button);});list.append(actions);if(action==='create'||action==='update'){if(action==='update'){const select=document.createElement('select');select.className='os-current-account-select';const blank=document.createElement('option');blank.value='';blank.textContent='Select Notification';select.append(blank);notifications.forEach(note=>{const option=document.createElement('option');option.value=note.id;option.textContent=note.title;select.append(option);});select.value=selectedId;select.addEventListener('change',()=>{selectedId=select.value;render();});list.append(select);if(!selectedId)return;}const selected=notifications.find(note=>note.id===selectedId);const form=document.createElement('form');form.className='os-current-account-form';[['title','Notification Title'],['publishDate','Publish Date'],['body','Notification Text']].forEach(([name,label])=>{const input=document.createElement('input');input.name=name;input.placeholder=label;input.value=selected?(name==='publishDate'?selected.publish_date.slice(0,16):selected[name]||''):'';if(name==='publishDate')input.type='datetime-local';form.append(input);});const audience=document.createElement('select');audience.name='audience';audience.className='os-current-account-select';[['','Audience'],['clients','Clients'],['employees','Employees'],['everyone','Everyone']].forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;audience.append(option);});audience.value=selected?.audience||'';form.append(audience);list.append(form,controls(async()=>{const values=new FormData(form);try{await mutate({action:action==='create'?'create':'update',id:selectedId,title:values.get('title'),publishDate:values.get('publishDate'),body:values.get('body'),audience:values.get('audience')});action='';selectedId='';render();}catch(_){}}));}if(action==='delete'){const select=document.createElement('select');select.className='os-current-account-select';const blank=document.createElement('option');blank.value='';blank.textContent='Select Notification';select.append(blank);notifications.forEach(note=>{const option=document.createElement('option');option.value=note.id;option.textContent=note.title;select.append(option);});select.value=selectedId;select.addEventListener('change',()=>{selectedId=select.value;confirmDelete=false;render();});list.append(select);if(!selectedId)return;const remove=document.createElement('button');remove.type='button';remove.className='os-current-account-delete';remove.textContent=confirmDelete?'Confirm':'Delete notification';remove.addEventListener('click',async()=>{if(!confirmDelete){confirmDelete=true;render();return;}try{await mutate({action:'delete',id:selectedId});action='';selectedId='';confirmDelete=false;render();}catch(_){}});list.append(controls(()=>remove.click()));}};mode.querySelectorAll('button').forEach(button=>button.addEventListener('click',async()=>{action='';selectedId='';confirmDelete=false;try{await load();}catch(_){notifications=[];}render();}));type.querySelectorAll('button').forEach(button=>button.addEventListener('click',async()=>{action='';selectedId='';confirmDelete=false;try{await load();}catch(_){notifications=[];}render();}));load().then(render).catch(()=>render());})();</script>`;
const panelStateResetScript = `<script>(()=>{const dashboard=document.querySelector('.os-dashboard-experience');if(!dashboard)return;const select=(attribute,value)=>document.querySelector('['+attribute+'="'+value+'"]')?.click();dashboard.addEventListener('os-panel-activated',event=>{if(event.detail.panel===1){select('data-os-accounts-mode-option','current');select('data-os-accounts-type-option','employee');}if(event.detail.panel===2){select('data-os-panel-three-mode-option','current');select('data-os-panel-three-type-option','discount-codes');}});})();</script>`;
const dashboard = () => `${head('OOXME OS')}<body class="os-page"><main class="master-panel-experience os-experience os-dashboard-experience"><div class="master-panel-track os-panel-track">${dashboardPanel([['Website','website'],['Vercel','vercel'],['GitHub','github'],['Gmail','gmail'],['Drive','drive'],['Calendar','calendar'],['WhatsApp','whatsapp'],['Facebook','facebook'],['Instagram','instagram'],['YCloud','ycloud'],['GPT','gpt'],['Neon','neon']], true)}${currentAccountsPanel()}${panelThreeAccountsPanel()}</div></main><script src="/js/os-language.js"></script><script src="/js/authenticated-navigation.js"></script>${dashboardScript}${currentAccountsScript}${panelThreeDiscountScriptLive}${panelThreeNotificationsScript}${panelStateResetScript}</body></html>`;

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

const accountManagement = () => shell(`<section class="master-panel-content os-content os-account-content"><div class="os-title-row"><h1 data-os-text="accountManagement">Account Management</h1><div class="os-account-top-actions"><a class="os-account-back" href="/os" data-os-text="osDashboard">OS Dashboard</a></div></div><section class="os-account-layout"><section class="os-account-directory" aria-label="Account directory"><div class="os-account-tabs" role="tablist"><button type="button" data-account-type-tab="employee" data-os-text="employees">Employees</button><button type="button" data-account-type-tab="client" data-os-text="clients">Clients</button></div><div class="os-account-list" data-account-list></div></section><section class="os-account-editor"><div class="os-account-editor-heading"><h2 data-account-form-title data-os-text="createAccount">Create account</h2><button type="button" class="os-account-new" data-account-new data-os-text="newAccount">New account</button></div><form class="os-account-form" data-account-form data-mode="create"><label><span data-os-text="accountType">Account type</span><select data-account-type><option value="employee" data-os-text="employee">Employee</option><option value="client" data-os-text="client">Client</option></select></label><label><span data-os-text="username">Username</span><input data-account-username autocomplete="username" required></label><label><span data-os-text="displayName">Display name</span><input data-account-display autocomplete="name" required></label><label><span data-account-profile-label data-os-text="jobTitle">Job title</span><input data-account-profile></label><label><span data-os-text="password">Password</span><input type="password" data-account-password autocomplete="new-password" required></label><p class="os-error" data-account-error role="alert"></p><button type="submit" class="os-account-primary" data-account-submit data-os-text="createAccount">Create account</button></form><div class="os-account-danger-actions"><button type="button" data-account-status hidden></button><button type="button" data-account-delete hidden data-os-text="deleteAccount">Delete account</button></div></section></section></section><script src="/js/os-language.js"></script>${accountManagementScript}`, 'OOXME OS — Account Management');

module.exports = { login, dashboard, accountManagement };
