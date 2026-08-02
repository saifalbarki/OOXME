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
    trigger.innerHTML='<span class="sidebar-icon" aria-hidden="true"></span>';
    legacy.replaceWith(trigger);
  }
  if(!trigger.querySelector('.sidebar-icon')){
    const image=trigger.querySelector('img');
    if(image)image.remove();
    trigger.insertAdjacentHTML('afterbegin','<span class="sidebar-icon" aria-hidden="true"></span>');
  }
  let menu=document.querySelector('.site-menu');
  if(!menu){
    menu=document.createElement('nav');
    menu.className='site-menu ooxme-sidebar';
    menu.setAttribute('aria-label','Primary navigation');
    menu.innerHTML='<div class="sidebar-intro"><p>Hello, you are in OOXME.</p><span>Make your next move meaningful.</span></div><div class="sidebar-links"><a href="index.html">Home</a><a href="portfolio.html">Portfolio</a><a href="services.html">Services</a><a href="consultation.html">Consultation</a></div>';
    document.body.append(menu);
  }
  const close=()=>{menu.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','Open menu');document.body.classList.remove('menu-open')};
  trigger.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',open?'Close menu':'Open menu');document.body.classList.toggle('menu-open',open)});
  menu.querySelectorAll('a').forEach((link)=>link.addEventListener('click',close));
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')close()});
})();
