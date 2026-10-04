(() => {
  'use strict';

  const root = document.documentElement;
  const page = document.querySelector('.s-page--store');
  const content = page?.querySelector('.s-page__content');
  const composer = page?.querySelector('[data-s-composer]');
  const addButton = page?.querySelector('.s-page__add');
  const input = page?.querySelector('.s-page__composer-input');
  const submit = composer?.querySelector('button[type="submit"]');
  const languageButton = page?.querySelector('[data-s-utility="language"]');
  const sections = Array.from(page?.querySelectorAll('[data-s-major-section]') || []);
  const carousel = page?.querySelector('[data-store-carousel]');
  const carouselViewport = page?.querySelector('[data-store-carousel-viewport]');
  const carouselTrack = page?.querySelector('[data-store-carousel-track]');
  const productCards = Array.from(page?.querySelectorAll('[data-store-product-card]') || []);
  const previousProduct = page?.querySelector('[data-store-carousel-previous]');
  const nextProduct = page?.querySelector('[data-store-carousel-next]');
  const carouselStatus = page?.querySelector('[data-store-carousel-status]');
  const featuredCard = page?.querySelector('.s-page__store-featured-card');
  const featuredCopy = featuredCard?.querySelector('.s-page__store-card-copy');

  if (!page || !content || !composer || !addButton || !input || !submit || !languageButton || sections.length !== 3 || !carousel || !carouselViewport || !carouselTrack || productCards.length !== 4 || !previousProduct || !nextProduct || !carouselStatus) return;

  const copy = {
    en: {
      menu: ['Home', 'The Brand Management', 'The Gallery', 'The Store', 'The Consultation', 'Contact'],
      ask: 'Ask ooxme', add: 'Add context', submit: 'Submit question', language: 'Switch to Arabic', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode',
      view: 'View',
      customLabel: 'Custom Products', customTitle: 'Made for you', customDescription: 'A future space for products shaped around your needs.', customAction: 'Request a Custom Product',
      previous: 'Previous product', next: 'Next product'
    },
    ar: {
      menu: ['الرئيسية', 'إدارة العلامة التجارية', 'المعرض', 'المتجر', 'الاستشارة', 'تواصل'],
      ask: 'اسأل اوكسوم', add: 'اضف سياقًا', submit: 'ارسال السؤال', language: 'Switch to English', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode',
      view: 'عرض',
      customLabel: 'منتجات مخصصة', customTitle: 'مصمم لك', customDescription: 'مساحة مستقبلية لمنتجات مصممة حسب احتياجاتك.', customAction: 'اطلب منتج مخصص',
      previous: 'المنتج السابق', next: 'المنتج التالي'
    }
  };

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeProduct = 1;
  let sectionLocked = false;
  let sectionInputLocked = false;
  let sectionUnlockTimer = 0;
  let sectionSettleFrame = 0;
  let sectionSettleTarget = null;
  let sectionSettleStableFrames = 0;
  let sectionScrollResumeTimer = 0;
  let menuTimer = 0;
  let carouselDrag = null;
  let featuredEnglishRows = '';
  let publicProducts = [];
  const featuredFontsReady = document.fonts?.ready || Promise.resolve();

  const syncFeaturedGeometry = (language) => {
    if (!featuredCard || !featuredCopy) return;
    featuredCard.style.height = 'auto';
    if (language === 'en') {
      featuredCopy.style.removeProperty('grid-template-rows');
      featuredEnglishRows = getComputedStyle(featuredCopy).gridTemplateRows;
      return;
    }
    if (featuredEnglishRows) featuredCopy.style.gridTemplateRows = featuredEnglishRows;
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

  const renderPublicProducts = (language = root.lang) => {
    const selected = language === 'ar' ? 'ar' : 'en';
    const featured = publicProducts.find((product) => product.isFeatured) || publicProducts[0];
    const cards = publicProducts.filter((product) => product !== featured).slice(0, productCards.length);
    const set = (node, value) => { if (node) node.textContent = value || ''; };
    if (featured) {
      const featuredName = featured.name?.[selected] || '';
      const heroParts = featuredName.match(/^(\d+)\s*(.*)$/u);
      set(featuredCard?.querySelector('[data-store-copy="featuredHeroNumber"]'), heroParts?.[1] || '');
      set(featuredCard?.querySelector('[data-store-copy="featuredHeroWord"]'), heroParts?.[2] || featuredName);
      set(featuredCard?.querySelector('[data-store-copy="featuredName"]'), featured.name?.[selected]);
      set(featuredCard?.querySelector('[data-store-copy="featuredLabel"]'), language === 'ar' ? 'منتج مميز' : 'Featured Product');
      set(featuredCard?.querySelector('[data-store-copy="featuredCategory"]'), featured.category?.[selected]);
      set(featuredCard?.querySelector('[data-store-copy="featuredDescription"]'), featured.description?.[selected]);
      set(featuredCard?.querySelector('[data-store-copy="featuredPrice"]'), featured.price?.label?.[selected]);
    } else {
      featuredCard?.querySelectorAll('[data-store-copy="featuredHeroNumber"], [data-store-copy="featuredHeroWord"], [data-store-copy="featuredName"], [data-store-copy="featuredLabel"], [data-store-copy="featuredCategory"], [data-store-copy="featuredDescription"], [data-store-copy="featuredPrice"], [data-store-copy="featuredPreviousPrice"]').forEach((node) => { node.textContent = ''; });
    }
    productCards.forEach((card, index) => {
      const product = cards[index];
      card.hidden = !product;
      if (!product) return;
      set(card.querySelector('.s-page__store-card-title'), product.name?.[selected]);
      set(card.querySelector('.s-page__store-eyebrow'), product.category?.[selected]);
      set(card.querySelector('.s-page__store-card-description'), product.description?.[selected]);
      set(card.querySelector('.s-page__store-price--current'), product.price?.label?.[selected]);
    });
    syncCarousel(false);
  };

  const loadPublicProducts = async () => {
    try {
      const response = await fetch('/api/products', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('products_unavailable');
      publicProducts = (await response.json()).data?.products || [];
    } catch (_) {
      publicProducts = [];
    }
    renderPublicProducts(root.lang);
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
      if (/^(featured|product(?:One|Two|Three|Four))/.test(node.dataset.storeCopy)) return;
      const value = labels[node.dataset.storeCopy];
      if (value) node.textContent = value;
    });
    page.querySelectorAll('.s-page__composer-menu-label').forEach((node, index) => { node.textContent = labels.menu[index]; });
    page.querySelector('.s-page__input-label .s-page__visually-hidden').textContent = labels.ask;
    addButton.setAttribute('aria-label', language === 'ar' ? 'شخصية اوكسوم' : 'OOXME character');
    submit.setAttribute('aria-label', labels.submit);
    languageButton.setAttribute('aria-label', labels.language);
    languageButton.setAttribute('aria-pressed', String(language === 'en'));
    languageButton.classList.toggle('is-active', language === 'en');
    previousProduct.setAttribute('aria-label', labels.previous);
    nextProduct.setAttribute('aria-label', labels.next);
    input.value = '';
    updateInputLanguage();
    syncFeaturedGeometry(language);
    syncCarousel(false);
    renderPublicProducts(language);
  };

  window.addEventListener('ooxme-language-change', (event) => {
    if (event.detail?.language) applyLanguage(event.detail.language, { persist: false });
  });

  const sectionReferenceY = () => Number.parseFloat(getComputedStyle(content).paddingTop) || 0;
  const activeSectionIndex = () => sections.reduce((closest, section, index) => {
    const distance = Math.abs(section.getBoundingClientRect().top - sectionReferenceY());
    return !closest || distance < closest.distance ? { index, distance } : closest;
  }, null)?.index ?? 0;

  const sectionReferenceScrollY = (section) => (
    window.scrollY + section.getBoundingClientRect().top - sectionReferenceY()
  );

  const cancelSectionSettle = ({ stopNativeScroll = false } = {}) => {
    if (sectionSettleFrame) window.cancelAnimationFrame(sectionSettleFrame);
    sectionSettleFrame = 0;
    const wasSettling = sectionSettleTarget !== null;
    sectionSettleTarget = null;
    sectionSettleStableFrames = 0;
    if (stopNativeScroll) sectionLocked = false;
    if (stopNativeScroll && wasSettling) window.scrollTo({ top: window.scrollY, left: 0, behavior: 'auto' });
  };

  const watchSectionSettle = () => {
    sectionSettleFrame = 0;
    if (sectionSettleTarget === null) return;
    if (Math.abs(window.scrollY - sectionSettleTarget) <= 1) {
      sectionSettleStableFrames += 1;
      if (sectionSettleStableFrames >= 2) {
        sectionSettleTarget = null;
        sectionSettleStableFrames = 0;
        sectionLocked = false;
        return;
      }
    } else {
      sectionSettleStableFrames = 0;
    }
    sectionSettleFrame = window.requestAnimationFrame(watchSectionSettle);
  };

  const settleToNearestSection = () => {
    if (sectionSettleTarget !== null || sectionLocked) return;
    const current = activeSectionIndex();
    const target = sectionReferenceScrollY(sections[current]);
    if (Math.abs(window.scrollY - target) <= 1) return;
    sectionSettleTarget = target;
    sectionSettleStableFrames = 0;
    sectionLocked = true;
    window.scrollTo({ top: target, left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    sectionSettleFrame = window.requestAnimationFrame(watchSectionSettle);
  };

  const transitionSection = (direction) => {
    if (!direction || sectionInputLocked || sectionSettleTarget !== null) return;
    const current = activeSectionIndex();
    const targetIndex = Math.max(0, Math.min(sections.length - 1, current + direction));
    const target = sections[targetIndex];
    if (!target || targetIndex === current) return;
    sectionLocked = true;
    clearTimeout(sectionUnlockTimer);
    cancelSectionSettle();
    sectionSettleTarget = sectionReferenceScrollY(target);
    sectionSettleStableFrames = 0;
    sectionInputLocked = true;
    window.clearTimeout(sectionUnlockTimer);
    sectionUnlockTimer = window.setTimeout(() => { sectionInputLocked = false; }, 800);
    window.scrollTo({ top: sectionSettleTarget, left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    sectionSettleFrame = window.requestAnimationFrame(watchSectionSettle);
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

  input.addEventListener('input', updateInputLanguage);
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

  document.addEventListener('pointerdown', () => cancelSectionSettle({ stopNativeScroll: true }), { capture: true, passive: true });
  window.addEventListener('scroll', () => {
    if (sectionSettleTarget !== null) return;
    window.clearTimeout(sectionScrollResumeTimer);
    sectionScrollResumeTimer = window.setTimeout(settleToNearestSection, 90);
  }, { passive: true });
  window.addEventListener('resize', () => {
    applyLanguage(root.lang === 'en' ? 'en' : 'ar', { persist: false });
    syncCarousel(false);
  }, { passive: true });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  renderPublicProducts(root.lang);
  void loadPublicProducts();
  root.classList.add('s-x-discrete-sections');
  applyLanguage(root.lang === 'en' ? 'en' : 'ar', { persist: false });
  featuredFontsReady.then(() => { if (root.lang === 'en') syncFeaturedGeometry('en'); });
  requestAnimationFrame(() => {
    syncCarousel(false);
    root.classList.remove('s-x-initializing');
  });
})();
