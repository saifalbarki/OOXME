const homeCopy={
  en:{title:'OOXME — Business Development Partner',navHome:'Home',navPortfolio:'Portfolio',navConsultation:'Consultation',eyebrow:'Business Development Partner',headline:'Building Businesses<br>That Lead Markets.',supporting:'We help ambitious businesses grow through strategic business development, brand management, digital experiences, and creative execution—turning ideas into measurable success.',english:'English',arabic:'العربية',languageAria:'Switch to Arabic',menuOpen:'Open menu',menuClose:'Close menu'},
  ar:{title:'أوكسمي — شريك تطوير الأعمال',navHome:'الرئيسية',navPortfolio:'المعرض',navConsultation:'استشارة',eyebrow:'شريك تطوير الأعمال',headline:'نبني أعمالًا<br>تقود الأسواق.',supporting:'نساعد الأعمال الطموحة على النمو عبر تطوير الأعمال الاستراتيجي وإدارة العلامات التجارية والتجارب الرقمية والتنفيذ الإبداعي، لنحوّل الأفكار إلى نجاح قابل للقياس.',english:'English',arabic:'العربية',languageAria:'التبديل إلى الإنجليزية',menuOpen:'فتح القائمة',menuClose:'إغلاق القائمة'}
};
const homeRoot=document.documentElement;
const homeMenu=document.querySelector('.site-menu');
const homeMenuButton=document.querySelector('.menu-toggle');
const homeLanguageButton=document.querySelector('.language-toggle');
let homeLanguage='en';

function setHomeMenu(open){homeMenu.classList.toggle('is-open',open);homeMenuButton.setAttribute('aria-expanded',String(open));homeMenuButton.setAttribute('aria-label',homeCopy[homeLanguage][open?'menuClose':'menuOpen']);document.body.classList.toggle('menu-open',open)}
function setHomeLanguage(next){homeLanguage=next;const copy=homeCopy[next];homeRoot.lang=next;homeRoot.dir=next==='ar'?'rtl':'ltr';document.title=copy.title;document.querySelectorAll('[data-i18n]').forEach((element)=>{element.innerHTML=copy[element.dataset.i18n]});homeLanguageButton.setAttribute('aria-label',copy.languageAria);try{localStorage.setItem('ooxme-language',next)}catch(error){}}

homeMenuButton.addEventListener('click',()=>setHomeMenu(!homeMenu.classList.contains('is-open')));
homeLanguageButton.addEventListener('click',()=>setHomeLanguage(homeLanguage==='en'?'ar':'en'));
homeMenu.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>setHomeMenu(false)));
document.addEventListener('keydown',(event)=>{if(event.key==='Escape')setHomeMenu(false)});
document.querySelectorAll('[data-language-choice]').forEach((button)=>button.addEventListener('click',()=>{setHomeLanguage(button.dataset.languageChoice);window.location.href='portfolio.html'}));
homeRoot.classList.add('js');
setHomeLanguage('en');
requestAnimationFrame(()=>document.querySelectorAll('.text-reveal').forEach((element,index)=>{element.style.transitionDelay=`${index*80}ms`;element.classList.add('is-visible')}));
