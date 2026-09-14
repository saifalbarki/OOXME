(() => {
  'use strict';
  const root = document.documentElement;
  const page = document.querySelector('.s-page--brand-management');
  const composer = page?.querySelector('[data-s-composer]');
  const menu = page?.querySelector('[data-s-composer-menu]');
  const utilities = page?.querySelector('[data-s-send-utilities]');
  const submit = page?.querySelector('.s-page__x-top-bar-submit');
  const theme = page?.querySelector('[data-s-utility="theme"]');
  const language = page?.querySelector('[data-s-utility="language"]');
  const input = page?.querySelector('.s-page__composer-input');
  const view = page?.querySelector('[data-brand-view]');
  const serviceCards = [...page?.querySelectorAll('[data-brand-service-card]') || []];
  const serviceViewport = page?.querySelector('[data-brand-carousel-viewport]');
  const serviceTrack = page?.querySelector('[data-brand-carousel-track]');
  const servicePrevious = page?.querySelector('[data-brand-prev]');
  const serviceNext = page?.querySelector('[data-brand-next]');
  const serviceCounter = page?.querySelector('[data-brand-counter]');
  const content = page?.querySelector('.s-page__content');
  const sections = [...page?.querySelectorAll('[data-s-major-section]') || []];
  if (!page || !composer || !menu || !utilities || !submit || !theme || !language || !input || !view || !content || sections.length !== 2 || serviceCards.length !== 4 || !serviceViewport || !serviceTrack || !servicePrevious || !serviceNext || !serviceCounter) return;
  const copy = {
    en: { menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'], title: 'What is Brand Management?', description: 'A premium brand management service built to strengthen positioning, improve business performance, and create a clearer, more scalable brand through strategy, content, sales, customer experience, and growth.', secondary: "Iraq's one and only brand management", secondaryCompact: '#1 Iraq', ask: 'Ask ooxme', submit: 'Submit question', language: 'Switch to Arabic', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode', view: 'View' },
    ar: { menu: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'], title: 'ما هي ادارة العلامة التجارية؟', description: 'خدمة متميزة لادارة العلامة التجارية، صممت لتعزيز مكانتها وتحسين اداء الاعمال وبناء علامة اوضح واكثر قابلية للتوسع من خلال الاستراتيجية والمحتوى والمبيعات وتجربة العميل والنمو.', secondary: 'ادارة العلامة التجارية الواحد والوحيد في العراق', secondaryCompact: '#الاول_بالعراق', ask: 'اسأل اوكسوم', submit: 'ارسال السؤال', language: 'Switch to English', day: 'التبديل الى الوضع النهاري', dark: 'التبديل الى الوضع الداكن', view: 'عرض' }
  };
  const serviceCopy = {
    en: [
      { title: 'Brand Strategy', description: 'Define brand direction and build a clear system that protects identity and strengthens market position.', list: ['Brand Strategy & Positioning', 'Identity & Brand Standards', 'Monthly Brand Planning', 'Performance & Growth Review'] },
      { title: 'Business Growth', description: 'Turn brand goals into practical growth opportunities through better sales, offers, and customer experience.', list: ['Business Development & Opportunities', 'Sales System Development', 'Offers & Pricing Development', 'Customer Journey Improvement'] },
      { title: 'Content & Presence', description: 'Build a distinctive presence that reflects brand value through focused content, production, and communication.', list: ['Content & Publishing Strategy', 'Photography & Video Production', 'Creative Direction', 'Campaign Planning & Management'] },
      { title: 'Systems & Support', description: 'Build digital and operational systems that help the brand work efficiently and scale with control.', list: ['Website & Digital Ecosystem', 'Business Verification & HR', 'Internal Systems Development', 'Account Management & Support'] }
    ],
    ar: [
      { title: 'استراتيجية العلامة', description: 'نحدد اتجاه العلامة ونبني نظاما واضحا يحافظ على هويتها ويقوي مكانتها في السوق.', list: ['استراتيجية العلامة وموقعها', 'تطوير الهوية والمعايير', 'التخطيط الشهري للعلامة', 'مراجعة الاداء والتطور'] },
      { title: 'النمو التجاري', description: 'نحول اهداف العلامة الى فرص نمو عملية عبر تطوير المبيعات والعروض وتجربة العميل.', list: ['تطوير الاعمال والفرص', 'بناء نظام المبيعات', 'تطوير العروض والتسعير', 'تحسين رحلة العميل'] },
      { title: 'المحتوى والحضور', description: 'نبني حضورا واضحا ومميزا يعكس قيمة العلامة من خلال محتوى وانتاج واتصال اقوى.', list: ['استراتيجية المحتوى والنشر', 'التصوير وانتاج الفيديو', 'التوجيه الابداعي', 'تخطيط وادارة الحملات'] },
      { title: 'الانظمة والدعم', description: 'نبني البنية الرقمية والتشغيلية التي تساعد العلامة على العمل بكفاءة والتوسع بثبات.', list: ['الموقع والمنظومة الرقمية', 'توثيق الاعمال والموارد', 'تطوير الانظمة الداخلية', 'ادارة الحساب والدعم'] }
    ]
  };
  const setServiceCopy = (language) => {
    serviceCards.forEach((card) => { const item = serviceCopy[language][Number(card.dataset.brandServiceIndex)]; card.querySelector('[data-brand-service-copy="title"]').textContent = item.title; card.querySelector('[data-brand-service-copy="description"]').textContent = item.description; card.querySelectorAll('[data-brand-service-copy="list"] li').forEach((node, index) => { node.textContent = item.list[index]; }); });
  };
  const captureEnglishFeaturedGeometry = () => {
    const card = page.querySelector('.s-page__store-featured-card');
    const title = page.querySelector('[data-brand-copy="title"]');
    const description = page.querySelector('[data-brand-copy="description"]');
    const secondary = page.querySelector('[data-brand-copy="secondary"]');
    if (!card || !title || !description || !secondary) return;
    root.lang = 'en'; root.dir = 'ltr';
    title.textContent = copy.en.title;
    description.textContent = copy.en.description;
    secondary.textContent = copy.en.secondary;
    card.style.setProperty('--s-bm-featured-description-height', `${description.offsetHeight}px`);
  };
  const measureServiceCardHeight = () => {
    const image = page.querySelector('.s-page__store-featured-card img');
    const featuredTitle = page.querySelector('[data-brand-copy="title"]');
    if (!image || !featuredTitle) return;
    const padding = Math.max(0, featuredTitle.getBoundingClientRect().top - image.getBoundingClientRect().bottom);
    root.style.setProperty('--s-bm-service-layout-padding', `${padding}px`);
    const current = root.lang === 'ar' ? 'ar' : 'en';
    const saved = serviceCards.map((card) => ({ card, active: card.classList.contains('is-active'), height: card.style.height, minHeight: card.style.minHeight, transform: card.style.transform, copy: card.querySelector('.s-page__store-card-copy'), position: card.querySelector('.s-page__store-card-copy').style.position, bottom: card.querySelector('.s-page__store-card-copy').style.bottom }));
    root.style.removeProperty('--s-bm-service-card-height');
    saved.forEach(({ card, copy }) => { card.classList.add('is-active'); card.style.height = 'auto'; card.style.minHeight = '0'; card.style.transform = 'none'; copy.style.position = 'static'; copy.style.bottom = 'auto'; });
    let largest = 0;
    ['en', 'ar'].forEach((language) => {
      root.lang = language; root.dir = language === 'ar' ? 'rtl' : 'ltr'; setServiceCopy(language);
      serviceCards.forEach((card) => {
        const title = card.querySelector('[data-brand-service-copy="title"]');
        const description = card.querySelector('[data-brand-service-copy="description"]');
        const list = card.querySelector('[data-brand-service-copy="list"]');
        const style = getComputedStyle(card);
        const borders = (Number(style.borderTopWidth.replace('px', '')) || 0) + (Number(style.borderBottomWidth.replace('px', '')) || 0);
        largest = Math.max(largest, title.getBoundingClientRect().height + description.getBoundingClientRect().height + list.getBoundingClientRect().height + (padding * 4.5) + borders);
      });
    });
    root.style.setProperty('--s-bm-service-card-height', `${Math.ceil(largest * 100) / 100}px`);
    saved.forEach(({ card, active, height, minHeight, transform, copy, position, bottom }) => { card.classList.toggle('is-active', active); card.style.height = height; card.style.minHeight = minHeight; card.style.transform = transform; copy.style.position = position; copy.style.bottom = bottom; });
    root.lang = current; root.dir = current === 'ar' ? 'rtl' : 'ltr'; setServiceCopy(current);
    const cssHeight = Number(getComputedStyle(serviceCards[0]).height.replace('px', '')) || largest;
    const renderedRequirement = Math.max(...serviceCards.map((card) => { const scale = card.offsetWidth ? card.getBoundingClientRect().width / card.offsetWidth : 1; const topGap = (card.querySelector('[data-brand-service-copy="title"]').getBoundingClientRect().top - card.getBoundingClientRect().top) / (scale || 1); return cssHeight + padding - topGap; }));
    root.style.setProperty('--s-bm-service-card-height', `${Math.ceil(Math.max(largest, renderedRequirement) * 100) / 100}px`);
  };
  let activeService = 0;
  let serviceDrag = null;
  let sectionLocked = false;
  let sectionUnlockTimer = 0;
  let sectionSettleTimer = 0;
  let sectionTouch = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const sectionReferenceY = () => Number.parseFloat(getComputedStyle(content).paddingTop) || 0;
  const activeSectionIndex = () => sections.reduce((closest, section, index) => { const distance = Math.abs(section.getBoundingClientRect().top - sectionReferenceY()); return !closest || distance < closest.distance ? { index, distance } : closest; }, null)?.index ?? 0;
  const transitionSection = (direction) => {
    if (!direction || sectionLocked) return;
    const current = activeSectionIndex();
    const targetIndex = Math.max(0, Math.min(sections.length - 1, current + direction));
    const target = sections[targetIndex];
    if (!target || targetIndex === current) return;
    sectionLocked = true;
    clearTimeout(sectionUnlockTimer); clearTimeout(sectionSettleTimer);
    sectionUnlockTimer = setTimeout(() => { sectionLocked = false; }, 820);
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - sectionReferenceY(), left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    if (targetIndex !== sections.length - 1) sectionSettleTimer = setTimeout(() => { const correction = target.getBoundingClientRect().top - sectionReferenceY(); if (Math.abs(correction) > .5) window.scrollTo({ top: window.scrollY + correction, left: 0, behavior: 'auto' }); }, reducedMotion.matches ? 80 : 900);
  };
  const syncServices = (animate = true, dragOffset = 0) => {
    const card = serviceCards[activeService];
    if (!card) return;
    const isArabic = root.lang === 'ar';
    const gap = Number.parseFloat(getComputedStyle(serviceTrack).columnGap) || 0;
    const centerOffset = (serviceViewport.clientWidth / 2) - (card.offsetWidth / 2);
    const position = centerOffset - ((isArabic ? serviceCards.length - 1 - activeService : activeService) * (card.offsetWidth + gap)) + dragOffset;
    serviceTrack.classList.toggle('is-dragging', !animate);
    serviceTrack.style.transform = `translate3d(${position.toFixed(2)}px, 0, 0)`;
    serviceCards.forEach((item, index) => { const active = index === activeService; item.classList.toggle('is-active', active); item.setAttribute('aria-current', String(active)); item.dir = isArabic ? 'rtl' : 'ltr'; item.lang = isArabic ? 'ar' : 'en'; });
    serviceCounter.textContent = `${activeService + 1} / ${serviceCards.length}`;
    servicePrevious.disabled = isArabic ? activeService === serviceCards.length - 1 : activeService === 0;
    serviceNext.disabled = isArabic ? activeService === 0 : activeService === serviceCards.length - 1;
    servicePrevious.setAttribute('aria-label', isArabic ? 'Forward card' : 'Previous card');
    serviceNext.setAttribute('aria-label', isArabic ? 'Previous card' : 'Forward card');
  };
  const selectService = (index) => { activeService = Math.max(0, Math.min(serviceCards.length - 1, index)); syncServices(); };
  const syncFinalText = () => {
    const finalText = page.querySelector('[data-brand-copy="secondary"]');
    const card = page.querySelector('.s-page__store-featured-card');
    const section = sections[0];
    if (!finalText || !card || !section) return;
    const labels = copy[root.lang === 'ar' ? 'ar' : 'en'];
    finalText.textContent = labels.secondary;
    const x = Number.parseFloat(getComputedStyle(root).getPropertyValue('--s-x')) || 18;
    const safeTop = section.getBoundingClientRect().top + 48 + (x * 2);
    const lineHeight = Number.parseFloat(getComputedStyle(finalText).lineHeight) || 0;
    const wrapsBesideButton = lineHeight > 0 && finalText.getBoundingClientRect().height > (lineHeight * 1.1);
    if (wrapsBesideButton || card.getBoundingClientRect().top < safeTop) finalText.textContent = labels.secondaryCompact;
  };
  const setMenu = (open) => { menu.classList.toggle('is-open', open); utilities.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open)); utilities.setAttribute('aria-hidden', String(!open)); };
  const applyLanguage = (next, { persist = true } = {}) => {
    const current = next === 'ar' ? 'ar' : 'en';
    const labels = copy[current];
    root.lang = current; root.dir = current === 'ar' ? 'rtl' : 'ltr';
    page.querySelectorAll('.s-page__composer-menu-label').forEach((node, index) => { node.textContent = labels.menu[index]; });
    page.querySelector('[data-brand-copy="title"]').textContent = labels.title;
    page.querySelector('[data-brand-copy="description"]').textContent = labels.description;
    page.querySelector('[data-brand-copy="secondary"]').textContent = labels.secondary;
    serviceCards.forEach((card) => { const item = serviceCopy[current][Number(card.dataset.brandServiceIndex)]; card.querySelector('[data-brand-service-copy="title"]').textContent = item.title; card.querySelector('[data-brand-service-copy="description"]').textContent = item.description; card.querySelectorAll('[data-brand-service-copy="list"] li').forEach((node, index) => { node.textContent = item.list[index]; }); });
    page.querySelector('.s-page__visually-hidden').textContent = labels.ask;
    submit.setAttribute('aria-label', labels.submit); language.setAttribute('aria-label', labels.language); language.setAttribute('aria-pressed', String(current === 'en')); language.classList.toggle('is-active', current === 'en'); theme.setAttribute('aria-label', root.classList.contains('is-day-mode') ? labels.dark : labels.day); view.textContent = labels.view; input.lang = current; input.dir = current === 'ar' ? 'rtl' : 'ltr';
    syncServices(false);
    syncFinalText();
    if (persist) try { localStorage.setItem('ooxme-language', current); } catch (_) {}
  };
  const applyTheme = (next) => { const day = next === 'day'; const labels = copy[root.lang === 'ar' ? 'ar' : 'en']; root.classList.toggle('is-day-mode', day); theme.classList.toggle('is-active', !day); theme.setAttribute('aria-pressed', String(!day)); theme.setAttribute('aria-label', day ? labels.dark : labels.day); document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000'); };
  servicePrevious.addEventListener('click', () => selectService(activeService + (root.lang === 'ar' ? 1 : -1)));
  serviceNext.addEventListener('click', () => selectService(activeService + (root.lang === 'ar' ? -1 : 1)));
  serviceViewport.addEventListener('pointerdown', (event) => { if (event.target.closest('button')) return; serviceDrag = { id: event.pointerId, startX: event.clientX, delta: 0 }; serviceViewport.setPointerCapture?.(event.pointerId); syncServices(false); });
  serviceViewport.addEventListener('pointermove', (event) => { if (!serviceDrag || event.pointerId !== serviceDrag.id) return; serviceDrag.delta = event.clientX - serviceDrag.startX; syncServices(false, serviceDrag.delta); });
  const finishServiceDrag = (event) => { if (!serviceDrag || event.pointerId !== serviceDrag.id) return; const delta = serviceDrag.delta; serviceDrag = null; if (Math.abs(delta) >= 42) { const forward = root.lang === 'ar' ? delta > 0 : delta < 0; selectService(activeService + (forward ? 1 : -1)); } else syncServices(); };
  serviceViewport.addEventListener('pointerup', finishServiceDrag); serviceViewport.addEventListener('pointercancel', finishServiceDrag);
  composer.addEventListener('submit', (event) => { event.preventDefault(); setMenu(!menu.classList.contains('is-open')); });
  document.addEventListener('pointerdown', (event) => { if (menu.classList.contains('is-open') && !composer.contains(event.target)) setMenu(false); }, { passive: true });
  theme.addEventListener('click', () => applyTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day'));
  language.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar'));
  view.addEventListener('click', (event) => { event.preventDefault(); transitionSection(1); });
  document.addEventListener('touchstart', (event) => { if (event.target.closest('[data-s-composer], [data-brand-carousel]')) return; const item = event.changedTouches[0]; if (item) sectionTouch = { id: item.identifier, y: item.clientY }; }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => { const item = [...event.changedTouches].find((candidate) => candidate.identifier === sectionTouch?.id); if (item && item.clientY !== sectionTouch.y) event.preventDefault(); }, { capture: true, passive: false });
  document.addEventListener('touchend', (event) => { const item = [...event.changedTouches].find((candidate) => candidate.identifier === sectionTouch?.id); if (item && Math.abs(item.clientY - sectionTouch.y) >= 36) transitionSection(item.clientY < sectionTouch.y ? 1 : -1); if (item) sectionTouch = null; }, { capture: true, passive: true });
  window.addEventListener('wheel', (event) => { event.preventDefault(); if (Math.abs(event.deltaY) >= 8) transitionSection(event.deltaY > 0 ? 1 : -1); }, { passive: false });
  window.addEventListener('keydown', (event) => { if (![' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key) || event.target.closest('input, textarea, [contenteditable="true"]')) return; event.preventDefault(); if (event.key === 'Home') transitionSection(-sections.length); else if (event.key === 'End') transitionSection(sections.length); else transitionSection([' ', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1); }, { passive: false });
  window.addEventListener('resize', () => { const current = root.lang; captureEnglishFeaturedGeometry(); if (current !== 'en') applyLanguage(current, { persist: false }); measureServiceCardHeight(); syncServices(false); syncFinalText(); }, { passive: true });
  window.addEventListener('ooxme-language-change', (event) => { if (event.detail?.language && event.detail.language !== root.lang) applyLanguage(event.detail.language, { persist: false }); });
  let initialLanguage = 'en';
  try { initialLanguage = localStorage.getItem('ooxme-language') || 'en'; } catch (_) {}
  root.lang = 'en'; root.dir = 'ltr'; setServiceCopy('en'); captureEnglishFeaturedGeometry(); applyLanguage(initialLanguage, { persist: false }); applyTheme('dark'); measureServiceCardHeight(); syncServices(false);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  root.classList.add('s-x-discrete-sections');
  requestAnimationFrame(() => syncServices(false));
  document.fonts?.ready.then(() => { requestAnimationFrame(() => { measureServiceCardHeight(); syncServices(false); }); });
  setTimeout(() => { measureServiceCardHeight(); syncServices(false); }, 250);
  document.fonts?.ready.then(syncFinalText);
  root.classList.remove('s-x-initializing');
})();
