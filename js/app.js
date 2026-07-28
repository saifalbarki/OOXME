const copy={en:{title:'OOXME — Business Developer Partner',navHome:'Home',navWork:'Creative Work',navServices:'Creative Services',navProcess:'Process',navContact:'Contact',eyebrow:'Business Developer Partner',heroTitle:'Digital experiences',heroAccent:'with an edge.',heroIntro:'OOXME helps bold businesses find their voice, shape their look, and move forward.',workLabel:'01 / Creative Work',workHeading:'Ideas in<br>the wild',workCopy:'A selection of identities and experiences shaped to be clear, memorable, and useful.',workItem1:'Businesses we managed <span>01</span>',workItem2:'Brands we have designed <span>02</span>',workItem3:'Visual identities we have designed <span>03</span>',workItem4:'Logos we designed <span>04</span>',servicesLabel:'02 / Creative Services',servicesHeading:'Make your<br>mark.',servicesCopy:'From the first spark to the finished expression, we help ambitious teams create distinctive work with clarity and intent.',servicesItem1:'Brand strategy <span>01</span>',servicesItem2:'Visual identity <span>02</span>',servicesItem3:'Art direction <span>03</span>',servicesItem4:'Digital design <span>04</span>',processLabel:'03 / Process',processHeading:'Good work<br>has rhythm.',processCopy:'Every project follows a focused path — enough structure to stay clear, with room for the unexpected.',processItem1:'Discover <span>01</span>',processItem2:'Define <span>02</span>',processItem3:'Design <span>03</span>',processItem4:'Deliver <span>04</span>',contactLabel:'04 / Contact',contactHeading:'Let’s make<br>something move.',contactCopy:'Have a project, partnership, or an idea worth exploring? We’d love to hear from you.',language:'العربية',languageAria:'Switch to Arabic',menuOpen:'Open menu',menuClose:'Close menu',email:'Email OOXME',phone:'Call OOXME',whatsapp:'Message OOXME on WhatsApp',instagram:'Visit OOXME on Instagram',linkedin:'Visit OOXME on LinkedIn'},ar:{title:'أوكسمي — شريك تطوير الأعمال',navHome:'الرئيسية',navWork:'الأعمال الإبداعية',navServices:'الخدمات الإبداعية',navProcess:'المنهجية',navContact:'تواصل معنا',eyebrow:'شريك تطوير الأعمال',heroTitle:'تجارب رقمية',heroAccent:'بلمسة مختلفة.',heroIntro:'نساعد الشركات الجريئة على اكتشاف صوتها وبناء حضورها والمضي قدمًا.',workLabel:'٠١ / الأعمال الإبداعية',workHeading:'أفكار تنبض<br>بالحياة',workCopy:'مجموعة من الهويات والتجارب التي صُممت لتكون واضحة، مؤثرة، وسهلة التذكر.',workItem1:'أعمال نديرها <span>٠١</span>',workItem2:'علامات صممناها <span>٠٢</span>',workItem3:'هويات بصرية صممناها <span>٠٣</span>',workItem4:'شعارات صممناها <span>٠٤</span>',servicesLabel:'٠٢ / الخدمات الإبداعية',servicesHeading:'اصنع<br>بصمتك.',servicesCopy:'من الشرارة الأولى إلى النتيجة النهائية، نساعد الفرق الطموحة على صنع عمل مميز بوضوح وهدف.',servicesItem1:'استراتيجية العلامة <span>٠١</span>',servicesItem2:'الهوية البصرية <span>٠٢</span>',servicesItem3:'التوجيه الفني <span>٠٣</span>',servicesItem4:'التصميم الرقمي <span>٠٤</span>',processLabel:'٠٣ / المنهجية',processHeading:'العمل الجيد<br>له إيقاع.',processCopy:'كل مشروع يسير ضمن مسار واضح؛ هيكل منظم يترك مساحة لما هو غير متوقع.',processItem1:'اكتشاف <span>٠١</span>',processItem2:'تحديد <span>٠٢</span>',processItem3:'تصميم <span>٠٣</span>',processItem4:'تسليم <span>٠٤</span>',contactLabel:'٠٤ / تواصل معنا',contactHeading:'لنصنع<br>شيئًا مؤثرًا.',contactCopy:'هل لديك مشروع أو شراكة أو فكرة تستحق الاستكشاف؟ يسعدنا أن نسمع منك.',language:'EN',languageAria:'التبديل إلى الإنجليزية',menuOpen:'فتح القائمة',menuClose:'إغلاق القائمة',email:'البريد الإلكتروني لأوكسمي',phone:'الاتصال بأوكسمي',whatsapp:'مراسلة أوكسمي عبر واتساب',instagram:'زيارة أوكسمي على إنستغرام',linkedin:'زيارة أوكسمي على لينكدإن'}};
const root=document.documentElement;
const menuButton=document.querySelector('.menu-toggle');
const languageButton=document.querySelector('.language-toggle');
const nav=document.querySelector('.primary-nav');
const menuScrim=document.querySelector('.menu-scrim');
const navLinks=[...nav.querySelectorAll('a')];
let language='en';
try{language=localStorage.getItem('ooxme-language')==='ar'?'ar':'en'}catch(error){}

function setMenu(open){
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',copy[language][open?'menuClose':'menuOpen']);
  nav.classList.toggle('is-open',open);
  menuScrim.classList.toggle('is-visible',open);
  document.body.classList.toggle('menu-open',open);
}

function setLanguage(next){
  language=next;
  root.lang=next;
  root.dir=next==='ar'?'rtl':'ltr';
  document.title=copy[next].title;
  document.querySelectorAll('[data-i18n]').forEach((element)=>{element.innerHTML=copy[next][element.dataset.i18n]});
  document.querySelectorAll('[data-aria-key]').forEach((element)=>{element.setAttribute('aria-label',copy[next][element.dataset.ariaKey])});
  languageButton.textContent=copy[next].language;
  languageButton.classList.toggle('is-arabic-label',next==='en');
  languageButton.setAttribute('aria-label',copy[next].languageAria);
  setMenu(false);
  try{localStorage.setItem('ooxme-language',next)}catch(error){}
}

function setActiveLink(id){
  navLinks.forEach((link)=>link.classList.toggle('is-active',link.getAttribute('href')===`#${id}`));
}

menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
languageButton.addEventListener('click',()=>setLanguage(language==='en'?'ar':'en'));
menuScrim.addEventListener('click',()=>setMenu(false));
navLinks.forEach((link)=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',(event)=>{if(event.key==='Escape')setMenu(false)});
root.classList.add('js');

if('IntersectionObserver'in window){
  const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>entry.target.classList.toggle('is-visible',entry.isIntersecting)),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach((section)=>observer.observe(section));
  const navigationObserver=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting)setActiveLink(entry.target.id)}),{rootMargin:'-34% 0px -56% 0px',threshold:0});
  document.querySelectorAll('main section[id]').forEach((section)=>navigationObserver.observe(section));
}
setLanguage(language);
