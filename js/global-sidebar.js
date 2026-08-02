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
    trigger.setAttribute('aria-label','Open menu');
    trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML='<img class="menu-icon" src="assets/icons/menu.png" alt="" />';
    legacy.replaceWith(trigger);
  }
  if(!trigger.querySelector('.menu-icon'))trigger.innerHTML='<img class="menu-icon" src="assets/icons/menu.png" alt="" />';
  let menu=document.querySelector('.site-menu');
  if(!menu){
    menu=document.createElement('nav');
    menu.className='site-menu ooxme-sidebar';
    menu.setAttribute('aria-label','Primary navigation');
    menu.innerHTML='<div class="sidebar-intro"><p>Hello</p><span>Make your next move meaningful.</span></div><div class="sidebar-links"><a href="index.html">Home</a><a href="portfolio.html">Portfolio</a><a href="services.html">Services</a><a href="consultation.html">Consultation</a></div>';
    document.body.append(menu);
  }
  const syncMenuLanguage=()=>{
    const arabic=document.documentElement.lang==='ar';
    menu.dir=arabic?'rtl':'ltr';
    menu.setAttribute('aria-label',arabic?'التنقل الرئيسي':'Primary navigation');
    const intro=menu.querySelector('.sidebar-intro p');
    const phrase=menu.querySelector('.sidebar-intro span');
    if(intro)intro.textContent=arabic?'مرحبًا':'Hello';
    if(phrase)phrase.textContent=arabic?'خطوتك القادمة تبدأ بوضوح.':'Make your next move meaningful.';
    menu.querySelectorAll('.sidebar-links a').forEach((link)=>{
      const labels={
        'index.html':arabic?'الرئيسية':'Home',
        'portfolio.html':arabic?'المعرض':'Portfolio',
        'services.html':arabic?'الخدمات':'Services',
        'consultation.html':arabic?'استشارة':'Consultation'
      };
      const href=link.getAttribute('href');
      if(labels[href])link.textContent=labels[href];
    });
  };
  syncMenuLanguage();
  new MutationObserver(syncMenuLanguage).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
  const close=()=>{menu.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','Open menu');document.body.classList.remove('menu-open')};
  trigger.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Close menu':'Open menu');document.body.classList.toggle('menu-open',open)});
  menu.querySelectorAll('a').forEach((link)=>link.addEventListener('click',close));
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')close()});
})();
