(() => {
  const root = document.documentElement;
  const languageStorageKey = 'ooxme-language';
  const readLanguage = () => {
    try {
      const saved = window.localStorage.getItem(languageStorageKey);
      return saved === 'ar' || saved === 'en' ? saved : '';
    } catch { return ''; }
  };
  const applyLanguage = (language, emit = true) => {
    const current = language === 'ar' ? 'ar' : 'en';
    if (root.lang !== current) root.lang = current;
    if (root.dir !== (current === 'ar' ? 'rtl' : 'ltr')) root.dir = current === 'ar' ? 'rtl' : 'ltr';
    try { if (window.localStorage.getItem(languageStorageKey) !== current) window.localStorage.setItem(languageStorageKey, current); } catch { /* Storage may be unavailable. */ }
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language: current } }));
  };
  const savedLanguage = readLanguage();
  if (savedLanguage) applyLanguage(savedLanguage, false);
  else {
    const initial = root.lang === 'en' ? 'en' : 'ar';
    applyLanguage(initial, false);
  }

  const composer = document.querySelector('[data-s-composer]');
  const addButton = composer?.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  if (!composer || !addButton || !submitButton) return;

  const pulse = () => {
    composer.classList.remove('is-pulsing');
    requestAnimationFrame(() => composer.classList.add('is-pulsing'));
  };
  composer.addEventListener('animationend', (event) => {
    if (event.animationName === 's-page-composer-pulse') composer.classList.remove('is-pulsing');
  });
  [addButton, submitButton].forEach((control) => control.addEventListener('pointerdown', pulse, { passive: true }));
  composer.addEventListener('pointerdown', (event) => { if (event.target === composer) pulse(); }, { passive: true });

  const menu = composer.querySelector('[data-s-composer-menu]');
  const utilities = composer.querySelector('[data-s-send-utilities]');
  const themeUtility = composer.querySelector('[data-s-utility="theme"]');
  const languageUtility = composer.querySelector('[data-s-utility="language"]');
  const keyForLabel = (label) => ({
    'The Brand Management': 'brand', 'إدارة العلامة التجارية': 'brand',
    'The Gallery': 'gallery', 'المعرض': 'gallery',
    'The Store': 'store', 'المتجر': 'store',
    'The Consultation': 'consultation', 'الاستشارة': 'consultation',
    Contact: 'contact', 'تواصل': 'contact'
  })[label.trim()] || '';
  const itemForKey = (key, href, disabled = false) => {
    const item = document.createElement(disabled ? 'button' : 'a');
    item.className = 's-page__composer-menu-item';
    item.dataset.sMenuKey = key;
    if (disabled) {
      item.type = 'button';
      item.disabled = true;
      item.setAttribute('aria-disabled', 'true');
    } else item.href = href;
    const label = document.createElement('span');
    label.className = 's-page__composer-menu-label';
    item.append(label);
    return item;
  };
  const normalizeMenu = () => {
    if (!menu) return;
    menu.setAttribute('role', 'navigation');
    menu.setAttribute('aria-label', root.lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation');
    const found = new Map();
    [...menu.querySelectorAll('.s-page__composer-menu-item')].forEach((item) => {
      const label = item.querySelector('.s-page__composer-menu-label');
      const key = item.dataset.sMenuKey || keyForLabel(label?.textContent || '');
      if (key) found.set(key, item);
    });

    const items = [
      itemForKey('home', '/'),
      itemForKey('brand', '', true),
      itemForKey('gallery', '', true),
      itemForKey('store', '', true),
      itemForKey('consultation', '/consultation'),
      itemForKey('contact', document.body.classList.contains('s-page--main') ? '#contact' : '/?section=contact')
    ];
    const language = root.lang === 'en' ? 'en' : 'ar';
    const menuLabels = {
      en: { home: 'Home', brand: 'The Brand Management', gallery: 'The Gallery', store: 'The Store', consultation: 'The Consultation', contact: 'Contact' },
      ar: { home: 'الرئيسية', brand: 'إدارة العلامة التجارية', gallery: 'المعرض', store: 'المتجر', consultation: 'الاستشارة', contact: 'تواصل' }
    };
    items.forEach((item) => {
      const key = item.dataset.sMenuKey;
      const oldItem = found.get(key);
      const lock = oldItem?.querySelector('.s-page__x-menu-lock');
      if (lock && (key === 'brand' || key === 'gallery')) item.append(lock.cloneNode(true));
      if (key === 'store') {
        const storeLock = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        storeLock.setAttribute('class', 's-page__x-menu-lock');
        storeLock.setAttribute('viewBox', '0 0 16 16');
        storeLock.setAttribute('aria-hidden', 'true');
        storeLock.setAttribute('focusable', 'false');
        const shackle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shackle.setAttribute('class', 's-page__x-menu-lock-shackle');
        shackle.setAttribute('d', 'M4.5 7V4.75a3.5 3.5 0 0 1 7 0V7');
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('class', 's-page__x-menu-lock-body');
        body.setAttribute('x', '2.5'); body.setAttribute('y', '7'); body.setAttribute('width', '11'); body.setAttribute('height', '7'); body.setAttribute('rx', '1.5');
        storeLock.append(shackle, body);
        item.append(storeLock);
      }
      item.querySelector('.s-page__composer-menu-label').textContent = menuLabels[language][key];
    });
    menu.replaceChildren(...items);
  };

  let closeTimer = 0;
  let menuExpanded = false;
  const updateMenuTriggerLabel = () => {
    const labels = root.lang === 'ar'
      ? { open: 'فتح قائمة التنقل', close: 'إغلاق قائمة التنقل' }
      : { open: 'Open navigation menu', close: 'Close navigation menu' };
    submitButton.setAttribute('aria-label', menuExpanded ? labels.close : labels.open);
  };
  const setMenuOpen = (open) => {
    window.clearTimeout(closeTimer);
    menuExpanded = open;
    if (open) {
      normalizeMenu();
      composer.style.setProperty('--s-composer-menu-height', `${menu?.offsetHeight || 0}px`);
      menu?.classList.add('is-open');
      menu?.setAttribute('aria-hidden', 'false');
      if (menu) menu.inert = false;
      utilities?.classList.add('is-open');
      utilities?.setAttribute('aria-hidden', 'false');
      if (utilities) utilities.inert = false;
      submitButton.classList.add('is-active');
      submitButton.setAttribute('aria-expanded', 'true');
      updateMenuTriggerLabel();
      return;
    }
    submitButton.classList.remove('is-active');
    submitButton.setAttribute('aria-expanded', 'false');
    updateMenuTriggerLabel();
    composer.style.removeProperty('--s-composer-menu-height');
    closeTimer = window.setTimeout(() => {
      menu?.classList.remove('is-open');
      menu?.setAttribute('aria-hidden', 'true');
      if (menu) menu.inert = true;
      utilities?.classList.remove('is-open');
      utilities?.setAttribute('aria-hidden', 'true');
      if (utilities) utilities.inert = true;
      closeTimer = 0;
    }, 60);
  };
  window.OOXMEHeader = { setMenuOpen, normalizeMenu };

  if (menu) {
    menu.id ||= 'ooxme-primary-menu';
    submitButton.setAttribute('aria-controls', menu.id);
    submitButton.setAttribute('aria-expanded', 'false');
    menu.inert = true;
    if (utilities) utilities.inert = true;
    normalizeMenu();
    menu.addEventListener('pointerdown', (event) => {
      const item = event.target.closest('.s-page__composer-menu-item');
      if (!item || item.disabled) return;
      item.classList.add('is-active');
      window.setTimeout(() => item.classList.remove('is-active'), 120);
    }, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.classList.contains('is-open')) return;
      setMenuOpen(false);
      submitButton.focus({ preventScroll: true });
    });
  }
  const updateAddLabel = () => addButton.setAttribute('aria-label', root.lang === 'ar' ? 'شخصية اوكسوم' : 'OOXME character');
  updateAddLabel();
  updateMenuTriggerLabel();
  window.setTimeout(updateMenuTriggerLabel, 0);
  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenuOpen(false);
  });
  document.addEventListener('pointerdown', (event) => {
    if (composer.contains(event.target)) return;
    setMenuOpen(false);
  }, { passive: true });
  window.addEventListener('resize', () => { if (menu?.classList.contains('is-open')) setMenuOpen(true); }, { passive: true });

  const persistCurrentLanguage = () => {
    const current = root.lang === 'en' ? 'en' : 'ar';
    try { window.localStorage.setItem(languageStorageKey, current); } catch { /* Storage may be unavailable. */ }
    root.dir = current === 'ar' ? 'rtl' : 'ltr';
    updateAddLabel();
    updateMenuTriggerLabel();
    normalizeMenu();
    window.setTimeout(updateMenuTriggerLabel, 0);
  };
  new MutationObserver(persistCurrentLanguage).observe(root, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('storage', (event) => {
    if (event.key !== languageStorageKey || !['ar', 'en'].includes(event.newValue)) return;
    applyLanguage(event.newValue);
  });
  window.addEventListener('ooxme-language-change', persistCurrentLanguage);

  // Non-home routes use the same shared header controls; their page scripts
  // remain responsible only for page content and interaction.
  if (!document.body.classList.contains('s-page--main')) {
    const utilityCopy = {
      en: { language: 'Switch to Arabic', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode' },
      ar: { language: 'التبديل الى الانجليزية', day: 'التبديل الى الوضع النهاري', dark: 'التبديل الى الوضع الداكن' }
    };
    const updateRouteUtilities = () => {
      const labels = utilityCopy[root.lang === 'en' ? 'en' : 'ar'];
      composer.querySelector('.s-page__composer-input')?.setAttribute('placeholder', root.lang === 'ar' ? 'اسأل اوكسوم' : 'Ask ooxme');
      composer.querySelector('.s-page__composer-input')?.setAttribute('lang', root.lang);
      composer.querySelector('.s-page__composer-input')?.setAttribute('dir', root.lang === 'ar' ? 'rtl' : 'ltr');
      languageUtility?.classList.toggle('is-active', root.lang === 'en');
      languageUtility?.setAttribute('aria-pressed', String(root.lang === 'en'));
      languageUtility?.setAttribute('aria-label', labels.language);
      themeUtility?.setAttribute('aria-label', root.classList.contains('is-day-mode') ? labels.dark : labels.day);
    };
    const applyRouteTheme = (next) => {
      const day = next === 'day';
      root.classList.toggle('is-day-mode', day);
      themeUtility?.classList.toggle('is-active', !day);
      themeUtility?.setAttribute('aria-pressed', String(!day));
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000');
      updateRouteUtilities();
    };
    composer.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(!menu?.classList.contains('is-open'));
    });
    themeUtility?.addEventListener('click', (event) => {
      event.stopPropagation();
      applyRouteTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day');
    });
    languageUtility?.addEventListener('click', (event) => {
      event.stopPropagation();
      applyLanguage(root.lang === 'ar' ? 'en' : 'ar');
      updateRouteUtilities();
    });
    window.addEventListener('ooxme-language-change', updateRouteUtilities);
    applyRouteTheme('dark');
  }
  // The homepage clears this bootstrap state from its page controller. The
  // shared header owns that same lifecycle for standalone routes so the OXO
  // circle and interaction transitions are not left in their init state.
  if (!document.body.classList.contains('s-page--main')) root.classList.remove('s-x-initializing');
})();

// Keep the shared OXO face gaze and settle motion on every non-home route.
(() => {
  if (document.body.classList.contains('s-page--main')) return;
  const addButton = document.querySelector('[data-s-composer] .s-page__add');
  const face = addButton?.querySelector('[data-s-x-face]');
  const shell = face?.querySelector('.s-page__x-face-shell');
  const eyes = face?.querySelector('.s-page__x-face-eyes');
  const eyeMotion = face?.querySelector('.s-page__x-face-eye-motion');
  if (!addButton || !face || !shell || !eyes || !eyeMotion) return;

  const gazeLimit = 1.1;
  const dragThreshold = 6;
  let pointer = null;
  let dragging = false;
  let tapping = false;
  let settling = false;
  let tapTimer = 0;
  let settleTimer = 0;
  let animationFrame = 0;
  let previousTime = 0;
  let targetGaze = { x: 0, y: 0 };
  let currentGaze = { x: 0, y: 0 };

  const clearTimer = (timer) => {
    if (timer) window.clearTimeout(timer);
    return 0;
  };
  const setGaze = (x, y, normalize = true) => {
    const magnitude = Math.hypot(x, y);
    const scale = normalize && magnitude > 0 ? gazeLimit / Math.max(gazeLimit, magnitude) : 1;
    targetGaze = {
      x: Math.max(-gazeLimit, Math.min(gazeLimit, x * scale)),
      y: Math.max(-gazeLimit, Math.min(gazeLimit, y * scale))
    };
  };
  const getState = () => dragging ? 'drag' : tapping ? 'tap' : settling ? 'settle' : 'idle';
  const render = () => { face.dataset.faceState = getState(); };
  const tick = (time) => {
    const delta = Math.min(48, Math.max(1, time - (previousTime || time)));
    previousTime = time;
    const state = getState();
    const gazeEasing = 1 - Math.exp(-delta / (state === 'drag' ? 38 : 72));
    const gazeTarget = state === 'tap' || state === 'drag' ? targetGaze : { x: 0, y: 0 };
    currentGaze.x += (gazeTarget.x - currentGaze.x) * gazeEasing;
    currentGaze.y += (gazeTarget.y - currentGaze.y) * gazeEasing;
    const blinkPhase = (((time / 1000) + .7) % 2) / 2;
    const blink = state === 'idle' ? 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .014, 2))) : 1;
    shell.setAttribute('transform', 'translate(0 0)');
    eyes.setAttribute('transform', `translate(${currentGaze.x.toFixed(3)} ${currentGaze.y.toFixed(3)})`);
    eyeMotion.setAttribute('transform', state === 'idle'
      ? `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)`
      : 'translate(0 0)');
    render();
    animationFrame = window.requestAnimationFrame(tick);
  };
  const centerGaze = () => setGaze(0, 0, false);
  const gazeAtPoint = (clientX, clientY) => {
    const rect = addButton.getBoundingClientRect();
    setGaze(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
  };
  const begin = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (pointer) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    dragging = false;
  };
  const move = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!dragging && Math.hypot(dx, dy) < dragThreshold) return;
    if (!dragging) {
      dragging = true;
      tapping = false;
      settling = false;
      tapTimer = clearTimer(tapTimer);
      settleTimer = clearTimer(settleTimer);
    }
    setGaze(dx, dy);
    render();
  };
  const end = (event, cancelled = false) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const wasDragging = dragging;
    pointer = null;
    dragging = false;
    if (wasDragging) {
      tapping = false;
      settling = true;
      centerGaze();
      render();
      settleTimer = clearTimer(settleTimer);
      settleTimer = window.setTimeout(() => { settling = false; render(); }, 480);
      return;
    }
    if (cancelled) {
      centerGaze();
      render();
      return;
    }
    tapping = true;
    settling = false;
    gazeAtPoint(event.clientX, event.clientY);
    render();
    tapTimer = clearTimer(tapTimer);
    tapTimer = window.setTimeout(() => { tapping = false; centerGaze(); render(); }, 380);
  };
  document.addEventListener('pointerdown', begin, { capture: true, passive: true });
  document.addEventListener('pointermove', move, { capture: true, passive: true });
  ['pointerup', 'pointercancel'].forEach((name) => document.addEventListener(name, (event) => end(event, name === 'pointercancel'), { capture: true, passive: true }));
  render();
  animationFrame = window.requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    tapTimer = clearTimer(tapTimer);
    settleTimer = clearTimer(settleTimer);
  }, { once: true });
})();
