(()=>{
  const header=document.querySelector('.site-header');
  if(!header)return;

  let trigger=header.querySelector('.menu-toggle');
  if(!trigger){
    const legacy=header.querySelector('.home-control');
    if(!legacy)return;
    trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='icon-control menu-toggle';
    trigger.innerHTML='<img class="menu-icon" src="assets/icons/menu.png" alt="" />';
    legacy.replaceWith(trigger);
  }
  if(!trigger.querySelector('.menu-icon'))trigger.innerHTML='<img class="menu-icon" src="assets/icons/menu.png" alt="" />';
  trigger.setAttribute('aria-expanded','false');

  let menu=document.querySelector('.site-menu');
  if(!menu){
    menu=document.createElement('nav');
    menu.className='site-menu';
    document.body.append(menu);
  }

  const originalLinks=Array.from(menu.querySelectorAll('a')).map((link)=>({
    href:link.getAttribute('href')||'#',
    target:link.getAttribute('target'),
    rel:link.getAttribute('rel'),
    key:link.getAttribute('data-i18n')
  }));
  const fallbackLinks=[
    {href:'/'},
    {href:'/portfolio'},
    {href:'/services'},
    {href:'/consultation'}
  ];
  const links=originalLinks.length?originalLinks:fallbackLinks;
  menu.classList.add('ooxme-sidebar');
  menu.innerHTML='<div class="sidebar-intro"><p></p></div><div class="sidebar-links"><span class="sidebar-phrase"></span></div>';
  const linksWrap=menu.querySelector('.sidebar-links');
  const phrase=menu.querySelector('.sidebar-phrase');
  links.forEach((item)=>{
    const link=document.createElement('a');
    link.href=item.href;
    if(item.target)link.target=item.target;
    if(item.rel)link.rel=item.rel;
    if(item.key)link.dataset.i18n=item.key;
    linksWrap.insertBefore(link,phrase);
  });

  const labels={
    en:{
      greeting:'Hello', phrase:'Make your next move meaningful.', aria:'Primary navigation',
      '/':'Home','/portfolio':'Portfolio','#work':'Previous Work','#plans':'Plans',
      '/services':'Services','#services':'Services','/consultation':'Consultation',
      '#consultation':'Consultation','#contact':'Contact'
    },
    ar:{
      greeting:'\u0645\u0631\u062d\u0628\u064b\u0627', phrase:'\u062e\u0637\u0648\u062a\u0643 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u062a\u0628\u062f\u0623 \u0628\u0648\u0636\u0648\u062d.', aria:'\u0627\u0644\u062a\u0646\u0642\u0644 \u0627\u0644\u0631\u0626\u064a\u0633\u064a',
      '/':'\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629','/portfolio':'\u0627\u0644\u0645\u0639\u0631\u0636','#work':'\u0623\u0639\u0645\u0627\u0644 \u0633\u0627\u0628\u0642\u0629','#plans':'\u0627\u0644\u0628\u0627\u0642\u0627\u062a',
      '/services':'\u0627\u0644\u062e\u062f\u0645\u0627\u062a','#services':'\u0627\u0644\u062e\u062f\u0645\u0627\u062a','/consultation':'\u0627\u0633\u062a\u0634\u0627\u0631\u0629',
      '#consultation':'\u0627\u0633\u062a\u0634\u0627\u0631\u0629','#contact':'\u062a\u0648\u0627\u0635\u0644'
    }
  };
  const syncMenuLanguage=()=>{
    const language=document.documentElement.lang==='ar'?'ar':'en';
    const copy=labels[language];
    menu.dir=language==='ar'?'rtl':'ltr';
    menu.setAttribute('aria-label',copy.aria);
    menu.querySelector('.sidebar-intro p').textContent=copy.greeting;
    menu.querySelector('.sidebar-phrase').textContent=copy.phrase;
    menu.querySelectorAll('.sidebar-links a').forEach((link)=>{
      const label=copy[link.getAttribute('href')];
      if(label)link.textContent=label;
    });
    trigger.setAttribute('aria-label',menu.classList.contains('is-open')?(language==='ar'?'\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0642\u0627\u0626\u0645\u0629':'Close menu'):(language==='ar'?'\u0641\u062a\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629':'Open menu'));
  };
  const close=()=>{
    menu.classList.remove('is-open');
    trigger.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
    syncMenuLanguage();
  };
  syncMenuLanguage();
  new MutationObserver(syncMenuLanguage).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
  trigger.addEventListener('click',()=>{
    const open=!menu.classList.contains('is-open');
    menu.classList.toggle('is-open',open);
    trigger.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('menu-open',open);
    syncMenuLanguage();
  });
  menu.querySelectorAll('a').forEach((link)=>link.addEventListener('click',close));
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')close()});
})();
