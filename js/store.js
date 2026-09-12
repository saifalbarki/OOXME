(() => {
  'use strict';

  const root = document.documentElement;
  const page = document.querySelector('.s-page--store');
  const content = page?.querySelector('.s-page__content');
  const composer = page?.querySelector('[data-s-composer]');
  const menu = page?.querySelector('[data-s-composer-menu]');
  const utilities = page?.querySelector('[data-s-send-utilities]');
  const addButton = page?.querySelector('.s-page__add');
  const input = page?.querySelector('.s-page__composer-input');
  const submit = composer?.querySelector('button[type="submit"]');
  const themeButton = page?.querySelector('[data-s-utility="theme"]');
  const languageButton = page?.querySelector('[data-s-utility="language"]');
  const sections = Array.from(page?.querySelectorAll('[data-s-major-section]') || []);
  const menuItems = Array.from(page?.querySelectorAll('.s-page__composer-menu-item') || []);
  const carousel = page?.querySelector('[data-store-carousel]');
  const carouselViewport = page?.querySelector('[data-store-carousel-viewport]');
  const carouselTrack = page?.querySelector('[data-store-carousel-track]');
  const productCards = Array.from(page?.querySelectorAll('[data-store-product-card]') || []);
  const previousProduct = page?.querySelector('[data-store-carousel-previous]');
  const nextProduct = page?.querySelector('[data-store-carousel-next]');
  const carouselStatus = page?.querySelector('[data-store-carousel-status]');

  if (!page || !content || !composer || !menu || !utilities || !addButton || !input || !submit || !themeButton || !languageButton || sections.length !== 3 || !carousel || !carouselViewport || !carouselTrack || productCards.length !== 4 || !previousProduct || !nextProduct || !carouselStatus) return;

  const copy = {
    en: {
      menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'],
      ask: 'Ask ooxme', add: 'Add context', submit: 'Submit question', language: 'Switch to Arabic', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode',
      featuredLabel: 'Featured Product', featuredName: 'Brand Blueprint', featuredCategory: 'Digital Business Tool', featuredDescription: 'A structured brand planning file for positioning, identity, operations, and growth.', featuredPreviousPrice: '$39', featuredPrice: '$29',
      productOneName: 'Project Planner', productOneCategory: 'Digital File', productOneDescription: 'A practical planning system for organizing projects, tasks, priorities, and execution.', productOnePrice: '$19', productTwoName: 'Business Model Kit', productTwoCategory: 'Business Toolkit', productTwoDescription: 'A structured toolkit for reviewing business models, offers, operations, and growth opportunities.', productTwoPrice: '$39', productThreeName: 'Content System', productThreeCategory: 'Content Toolkit', productThreeDescription: 'A practical framework for planning, organizing, and maintaining consistent brand content.', productThreePrice: '$24', productFourName: 'Custom Brand Pack', productFourCategory: 'Custom Product', productFourDescription: 'A tailored set of brand files prepared around your business needs and priorities.', productFourPrice: 'Custom', view: 'View',
      customLabel: 'Custom Products', customTitle: 'Made for you', customDescription: 'A future space for products shaped around your needs.', customAction: 'Request a Custom Product',
      previous: 'Previous product', next: 'Next product'
    },
    ar: {
      menu: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'],
      ask: 'اسأل اوكسوم', add: 'اضف سياقًا', submit: 'ارسال السؤال', language: 'Switch to English', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode',
      featuredLabel: 'منتج مميز', featuredName: 'مخطط العلامة التجارية', featuredCategory: 'أداة اعمال رقمية', featuredDescription: 'ملف منظم لتخطيط تموضع العلامة التجارية وهويتها وعملياتها ونموها.', featuredPreviousPrice: '$39', featuredPrice: '$29',
      productOneName: 'مخطط المشروع', productOneCategory: 'ملف رقمي', productOneDescription: 'نظام عملي لتنظيم المشاريع والمهام والاولويات والتنفيذ.', productOnePrice: '$19', productTwoName: 'حزمة نموذج العمل', productTwoCategory: 'ادوات اعمال', productTwoDescription: 'حزمة منظمة لمراجعة نموذج العمل والعروض والعمليات وفرص النمو.', productTwoPrice: '$39', productThreeName: 'نظام المحتوى', productThreeCategory: 'ادوات محتوى', productThreeDescription: 'اطار عملي لتخطيط وتنظيم واستمرار محتوى العلامة التجارية.', productThreePrice: '$24', productFourName: 'حزمة علامة مخصصة', productFourCategory: 'منتج مخصص', productFourDescription: 'مجموعة ملفات علامة تجارية مخصصة حسب احتياجات واولويات عملك.', productFourPrice: 'مخصص', view: 'عرض',
      customLabel: 'منتجات مخصصة', customTitle: 'مصمم لك', customDescription: 'مساحة مستقبلية لمنتجات مصممة حسب احتياجاتك.', customAction: 'اطلب منتج مخصص',
      previous: 'المنتج السابق', next: 'المنتج التالي'
    }
  };

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeProduct = 1;
  let sectionLocked = false;
  let sectionUnlockTimer = 0;
  let sectionSettleTimer = 0;
  let menuTimer = 0;
  let sectionTouch = null;
  let carouselDrag = null;

  const setMenuOpen = (open) => {
    clearTimeout(menuTimer);
    if (open) {
      composer.style.setProperty('--s-composer-menu-height', `${menu.offsetHeight}px`);
      menu.classList.add('is-open');
      utilities.classList.add('is-open');
      submit.classList.add('is-active');
      menu.setAttribute('aria-hidden', 'false');
      utilities.setAttribute('aria-hidden', 'false');
      return;
    }
    submit.classList.remove('is-active');
    menuTimer = setTimeout(() => {
      menu.classList.remove('is-open');
      utilities.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      utilities.setAttribute('aria-hidden', 'true');
    }, 60);
  };

  const updateInputLanguage = () => {
    const arabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(input.value);
    input.lang = arabic ? 'ar' : root.lang;
    input.dir = arabic || root.lang === 'ar' ? 'rtl' : 'ltr';
    input.classList.toggle('is-english-input', !arabic && root.lang !== 'ar');
  };

  const syncCarousel = (animate = true, dragOffset = 0) => {
    const card = productCards[activeProduct];
    if (!card) return;
    carouselTrack.classList.toggle('is-dragging', !animate);
    const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
    const position = (carouselViewport.clientWidth / 2) - cardCenter + dragOffset;
    carouselTrack.style.transform = `translate3d(${position.toFixed(2)}px, 0, 0)`;
    productCards.forEach((item, index) => {
      const active = index === activeProduct;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-current', active ? 'true' : 'false');
      item.dir = root.lang === 'ar' ? 'rtl' : 'ltr';
      item.lang = root.lang === 'ar' ? 'ar' : 'en';
    });
    previousProduct.disabled = activeProduct === 0;
    nextProduct.disabled = activeProduct === productCards.length - 1;
    carouselStatus.textContent = `${activeProduct + 1} / ${productCards.length}`;
  };

  const selectProduct = (nextIndex) => {
    activeProduct = Math.max(0, Math.min(productCards.length - 1, nextIndex));
    syncCarousel(true);
  };

  const applyLanguage = (next, { persist = true } = {}) => {
    const language = next === 'ar' ? 'ar' : 'en';
    const labels = copy[language];
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    page.querySelectorAll('[data-store-copy]').forEach((node) => {
      const value = labels[node.dataset.storeCopy];
      if (value) node.textContent = value;
    });
    page.querySelectorAll('.s-page__composer-menu-label').forEach((node, index) => { node.textContent = labels.menu[index]; });
    page.querySelector('.s-page__input-label .s-page__visually-hidden').textContent = labels.ask;
    addButton.setAttribute('aria-label', labels.add);
    submit.setAttribute('aria-label', labels.submit);
    languageButton.setAttribute('aria-label', labels.language);
    languageButton.setAttribute('aria-pressed', String(language === 'en'));
    languageButton.classList.toggle('is-active', language === 'en');
    previousProduct.setAttribute('aria-label', labels.previous);
    nextProduct.setAttribute('aria-label', labels.next);
    input.value = '';
    updateInputLanguage();
    syncCarousel(false);
    if (persist) {
      try { localStorage.setItem('ooxme-language', language); } catch (_) {}
    }
  };

  const applyTheme = (next) => {
    const day = next === 'day';
    const labels = copy[root.lang === 'ar' ? 'ar' : 'en'];
    root.classList.toggle('is-day-mode', day);
    themeButton.classList.toggle('is-active', !day);
    themeButton.setAttribute('aria-pressed', String(!day));
    themeButton.setAttribute('aria-label', day ? labels.dark : labels.day);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000');
  };

  const sectionReferenceY = () => Number.parseFloat(getComputedStyle(content).paddingTop) || 0;
  const activeSectionIndex = () => sections.reduce((closest, section, index) => {
    const distance = Math.abs(section.getBoundingClientRect().top - sectionReferenceY());
    return !closest || distance < closest.distance ? { index, distance } : closest;
  }, null)?.index ?? 0;

  const transitionSection = (direction) => {
    if (!direction || sectionLocked) return;
    const current = activeSectionIndex();
    const targetIndex = Math.max(0, Math.min(sections.length - 1, current + direction));
    const target = sections[targetIndex];
    if (!target || targetIndex === current) return;
    sectionLocked = true;
    clearTimeout(sectionUnlockTimer);
    clearTimeout(sectionSettleTimer);
    sectionUnlockTimer = setTimeout(() => { sectionLocked = false; }, 820);
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - sectionReferenceY(), left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    if (targetIndex !== sections.length - 1) {
      sectionSettleTimer = setTimeout(() => {
        const correction = target.getBoundingClientRect().top - sectionReferenceY();
        if (Math.abs(correction) > .5) window.scrollTo({ top: window.scrollY + correction, left: 0, behavior: 'auto' });
      }, reducedMotion.matches ? 80 : 900);
    }
  };

  const setupFace = () => {
    const face = addButton.querySelector('[data-s-x-face]');
    const eyes = face?.querySelector('.s-page__x-face-eyes');
    const motion = face?.querySelector('.s-page__x-face-eye-motion');
    if (!face || !eyes || !motion) return;
    let pointer = null;
    let gaze = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    const render = (time) => {
      gaze.x += (target.x - gaze.x) * .16;
      gaze.y += (target.y - gaze.y) * .16;
      const blinkPhase = ((time / 1000 + .7) % 5.6) / 5.6;
      const blink = 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .022, 2)));
      eyes.setAttribute('transform', `translate(${gaze.x.toFixed(3)} ${gaze.y.toFixed(3)})`);
      motion.setAttribute('transform', `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)`);
      requestAnimationFrame(render);
    };
    addButton.addEventListener('pointerdown', (event) => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
    addButton.addEventListener('pointermove', (event) => {
      if (!pointer) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const magnitude = Math.max(1, Math.hypot(dx, dy));
      target = { x: Math.max(-1.1, Math.min(1.1, dx / magnitude * 1.1)), y: Math.max(-1.1, Math.min(1.1, dy / magnitude * 1.1)) };
    }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => addButton.addEventListener(name, () => { pointer = null; target = { x: 0, y: 0 }; }, { passive: true }));
    requestAnimationFrame(render);
  };

  composer.addEventListener('submit', (event) => { event.preventDefault(); setMenuOpen(!menu.classList.contains('is-open')); });
  input.addEventListener('input', updateInputLanguage);
  addButton.addEventListener('click', (event) => { event.stopPropagation(); setMenuOpen(false); });
  themeButton.addEventListener('click', (event) => { event.stopPropagation(); applyTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day'); });
  languageButton.addEventListener('click', (event) => { event.stopPropagation(); applyLanguage(root.lang === 'ar' ? 'en' : 'ar'); });
  menuItems.forEach((item, index) => {
    item.addEventListener('pointerdown', () => { item.classList.add('is-active'); setTimeout(() => item.classList.remove('is-active'), 120); }, { passive: true });
    if (index === 0) item.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); setMenuOpen(false); window.location.assign('/bm'); });
  });
  page.querySelectorAll('.s-page__store-action').forEach((button) => button.addEventListener('click', (event) => event.preventDefault()));
  previousProduct.addEventListener('click', () => selectProduct(activeProduct - 1));
  nextProduct.addEventListener('click', () => selectProduct(activeProduct + 1));

  carouselViewport.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    carouselDrag = { id: event.pointerId, startX: event.clientX, delta: 0 };
    carouselViewport.setPointerCapture?.(event.pointerId);
    syncCarousel(false);
  });
  carouselViewport.addEventListener('pointermove', (event) => {
    if (!carouselDrag || event.pointerId !== carouselDrag.id) return;
    carouselDrag.delta = event.clientX - carouselDrag.startX;
    syncCarousel(false, carouselDrag.delta);
  });
  const finishCarouselDrag = (event) => {
    if (!carouselDrag || event.pointerId !== carouselDrag.id) return;
    const delta = carouselDrag.delta;
    carouselDrag = null;
    if (Math.abs(delta) >= 42) selectProduct(activeProduct + ((delta < 0 ? 1 : -1) * (root.lang === 'ar' ? -1 : 1)));
    else syncCarousel(true);
  };
  carouselViewport.addEventListener('pointerup', finishCarouselDrag);
  carouselViewport.addEventListener('pointercancel', finishCarouselDrag);

  document.addEventListener('pointerdown', (event) => { if (!composer.contains(event.target)) setMenuOpen(false); }, { passive: true });
  document.addEventListener('touchstart', (event) => {
    if (event.target.closest('[data-s-composer], [data-store-carousel]')) return;
    const item = event.changedTouches[0];
    if (item) sectionTouch = { id: item.identifier, y: item.clientY };
  }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => {
    const item = Array.from(event.changedTouches).find((candidate) => candidate.identifier === sectionTouch?.id);
    if (item && item.clientY !== sectionTouch.y) event.preventDefault();
  }, { capture: true, passive: false });
  document.addEventListener('touchend', (event) => {
    const item = Array.from(event.changedTouches).find((candidate) => candidate.identifier === sectionTouch?.id);
    if (item && Math.abs(item.clientY - sectionTouch.y) >= 36) transitionSection(item.clientY < sectionTouch.y ? 1 : -1);
    if (item) sectionTouch = null;
  }, { capture: true, passive: true });
  window.addEventListener('wheel', (event) => { event.preventDefault(); if (Math.abs(event.deltaY) >= 8) transitionSection(event.deltaY > 0 ? 1 : -1); }, { passive: false });
  window.addEventListener('keydown', (event) => {
    if (![' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key) || event.target.closest('input, textarea, [contenteditable="true"]')) return;
    event.preventDefault();
    if (event.key === 'Home') transitionSection(-sections.length);
    else if (event.key === 'End') transitionSection(sections.length);
    else transitionSection([' ', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1);
  }, { passive: false });
  window.addEventListener('resize', () => syncCarousel(false), { passive: true });
  window.addEventListener('storage', (event) => { if (event.key === 'ooxme-language' && event.newValue) applyLanguage(event.newValue, { persist: false }); });

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  root.classList.add('s-x-discrete-sections');
  let initialLanguage = 'en';
  try { initialLanguage = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(initialLanguage, { persist: false });
  applyTheme('dark');
  setupFace();
  requestAnimationFrame(() => {
    syncCarousel(false);
    root.classList.remove('s-x-initializing');
  });
})();
