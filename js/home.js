const homeCopy={
  en:{title:'OOXME — Let’s Change',navHome:'Home',navPortfolio:'Portfolio',navConsultation:'Consultation',headline:"Let's Change",supporting:'OOXME helps businesses grow through smarter operations, stronger branding, optimized workflows, and measurable business development. Transform your company into a scalable, organized, and profitable business.',next:'Next',languageAria:'Switch to Arabic',menuOpen:'Open menu',menuClose:'Close menu'},
  ar:{title:'OOXME',navHome:'الرئيسية',navPortfolio:'المعرض',navConsultation:'استشارة',headline:'لنغيّر',supporting:'تساعد أوكسوم الشركات على النمو عبر عمليات أكثر ذكاءً، وهوية أقوى، وسير عمل منظم، وتطوير أعمال قابل للقياس. حوّل شركتك إلى عمل قابل للتوسع والتنظيم والربح.',next:'التالي',languageAria:'التبديل إلى الإنجليزية',menuOpen:'فتح القائمة',menuClose:'إغلاق القائمة'}
};
const homeRoot=document.documentElement;
const homeMenu=document.querySelector('.site-menu');
const homeMenuButton=document.querySelector('.menu-toggle');
const homeLanguageButton=document.querySelector('.language-toggle');
const homeNextButton=document.querySelector('[data-next]');
let homeLanguage='en';

function setHomeMenu(open){homeMenu.classList.toggle('is-open',open);homeMenuButton.setAttribute('aria-expanded',String(open));homeMenuButton.setAttribute('aria-label',homeCopy[homeLanguage][open?'menuClose':'menuOpen']);document.body.classList.toggle('menu-open',open)}
function setHomeLanguage(next){homeLanguage=next;const copy=homeCopy[next];homeRoot.lang=next;homeRoot.dir=next==='ar'?'rtl':'ltr';document.title=copy.title;document.querySelectorAll('[data-i18n]').forEach((element)=>{element.textContent=copy[element.dataset.i18n]});homeLanguageButton.setAttribute('aria-label',copy.languageAria);try{localStorage.setItem('ooxme-language',next)}catch(error){}}

homeMenuButton.addEventListener('click',()=>setHomeMenu(!homeMenu.classList.contains('is-open')));
homeLanguageButton.addEventListener('click',()=>setHomeLanguage(homeLanguage==='en'?'ar':'en'));
homeMenu.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>setHomeMenu(false)));
homeNextButton.addEventListener('click',()=>{window.location.href='portfolio.html'});
document.addEventListener('keydown',(event)=>{if(event.key==='Escape')setHomeMenu(false)});
homeRoot.classList.add('js');
setHomeLanguage('en');
const homeRevealElements=[...document.querySelectorAll('.text-reveal')];
if('IntersectionObserver'in window){const homeObserver=new IntersectionObserver((entries)=>entries.forEach((entry)=>entry.target.classList.toggle('is-visible',entry.isIntersecting)),{threshold:.14});homeRevealElements.forEach((element,index)=>{element.style.transitionDelay=`${index*110}ms`;homeObserver.observe(element)})}else{homeRevealElements.forEach((element)=>element.classList.add('is-visible'))}
