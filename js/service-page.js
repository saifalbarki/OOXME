const serviceContent={
  'businesses-we-managed':{en:['Businesses We Managed','Growth with a clear direction.','We help ambitious businesses turn focused decisions into steady momentum.','Business development'],ar:['الأعمال التي أدرناها','نمو باتجاه واضح.','نساعد الشركات الطموحة على تحويل القرارات المركزة إلى زخم مستمر.','تطوير الأعمال']},
  'brands-we-designed':{en:['Brands We Designed','Distinctive brands, built to move.','A considered brand system gives every ambitious idea a clear place in the world.','Brand work'],ar:['علامات صممناها','علامات مميزة صُممت لتتحرك.','منظومة علامة مدروسة تمنح كل فكرة طموحة مكانًا واضحًا في العالم.','عمل العلامة']},
  'visual-identities':{en:['Visual Identities','A visual language with intent.','We shape visual identities that make businesses recognizable, useful, and memorable.','Identity design'],ar:['الهويات البصرية','لغة بصرية ذات هدف.','نصمم هويات بصرية تجعل الأعمال واضحة ومفيدة وسهلة التذكر.','تصميم الهوية']},
  'logos-we-designed':{en:['Logos We Designed','One mark. A lasting signal.','A strong logo creates a focused first impression and a flexible foundation for growth.','Logo design'],ar:['الشعارات التي صممناها','رمز واحد. إشارة تدوم.','يصنع الشعار القوي انطباعًا أوليًا واضحًا وأساسًا مرنًا للنمو.','تصميم الشعار']},
  'brand-strategy':{en:['Brand Strategy','Find the signal in the noise.','We clarify your position, audience, and opportunity so every next move has purpose.','Strategy'],ar:['استراتيجية العلامة','اكتشف الإشارة وسط الضجيج.','نوضح موقعك وجمهورك وفرصتك لتكون كل خطوة تالية ذات هدف.','الاستراتيجية']},
  'visual-identity':{en:['Visual Identity','Make your mark.','A coherent visual system turns your point of view into an experience people remember.','Creative service'],ar:['الهوية البصرية','اصنع بصمتك.','يحوّل النظام البصري المتماسك وجهة نظرك إلى تجربة يتذكرها الناس.','خدمة إبداعية']},
  'art-direction':{en:['Art Direction','Ideas with a point of view.','We guide the visual story across every touchpoint, from the first frame to the final detail.','Creative service'],ar:['التوجيه الفني','أفكار بوجهة نظر.','نقود القصة البصرية عبر كل نقطة تواصل، من الإطار الأول إلى التفاصيل الأخيرة.','خدمة إبداعية']},
  'digital-design':{en:['Digital Design','Useful can still feel unexpected.','We design digital moments that are clear to use and distinctive enough to stay with people.','Creative service'],ar:['التصميم الرقمي','ما هو مفيد يمكن أن يكون غير متوقع.','نصمم لحظات رقمية واضحة الاستخدام ومميزة بما يكفي لتبقى مع الناس.','خدمة إبداعية']},
  discover:{en:['Discover','Start with the right questions.','We listen, research, and find the opportunity that gives the work a meaningful direction.','Process'],ar:['اكتشاف','ابدأ بالأسئلة الصحيحة.','نستمع ونبحث ونجد الفرصة التي تمنح العمل اتجاهًا ذا معنى.','المنهجية']},
  define:{en:['Define','Turn insight into a clear brief.','We align the ambition, audience, and priorities before the making begins.','Process'],ar:['تحديد','حوّل الرؤية إلى موجز واضح.','نوحّد الطموح والجمهور والأولويات قبل أن يبدأ التنفيذ.','المنهجية']},
  design:{en:['Design','Give the idea a form.','We explore, refine, and build the visual language that makes the strategy tangible.','Process'],ar:['تصميم','امنح الفكرة شكلًا.','نستكشف ونصقل ونبني اللغة البصرية التي تجعل الاستراتيجية ملموسة.','المنهجية']},
  deliver:{en:['Deliver','Make it ready to move.','We prepare the final system, assets, and handoff so the work performs in the real world.','Process'],ar:['تسليم','اجعلها جاهزة للتحرك.','نجهز النظام النهائي والأصول والتسليم ليؤدي العمل في العالم الحقيقي.','المنهجية']}
};
serviceContent.consultation={en:['Consultation','Let’s Build Your Business Together','Book a consultation with OOXME to discuss your business, identify opportunities, and create a clear growth strategy.','Consultation'],ar:['استشارة','لنبنِ نمو أعمالك معًا','احجز جلسة استشارية مع اوكسوم لمناقشة أعمالك وتحديد الفرص وبناء استراتيجية نمو واضحة.','استشارة']};

let serviceLanguage='en';
try{serviceLanguage=localStorage.getItem('ooxme-language')==='ar'?'ar':'en'}catch(error){}
const serviceKey=document.body.dataset.service;
const content=serviceContent[serviceKey]||serviceContent['brand-strategy'];
const languageButton=document.querySelector('.language-toggle');

function setServiceLanguage(next){
  serviceLanguage=next;
  const value=content[next];
  document.documentElement.lang=next;
  document.documentElement.dir=next==='ar'?'rtl':'ltr';
  document.title=`${value[0]} - OOXME`;
  document.querySelector('[data-page-label]').textContent=value[3];
  document.querySelector('[data-page-heading]').textContent=value[0];
  document.querySelector('[data-page-description]').textContent=value[2];
  const panel=document.querySelector('[data-page-placeholder]');
  const isArabic=next==='ar';
  const items=isArabic?['اتجاه واضح','نظام مترابط','تنفيذ قابل للقياس']:['Clear direction','A connected system','Measurable execution'];
  panel.classList.add('service-detail-panel');
  panel.innerHTML=`<p class="eyebrow">${isArabic?'كيف نساعد':'How we help'}</p><h2>${value[0]}</h2><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul><a class="primary-button" href="consultation.html">${isArabic?'ابدأ محادثة':'Start a conversation'}</a>`;
  languageButton.setAttribute('aria-label',next==='en'?'Switch to Arabic':'التبديل إلى الإنجليزية');
  try{localStorage.setItem('ooxme-language',next)}catch(error){}
}

languageButton.addEventListener('click',()=>setServiceLanguage(serviceLanguage==='en'?'ar':'en'));
document.documentElement.classList.add('js');
document.querySelectorAll('.page-text').forEach((element,index)=>{element.classList.add('text-reveal');element.style.transitionDelay=`${index*70}ms`});
setServiceLanguage(serviceLanguage);
requestAnimationFrame(()=>document.querySelectorAll('.text-reveal').forEach((element)=>element.classList.add('is-visible')));
