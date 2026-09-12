(() => {
  'use strict';

  const root = document.documentElement;
  const page = document.querySelector('.s-page--rpn');
  const composer = page?.querySelector('[data-s-composer]');
  const composerMenu = page?.querySelector('[data-s-composer-menu]');
  const sendUtilities = page?.querySelector('[data-s-send-utilities]');
  const themeUtility = page?.querySelector('[data-s-utility="theme"]');
  const languageUtility = page?.querySelector('[data-s-utility="language"]');
  const addButton = page?.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  const nav = page?.querySelector('[data-s-rpn-secondary-nav]');
  const navItems = Array.from(page?.querySelectorAll('[data-s-rpn-secondary-nav-item]') || []);
  const previousButton = page?.querySelector('[data-s-rpn-secondary-nav-previous]');
  const nextButton = page?.querySelector('[data-s-rpn-secondary-nav-next]');
  const carouselNav = page?.querySelector('[data-s-rpn-carousel-nav]');
  const carouselPrevious = carouselNav?.querySelector('button:first-child');
  const carouselNext = carouselNav?.querySelector('button:last-child');
  const carouselCounter = carouselNav?.querySelector('[data-s-rpn-carousel-counter]');
  const storeCarousel = page?.querySelector('[data-store-carousel]');
  const storeCarouselViewport = page?.querySelector('[data-store-carousel-viewport]');
  const storeCarouselTrack = page?.querySelector('[data-store-carousel-track]');
  const storeProductCards = Array.from(page?.querySelectorAll('[data-store-product-card]') || []);
  const menuLabels = Array.from(composerMenu?.querySelectorAll('.s-page__composer-menu-label') || []);
  const menuItems = Array.from(composerMenu?.querySelectorAll('.s-page__composer-menu-item') || []);

  if (!page || !composer || !composerMenu || !sendUtilities
    || !themeUtility || !languageUtility || !addButton || !submitButton || !nav
    || !previousButton || !nextButton || !carouselNav || !carouselPrevious || !carouselNext || !carouselCounter || !storeCarousel || !storeCarouselViewport || !storeCarouselTrack || storeProductCards.length !== 4 || navItems.length !== 4 || menuItems.length !== 5) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const menuCopy = {
    en: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'],
    ar: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل']
  };
  const utilityCopy = {
    en: { submit: 'Submit question', previous: 'Previous card', next: 'Next card', nav: 'Card navigation', toArabic: 'Switch to Arabic', toDay: 'Switch to Day Mode', toDark: 'Switch to Dark Mode' },
    ar: { submit: 'ارسال السؤال', previous: 'البطاقة السابقة', next: 'البطاقة التالية', nav: 'التنقل بين البطاقات', toEnglish: 'Switch to English', toDay: 'التبديل الى الوضع النهاري', toDark: 'التبديل الى الوضع الداكن' }
  };
  const storeCopy = {
    en: {
      descriptionLabel: 'Description', descriptionTitle: 'OOXME Referral Partner Network', descriptionBody: 'A professional network connecting OOXME with companies and project owners through trusted business relationships. Partners share suitable opportunities and connect clients with our team, while OOXME handles evaluation, presentation, commercial discussions, and contracting.', descriptionSecondary: 'Applications open: 1 October 2026',
      requirementsLabel: 'Requirements', requirementsOneTitle: 'Strong Relations', requirementsOneBody: 'Connect with business owners, project owners, managers, and decision-makers.', requirementsTwoTitle: 'Related Field', requirementsTwoBody: 'Work in, or have strong connections to, engineering, architecture, construction, or related sectors.', requirementsThreeTitle: 'OOXME Commitment', requirementsThreeBody: 'Follow OOXME’s approved referral process and professional communication standards.',
      rewardsLabel: 'Rewards', rewardsOneTitle: '25% Commission', rewardsOneBody: 'Earned when a referred client signs a contract with OOXME.', rewardsTwoTitle: 'Client Discount', rewardsTwoBody: 'Available for clients referred through you when they sign a contract with OOXME.', rewardsThreeTitle: 'OOXME ID', rewardsThreeBody: 'Awarded after 2 successful referrals.', rewardsFourTitle: 'Internet Credit', rewardsFourBody: 'Awarded after 3 successful referrals.', rewardsFiveTitle: 'Transport Credit', rewardsFiveBody: 'Awarded after 4 successful referrals.', rewardsSixTitle: 'Formal Suit', rewardsSixBody: 'Awarded after 5 successful referrals.',
      applyLabel: 'Apply', applyOneTitle: 'Applications Open', applyOneBody: 'Applications will open on the officially announced date.', applyTwoTitle: 'Who Can Apply', applyTwoBody: 'Professionals with strong business relationships, especially in engineering and related sectors.', applyThreeTitle: 'Selection', applyThreeBody: 'Applicants will be reviewed based on network quality, professional relevance, and commitment to the OOXME referral system.', sendEmail: 'Send Email', applyNow: 'Apply Now', previous: 'Previous card', next: 'Next card'
    },
    ar: {
      descriptionLabel: 'وصف', descriptionTitle: 'شبكة شركاء الاحالة لاوكسوم', descriptionBody: 'شبكة مهنية تربط اوكسوم بالشركات واصحاب المشاريع من خلال علاقات اعمال موثوقة. يشارك الشركاء الفرص المناسبة ويربطون العملاء بفريقنا، بينما تتولى اوكسوم التقييم والعرض والمناقشات التجارية والتعاقد.', descriptionSecondary: 'يبدأ التقديم: 1 أكتوبر 2026',
      requirementsLabel: 'شروط التقديم', requirementsOneTitle: 'علاقات قوية', requirementsOneBody: 'التواصل مع اصحاب الاعمال والمشاريع والمديرين وصناع القرار.', requirementsTwoTitle: 'مجال ذو صلة', requirementsTwoBody: 'العمل في، او امتلاك علاقات قوية مع، الهندسة او العمارة او الانشاءات او القطاعات ذات الصلة.', requirementsThreeTitle: 'التزام اوكسوم', requirementsThreeBody: 'اتباع الية الاحالة المعتمدة لدى اوكسوم ومعايير التواصل المهني.',
      rewardsLabel: 'المكافآت', rewardsOneTitle: 'عمولة 25%', rewardsOneBody: 'تمنح عند توقيع العميل المحال عقدا مع اوكسوم.', rewardsTwoTitle: 'خصم العميل', rewardsTwoBody: 'متاح للعملاء المحالين من خلالك عند توقيعهم عقدا مع اوكسوم.', rewardsThreeTitle: 'هوية اوكسوم', rewardsThreeBody: 'تمنح بعد احالتين ناجحتين.', rewardsFourTitle: 'رصيد الانترنت', rewardsFourBody: 'يمنح بعد 3 احالات ناجحة.', rewardsFiveTitle: 'رصيد النقل', rewardsFiveBody: 'يمنح بعد 4 احالات ناجحة.', rewardsSixTitle: 'بدلة رسمية', rewardsSixBody: 'تمنح بعد 5 احالات ناجحة.',
      applyLabel: 'التقديم', applyOneTitle: 'فتح التقديم', applyOneBody: 'سيبدأ التقديم في الموعد المعلن رسميا.', applyTwoTitle: 'من يمكنه التقديم', applyTwoBody: 'المهنيون الذين يمتلكون علاقات اعمال قوية، خصوصا في الهندسة والقطاعات ذات الصلة.', applyThreeTitle: 'الاختيار', applyThreeBody: 'تتم مراجعة المتقدمين بناء على جودة شبكة العلاقات، والصلة المهنية، والالتزام بنظام الاحالة المعتمد لدى اوكسوم.', sendEmail: 'ارسال بريد', applyNow: 'قدم الان', previous: 'البطاقة السابقة', next: 'البطاقة التالية'
    }
  };

  const pulseFrames = new Map();
  const utilityPulseFrames = new Map();
  const menuFlashTimers = new Map();
  let activeCard = 0;
  let activeUi = 'none';
  let initialized = false;
  let initializationRun = 0;
  let menuCloseTimer = 0;
  let composerPulseFrame = 0;
  let menuPulseFrame = 0;
  let inactivityTimer = 0;
  let faceController = null;
  let activeProduct = 0;
  let storeCarouselDrag = null;

  const pulseSurface = (element) => {
    const pending = pulseFrames.get(element);
    if (pending) cancelAnimationFrame(pending);
    element.classList.remove('is-pulsing');
    pulseFrames.set(element, requestAnimationFrame(() => {
      pulseFrames.delete(element);
      element.classList.add('is-pulsing');
    }));
  };

  const pulseUtility = (element) => {
    const pending = utilityPulseFrames.get(element);
    if (pending) cancelAnimationFrame(pending);
    element.classList.remove('is-pulsing');
    utilityPulseFrames.set(element, requestAnimationFrame(() => {
      utilityPulseFrames.delete(element);
      element.classList.add('is-pulsing');
    }));
  };

  const setMenuOpen = (open) => {
    clearTimeout(menuCloseTimer);
    menuCloseTimer = 0;
    if (open) {
      composer.style.setProperty('--s-composer-menu-height', `${composerMenu.offsetHeight}px`);
      composerMenu.classList.add('is-open');
      composerMenu.setAttribute('aria-hidden', 'false');
      return;
    }
    if (!composerMenu.classList.contains('is-open')) {
      composerMenu.setAttribute('aria-hidden', 'true');
      return;
    }
    menuCloseTimer = window.setTimeout(() => {
      composerMenu.classList.remove('is-open');
      composerMenu.setAttribute('aria-hidden', 'true');
      menuCloseTimer = 0;
    }, 60);
  };

  const setUtilitiesOpen = (open) => {
    sendUtilities.classList.toggle('is-open', open);
    sendUtilities.setAttribute('aria-hidden', String(!open));
  };

  const setActiveUi = (next) => {
    activeUi = next === 'menu' ? 'menu' : 'none';
    const menuOpen = activeUi === 'menu';
    submitButton.classList.toggle('is-active', menuOpen);
    setMenuOpen(menuOpen);
    setUtilitiesOpen(menuOpen);
  };

  const resetTopBar = () => {
    addButton.classList.remove('is-active');
    setActiveUi('none');
  };

  const pulseComposer = () => {
    if (!initialized) return;
    if (composerPulseFrame) cancelAnimationFrame(composerPulseFrame);
    composer.classList.remove('is-pulsing');
    composerPulseFrame = requestAnimationFrame(() => {
      composerPulseFrame = 0;
      composer.classList.add('is-pulsing');
    });
  };

  const pulseMenu = () => {
    if (!initialized) return;
    if (menuPulseFrame) cancelAnimationFrame(menuPulseFrame);
    composerMenu.classList.remove('is-pulsing');
    menuPulseFrame = requestAnimationFrame(() => {
      menuPulseFrame = 0;
      composerMenu.classList.add('is-pulsing');
    });
  };

  const updateThemeLabel = () => {
    const language = root.lang === 'ar' ? 'ar' : 'en';
    const copy = utilityCopy[language];
    themeUtility.setAttribute('aria-label', root.classList.contains('is-day-mode') ? copy.toDark : copy.toDay);
  };

  const syncStoreCarousel = (animate = true, dragOffset = 0) => {
    const card = storeProductCards[activeProduct];
    if (!card) return;
    const rtl = root.lang === 'ar';
    storeCarouselTrack.classList.toggle('is-dragging', !animate);
    const gap = Number.parseFloat(getComputedStyle(storeCarouselTrack).columnGap) || 0;
    const centerOffset = (storeCarouselViewport.clientWidth / 2) - (card.offsetWidth / 2);
    const position = rtl ? -centerOffset + (activeProduct * (card.offsetWidth + gap)) + dragOffset : centerOffset - (activeProduct * (card.offsetWidth + gap)) + dragOffset;
    storeCarouselTrack.style.transform = `translate3d(${position.toFixed(2)}px, 0, 0)`;
    storeProductCards.forEach((item, index) => {
      const active = index === activeProduct;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-current', active ? 'true' : 'false');
      item.dir = root.lang === 'ar' ? 'rtl' : 'ltr';
      item.lang = root.lang === 'ar' ? 'ar' : 'en';
    });
    carouselCounter.textContent = `${activeProduct + 1} / ${storeProductCards.length}`;
  };

  const selectStoreProduct = (nextIndex) => {
    activeProduct = Math.max(0, Math.min(storeProductCards.length - 1, nextIndex));
    activeCard = activeProduct;
    syncCardNavigation();
    syncStoreCarousel(true);
  };

  const syncCardNavigation = () => {
    navItems.forEach((item, itemIndex) => {
      const active = itemIndex === activeCard;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    faceController?.setApply(activeCard === 3);
  };

  const applyTheme = (theme) => {
    const day = theme === 'day';
    root.classList.toggle('is-day-mode', day);
    themeUtility.classList.toggle('is-active', !day);
    themeUtility.setAttribute('aria-pressed', String(!day));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000');
    updateThemeLabel();
  };

  const applyLanguage = (next, { persist = true, emit = true } = {}) => {
    const language = next === 'ar' ? 'ar' : 'en';
    const copy = utilityCopy[language];
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    menuLabels.forEach((label, index) => { label.textContent = menuCopy[language][index]; });
    page.querySelectorAll('[data-store-copy]').forEach((node) => {
      const value = storeCopy[language][node.dataset.storeCopy];
      if (value) node.textContent = value;
    });
    nav.setAttribute('aria-label', copy.nav);
    previousButton.setAttribute('aria-label', copy.previous);
    nextButton.setAttribute('aria-label', copy.next);
    carouselPrevious.setAttribute('aria-label', storeCopy[language].previous);
    carouselNext.setAttribute('aria-label', storeCopy[language].next);
    addButton.setAttribute('aria-label', language === 'ar' ? 'الذهاب الى اوكسوم' : 'Go to OOXME');
    submitButton.setAttribute('aria-label', copy.submit);
    languageUtility.classList.toggle('is-active', language === 'en');
    languageUtility.setAttribute('aria-pressed', String(language === 'en'));
    languageUtility.setAttribute('aria-label', language === 'en' ? copy.toArabic : copy.toEnglish);
    updateThemeLabel();
    syncStoreCarousel(false);
    if (persist) {
      try { localStorage.setItem('ooxme-language', language); } catch (_) {}
    }
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language } }));
  };

  const createFaceController = () => {
    const face = addButton.querySelector('[data-s-rpn-face]');
    const shell = face?.querySelector('.s-page__rpn-face-shell');
    const eyes = face?.querySelector('.s-page__rpn-face-eyes');
    const eyeMotion = face?.querySelector('.s-page__rpn-face-eye-motion');
    if (!face || !shell || !eyes || !eyeMotion) return null;
    const gazeLimit = 1.1;
    const dragThreshold = 6;
    let pointer = null;
    let dragging = false;
    let tapping = false;
    let settling = false;
    let applyActive = false;
    let reaction = null;
    let reactionStartedAt = 0;
    let tapTimer = 0;
    let settleTimer = 0;
    let reactionTimer = 0;
    let previousTime = 0;
    let targetGaze = { x: 0, y: 0 };
    let currentGaze = { x: 0, y: 0 };
    const clearTimer = (timer) => { if (timer) clearTimeout(timer); return 0; };
    const setGaze = (x, y, normalize = true) => {
      const magnitude = Math.hypot(x, y);
      const scale = normalize && magnitude ? gazeLimit / Math.max(gazeLimit, magnitude) : 1;
      targetGaze = { x: Math.max(-gazeLimit, Math.min(gazeLimit, x * scale)), y: Math.max(-gazeLimit, Math.min(gazeLimit, y * scale)) };
    };
    const state = () => dragging ? 'drag' : tapping ? 'tap' : reaction || (applyActive ? 'apply' : (settling ? 'settle' : 'idle'));
    const renderState = () => { face.dataset.faceState = state(); };
    const tick = (time) => {
      const delta = Math.min(48, Math.max(1, time - (previousTime || time)));
      previousTime = time;
      const currentState = state();
      const gazeTarget = currentState === 'tap' || currentState === 'drag' ? targetGaze : { x: 0, y: 0 };
      const easing = 1 - Math.exp(-delta / (currentState === 'drag' ? 38 : 72));
      currentGaze.x += (gazeTarget.x - currentGaze.x) * easing;
      currentGaze.y += (gazeTarget.y - currentGaze.y) * easing;
      const elapsed = reaction ? Math.max(0, time - reactionStartedAt) : 0;
      const bounce = currentState === 'apply-enter' ? Math.sin(Math.min(1, elapsed / 420) * Math.PI * 2) * .62 : 0;
      const shake = currentState === 'apply-exit' ? Math.sin(Math.min(1, elapsed / 340) * Math.PI * 4) * .68 : 0;
      const blinkPhase = (((time / 1000) + .7) % 5.6) / 5.6;
      const blink = currentState === 'idle' ? 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .022, 2))) : 1;
      shell.setAttribute('transform', `translate(${shake.toFixed(3)} ${bounce.toFixed(3)})`);
      eyes.setAttribute('transform', `translate(${currentGaze.x.toFixed(3)} ${currentGaze.y.toFixed(3)})`);
      eyeMotion.setAttribute('transform', currentState === 'idle' ? `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)` : `translate(0 ${(currentState === 'apply' || currentState === 'apply-enter' ? -.22 : 0).toFixed(3)})`);
      renderState();
      requestAnimationFrame(tick);
    };
    const center = () => setGaze(0, 0, false);
    const gazeAt = (x, y) => {
      const rect = addButton.getBoundingClientRect();
      setGaze(x - rect.left - rect.width / 2, y - rect.top - rect.height / 2);
    };
    const begin = (event) => {
      if ((event.pointerType === 'mouse' && event.button !== 0) || pointer) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      dragging = false;
    };
    const move = (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!dragging && Math.hypot(dx, dy) < dragThreshold) return;
      if (!dragging) {
        dragging = true; tapping = false; settling = false;
        tapTimer = clearTimer(tapTimer); settleTimer = clearTimer(settleTimer);
      }
      setGaze(dx, dy);
      renderState();
    };
    const end = (event, cancelled = false) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const wasDragging = dragging;
      pointer = null; dragging = false;
      if (wasDragging) {
        tapping = false; settling = true; center(); renderState();
        settleTimer = clearTimer(settleTimer);
        settleTimer = window.setTimeout(() => { settling = false; renderState(); }, 480);
      } else if (cancelled) {
        center(); renderState();
      } else {
        tapping = true; settling = false; gazeAt(event.clientX, event.clientY); renderState();
        tapTimer = clearTimer(tapTimer);
        tapTimer = window.setTimeout(() => { tapping = false; center(); renderState(); }, 380);
      }
    };
    const rejectApply = () => {
      applyActive = false; reaction = 'apply-exit'; reactionStartedAt = performance.now();
      reactionTimer = clearTimer(reactionTimer); center();
      reactionTimer = window.setTimeout(() => { reaction = null; center(); renderState(); }, 360);
    };
    const setApply = (active) => {
      if (active && !applyActive) {
        applyActive = true; reaction = 'apply-enter'; reactionStartedAt = performance.now();
        reactionTimer = clearTimer(reactionTimer); if (!dragging && !tapping) center();
        reactionTimer = window.setTimeout(() => { reaction = null; renderState(); }, 420);
      } else if (!active && applyActive) rejectApply();
      renderState();
    };
    renderState();
    requestAnimationFrame(tick);
    return { begin, move, end, setApply, rejectApply };
  };

  const setActiveCard = (index) => {
    activeCard = Math.max(0, Math.min(navItems.length - 1, index));
    activeProduct = activeCard;
    syncCardNavigation();
    syncStoreCarousel(true);
  };

  const prepareLayout = () => {
    syncStoreCarousel(false);
  };

  const initialize = () => {
    initializationRun += 1;
    root.classList.add('s-x-initializing');
    initialized = false;
    resetTopBar();
    composer.classList.remove('is-pulsing');
    prepareLayout();
    const run = initializationRun;
    const fontsReady = document.fonts?.ready || Promise.resolve();
    fontsReady.then(() => { if (initializationRun === run) prepareLayout(); });
    initialized = true;
    root.classList.remove('s-x-initializing');
  };

  const resetPage = () => {
    clearTimeout(inactivityTimer);
    pulseFrames.forEach(cancelAnimationFrame);
    pulseFrames.clear();
    utilityPulseFrames.forEach(cancelAnimationFrame);
    utilityPulseFrames.clear();
    menuFlashTimers.forEach(clearTimeout);
    menuFlashTimers.clear();
    document.querySelectorAll('.is-pulsing').forEach((element) => element.classList.remove('is-pulsing'));
    applyLanguage('en', { persist: false, emit: false });
    applyTheme('dark');
    setActiveCard(0);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    initialize();
    inactivityTimer = window.setTimeout(resetPage, 30000);
  };

  const noteInteraction = () => {
    if (!initialized) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = window.setTimeout(resetPage, 30000);
  };

  faceController = createFaceController();
  applyLanguage('en', { persist: false, emit: false });
  applyTheme('dark');

  composer.addEventListener('animationend', (event) => { if (event.animationName === 's-page-composer-pulse') composer.classList.remove('is-pulsing'); });
  composerMenu.addEventListener('animationend', (event) => { if (event.animationName === 's-page-composer-menu-pulse') composerMenu.classList.remove('is-pulsing'); });
  nav.addEventListener('animationend', (event) => { if (event.animationName === 's-page-composer-menu-pulse') nav.classList.remove('is-pulsing'); });
  [themeUtility, languageUtility].forEach((control) => {
    control.addEventListener('pointerdown', () => pulseUtility(control), { passive: true });
    control.addEventListener('animationend', (event) => { if (event.animationName === 's-page-composer-menu-pulse') control.classList.remove('is-pulsing'); });
  });
  [addButton, submitButton].forEach((control) => control.addEventListener('pointerdown', pulseComposer, { passive: true }));
  submitButton.addEventListener('pointerdown', (event) => event.preventDefault());
  [addButton, composerMenu, sendUtilities].forEach((control) => {
    control.addEventListener('pointerdown', (event) => event.stopPropagation());
    control.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
    control.addEventListener('click', (event) => event.stopPropagation());
  });
  composer.addEventListener('pointerdown', (event) => { if (event.target === composer) pulseComposer(); }, { passive: true });
  composerMenu.querySelectorAll('.s-page__composer-menu-item').forEach((item) => {
    item.addEventListener('pointerdown', () => {
      pulseMenu();
      clearTimeout(menuFlashTimers.get(item));
      item.classList.add('is-active');
      menuFlashTimers.set(item, window.setTimeout(() => item.classList.remove('is-active'), 120));
    }, { passive: true });
  });
  menuItems[0].addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.assign('/bm');
  });
  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.assign('/');
  });
  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveUi(activeUi === 'menu' ? 'none' : 'menu');
  });
  document.addEventListener('pointerdown', (event) => { if (!composer.contains(event.target)) setActiveUi('none'); }, { passive: true });
  themeUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day');
  });
  languageUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyLanguage(root.lang === 'ar' ? 'en' : 'ar');
  });

  navItems.forEach((item, index) => item.addEventListener('click', () => {
    setActiveCard(index);
    pulseSurface(nav);
  }));
  [[previousButton, -1], [nextButton, 1]].forEach(([button, step]) => button.addEventListener('click', () => {
    setActiveCard(activeCard + step);
    pulseSurface(nav);
  }));
  carouselNav.addEventListener('click', () => pulseSurface(carouselNav));
  carouselPrevious.addEventListener('click', () => selectStoreProduct(activeProduct - 1));
  carouselNext.addEventListener('click', () => selectStoreProduct(activeProduct + 1));
  page.querySelectorAll('.s-page__store-action').forEach((button) => button.addEventListener('click', (event) => event.preventDefault()));
  storeCarouselViewport.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    storeCarouselDrag = { id: event.pointerId, startX: event.clientX, delta: 0 };
    storeCarouselViewport.setPointerCapture?.(event.pointerId);
    syncStoreCarousel(false);
  });
  storeCarouselViewport.addEventListener('pointermove', (event) => {
    if (!storeCarouselDrag || event.pointerId !== storeCarouselDrag.id) return;
    storeCarouselDrag.delta = event.clientX - storeCarouselDrag.startX;
    syncStoreCarousel(false, storeCarouselDrag.delta);
  });
  const finishStoreCarouselDrag = (event) => {
    if (!storeCarouselDrag || event.pointerId !== storeCarouselDrag.id) return;
    const delta = storeCarouselDrag.delta;
    storeCarouselDrag = null;
    if (Math.abs(delta) >= 42) selectStoreProduct(activeProduct + ((delta < 0 ? 1 : -1) * (root.lang === 'ar' ? -1 : 1)));
    else syncStoreCarousel(true);
  };
  storeCarouselViewport.addEventListener('pointerup', finishStoreCarouselDrag);
  storeCarouselViewport.addEventListener('pointercancel', finishStoreCarouselDrag);

  document.addEventListener('pointerdown', (event) => {
    faceController?.begin(event);
  }, { capture: true, passive: true });
  document.addEventListener('pointermove', (event) => {
    faceController?.move(event);
  }, { capture: true, passive: true });
  ['pointerup', 'pointercancel'].forEach((eventName) => document.addEventListener(eventName, (event) => {
    faceController?.end(event, eventName === 'pointercancel');
  }, { passive: true }));
  window.addEventListener('resize', () => syncStoreCarousel(false), { passive: true });

  ['pointerdown', 'mousemove', 'touchstart', 'click', 'keydown'].forEach((eventName) => document.addEventListener(eventName, noteInteraction, { passive: true }));
  window.addEventListener('pageshow', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    initialize();
  });

  page.classList.add('s-rpn-discrete-sections');
  root.classList.add('s-rpn-discrete-sections');
  setActiveCard(0);
  initialize();
  noteInteraction();
})();
