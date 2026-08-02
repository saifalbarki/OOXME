const repairLocalizedText=window.repairLocalizedText||(window.repairLocalizedText=(root=document.body)=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){const value=node.nodeValue;if(/[ÃÂØÙâ]/.test(value)){try{node.nodeValue=decodeURIComponent(escape(value))}catch(error){}}}});
new MutationObserver(()=>repairLocalizedText()).observe(document.body,{childList:true,subtree:true,characterData:true});
repairLocalizedText();
const detailContent={
 'project-albasri-commercial-group':{en:['Project','Albasri Commercial Group','A focused brand and business development engagement designed to strengthen clarity, presence, and commercial momentum.'],ar:['مشروع','مجموعة البصري التجارية','مشروع علامة وتطوير أعمال صُمم لتعزيز الوضوح والحضور والزخم التجاري.']},
 'project-alfayha-eyewear':{en:['Project','Alfayha Eyewear','A refined identity and customer experience direction for a modern eyewear business.'],ar:['مشروع','نظارات الفيحاء','توجيه لهوية وتجربة عميل راقية لعلامة نظارات عصرية.']},
 'project-viir':{en:['Project','Viir','A distinctive visual system created to make a new idea recognizable and ready to grow.'],ar:['مشروع','فيير','نظام بصري مميز صُمم ليجعل الفكرة الجديدة واضحة وجاهزة للنمو.']},
 'project-zone-restaurant':{en:['Project','Zone Restaurant','A hospitality brand direction that turns atmosphere into a memorable business experience.'],ar:['مشروع','مطعم زون','توجيه لعلامة ضيافة يحوّل الأجواء إلى تجربة أعمال لا تُنسى.']},
 'plan-starter':{en:['Growth Plan','Starter','A focused monthly partnership for businesses ready to build a solid strategic and creative foundation.'],ar:['باقة نمو','البداية','شراكة شهرية مركزة للأعمال المستعدة لبناء أساس استراتيجي وإبداعي قوي.']},
 'plan-standard':{en:['Growth Plan','Standard','An ongoing partnership that connects strategy, execution, and consistent business progress.'],ar:['باقة نمو','القياسية','شراكة مستمرة تربط الاستراتيجية والتنفيذ والتقدم المنتظم للأعمال.']},
 'plan-plus':{en:['Growth Plan','Plus','A high-touch growth partnership for businesses that need a dedicated, multi-disciplinary OOXME team.'],ar:['باقة نمو','بلس','شراكة نمو متقدمة للأعمال التي تحتاج فريق اوكسوم متخصصًا ومتعدد الخبرات.']},
 'service-business-development':{en:['Service','Business Development','We identify commercial opportunities, shape partnerships, and build the systems that help your business move forward.'],ar:['خدمة','تطوير الأعمال','نحدد الفرص التجارية ونبني الشراكات والأنظمة التي تدفع عملك إلى الأمام.']},
 'service-brand-strategy':{en:['Service','Brand Strategy','A clear point of view for how your business should be positioned, understood, and chosen.'],ar:['خدمة','استراتيجية العلامة','وجهة نظر واضحة لكيفية تموضع عملك وفهمه واختياره.']},
 'service-brand-identity':{en:['Service','Brand Identity','A distinct identity system that gives your business a recognizable presence at every touchpoint.'],ar:['خدمة','هوية العلامة','نظام هوية مميز يمنح عملك حضورًا واضحًا في كل نقطة تواصل.']},
 'service-brand-management':{en:['Service','Brand Management','Ongoing guidance to keep every brand expression clear, consistent, and strategically aligned.'],ar:['خدمة','إدارة العلامة','توجيه مستمر للحفاظ على كل تعبير للعلامة واضحًا ومتسقًا ومتوافقًا استراتيجيًا.']},
 'service-website-design-development':{en:['Service','Website Design & Development','Websites designed to make your value clear and turn attention into meaningful action.'],ar:['خدمة','تصميم وتطوير المواقع','مواقع مصممة لتوضيح قيمتك وتحويل الاهتمام إلى فعل حقيقي.']},
 'service-ui-ux-design':{en:['Service','UI/UX Design','Digital journeys that feel intuitive, purposeful, and built around your audience.'],ar:['خدمة','تصميم تجربة وواجهة المستخدم','رحلات رقمية بديهية وهادفة ومبنية حول جمهورك.']},
 'service-social-media-management':{en:['Service','Social Media Management','A considered social presence that turns everyday communication into brand momentum.'],ar:['خدمة','إدارة وسائل التواصل','حضور اجتماعي مدروس يحوّل التواصل اليومي إلى زخم للعلامة.']},
 'service-content-creation':{en:['Service','Content Creation','Useful, relevant content that gives your business a voice people want to follow.'],ar:['خدمة','صناعة المحتوى','محتوى مفيد وملائم يمنح عملك صوتًا يرغب الناس في متابعته.']},
 'service-photography':{en:['Service','Photography','Photography that captures the character, detail, and value behind your business.'],ar:['خدمة','التصوير الفوتوغرافي','صور تلتقط شخصية عملك وتفاصيله وقيمته.']},
 'service-videography':{en:['Service','Videography','Story-led video that makes your message easier to feel, understand, and remember.'],ar:['خدمة','إنتاج الفيديو','فيديو قائم على القصة يجعل رسالتك أسهل للشعور والفهم والتذكر.']},
 'service-drone-production':{en:['Service','Drone Production','Aerial perspectives that give your spaces, projects, and story a wider point of view.'],ar:['خدمة','إنتاج الدرون','مناظير جوية تمنح مساحاتك ومشاريعك وقصتك رؤية أوسع.']},
 'service-interior-photography':{en:['Service','Interior Photography','Thoughtful interior imagery that communicates atmosphere, scale, and attention to detail.'],ar:['خدمة','تصوير المساحات الداخلية','صور داخلية مدروسة تنقل الأجواء والحجم والاهتمام بالتفاصيل.']},
 'service-product-photography':{en:['Service','Product Photography','Product imagery designed to make quality tangible and buying decisions easier.'],ar:['خدمة','تصوير المنتجات','صور منتجات تجعل الجودة ملموسة وقرار الشراء أسهل.']},
 'service-motion-graphics':{en:['Service','Motion Graphics','Motion systems that give your ideas energy, clarity, and a memorable rhythm.'],ar:['خدمة','الرسوم المتحركة','أنظمة حركة تمنح أفكارك طاقة ووضوحًا وإيقاعًا لا يُنسى.']},
 'service-graphic-design':{en:['Service','Graphic Design','Everyday design assets built to keep your business sharp, clear, and recognizable.'],ar:['خدمة','التصميم الجرافيكي','أصول تصميم يومية تحافظ على عملك حادًا وواضحًا وسهل التمييز.']},
 'service-digital-marketing':{en:['Service','Digital Marketing','Connected digital campaigns that align the right message with the right audience.'],ar:['خدمة','التسويق الرقمي','حملات رقمية مترابطة توصل الرسالة الصحيحة إلى الجمهور المناسب.']},
 'service-seo':{en:['Service','SEO','Search strategy that helps the right people discover your business at the right time.'],ar:['خدمة','تحسين محركات البحث','استراتيجية بحث تساعد الأشخاص المناسبين على اكتشاف عملك في الوقت المناسب.']},
 'service-advertising-campaigns':{en:['Service','Advertising Campaigns','Campaigns built around a clear idea, a focused audience, and measurable movement.'],ar:['خدمة','الحملات الإعلانية','حملات مبنية على فكرة واضحة وجمهور محدد وحركة قابلة للقياس.']},
 'service-ai-integration':{en:['Service','AI Integration','Practical AI systems that improve how your business thinks, works, and grows.'],ar:['خدمة','تكامل الذكاء الاصطناعي','أنظمة ذكاء اصطناعي عملية تحسن طريقة تفكير عملك وعمله ونموه.']},
 'service-business-consultation':{en:['Service','Business Consultation','A focused conversation to identify the next important decision for your business.'],ar:['خدمة','استشارات الأعمال','جلسة مركزة لتحديد القرار المهم التالي لعملك.']},
 consultation:{en:['Consultation','Let’s Build Your Business Together','Book a consultation with OOXME to discuss your business, identify opportunities, and create a clear growth strategy.'],ar:['استشارة','لنبنِ أعمالك معًا','احجز استشارة مع اوكسوم لمناقشة عملك وتحديد الفرص وبناء استراتيجية نمو واضحة.']}
};
const detailRoot=document.documentElement;
const detailKey=document.body.dataset.detail;
const detail=detailContent[detailKey]||detailContent.consultation;
const detailLabel=document.querySelector('[data-detail-label]');
const detailHeading=document.querySelector('[data-detail-heading]');
const detailDescription=document.querySelector('[data-detail-description]');
const detailMenu=document.querySelector('.site-menu');
const detailMenuButton=document.querySelector('.menu-toggle');
const detailLanguageButton=document.querySelector('.language-toggle');
let detailLanguage='en';
try{detailLanguage=localStorage.getItem('ooxme-language')==='ar'?'ar':'en'}catch(error){}
function setDetailLanguage(next){detailLanguage=next;const isArabic=next==='ar';detailRoot.lang=next;detailRoot.dir=isArabic?'rtl':'ltr';document.title=isArabic?'قريبًا — اوكسوم':'Much More Is Coming — OOXME';if(detailLabel)detailLabel.textContent='';if(detailHeading)detailHeading.textContent=isArabic?'المزيد قادم قريبًا':'Much More Is Coming';if(detailDescription)detailDescription.textContent=isArabic?'هذه الصفحة قيد التطوير حاليًا. سيتوفر المزيد من المحتوى التفصيلي قريبًا.':'This page is currently under development. More detailed content will be available soon.';detailLanguageButton.setAttribute('aria-label',isArabic?'التبديل إلى الإنجليزية':'Switch to Arabic');document.querySelector('[data-nav-home]').textContent=isArabic?'الرئيسية':'Home';document.querySelector('[data-nav-portfolio]').textContent=isArabic?'المعرض':'Portfolio';try{localStorage.setItem('ooxme-language',next)}catch(error){}}
function setDetailMenu(open){detailMenu.classList.toggle('is-open',open);detailMenuButton.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)}
function observeDetailReveals(){const elements=[...document.querySelectorAll('.text-reveal')];if(!('IntersectionObserver'in window)){elements.forEach((element)=>element.classList.add('is-visible'));return}const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>entry.target.classList.toggle('is-visible',entry.isIntersecting)),{threshold:.14,rootMargin:'0px 0px -7% 0px'});elements.forEach((element,index)=>{element.style.transitionDelay=`${Math.min(index,5)*65}ms`;observer.observe(element)})}
detailMenuButton.addEventListener('click',()=>setDetailMenu(!detailMenu.classList.contains('is-open')));detailLanguageButton.addEventListener('click',()=>setDetailLanguage(detailLanguage==='en'?'ar':'en'));detailMenu.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>setDetailMenu(false)));document.addEventListener('keydown',(event)=>{if(event.key==='Escape')setDetailMenu(false)});detailRoot.classList.add('js');setDetailLanguage(detailLanguage);observeDetailReveals();
function enhanceServiceDetail(){
 if(!detailKey?.startsWith('service-'))return;
 const localized=detail[detailRoot.lang==='ar'?'ar':'en'];
 const placeholder=document.querySelector('[data-placeholder]');
 if(!placeholder)return;
 const isArabic=detailRoot.lang==='ar';
 const items=isArabic?['استراتيجية واضحة','نظام متماسك','تنفيذ قابل للقياس']:['Clear direction','A connected system','Measurable execution'];
 if(detailLabel)detailLabel.textContent=localized[0];
 if(detailHeading)detailHeading.textContent=localized[1];
 if(detailDescription)detailDescription.textContent=localized[2];
 document.title=`${localized[1]} — OOXME`;
 placeholder.classList.add('service-detail-card');
 placeholder.innerHTML=`<p class="eyebrow">${isArabic?'كيف نساعد':'How we help'}</p><h2>${localized[1]}</h2><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul><a class="primary-button" href="consultation.html">${isArabic?'ابدأ محادثة':'Start a conversation'}</a>`;
}
enhanceServiceDetail();
detailLanguageButton.addEventListener('click',()=>window.setTimeout(enhanceServiceDetail,0));
if(detailKey==='project-zone-restaurant'){
 const updateZoneDetail=()=>{const arabic=detailRoot.lang==='ar';document.querySelector('[data-detail-heading]').textContent=arabic?'المزيد':'Much More';document.querySelector('[data-detail-description]').textContent=arabic?'اكتشف الأعمال والأفكار والشراكات التي تصنع ما هو قادم.':'Discover the work, ideas, and partnerships that shape what comes next.'};
 updateZoneDetail();
 detailLanguageButton.addEventListener('click',()=>window.setTimeout(updateZoneDetail,0));
}
if(detailKey==='project-albasri-commercial-group'){
 const albasriCopy={en:{label:'Brands We Created',title:'Hyper Albasri',intro:'A complete identity and content system that gives Hyper Albasri a clear, active, and recognisable presence across every customer touchpoint.',brandLabel:'Brand',brandTitle:'The identity',brandText:'A confident visual system that keeps the Hyper Albasri experience familiar, modern, and easy to recognise.',designLabel:'Design',designTitle:'Everyday communication',designText:'A flexible set of visual pieces designed to keep messages clear and the brand consistently present.',photoLabel:'Photography',photoTitle:'The store in motion',photoText:'Photography captures the energy, products, and people that shape the Hyper Albasri customer experience.'},ar:{label:'العلامات التي أنشأناها',title:'هايبر البصري',intro:'هوية ونظام محتوى متكاملان يمنحان هايبر البصري حضوراً واضحاً ونشطاً وسهل التعرّف عليه في كل نقطة تواصل مع العملاء.',brandLabel:'الهوية',brandTitle:'هوية متكاملة',brandText:'نظام بصري واثق يحافظ على تجربة هايبر البصري مألوفة وعصرية وسهلة التمييز.',designLabel:'التصميم',designTitle:'تواصل يومي',designText:'مجموعة مرنة من القطع البصرية المصممة لإبقاء الرسائل واضحة والعلامة حاضرة باستمرار.',photoLabel:'التصوير',photoTitle:'المتجر في حركة',photoText:'يلتقط التصوير الطاقة والمنتجات والأشخاص الذين يشكلون تجربة عملاء هايبر البصري.'}};
 const albasriIntro=document.querySelector('[data-project-intro="hyper"]');
 const albasriGalleries=[...document.querySelectorAll('[data-project-gallery="hyper"]')];
 const albasriFields={
  label:albasriIntro?.querySelector('.eyebrow'),title:albasriIntro?.querySelector('h1'),intro:albasriIntro?.querySelector('article>p:last-child'),
  brandLabel:albasriGalleries[0]?.querySelector('.eyebrow'),brandTitle:albasriGalleries[0]?.querySelector('h2'),brandText:albasriGalleries[0]?.querySelector('.albasri-section-copy>p:last-child'),
  designLabel:albasriGalleries[1]?.querySelector('.eyebrow'),designTitle:albasriGalleries[1]?.querySelector('h2'),designText:albasriGalleries[1]?.querySelector('.albasri-section-copy>p:last-child'),
  photoLabel:albasriGalleries[2]?.querySelector('.eyebrow'),photoTitle:albasriGalleries[2]?.querySelector('h2'),photoText:albasriGalleries[2]?.querySelector('.albasri-section-copy>p:last-child')
 };
 Object.entries(albasriFields).forEach(([key,node])=>{if(node)node.dataset.albasriCopy=key});
 const setAlbasriLanguage=()=>{const language=detailRoot.lang==='ar'?'ar':'en';const copy=albasriCopy[language];document.title=`${copy.title} — OOXME`;document.querySelectorAll('[data-albasri-copy]').forEach(node=>{const value=copy[node.dataset.albasriCopy];if(value)node.textContent=value})};
 setAlbasriLanguage();detailLanguageButton?.addEventListener('click',()=>requestAnimationFrame(setAlbasriLanguage));
 document.querySelectorAll('[data-albasri-stack]').forEach(stack=>{const cards=[...stack.querySelectorAll('figure')];let active=0;let startX=0;const render=()=>{const next=(active+1)%cards.length;const previous=(active-1+cards.length)%cards.length;cards.forEach((card,index)=>{card.classList.toggle('is-front',index===active);card.classList.toggle('is-middle',index===next);card.classList.toggle('is-back',index===previous);card.classList.toggle('is-hidden',index!==active&&index!==next&&index!==previous)})};const move=direction=>{active=(active+direction+cards.length)%cards.length;render()};stack.tabIndex=0;stack.setAttribute('role','group');stack.setAttribute('aria-label','Swipe through project images');stack.addEventListener('pointerdown',event=>{startX=event.clientX;stack.setPointerCapture?.(event.pointerId)});stack.addEventListener('pointerup',event=>{const distance=event.clientX-startX;if(Math.abs(distance)>28)move(distance<0?1:-1)});stack.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();move(1)}if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}});render()});
 const lightbox=document.createElement('div');
 lightbox.className='project-image-lightbox';
 lightbox.setAttribute('aria-hidden','true');
 lightbox.innerHTML='<button class="project-image-lightbox__close" type="button" aria-label="Close image">×</button><img class="project-image-lightbox__image" alt="" />';
 document.body.append(lightbox);
 const lightboxImage=lightbox.querySelector('img');
 const closeLightbox=()=>{lightbox.classList.remove('is-open');lightbox.setAttribute('aria-hidden','true')};
 lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox()});
 lightbox.querySelector('button').addEventListener('click',closeLightbox);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeLightbox()});
 document.querySelectorAll('[data-albasri-stack]').forEach(stack=>{
  let tapStartX=0;
  stack.addEventListener('pointerdown',event=>{tapStartX=event.clientX},{passive:true});
  stack.querySelectorAll('figure').forEach(figure=>figure.addEventListener('click',event=>{
   if(Math.abs(event.clientX-tapStartX)>28)return;
   const image=figure.querySelector('img');
   lightboxImage.src=image.currentSrc||image.src;
   lightboxImage.alt=image.alt;
   lightbox.classList.add('is-open');
   lightbox.setAttribute('aria-hidden','false');
  }));
 });
 const addSeeMore=(key,container,reopen)=>{
  let control=container.querySelector(`[data-project-reopen="${key}"]`);
  if(!control){control=document.createElement('button');control.type='button';control.className='project-reopen-control';control.dataset.projectReopen=key;control.innerHTML='<span>See More</span><i aria-hidden="true"></i>';container.append(control);control.addEventListener('click',reopen)}
  control.classList.add('is-visible');
 };
 document.querySelectorAll('[data-open-project]').forEach(button=>button.addEventListener('click',()=>{
  const nextPanel=document.querySelector(`[data-project-panel="${button.dataset.openProject}"]`);
  if(!nextPanel)return;
  const currentPanel=button.closest('[data-project-panel]');
  if(currentPanel){
   const key=currentPanel.dataset.projectPanel;
   currentPanel.classList.add('is-compacted');
   addSeeMore(key,currentPanel.querySelector('.albasri-shell'),()=>{currentPanel.classList.remove('is-compacted')});
  }else{
   const intro=document.querySelector('[data-project-intro="hyper"]');
   document.querySelectorAll('[data-project-gallery="hyper"]').forEach(section=>{section.hidden=true});
   addSeeMore('hyper',intro.querySelector('.albasri-shell'),()=>{document.querySelectorAll('[data-project-gallery="hyper"]').forEach(section=>{section.hidden=false})});
  }
  nextPanel.hidden=false;
  requestAnimationFrame(()=>nextPanel.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
 }));
}
if(detailKey==='project-alfayha-eyewear'){
 const alfayhaCopy={en:{projectLabel:'Project',title:'Alfayha Eyewear',intro:'We created a recognizable identity and content system for an established eyewear business—bringing its service, expertise, and personality into one clear visual presence.',logoLabel:'The logo',logoTitle:'A human symbol for better vision.',logoText:'The mark combines a face, glasses, and a direct expression to make the brand immediately approachable. Its bold orange color gives every touchpoint a confident, consistent signature.',portraitTitle:'Portrait photography',portraitText:'Photography brings the people behind the eyewear service into focus, making the brand feel personal and trustworthy.',campaignTitle:'Campaign system',campaignText:'A flexible social media system balances product, education, and customer stories with one distinctive visual language.',identityTitle:'Visual identity system',identityText:'Prescription forms, cards, and branded materials carry the logo and orange palette consistently across everyday interactions.',printTitle:'Printed touchpoints',printText:'Business cards turn the identity into a practical, memorable object—combining contact details, QR access, and brand recognition.',fatimahLabel:'Project',fatimahTitle:'Fatima Floss Dental Clinic',fatimahIntro:'A friendly dental-clinic identity built around care, confidence, and a bright visual system that feels welcoming at every touchpoint.',fatimahImage1Title:'Clinic uniforms',fatimahImage1Text:'Colour-led uniforms carry the clinic identity naturally into the day-to-day patient experience.',fatimahImage2Title:'Branded material',fatimahImage2Text:'A clear, approachable visual language makes each clinic touchpoint feel considered and familiar.',fatimahImage3Title:'Identity applications',fatimahImage3Text:'The mark and colour palette stay consistent across the clinic’s practical brand applications.',fatimahImage4Title:'A caring system',fatimahImage4Text:'Every detail supports a calm, professional experience for patients and the clinic team.',arjwanLabel:'Project',arjwanTitle:'Arjwan',arjwanIntro:'A botanical identity shaped to feel distinctive, memorable, and closely connected to the natural character of the brand.',arjwanImage1Title:'Botanical mark',arjwanImage1Text:'The logo turns the brand’s floral inspiration into a simple, confident signature.',arjwanImage2Title:'Visual language',arjwanImage2Text:'Soft purple tones and a distinctive form create a memorable, coherent identity.',arjwanImage3Title:'Brand touchpoints',arjwanImage3Text:'The system keeps each expression recognisable while allowing room for the brand to grow.',arjwanImage4Title:'A coherent presence',arjwanImage4Text:'Every asset works together to create one clear, premium brand presence.'},ar:{projectLabel:'مشروع',title:'نظارات الفيحاء',intro:'طورنا هوية ونظام محتوى مميزين لمشروع نظارات قائم، يجمعان خدمته وخبرته وشخصيته في حضور بصري واضح.',logoLabel:'الشعار',logoTitle:'رمز إنساني لرؤية أوضح.',logoText:'يجمع الشعار بين الوجه والنظارات والتعبير المباشر ليكون قريباً وسهل التذكّر. ويمنح اللون البرتقالي كل نقطة تواصل توقيعاً واثقاً ومتسقاً.',portraitTitle:'تصوير شخصي',portraitText:'يُبرز التصوير الأشخاص وراء خدمة النظارات ويجعل العلامة أكثر قرباً وثقة.',campaignTitle:'نظام الحملات',campaignText:'ينظم نظام مرن للمحتوى المنتجات والتوعية وقصص العملاء ضمن لغة بصرية واحدة.',identityTitle:'نظام الهوية البصرية',identityText:'تحمل النماذج والبطاقات والمواد المطبوعة الشعار والألوان باستمرار في كل تفاعل يومي.',printTitle:'نقاط تواصل مطبوعة',printText:'تحول البطاقات الهوية إلى قطعة عملية لا تُنسى تجمع المعلومات والوصول السريع والتعرّف على العلامة.',fatimahLabel:'مشروع',fatimahTitle:'عيادة فاطمة فلوس لطب الأسنان',fatimahIntro:'هوية ودودة لعيادة أسنان تتمحور حول الرعاية والثقة ونظام بصري مشرق يرحّب بالزوار في كل نقطة تواصل.',fatimahImage1Title:'أزياء العيادة',fatimahImage1Text:'تُدخل الأزياء الملوّنة هوية العيادة إلى تجربة المرضى اليومية بصورة طبيعية.',fatimahImage2Title:'مواد العلامة',fatimahImage2Text:'تجعل اللغة البصرية الواضحة والقريبة كل نقطة تواصل مدروسة ومألوفة.',fatimahImage3Title:'تطبيقات الهوية',fatimahImage3Text:'يبقى الشعار ولوحة الألوان متسقين عبر تطبيقات العيادة العملية.',fatimahImage4Title:'نظام يهتم بالتفاصيل',fatimahImage4Text:'تدعم كل التفاصيل تجربة هادئة واحترافية للمرضى وفريق العيادة.',arjwanLabel:'مشروع',arjwanTitle:'أرجوان',arjwanIntro:'هوية نباتية صُممت لتكون مميزة وسهلة التذكر ومرتبطة بالطابع الطبيعي للعلامة.',arjwanImage1Title:'رمز نباتي',arjwanImage1Text:'يحوّل الشعار الإلهام الزهري للعلامة إلى توقيع بسيط وواثق.',arjwanImage2Title:'لغة بصرية',arjwanImage2Text:'تنتج الدرجات البنفسجية الناعمة والشكل المميز هوية متماسكة ولا تُنسى.',arjwanImage3Title:'نقاط تواصل العلامة',arjwanImage3Text:'يحافظ النظام على تميّز كل تطبيق مع إتاحة المجال لنمو العلامة.',arjwanImage4Title:'حضور متماسك',arjwanImage4Text:'تعمل كل الأصول معاً لصناعة حضور راقٍ وواضح للعلامة.'}};
 const setAlfayhaLanguage=()=>{const language=detailRoot.lang==='ar'?'ar':'en';const copy=alfayhaCopy[language];document.title=`${copy.title} — OOXME`;document.querySelectorAll('[data-alfayha-copy]').forEach(node=>{const value=copy[node.dataset.alfayhaCopy];if(value)node.textContent=value})};
 setAlfayhaLanguage();detailLanguageButton?.addEventListener('click',()=>requestAnimationFrame(setAlfayhaLanguage));
 document.querySelectorAll('.alfayha-gallery').forEach(gallery=>{const carousel=gallery.querySelector('.alfayha-carousel');const slides=carousel?[...carousel.querySelectorAll('.alfayha-slide')]:[];const dots=[...gallery.querySelectorAll('.alfayha-carousel-dots button')];let index=0;let frame=0;const setDot=next=>{if(!slides.length)return;index=(next+slides.length)%slides.length;dots.forEach((dot,dotIndex)=>{const active=dotIndex===index;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',String(active))})};const showSlide=next=>{if(!carousel||!slides.length)return;setDot(next);carousel.scrollTo({left:slides[index].offsetLeft-carousel.offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};dots.forEach((dot,dotIndex)=>dot.addEventListener('click',()=>showSlide(dotIndex)));carousel?.addEventListener('scroll',()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const edge=carousel.getBoundingClientRect().left;let nearest=0;let distance=Infinity;slides.forEach((slide,slideIndex)=>{const nextDistance=Math.abs(slide.getBoundingClientRect().left-edge);if(nextDistance<distance){distance=nextDistance;nearest=slideIndex}});setDot(nearest)})},{passive:true})});
}
if(detailKey==='project-sawa-university'){
 const sawaTitle=document.querySelector('[data-sawa-title]');
 const sawaDescription=document.querySelector('[data-sawa-description]');
 const sawaNext=document.querySelector('[data-sawa-next]');
 const updateSawaDetail=()=>{const arabic=detailRoot.lang==='ar';document.title=arabic?'جامعة ساوا — اوكسوم':'Sawa University — OOXME';if(sawaTitle)sawaTitle.textContent=arabic?'جامعة ساوا':'Sawa University';if(sawaDescription)sawaDescription.textContent=arabic?'هوية بصرية راقية لجامعة ساوا، تجمع بين التميّز الأكاديمي ولغة بصرية معاصرة وواضحة.':'A refined visual identity created for Sawa University, blending academic distinction with a clear, contemporary visual language.';if(sawaNext)sawaNext.textContent=arabic?'التالي':'Next'};
 updateSawaDetail();
 detailLanguageButton.addEventListener('click',()=>window.setTimeout(updateSawaDetail,0));
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.querySelectorAll('.sawa-project-gallery').forEach((gallery)=>{
  const sawaCarousel=gallery.querySelector('.sawa-carousel');
  const sawaDots=[...gallery.querySelectorAll('.sawa-carousel-dots button')];
  const sawaSlides=[...sawaCarousel.querySelectorAll('.sawa-tile')];
  const isTapeGallery=gallery.classList.contains('sawa-project-gallery--tape');
  if(isTapeGallery&&!reduceMotion){
   const tapeClones=sawaSlides.map((slide)=>{const clone=slide.cloneNode(true);clone.setAttribute('aria-hidden','true');return clone});
   sawaCarousel.append(...tapeClones);
   let tapeFrame=0;
   let tapeTimestamp=0;
   let tapePaused=false;
   const setTapeDot=(index)=>{const activeIndex=(index+sawaSlides.length)%sawaSlides.length;sawaDots.forEach((dot,dotIndex)=>{const active=dotIndex===activeIndex;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',String(active))})};
   const getTapeLength=()=>tapeClones[0].offsetLeft-sawaSlides[0].offsetLeft;
   const moveTape=(timestamp)=>{if(!tapeTimestamp)tapeTimestamp=timestamp;const elapsed=Math.min(timestamp-tapeTimestamp,50);tapeTimestamp=timestamp;if(!tapePaused){const loopLength=getTapeLength();if(loopLength){sawaCarousel.scrollLeft+=elapsed*.042;if(sawaCarousel.scrollLeft>=loopLength)sawaCarousel.scrollLeft-=loopLength;setTapeDot(Math.floor((sawaCarousel.scrollLeft/(loopLength/sawaSlides.length))%sawaSlides.length))}}tapeFrame=requestAnimationFrame(moveTape)};
   sawaDots.forEach((dot,index)=>dot.addEventListener('click',()=>{sawaCarousel.scrollLeft=sawaSlides[index].offsetLeft;setTapeDot(index)}));
   sawaCarousel.addEventListener('pointerdown',()=>{tapePaused=true},{passive:true});
   sawaCarousel.addEventListener('pointerup',()=>{tapePaused=false;tapeTimestamp=0},{passive:true});
   sawaCarousel.addEventListener('pointercancel',()=>{tapePaused=false;tapeTimestamp=0},{passive:true});
   window.addEventListener('resize',()=>{const loopLength=getTapeLength();if(loopLength)sawaCarousel.scrollLeft%=loopLength},{passive:true});
   tapeFrame=requestAnimationFrame(moveTape);
   return;
  }
  let sawaIndex=0;
  let scrollFrame=0;
  const setSawaDot=(index)=>{sawaIndex=(index+sawaSlides.length)%sawaSlides.length;sawaDots.forEach((dot,dotIndex)=>{const active=dotIndex===sawaIndex;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',String(active))})};
  const showSawaSlide=(index,behavior=reduceMotion?'auto':'smooth')=>{setSawaDot(index);sawaCarousel.scrollTo({left:sawaSlides[sawaIndex].offsetLeft-sawaCarousel.offsetLeft,behavior})};
  sawaDots.forEach((dot,index)=>dot.addEventListener('click',()=>showSawaSlide(index)));
  sawaCarousel.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const edge=sawaCarousel.getBoundingClientRect().left;let nearest=0;let distance=Infinity;sawaSlides.forEach((slide,index)=>{const nextDistance=Math.abs(slide.getBoundingClientRect().left-edge);if(nextDistance<distance){distance=nextDistance;nearest=index}});setSawaDot(nearest)})},{passive:true});
  window.setInterval(()=>showSawaSlide(sawaIndex+1),3000);
 });
}
if(false&&detailKey==='project-alfayha-eyewear'){
 document.title='Alfayha Eyewear — OOXME';
 const alfayhaCarousel=document.querySelector('.alfayha-carousel');
 const alfayhaSlides=alfayhaCarousel?[...alfayhaCarousel.querySelectorAll('.alfayha-slide')]:[];
 const alfayhaDots=[...document.querySelectorAll('.alfayha-carousel-dots button')];
 let alfayhaIndex=0;
 let alfayhaScrollFrame=0;
 const setAlfayhaDot=(index)=>{alfayhaIndex=(index+alfayhaSlides.length)%alfayhaSlides.length;alfayhaDots.forEach((dot,dotIndex)=>{const active=dotIndex===alfayhaIndex;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',String(active))})};
 const showAlfayhaSlide=(index)=>{if(!alfayhaCarousel||!alfayhaSlides.length)return;setAlfayhaDot(index);alfayhaCarousel.scrollTo({left:alfayhaSlides[alfayhaIndex].offsetLeft-alfayhaCarousel.offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 alfayhaDots.forEach((dot,index)=>dot.addEventListener('click',()=>showAlfayhaSlide(index)));
 if(alfayhaCarousel)alfayhaCarousel.addEventListener('scroll',()=>{if(alfayhaScrollFrame)return;alfayhaScrollFrame=requestAnimationFrame(()=>{alfayhaScrollFrame=0;const edge=alfayhaCarousel.getBoundingClientRect().left;let nearest=0;let distance=Infinity;alfayhaSlides.forEach((slide,index)=>{const nextDistance=Math.abs(slide.getBoundingClientRect().left-edge);if(nextDistance<distance){distance=nextDistance;nearest=index}});setAlfayhaDot(nearest)})},{passive:true});
}
