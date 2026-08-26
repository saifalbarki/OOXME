(() => {
  const root = document.documentElement;
  const applyLanguage = (language) => {
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-studio-home]').forEach((element) => element.setAttribute('aria-label', language === 'ar' ? 'الرئيسية' : 'Home'));
    document.querySelectorAll('[data-studio-context="work"]').forEach((element) => element.setAttribute('aria-label', language === 'ar' ? 'السابق' : 'Previous'));
    document.querySelectorAll('[data-studio-context="details"]').forEach((element) => element.setAttribute('aria-label', language === 'ar' ? 'التالي' : 'Next'));
    document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[language]; });
    document.querySelectorAll('[data-en-placeholder][data-ar-placeholder]').forEach((input) => {
      input.placeholder = input.dataset[language + 'Placeholder'];
    });
  };
  let language = 'en';
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  window.addEventListener('storage', (event) => {
    if (event.key === 'ooxme-language') applyLanguage(event.newValue === 'ar' ? 'ar' : 'en');
  });

  const selector = document.querySelector('[data-studio-selector]');
  if (!selector) return;
  const workGallery = document.querySelector('[data-studio-work-gallery]');
  let resetStudioGallery = () => {};
  let setStudioPanelState = () => {};
  let setActiveStudioPanel = () => {};

  const navigation = document.querySelector('[data-authenticated-navigation]');
  const navigationTrigger = navigation?.querySelector('[data-auth-nav-trigger]');
  const navigationMenu = navigation?.querySelector('[data-auth-nav-menu]');
  const notifications = document.querySelector('[data-notifications]');
  const search = document.querySelector('[data-home-search]');
  const account = document.querySelector('[data-home-account]');
  const services = document.querySelector('[data-home-services]');
  const searchInput = document.querySelector('[data-home-search-input]');
  const searchSuggestions = document.querySelector('[data-home-search-suggestions]');
  const overlayByItem = { account, search, menu: notifications, services };
  const overlayClassByItem = { account: 'homepage-account-open', search: 'homepage-search-open', menu: 'homepage-notifications-open', services: 'homepage-services-open' };
  const normalizeNotificationLayout = (container) => container?.querySelectorAll('[data-notification]').forEach((item) => {
    const date = item.querySelector('.homepage-notification-summary time');
    const details = item.querySelector('.homepage-notification-details');
    if (date && details) details.append(date);
  });
  normalizeNotificationLayout(notifications);
  notifications?.querySelectorAll('[data-notifications-option]').forEach((button) => button.addEventListener('click', () => {
    const selector = notifications.querySelector('[data-notifications-selector]');
    const panel = notifications.querySelector('[data-notifications-panel]');
    selector.dataset.active = button.dataset.notificationsOption;
    panel.dataset.active = button.dataset.notificationsOption;
    selector.querySelectorAll('[data-notifications-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
  }));
  let overlayCloseTimer;
  let notificationSelectionTimer;
  const overlayMotionTimers = new WeakMap();

  const prepareOverlayMotion = (overlay) => {
    window.clearTimeout(overlayMotionTimers.get(overlay));
    overlay.classList.add('is-animating');
    overlayMotionTimers.set(overlay, window.setTimeout(() => overlay.classList.remove('is-animating'), 420));
  };

  const setNavigationOpen = (open) => {
    if (!navigation || !navigationTrigger || navigation.classList.contains('is-menu-open') === open) return;
    navigationTrigger.click();
  };
  const setOverlayOpen = (item, open) => {
    const overlay = overlayByItem[item];
    const className = overlayClassByItem[item];
    if (!overlay || !className) return;
    window.clearTimeout(overlayCloseTimer);
    if (open) {
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      prepareOverlayMotion(overlay);
      window.requestAnimationFrame(() => {
        document.body.classList.add(className);
        overlay.classList.add('is-open');
        if (item === 'search') renderSearchSuggestions();
      });
      return;
    }
    prepareOverlayMotion(overlay);
    overlay.classList.remove('is-open');
    document.body.classList.remove(className);
    overlay.setAttribute('aria-hidden', 'true');
    overlayCloseTimer = window.setTimeout(() => { overlay.hidden = true; }, 360);
    window.setTimeout(() => setNavigationOpen(true), 0);
  };
  const searchEntries = [
    { en: 'Reengineered', ar: 'إعادة هندسة' },
    { en: 'Ooxme v4.0', ar: 'التحديث الرابع لأوكسوم' },
    { en: 'Redesign Website', ar: 'إعادة تصميم الموقع' },
    { en: 'The Client Profile', ar: 'ملف العميل' },
    { en: 'The Gallery', ar: 'المعرض' },
    { en: 'Notifications', ar: 'الإشعارات' }
  ];
  const renderSearchSuggestions = () => {
    if (!searchInput || !searchSuggestions) return;
    const query = searchInput.value.trim().toLocaleLowerCase();
    const matches = searchEntries
      .map((entry, index) => {
        const label = entry[root.lang === 'ar' ? 'ar' : 'en'];
        const position = label.toLocaleLowerCase().indexOf(query);
        const overlap = [...query].filter((character) => label.toLocaleLowerCase().includes(character)).length;
        return { entry, index, score: position < 0 ? 100 - overlap : position };
      })
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .slice(0, 3);
    searchSuggestions.hidden = false;
    searchSuggestions.replaceChildren(...matches.map(({ entry }) => {
      const suggestion = document.createElement('button');
      suggestion.type = 'button';
      suggestion.className = 'homepage-search-suggestion';
      suggestion.textContent = entry[root.lang === 'ar' ? 'ar' : 'en'];
      return suggestion;
    }));
  };
  const loadNotifications = async () => {
    const list = notifications?.querySelector('.homepage-notifications-list');
    if (!list) return;
    try {
      const response = await fetch('/api/accounts/index?route=notifications', { credentials: 'same-origin' });
      const records = await response.json();
      if (!response.ok || !Array.isArray(records)) return;
      list.replaceChildren(...records.map((record) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'homepage-notification';
        item.dataset.notification = '';
        item.setAttribute('aria-expanded', 'false');
        item.innerHTML = '<span class="homepage-notification-summary"><span><strong></strong></span><span class="homepage-notification-unread" aria-hidden="true"></span></span><span class="homepage-notification-details"><span class="homepage-notification-copy"></span><time></time></span>';
        item.querySelector('strong').textContent = record.title;
        item.querySelector('time').dateTime = record.publish_date;
        item.querySelector('time').textContent = new Intl.DateTimeFormat(root.lang === 'ar' ? 'ar-IQ' : 'en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(record.publish_date));
        item.querySelector('.homepage-notification-copy').textContent = record.body;
        return item;
      }));
    } catch (_) {}
  };
  navigationMenu?.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
    const item = button.dataset.authNavItem;
    if (item === 'gallery') {
      setActiveStudioPanel(0);
      setStudioPanelState(0, false, 0);
    }
    if (item in overlayByItem) setOverlayOpen(item, true);
  }));
  notifications?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-notification]');
    if (!item) {
      if (!event.target.closest('.homepage-notifications-panel')) setOverlayOpen('menu', false);
      return;
    }
    const expanded = !item.classList.contains('is-expanded');
    notifications.querySelectorAll('[data-notification].is-expanded').forEach((openItem) => {
      openItem.classList.remove('is-expanded');
      openItem.setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('is-expanded', expanded);
    item.classList.add('is-read', 'is-selected');
    item.setAttribute('aria-expanded', String(expanded));
    window.clearTimeout(notificationSelectionTimer);
    notificationSelectionTimer = window.setTimeout(() => item.classList.remove('is-selected'), 340);
  });
  search?.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.homepage-search-panel')) setOverlayOpen('search', false);
  });
  account?.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.homepage-account-panel')) setOverlayOpen('account', false);
  });
  services?.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.homepage-services-panel')) setOverlayOpen('services', false);
  });
  services?.querySelectorAll('[data-home-services-option]').forEach((button) => button.addEventListener('click', () => {
    const selector = services.querySelector('[data-home-services-selector]');
    const panel = services.querySelector('[data-home-services-panel]');
    selector.dataset.active = button.dataset.homeServicesOption;
    panel.dataset.active = button.dataset.homeServicesOption;
    selector.querySelectorAll('[data-home-services-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
  }));
  services?.querySelectorAll('[data-brand-management-link]').forEach((button) => button.addEventListener('click', () => { window.location.assign('/brand'); }));
  services?.querySelectorAll('[data-consultation-link]').forEach((button) => button.addEventListener('click', () => { window.location.assign('/consultation'); }));
  account?.querySelectorAll('[data-home-account-type]').forEach((button) => button.addEventListener('click', () => {
    const accountSelector = account.querySelector('[data-home-account-selector]');
    accountSelector.dataset.active = button.dataset.homeAccountType;
    accountSelector.querySelectorAll('[data-home-account-type]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
  }));
  account?.querySelector('.homepage-account-login')?.addEventListener('click', async (buttonEvent) => {
    const loginButton = buttonEvent.currentTarget;
    const [usernameInput, passwordInput] = account.querySelectorAll('[data-home-account-input]');
    const expectedAccountType = account.querySelector('[data-home-account-selector]')?.dataset.active;
    loginButton.disabled = true;
    loginButton.setAttribute('aria-busy', 'true');
    usernameInput.removeAttribute('aria-invalid');
    passwordInput.removeAttribute('aria-invalid');
    try {
      const response = await fetch('/api/accounts/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
      });
      const accountResult = await response.json().catch(() => ({}));
      if (!response.ok || accountResult.accountType !== expectedAccountType) throw new Error('invalid_credentials');
      await loadNotifications();
      if (accountResult.accountType === 'employee') location.assign('/?panel=employee-dashboard');
    } catch (_) {
      usernameInput.setAttribute('aria-invalid', 'true');
      passwordInput.setAttribute('aria-invalid', 'true');
      passwordInput.focus();
    } finally {
      loginButton.disabled = false;
      loginButton.removeAttribute('aria-busy');
    }
  });
  searchInput?.addEventListener('input', renderSearchSuggestions);
  searchSuggestions?.addEventListener('click', (event) => event.stopPropagation());
  loadNotifications();

  if (!workGallery) return;

  const isGalleryPage = document.body.classList.contains('selected-works-page');
  // Preserve the last correct project set for each authoritative page.
  const images = (isGalleryPage ? ['01', '02', '03', '04'].map((name) => `assets/projects/fatimah/${name}.png`) : ['01', '02', '03', '04'].map((name) => `assets/projects/hijab/${name}.jpg`));
  const panelTwoImages = (isGalleryPage ? ['01', '02', '03', '04'].map((name) => `assets/projects/arjwan/optimized/${name}.webp`) : [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13',
    'photo_9_2026-08-02_22-22-30', 'photo_10_2026-08-02_22-22-30', 'photo_11_2026-08-02_22-22-30',
    'photo_12_2026-08-02_22-22-30', 'photo_13_2026-08-02_22-22-30', 'photo_14_2026-08-02_22-22-30',
    'photo_15_2026-08-02_22-22-30', 'photo_16_2026-08-02_22-22-30', 'photo_17_2026-08-02_22-22-30',
    'photo_18_2026-08-02_22-22-30', 'photo_19_2026-08-02_22-22-30', 'photo_20_2026-08-02_22-22-30',
    'photo_21_2026-08-02_22-22-30', 'photo_22_2026-08-02_22-22-30', 'photo_23_2026-08-02_22-22-30',
    'photo_24_2026-08-02_22-22-30', 'photo_30_2026-08-02_22-22-30', 'photo_31_2026-08-02_22-22-30',
    'photo_32_2026-08-02_22-22-30'
  ].map((name) => `assets/projects/mall albasri/design/optimized/${name}.webp`));
  const gallery = workGallery.querySelector('[data-studio-project-gallery]');
  const viewport = gallery.querySelector('.project-gallery-viewport');
  const rail = gallery.querySelector('.project-gallery-track');
  const card = document.querySelector('.studio-card');
  const studioExperience = document.querySelector('.studio-page .master-panel-experience');
  const studioPanel = document.querySelector('.studio-panel');
  let duplicateStudioPanel;
  let studioTrack;
  let studioPanels = [studioPanel];
  let studioPanelIndex = 0;
  const studioPanelViews = ['work', 'work'];
  const updateContextualNavigation = () => {
    document.querySelectorAll('[data-studio-contextual-pill]').forEach((pill) => {
      const panelIndex = studioPanels.indexOf(pill.closest('.studio-panel'));
      const stateIndex = studioPanelViews[panelIndex] === 'client' ? 1 : 0;
      pill.setAttribute('data-active', stateIndex === 0 ? 'work' : 'details');
    });
    document.querySelectorAll('[data-studio-context="work"]').forEach((button) => {
      const panelIndex = studioPanels.indexOf(button.closest('.studio-panel'));
      const atFirstState = studioPanelViews[panelIndex] !== 'client';
      button.toggleAttribute('disabled', atFirstState);
      button.setAttribute('aria-disabled', String(atFirstState));
      button.setAttribute('aria-pressed', String(atFirstState));
    });
    document.querySelectorAll('[data-studio-context="details"]').forEach((button) => {
      const panelIndex = studioPanels.indexOf(button.closest('.studio-panel'));
      const atLastState = studioPanelViews[panelIndex] === 'client';
      button.toggleAttribute('disabled', atLastState);
      button.setAttribute('aria-disabled', String(atLastState));
      button.setAttribute('aria-pressed', String(atLastState));
    });
  };
  const state = { index: 0, manualDirection: 1, dragging: false };
  let galleryRotationTimer;
  const landscapeQuery = window.matchMedia('(min-aspect-ratio: 4 / 3)');
  const circularDistance = (index, center, count) => {
    let distance = index - center;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    return distance;
  };
  const deckIndexAt = (index, direction, depth, count) => (index + direction * depth + count * 8) % count;
  const interpolateDepth = (values, depth) => {
    const lower = Math.max(0, Math.min(values.length - 1, Math.floor(depth)));
    const upper = Math.min(values.length - 1, lower + 1);
    return values[lower] + (values[upper] - values[lower]) * (depth - lower);
  };
  const slides = images.map((src) => {
    const image = new Image();
    image.className = 'project-gallery-slide';
    image.dataset.src = src;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = '';
    image.draggable = false;
    rail.append(image);
    return image;
  });
  const syncGalleryAspectClass = (image = slides[state.index]) => {
    if (!image?.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    gallery.classList.toggle('is-portrait', ratio < 1);
    gallery.classList.toggle('is-square', Math.abs(ratio - 1) < 0.01);
  };
  const ensureSlideSource = (index, priority = 'low') => {
    const normalizedIndex = ((Math.round(index) % images.length) + images.length) % images.length;
    const slide = slides[normalizedIndex];
    if (!slide || slide.hasAttribute('src')) return;
    slide.fetchPriority = priority;
    slide.addEventListener('load', () => { syncGalleryAspectClass(); containGallery(); render(); }, { once: true });
    slide.src = slide.dataset.src;
  };
  const primeSlides = (center, direction, count) => {
    for (let depth = 0; depth <= count; depth += 1) ensureSlideSource(deckIndexAt(center, direction, depth, images.length), depth === 0 ? 'high' : 'low');
  };
  const renderPortrait = (dragX = 0) => {
    const viewportHeight = viewport.clientHeight;
    const activeHeight = slides[state.index]?.offsetHeight || viewportHeight;
    if (!viewportHeight || !activeHeight) return;
    const fullLayerExposure = Math.min(16, Math.max(9, activeHeight * .04));
    // Keep the approved stack count, while narrowing only the portrait reveal.
    const layerExposure = fullLayerExposure * .58;
    const availableRise = Math.max(0, viewportHeight - activeHeight);
    const maxDepth = Math.min(4, images.length - 1, Math.floor(availableRise / fullLayerExposure));
    const range = Math.max(72, viewport.clientWidth * .24);
    const dragProgress = Math.min(1, Math.abs(dragX) / range);
    const direction = dragX ? (dragX < 0 ? 1 : -1) : state.manualDirection;
    const rotation = Math.max(-4, Math.min(4, (dragX / range) * 4));
    const visible = new Map([[state.index, 0]]);
    for (let depth = 1; depth <= maxDepth; depth += 1) visible.set(deckIndexAt(state.index, direction, depth, images.length), depth - dragProgress);
    primeSlides(state.index, direction, maxDepth + 1);
    slides.forEach((slide, index) => {
      const depth = visible.get(index);
      if (depth === undefined) {
        Object.assign(slide.style, { opacity: '0', visibility: 'hidden', pointerEvents: 'none', zIndex: '0', filter: 'none', boxShadow: 'none', willChange: 'auto' });
        return;
      }
      const scale = Math.max(.76, 1 - depth * .06);
      const translateY = -((1 - scale) * activeHeight + depth * layerExposure);
      const isActive = index === state.index;
      const blur = interpolateDepth([0, .35, .8, 1.4, 2], depth);
      const shadowOffset = interpolateDepth([6, 5, 4, 3, 2], depth);
      const shadowBlur = interpolateDepth([18, 14, 10, 8, 6], depth);
      const shadowOpacity = interpolateDepth([.14, .11, .08, .05, .025], depth);
      Object.assign(slide.style, {
        visibility: 'visible', opacity: `${interpolateDepth([1, .95, .83, .66, .42], depth)}`,
        zIndex: `${100 - Math.round(depth * 10)}`, pointerEvents: isActive ? 'auto' : 'none',
        transform: `translate3d(calc(-50% + ${isActive ? dragX : 0}px), ${translateY}px, 0) rotate(${isActive ? rotation : 0}deg) scale(${scale})`,
        filter: blur ? `blur(${blur}px)` : 'none', boxShadow: `0 ${shadowOffset}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`,
        willChange: 'transform, opacity, filter', transition: state.dragging ? 'none' : 'transform .34s cubic-bezier(.22, .75, .3, 1), opacity .34s ease, filter .34s ease, box-shadow .34s ease'
      });
    });
  };
  const renderLandscape = (center = state.index) => {
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    if (!viewportWidth || !viewportHeight) return;
    const activeWidth = viewportHeight * 9 / 16;
    const sideScale = .3;
    const sideWidth = activeWidth * sideScale;
    const smallGap = Math.min(16, Math.max(8, viewportWidth * .012));
    const focusGap = Math.min(80, Math.max(36, viewportWidth * .05));
    const firstSideOffset = activeWidth / 2 + focusGap + sideWidth / 2;
    const remainingWidth = Math.max(0, viewportWidth / 2 - firstSideOffset);
    const visibleLevels = Math.min(images.length - 1, 1 + Math.floor(remainingWidth / (sideWidth + smallGap)));
    primeSlides(center, 1, visibleLevels + 1);
    slides.forEach((slide, index) => {
      const distance = circularDistance(index, center, images.length);
      const depth = Math.abs(distance);
      const sign = Math.sign(distance) || 1;
      if (depth > visibleLevels + .05) {
        const offscreenOffset = firstSideOffset + (visibleLevels + 1) * (sideWidth + smallGap);
        Object.assign(slide.style, { opacity: '0', visibility: 'hidden', pointerEvents: 'none', zIndex: '0', filter: 'none', boxShadow: 'none', willChange: 'auto', transform: `translate3d(calc(-50% + ${sign * offscreenOffset}px), 0, 0) scale(${sideScale})`, transition: 'none' });
        return;
      }
      const horizontalOffset = depth <= 1 ? depth * firstSideOffset : firstSideOffset + (depth - 1) * (sideWidth + smallGap);
      const scale = .3 + .7 * Math.max(0, 1 - depth);
      Object.assign(slide.style, {
        visibility: 'visible', opacity: `${Math.max(.56, 1 - depth * .14)}`, zIndex: `${100 - Math.round(depth * 10)}`,
        pointerEvents: depth < .5 ? 'auto' : 'none', filter: 'none', boxShadow: 'none',
        transform: `translate3d(calc(-50% + ${sign * horizontalOffset}px), 0, 0) scale(${scale})`,
        willChange: 'transform, opacity', transition: state.dragging ? 'none' : 'transform .38s cubic-bezier(.22, .61, .36, 1), opacity .3s ease'
      });
    });
  };
  const syncDuplicateStudioPanel = () => {
    if (!duplicateStudioPanel) return;
    const duplicateSlides = duplicateStudioPanel.querySelectorAll('.project-gallery-slide');
    const duplicateGallery = duplicateStudioPanel.querySelector('[data-studio-project-gallery]');
    duplicateGallery?.classList.toggle('is-portrait', gallery.classList.contains('is-portrait'));
    duplicateGallery?.classList.toggle('is-square', gallery.classList.contains('is-square'));
    slides.forEach((slide, index) => {
      const duplicateSlide = duplicateSlides[index];
      if (!duplicateSlide) return;
      duplicateSlide.className = slide.className;
      duplicateSlide.style.cssText = slide.style.cssText;
      duplicateSlide.src = panelTwoImages[index % panelTwoImages.length];
    });
  };
  const render = (center) => {
    syncGalleryAspectClass();
    landscapeQuery.matches ? renderLandscape(center) : renderPortrait(center);
    syncDuplicateStudioPanel();
  };
  const containGallery = () => {
    viewport.style.removeProperty('height');
    gallery.style.removeProperty('--story-active-height');
    if (!landscapeQuery.matches) {
      // Fit the square Panel 1 card group between the Studio card's exact X insets.
      gallery.style.setProperty('--story-active-height', `${gallery.clientWidth}px`);
      return;
    }
    const cardStyle = getComputedStyle(card);
    const availableHeight = card.clientHeight
      - Number.parseFloat(cardStyle.paddingTop)
      - Number.parseFloat(cardStyle.paddingBottom)
      - selector.offsetHeight
      - Number.parseFloat(cardStyle.rowGap);
    const sourceHeight = viewport.offsetHeight;
    if (sourceHeight <= availableHeight) return;
    const height = Math.max(0, availableHeight);
    gallery.style.setProperty('--story-active-height', `${height}px`);
    viewport.style.height = `${height}px`;
  };
  const move = (direction) => {
    state.manualDirection = direction;
    state.index = (state.index + direction + images.length) % images.length;
    render();
  };
  const stopGalleryRotation = () => {
    window.clearInterval(galleryRotationTimer);
    galleryRotationTimer = undefined;
  };
  const activeWorkGallery = () => studioPanels[studioPanelIndex]?.querySelector('[data-studio-work-gallery]') || workGallery;
  const startGalleryRotation = () => {
    stopGalleryRotation();
    if (activeWorkGallery().hidden || document.hidden) return;
    galleryRotationTimer = window.setInterval(() => {
      if (!activeWorkGallery().hidden && !document.hidden) move(1);
    }, 4000);
  };
  resetStudioGallery = () => {
    stopGalleryRotation();
    state.index = 0;
    state.manualDirection = 1;
    state.dragging = false;
    containGallery();
    render();
  };
  let gesture;
  gallery.addEventListener('pointerdown', (event) => {
    gesture = { x: event.clientX, lastX: event.clientX, lastTime: performance.now(), pointerId: event.pointerId };
    state.dragging = true;
    gallery.setPointerCapture?.(event.pointerId);
  });
  gallery.addEventListener('pointermove', (event) => {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    if (landscapeQuery.matches) {
      const range = Math.max(96, viewport.clientWidth * .34);
      renderLandscape(state.index + Math.max(-1, Math.min(1, -dx / range)));
    } else renderPortrait(dx);
    gesture.lastX = event.clientX;
    gesture.lastTime = performance.now();
    event.preventDefault();
  }, { passive: false });
  const finishGesture = (event) => {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const elapsed = Math.max(1, performance.now() - gesture.lastTime);
    const velocity = (event.clientX - gesture.lastX) / elapsed;
    const threshold = landscapeQuery.matches ? Math.max(96, viewport.clientWidth * .34) : Math.max(52, Math.min(96, viewport.clientWidth * .2));
    const direction = Math.abs(dx) >= threshold || (Math.abs(velocity) > (landscapeQuery.matches ? .42 : .45) && Math.abs(dx) > 12) ? (dx < 0 ? 1 : -1) : 0;
    state.dragging = false;
    if (direction) move(direction);
    else render();
    gesture = null;
  };
  gallery.addEventListener('pointerup', finishGesture);
  gallery.addEventListener('pointercancel', () => { state.dragging = false; gesture = null; render(); });
  window.addEventListener('resize', () => { containGallery(); render(); });
  landscapeQuery.addEventListener('change', () => { containGallery(); render(); });
  const createSecondStudioPanel = () => {
    if (duplicateStudioPanel || !studioExperience || !studioPanel || !window.OOXMEMasterPanelDrag) return;
    duplicateStudioPanel = studioPanel.cloneNode(true);
    duplicateStudioPanel.classList.remove('is-active');
    studioTrack = document.createElement('div');
    studioTrack.className = 'master-panel-track';
    studioPanel.before(studioTrack);
    studioTrack.append(studioPanel, duplicateStudioPanel);
    studioPanels = [studioPanel, duplicateStudioPanel];
    studioTrack.style.height = 'calc(var(--ooxme-stable-viewport-height) * 2)';
    window.OOXMEMasterPanelDrag.register({ experience: studioExperience, track: studioTrack, panels: studioPanels, getIndex: () => studioPanelIndex, moveTo: (next) => setActiveStudioPanel(next), allowBottomControlNavigation: false });
    const duplicateNavigation = duplicateStudioPanel.querySelector('[data-authenticated-navigation]');
    const duplicateNavigationTrigger = duplicateNavigation?.querySelector('[data-auth-nav-trigger]');
    const duplicateNavigationMenu = duplicateNavigation?.querySelector('[data-auth-nav-menu]');
    // Panel 2 is a visual proxy only: Panel 1 remains the sole shared navigation controller.
    const syncDuplicateNavigation = () => {
      if (!navigation || !duplicateNavigation) return;
      duplicateNavigation.className = navigation.className;
      duplicateNavigationTrigger?.setAttribute('aria-expanded', navigationTrigger?.getAttribute('aria-expanded') || 'false');
      if (duplicateNavigationMenu && navigationMenu) {
        duplicateNavigationMenu.dataset.active = navigationMenu.dataset.active;
        duplicateNavigationMenu.querySelectorAll('[data-auth-nav-item]').forEach((button) => {
          const source = navigationMenu.querySelector(`[data-auth-nav-item="${button.dataset.authNavItem}"]`);
          button.setAttribute('aria-pressed', source?.getAttribute('aria-pressed') || 'false');
        });
      }
    };
    syncDuplicateNavigation();
    if (navigation) new MutationObserver(syncDuplicateNavigation).observe(navigation, { attributes: true, subtree: true, attributeFilter: ['class', 'aria-expanded', 'aria-pressed', 'data-active'] });
    duplicateNavigationTrigger?.addEventListener('click', () => navigationTrigger?.click());
    duplicateNavigationMenu?.querySelectorAll('[data-auth-nav-item]').forEach((button) => button.addEventListener('click', () => navigationMenu?.querySelector(`[data-auth-nav-item="${button.dataset.authNavItem}"]`)?.click()));
    const duplicateGallery = duplicateStudioPanel.querySelector('[data-studio-project-gallery]');
    let duplicateGesture;
    duplicateGallery?.addEventListener('pointerdown', (event) => {
      duplicateGesture = { x: event.clientX, lastX: event.clientX, lastTime: performance.now(), pointerId: event.pointerId };
      state.dragging = true;
      duplicateGallery.setPointerCapture?.(event.pointerId);
    });
    duplicateGallery?.addEventListener('pointermove', (event) => {
      if (!duplicateGesture || duplicateGesture.pointerId !== event.pointerId) return;
      const dx = event.clientX - duplicateGesture.x;
      if (landscapeQuery.matches) {
        const range = Math.max(96, viewport.clientWidth * .34);
        renderLandscape(state.index + Math.max(-1, Math.min(1, -dx / range)));
      } else renderPortrait(dx);
      syncDuplicateStudioPanel();
      duplicateGesture.lastX = event.clientX;
      duplicateGesture.lastTime = performance.now();
      event.preventDefault();
    }, { passive: false });
    const finishDuplicateGesture = (event) => {
      if (!duplicateGesture || duplicateGesture.pointerId !== event.pointerId) return;
      const dx = event.clientX - duplicateGesture.x;
      const elapsed = Math.max(1, performance.now() - duplicateGesture.lastTime);
      const velocity = (event.clientX - duplicateGesture.lastX) / elapsed;
      const threshold = landscapeQuery.matches ? Math.max(96, viewport.clientWidth * .34) : Math.max(52, Math.min(96, viewport.clientWidth * .2));
      const direction = Math.abs(dx) >= threshold || (Math.abs(velocity) > (landscapeQuery.matches ? .42 : .45) && Math.abs(dx) > 12) ? (dx < 0 ? 1 : -1) : 0;
      state.dragging = false;
      if (direction) move(direction);
      else render();
      duplicateGesture = null;
    };
    duplicateGallery?.addEventListener('pointerup', finishDuplicateGesture);
    duplicateGallery?.addEventListener('pointercancel', () => { state.dragging = false; duplicateGesture = null; render(); });
    const duplicateClientCopy = duplicateStudioPanel.querySelector('[data-studio-client-copy]');
    const [duplicateName, duplicateSince, duplicateDescription] = duplicateClientCopy?.querySelectorAll(':scope > :is(strong, p)') || [];
    if (duplicateName && duplicateSince && duplicateDescription) {
      Object.assign(duplicateName.dataset, { en: 'Albasri Mall', ar: 'البصري مول' });
      duplicateName.textContent = duplicateName.dataset[root.lang === 'ar' ? 'ar' : 'en'];
      Object.assign(duplicateSince.dataset, { en: 'Since 10 January 2026', ar: 'منذ 10 يناير 2026' });
      duplicateSince.textContent = duplicateSince.dataset[root.lang === 'ar' ? 'ar' : 'en'];
      Object.assign(duplicateDescription.dataset, { en: 'We provide Basra Mall with a monthly brand management package covering social media management, content creation, photography, and design. We also developed and refined the visual identity to create a more consistent and professional brand presence. This work contributed to gradual sales growth, stronger audience engagement, and an increase in followers and interested customers.', ar: 'نقدم للبصري مول باقة شهرية متكاملة لإدارة العلامة التجارية، تشمل إدارة حسابات التواصل الاجتماعي، صناعة المحتوى، التصوير، والتصميم. كما عملنا على تطوير وتحسين الهوية البصرية لبناء حضور أكثر اتساقاً واحترافية للعلامة. وأسهم هذا العمل في تحقيق نمو تدريجي في المبيعات، وزيادة التفاعل، وارتفاع أعداد المتابعين والعملاء المهتمين.' });
      duplicateDescription.textContent = duplicateDescription.dataset[root.lang === 'ar' ? 'ar' : 'en'];
    }
    syncDuplicateStudioPanel();
    setActiveStudioPanel(studioPanelIndex, true);
  };
  setActiveStudioPanel = (next, force = false) => {
    const target = Math.max(0, Math.min(studioPanels.length - 1, next));
    if (!force && target === studioPanelIndex) return;
    studioPanelIndex = target;
    resetStudioGallery();
    studioPanels.forEach((panel) => panel.classList.remove('is-active'));
    if (studioTrack) studioTrack.style.transform = `translateY(calc(var(--ooxme-stable-viewport-height) * ${-studioPanelIndex}))`;
    window.setTimeout(() => studioPanels[studioPanelIndex]?.classList.add('is-active'), 620);
    updateContextualNavigation();
    startGalleryRotation();
  };
  setStudioPanelState = (next, force = false, panelIndex = studioPanelIndex) => {
    const target = Math.max(0, Math.min(1, next));
    const view = target === 0 ? 'work' : 'client';
    const panel = studioPanels[panelIndex];
    if (!panel || (!force && studioPanelViews[panelIndex] === view)) return;
    studioPanelViews[panelIndex] = view;
    const panelSelector = panel.querySelector('[data-studio-selector]');
    const panelWorkGallery = panel.querySelector('[data-studio-work-gallery]');
    const panelClientCopy = panel.querySelector('[data-studio-client-copy]');
    panelSelector.dataset.active = view;
    panelSelector.querySelectorAll('[data-studio-option]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.studioOption === view)));
    panelWorkGallery.hidden = view !== 'work';
    panelClientCopy.hidden = view !== 'client';
    if (panelIndex === studioPanelIndex) {
      resetStudioGallery();
      startGalleryRotation();
    }
    updateContextualNavigation();
    document.dispatchEvent(new CustomEvent('studio-view-change', { detail: { view, panel, index: panelIndex } }));
  };
  document.addEventListener('click', (event) => {
    const option = event.target.closest('[data-studio-option]');
    if (option) {
      const panelIndex = studioPanels.indexOf(option.closest('.studio-panel'));
      setStudioPanelState(option.dataset.studioOption === 'client' ? 1 : 0, false, panelIndex);
      return;
    }
    const control = event.target.closest('[data-studio-context]');
    if (!control || control.disabled) return;
    const direction = control.dataset.studioContext === 'work' ? -1 : 1;
    const panelIndex = studioPanels.indexOf(control.closest('.studio-panel'));
    setStudioPanelState((studioPanelViews[panelIndex] === 'client' ? 1 : 0) + direction, false, panelIndex);
  });
  updateContextualNavigation();
  window.requestAnimationFrame(() => { containGallery(); render(); window.setTimeout(createSecondStudioPanel, 1100); });
  resetStudioGallery();
  startGalleryRotation();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopGalleryRotation();
    else startGalleryRotation();
  });
  window.addEventListener('pagehide', stopGalleryRotation);
})();
