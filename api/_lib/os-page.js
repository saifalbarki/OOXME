const head = title => `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="/css/styles.css"><link rel="stylesheet" href="/css/os.css"></head>`;

const panelHeader = () => `<header class="master-panel-header os-header"><span class="master-panel-control os-header-mark" aria-hidden="true"></span><a class="master-panel-logo" href="/" aria-label="OOXME home"><img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME"></a><span class="master-panel-control os-search-control" aria-hidden="true"></span></header>`;
const panelFooter = () => `<footer class="master-panel-footer os-footer"><span class="swipe-control" aria-hidden="true"><span class="swipe-control-line"></span></span></footer>`;
const shell = (content, title) => `${head(title)}<body class="os-page"><main class="master-panel-experience os-experience"><section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}${content}${panelFooter()}</article></section></main></body></html>`;

const login = () => shell(`<section class="master-panel-content has-simplified-text-hierarchy os-content os-login-content"><p class="master-panel-label">PRIVATE SYSTEM</p><h1>OOXME OS</h1><p>Sign in to access operational status.</p><form class="os-login" data-os-login><label><span>Username</span><input name="username" placeholder="Username" autocomplete="username" required></label><label><span>Password</span><input type="password" name="password" placeholder="Password" autocomplete="current-password" required></label><button type="submit">Sign in <i aria-hidden="true"></i></button><p class="os-error" data-os-error role="alert"></p></form></section><script>document.querySelector('[data-os-login]').addEventListener('submit',async event=>{event.preventDefault();const form=new FormData(event.currentTarget),error=document.querySelector('[data-os-error]');error.textContent='';const response=await fetch('/api/os/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password')})});if(response.ok)location.assign('/os');else error.textContent='Unable to sign in.';});</script>`, 'OOXME OS — Sign in');

const cards = items => `<section class="os-grid">${items.map(([name, key]) => `<article class="os-card" data-state="unavailable"${key ? ` data-os-service="${key}"` : ''}><div><span class="os-card-label">STATUS</span><h2>${name}</h2><p data-os-status>${key ? 'Loading…' : 'Pending'}</p>${key ? '<small data-os-meta></small>' : ''}</div><span class="os-card-dot" aria-hidden="true"></span></article>`).join('')}</section>`;
const dashboardPanel = items => `<section class="master-panel-screen is-active os-screen"><article class="master-panel os-panel">${panelHeader()}<section class="master-panel-content os-content os-dashboard-content"><div class="os-title-row"><h1>OOXME OS</h1><form action="/api/os/logout" method="post"><button class="os-logout" type="submit">Log out</button></form></div>${cards(items)}</section>${panelFooter()}</article></section>`;

const dashboardScript = `<script>
const setStatus=(name,value)=>{
  const card=document.querySelector('[data-os-service="'+name+'"]');
  if(!card)return;
  card.dataset.state=value.state||'error';
  card.querySelector('[data-os-status]').textContent=value.label||'Unavailable';
  let detail=value.detail||'';
  if(name==='github'&&value.branch)detail=[value.branch,value.latestCommit,value.author,value.date,value.activity,'PR '+value.pullRequests,'Issues '+value.issues].join(' · ');
  if(name==='gmail'&&value.messages)detail=['Unread: '+value.unread,...value.messages.map(message=>message.sender+' — '+message.subject+' · '+message.date+'\\n'+message.preview)].join('\\n');
  card.querySelector('[data-os-meta]').textContent=detail;
};
fetch('/api/os/index?route=status',{credentials:'same-origin'})
  .then(response=>response.ok?response.json():Promise.reject())
  .then(data=>{['website','github','vercel','gmail','calendar','drive','neon','gpt','ycloud','whatsapp','facebook','instagram'].forEach(name=>setStatus(name,data[name]));})
  .catch(()=>{['website','github','vercel','gmail','calendar','drive','neon','gpt','ycloud','whatsapp','facebook','instagram'].forEach(name=>setStatus(name,{state:'error',label:'Unavailable',detail:'Status check failed'}));});
</script>`;

const dashboard = () => `${head('OOXME OS')}<body class="os-page"><main class="master-panel-experience os-experience os-dashboard-experience"><div class="master-panel-track os-panel-track">${dashboardPanel([['Website','website'],['GitHub','github'],['Vercel','vercel'],['Neon','neon']])}${dashboardPanel([['GPT','gpt'],['Calendar','calendar'],['Gmail','gmail'],['Drive','drive']])}${dashboardPanel([['YCloud','ycloud'],['WhatsApp','whatsapp'],['Facebook','facebook'],['Instagram','instagram']])}</div></main>${dashboardScript}</body></html>`;

module.exports = { login, dashboard };
