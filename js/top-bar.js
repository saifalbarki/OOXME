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

  const unreadIndicator = submitButton.querySelector('.s-page__notification-indicator') || document.createElement('span');
  unreadIndicator.className = 's-page__notification-indicator';
  unreadIndicator.setAttribute('aria-hidden', 'true');
  if (!unreadIndicator.parentElement) submitButton.append(unreadIndicator);

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
  const notificationReadStateKey = 'ooxme-notification-read-state';
  const notificationId = 'homepage-gallery-announcement-v1';
  const readNotificationState = () => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(notificationReadStateKey) || '{}');
      return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch { return {}; }
  };
  const writeNotificationState = (state) => {
    try { window.localStorage.setItem(notificationReadStateKey, JSON.stringify(state)); } catch { /* Storage may be unavailable. */ }
  };
  const isNotificationRead = (id) => Boolean(readNotificationState()[id]);
  const setNotificationRead = (id, isRead) => {
    const state = readNotificationState();
    if (isRead) state[id] = true;
    else delete state[id];
    writeNotificationState(state);
  };
  const pageFadeTargets = [...document.querySelectorAll(
    'body.s-page--main > .s-page__content > *, body.s-page--main > .s-page__conversation > *, body.s-page--main > .s-page__conversation-final > *, body.s-page--gallery > .s-page__content > *, body.s-page--space > .s-page__content > *, body.s-page--update > .s-page__content > *, body.s-page--consultation > .s-page__content > *, body.s-page--os > .s-page__content > *, body.s-page--store > .s-page__content > *, body.s-page--brand-management > .s-page__content > *'
  )];
  let pageScrollLocked = false;
  let lockedScrollX = 0;
  let lockedScrollY = 0;
  const lockPageScroll = () => {
    if (pageScrollLocked) return;
    lockedScrollX = window.scrollX;
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add('is-homepage-menu-scroll-locked');
    document.body.classList.add('is-homepage-menu-scroll-locked');
    pageScrollLocked = true;
  };
  const unlockPageScroll = () => {
    if (!pageScrollLocked) return;
    document.documentElement.classList.remove('is-homepage-menu-scroll-locked');
    document.body.classList.remove('is-homepage-menu-scroll-locked');
    pageScrollLocked = false;
    if (window.scrollX !== lockedScrollX || window.scrollY !== lockedScrollY) {
      window.scrollTo({ left: lockedScrollX, top: lockedScrollY, behavior: 'auto' });
    }
  };
  const setPageMenuState = (isOpen) => {
    const isHomepageMenuPage = document.body.classList.contains('s-page--main')
      || document.body.classList.contains('s-page--gallery')
      || document.body.classList.contains('s-page--space')
      || document.body.classList.contains('s-page--update')
      || document.body.classList.contains('s-page--consultation')
      || document.body.classList.contains('s-page--os')
      || document.body.classList.contains('s-page--store')
      || document.body.classList.contains('s-page--brand-management');
    if (!isHomepageMenuPage) return;
    document.body.classList.toggle('is-menu-open', isOpen);
    if (isOpen) lockPageScroll();
    else unlockPageScroll();
    // Store owns native scroll-snap section navigation. Its section root must
    // remain interactive while the shared menu is open; the existing direct
    // dimming/pointer-events rules still prevent accidental page interaction.
    if (!document.body.classList.contains('s-page--store')) {
      pageFadeTargets.forEach((target) => {
        if ('inert' in target) target.inert = isOpen;
      });
    }
  };
  let measuredMenuWidth = window.innerWidth;
  let menuEdgeMeasured = false;
  let menuDotMeasured = false;
  const measureMenuEdge = () => {
    if (!menu || menuEdgeMeasured) return;
    const topBarBounds = composer.getBoundingClientRect();
    // Measure the menu's untransformed containing block. Reading the menu's
    // rect during its opening transition would include an intermediate slide
    // and feed that temporary position back into the edge correction.
    const menuParentBounds = menu.offsetParent?.getBoundingClientRect() || topBarBounds;
    const edgeDelta = root.dir === 'rtl'
      ? topBarBounds.right - menuParentBounds.right
      : topBarBounds.left - menuParentBounds.left;
    composer.style.setProperty('--s-composer-menu-edge-shift', `${edgeDelta}px`);
    menuEdgeMeasured = true;
  };
  const measureMenuDotAlignment = () => {
    if (!menu || menuDotMeasured) return;
    const topBarX = submitButton.getBoundingClientRect();
    const menuBounds = menu.getBoundingClientRect();
    const eyeCircle = composer.querySelector('.s-page__x-top-bar-eyes circle');
    const eyeBounds = eyeCircle?.getBoundingClientRect();
    const dotDiameter = eyeBounds?.width || 7.4;
    const xCenter = topBarX.left + (topBarX.width / 2);
    const menuEdge = root.dir === 'rtl' ? menuBounds.right : menuBounds.left;
    const dotRadius = dotDiameter / 2;
    const dotLeadingGap = Math.max(0, (root.dir === 'rtl' ? menuEdge - xCenter : xCenter - menuEdge) - dotRadius);
    const menuContentInset = 9;
    composer.style.setProperty('--s-composer-menu-dot-diameter', `${dotDiameter}px`);
    composer.style.setProperty('--s-composer-menu-dot-gap', `${dotLeadingGap}px`);
    composer.style.setProperty('--s-composer-menu-dot-item-padding', `${Math.max(0, dotLeadingGap + dotRadius - menuContentInset)}px`);
    menuDotMeasured = true;
  };
  const createMenuIcon = (kind = 'dot') => {
    const icon = document.createElement('span');
    icon.classList.add('s-page__composer-menu-icon');
    icon.setAttribute('aria-hidden', 'true');
    if (kind === 'arrow') {
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrow.setAttribute('class', 's-page__composer-menu-icon-arrow');
      arrow.setAttribute('viewBox', '0 0 11 16');
      arrow.setAttribute('fill', 'none');
      arrow.setAttribute('focusable', 'false');
      arrow.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M2.5 3.5 7.5 8 2.5 12.5');
      arrow.append(path);
      icon.append(arrow);
      return icon;
    }
    const dot = document.createElement('span');
    dot.className = 's-page__composer-menu-icon-dot';
    dot.setAttribute('aria-hidden', 'true');
    icon.append(dot);
    return icon;
  };
  let notificationRead = isNotificationRead(notificationId);
  const syncNotificationIndicator = ({ pulse: shouldPulse = false } = {}) => {
    unreadIndicator.classList.toggle('is-hidden', notificationRead);
    if (!notificationRead && shouldPulse) {
      unreadIndicator.classList.remove('is-pulsing');
      requestAnimationFrame(() => unreadIndicator.classList.add('is-pulsing'));
    }
  };
  syncNotificationIndicator({ pulse: true });
  const menuMotionDuration = 260;
  const createNotification = () => {
    const notification = document.createElement('button');
    notification.type = 'button';
    notification.className = 's-page__composer-menu-notification';
    notification.dataset.sMenuKey = 'notification';
    notification.dataset.sNotificationId = notificationId;
    notification.dataset.sNotificationIndex = '0';
    if (notificationRead) notification.classList.add('is-read');
    const divider = document.createElement('span');
    divider.className = 's-page__composer-menu-notification-divider';
    divider.dataset.sNotificationIndex = '0';
    divider.setAttribute('aria-hidden', 'true');
    const titleRow = document.createElement('span');
    titleRow.className = 's-page__composer-menu-notification-title-row';
    titleRow.append(createMenuIcon());
    const title = document.createElement('span');
    title.className = 's-page__composer-menu-notification-title';
    const description = document.createElement('span');
    description.className = 's-page__composer-menu-notification-description';
    titleRow.append(title);
    const content = document.createElement('span');
    content.className = 's-page__composer-menu-notification-content';
    content.append(titleRow, description);
    notification.append(content);
    const language = root.lang === 'en' ? 'en' : 'ar';
    title.textContent = language === 'en' ? 'Seen Our Gallery?' : 'هل رأيتم معرض اعمالنا؟';
    description.textContent = language === 'en'
      ? 'Our gallery is now live, featuring selected brands and identities we’ve created.'
      : 'افتتحنا اليوم معرض اعمالنا، لتشاهدوا مجموعة من العلامات والهويات التي عملنا عليها.';
    return { divider, notification };
  };
  const itemForKey = (key, href, disabled = false, buttonOnly = false) => {
    const isAction = key === 'language' || key === 'appearance';
    const item = document.createElement(disabled || isAction || buttonOnly ? 'button' : 'a');
    item.className = 's-page__composer-menu-item';
    item.dataset.sMenuKey = key;
    if (disabled || isAction || buttonOnly) {
      item.type = 'button';
      if (disabled) {
        item.disabled = true;
        item.setAttribute('aria-disabled', 'true');
      }
    } else item.href = href;
    if (!isAction) item.append(createMenuIcon('arrow'));
    const label = document.createElement('span');
    label.className = 's-page__composer-menu-label';
    item.append(label);
    return item;
  };
  const normalizeMenu = () => {
    if (!menu) return;
    menu.setAttribute('role', 'navigation');
    menu.setAttribute('aria-label', root.lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation');
    const items = [
      itemForKey('home', '/'),
      itemForKey('brand', '/bm'),
      itemForKey('gallery', '/gallery'),
      itemForKey('store', '', false, true),
      itemForKey('consultation', '/consultation'),
      itemForKey('contact', document.body.classList.contains('s-page--main') ? '#contact' : '/?section=contact'),
      itemForKey('language'),
      itemForKey('appearance')
    ];
    const language = root.lang === 'en' ? 'en' : 'ar';
    const menuLabels = {
      en: { home: 'Home', brand: 'Brand Management', gallery: 'Gallery', store: 'Store', consultation: 'Consultation', contact: 'Contact', language: 'Language', appearance: 'Appearance' },
      ar: { home: 'الرئيسية', brand: 'إدارة العلامة التجارية', gallery: 'المعرض', store: 'المتجر', consultation: 'الاستشارة', contact: 'تواصل', language: 'اللغة', appearance: 'المظهر' }
    };
    items.forEach((item) => {
      const key = item.dataset.sMenuKey;
      item.querySelector('.s-page__composer-menu-label').textContent = menuLabels[language][key];
    });
    const optionList = document.createElement('div');
    optionList.className = 's-page__composer-menu-options';
    optionList.append(...items);
    const spaceOption = document.createElement('div');
    spaceOption.className = 's-page__composer-menu-space-option';
    spaceOption.setAttribute('aria-hidden', 'true');
    const notificationArea = document.createElement('div');
    notificationArea.className = 's-page__composer-menu-notification-area';
    const notificationParts = createNotification();
    notificationArea.append(notificationParts.divider, notificationParts.notification);
    menu.replaceChildren(optionList, spaceOption, notificationArea);
  };
  const markNotificationUnread = () => {
    notificationRead = false;
    setNotificationRead(notificationId, false);
    syncNotificationIndicator({ pulse: true });
    normalizeMenu();
  };

  let menuExpanded = false;
  const updateMenuTriggerLabel = () => {
    const labels = root.lang === 'ar'
      ? { open: 'فتح قائمة التنقل', close: 'إغلاق قائمة التنقل' }
      : { open: 'Open navigation menu', close: 'Close navigation menu' };
    submitButton.setAttribute('aria-label', menuExpanded ? labels.close : labels.open);
  };
  const updateMenuLayoutMode = () => {
    if (!menu) return;
    const options = menu.querySelector('.s-page__composer-menu-options');
    if (!options) return;
    menu.classList.remove('is-two-column');
    menu.style.removeProperty('width');
    const menuTop = menu.getBoundingClientRect().top;
    const singleColumnHeight = menu.getBoundingClientRect().height;
    const availableHeight = Math.max(0, window.innerHeight - menuTop - 8);
    if (singleColumnHeight <= availableHeight) return;

    menu.classList.add('is-two-column');

    // The labels are intentionally nowrap. If the available Top Bar width
    // cannot contain both columns, keep a valid single-column menu instead
    // of squeezing or overflowing the two-column layout.
    const labelsFit = [...options.querySelectorAll('.s-page__composer-menu-label')]
      .every((label) => label.scrollWidth <= label.clientWidth + 1);
    if (!labelsFit) {
      menu.classList.remove('is-two-column');
      menu.style.removeProperty('width');
    }
  };
  const setMenuOpen = (open) => {
    menuExpanded = open;
    if (open) {
      normalizeMenu();
      setPageMenuState(true);
      menu?.classList.add('is-open');
      menu?.setAttribute('aria-hidden', 'false');
      if (menu) menu.inert = false;
      requestAnimationFrame(() => {
        measureMenuEdge();
        requestAnimationFrame(measureMenuDotAlignment);
        requestAnimationFrame(updateMenuLayoutMode);
      });
      submitButton.classList.add('is-active');
      submitButton.setAttribute('aria-expanded', 'true');
      updateMenuTriggerLabel();
      return;
    }
    setPageMenuState(false);
    submitButton.classList.remove('is-active');
    submitButton.setAttribute('aria-expanded', 'false');
    updateMenuTriggerLabel();
    menu?.classList.remove('is-open');
    menu?.setAttribute('aria-hidden', 'true');
    if (menu) menu.inert = true;
  };
  window.OOXMEHeader = { setMenuOpen, normalizeMenu, markNotificationUnread };

  if (menu) {
    menu.id ||= 'ooxme-primary-menu';
    submitButton.setAttribute('aria-controls', menu.id);
    submitButton.setAttribute('aria-expanded', 'false');
    menu.inert = true;
    if (utilities) utilities.inert = true;
    normalizeMenu();
    menu.addEventListener('pointerdown', (event) => {
      const notification = event.target.closest('.s-page__composer-menu-notification');
      if (notification) {
        notification.classList.add('is-active');
        window.setTimeout(() => notification.classList.remove('is-active'), 120);
        return;
      }
      const item = event.target.closest('.s-page__composer-menu-item');
      if (!item || item.disabled) return;
      if (item.dataset.sMenuKey === 'store') return;
      item.classList.add('is-active');
      window.setTimeout(() => item.classList.remove('is-active'), 120);
    }, { passive: true });
    menu.addEventListener('click', (event) => {
      const notification = event.target.closest('.s-page__composer-menu-notification');
      if (notification) {
        event.preventDefault();
        event.stopPropagation();
        notificationRead = true;
        setNotificationRead(notificationId, true);
        syncNotificationIndicator();
        notification.classList.add('is-read');
        setMenuOpen(false);
        const gallery = document.querySelector('[data-s-gallery-preview]');
        if (gallery) {
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          let focused = false;
          const restartPreview = () => {
            if (focused) return;
            focused = true;
            window.OOXMEGalleryPreview?.restart?.();
          };
          const focusGallery = () => {
            gallery.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
            if (reducedMotion) restartPreview();
            else {
              gallery.addEventListener('scrollend', restartPreview, { once: true });
              window.setTimeout(restartPreview, 600);
            }
          };
          window.setTimeout(focusGallery, menuMotionDuration);
        } else {
          // The notification always targets the Homepage Gallery Preview.
          // On internal routes, complete the shared menu close before routing
          // so the destination uses the Homepage's own section geometry.
          window.setTimeout(() => window.location.assign('/?section=gallery'), menuMotionDuration);
        }
        return;
      }
      const item = event.target.closest('.s-page__composer-menu-item');
      const action = item?.dataset.sMenuKey;
      if (!item || item.disabled) return;
      if (['language', 'appearance'].includes(action)) {
        event.preventDefault();
        event.stopPropagation();
        if (action === 'language') languageUtility?.click();
        else themeUtility?.click();
        return;
      }
      if (action === 'store') {
        event.preventDefault();
        event.stopPropagation();
        const arrow = item.querySelector('.s-page__composer-menu-icon-arrow');
        if (arrow) {
          arrow.getAnimations().forEach((animation) => animation.cancel());
          arrow.animate([
            { translate: '0 0' },
            { translate: '4px 0' },
            { translate: '-4px 0' },
            { translate: '2px 0' },
            { translate: '0 0' }
          ], { duration: 220, easing: 'ease-in-out', fill: 'none' });
        }
        return;
      }
      if (!(item instanceof HTMLAnchorElement) || !item.href) {
        setMenuOpen(false);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(false);
      const destination = item.href;
      window.setTimeout(() => window.location.assign(destination), menuMotionDuration);
    });
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
  const preventHomepageMenuScroll = (event) => {
    if (pageScrollLocked) event.preventDefault();
  };
  document.addEventListener('wheel', preventHomepageMenuScroll, { passive: false });
  document.addEventListener('touchmove', preventHomepageMenuScroll, { passive: false });
  let measuredMenuHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    const widthChanged = window.innerWidth !== measuredMenuWidth;
    const heightChanged = window.innerHeight !== measuredMenuHeight;
    if (!widthChanged && !heightChanged) return;
    measuredMenuWidth = window.innerWidth;
    measuredMenuHeight = window.innerHeight;
    menuEdgeMeasured = false;
    menuDotMeasured = false;
    requestAnimationFrame(updateMenuLayoutMode);
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    menuEdgeMeasured = false;
    menuDotMeasured = false;
    requestAnimationFrame(updateMenuLayoutMode);
  }, { passive: true });

  const persistCurrentLanguage = () => {
    const current = root.lang === 'en' ? 'en' : 'ar';
    try { window.localStorage.setItem(languageStorageKey, current); } catch { /* Storage may be unavailable. */ }
    root.dir = current === 'ar' ? 'rtl' : 'ltr';
    menuEdgeMeasured = false;
    menuDotMeasured = false;
    updateAddLabel();
    updateMenuTriggerLabel();
    normalizeMenu();
    window.setTimeout(updateMenuTriggerLabel, 0);
    if (menu?.classList.contains('is-open')) {
      requestAnimationFrame(() => {
        measureMenuEdge();
        requestAnimationFrame(() => {
          measureMenuDotAlignment();
          updateMenuLayoutMode();
        });
      });
    }
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
