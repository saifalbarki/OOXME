(() => {
  'use strict';

  const root = document.documentElement;
  const page = document.querySelector('.s-page--rpn');
  const content = page?.querySelector('.s-page__content');
  const composer = page?.querySelector('[data-s-composer]');
  const composerMenu = page?.querySelector('[data-s-composer-menu]');
  const sendUtilities = page?.querySelector('[data-s-send-utilities]');
  const statusUtility = page?.querySelector('[data-s-utility="status"]');
  const themeUtility = page?.querySelector('[data-s-utility="theme"]');
  const languageUtility = page?.querySelector('[data-s-utility="language"]');
  const addButton = page?.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  const firstGroup = page?.querySelector('[data-s-first-group]');
  const hero = page?.querySelector('.s-page__rpn-hero-image');
  const heroMedia = hero?.querySelector('[data-s-flow-item]');
  const heroCopy = hero?.querySelector('[data-s-image-copy]');
  const nav = page?.querySelector('[data-s-rpn-secondary-nav]');
  const navRail = page?.querySelector('[data-s-rpn-secondary-nav-rail]');
  const navItems = Array.from(page?.querySelectorAll('[data-s-rpn-secondary-nav-item]') || []);
  const previousButton = page?.querySelector('[data-s-rpn-secondary-nav-previous]');
  const nextButton = page?.querySelector('[data-s-rpn-secondary-nav-next]');
  const contentSlot = page?.querySelector('[data-s-rpn-content-slot]');
  const description = page?.querySelector('[data-s-rpn-description]');
  const requirements = page?.querySelector('[data-s-rpn-requirements]');
  const rewards = page?.querySelector('[data-s-rpn-rewards]');
  const applyPanel = page?.querySelector('[data-s-rpn-apply]');
  const applyButtons = Array.from(page?.querySelectorAll('[data-s-rpn-apply-destination]') || []);
  const menuLabels = Array.from(composerMenu?.querySelectorAll('.s-page__composer-menu-label') || []);
  const title = firstGroup?.querySelector('.s-page__group-title');
  const summary = firstGroup?.querySelector('.s-page__group-description');

  if (!page || !content || !composer || !composerMenu || !sendUtilities || !statusUtility
    || !themeUtility || !languageUtility || !addButton || !submitButton || !firstGroup
    || !title || !summary || !hero || !heroMedia || !heroCopy || !nav || !navRail
    || !previousButton || !nextButton || !contentSlot || !description || !requirements
    || !rewards || !applyPanel || navItems.length !== 4) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const panels = [description, requirements, rewards, applyPanel];
  const panelClasses = [
    ['is-rpn-description-attached', 'is-rpn-description-revealed'],
    ['is-rpn-requirements-attached', 'is-rpn-requirements-revealed'],
    ['is-rpn-rewards-attached', 'is-rpn-rewards-revealed'],
    ['is-rpn-apply-attached', 'is-rpn-apply-revealed']
  ];
  const heroLayers = [hero, heroMedia, heroCopy, title, summary, nav];
  const firstGroupCopy = {
    en: ['Welcome\nOur Next Partner', 'OOXME RPN is open to apply\nJoin us and get exclusive advantages and rewards'],
    ar: ['مرحبــا\nشريكنا القادم', 'شبكة شركاء الإحالة لأوكسوم متاحة الآن للتقديم\nانضم إلينا واستفد من مزايا ومكافآت حصرية.']
  };
  const menuCopy = {
    en: ['The Brand Management', 'The Consultation', 'The Gallery', 'The Store', 'Contact'],
    ar: ['إدارة العلامة التجارية', 'الاستشارة', 'المعرض', 'المتجر', 'تواصل']
  };
  const utilityCopy = {
    en: { add: 'Add context', submit: 'Submit question', previous: 'Previous section', next: 'Next section', nav: 'Section navigation', toArabic: 'Switch to Arabic', toDay: 'Switch to Day Mode', toDark: 'Switch to Dark Mode' },
    ar: { add: 'اضف سياقًا', submit: 'ارسال السؤال', previous: 'القسم السابق', next: 'القسم التالي', nav: 'التنقل بين الأقسام', toEnglish: 'Switch to English', toDay: 'التبديل الى الوضع النهاري', toDark: 'التبديل الى الوضع الداكن' }
  };

  const endpointTolerance = .25;
  const reverseIntentDistance = 3;
  const releaseDelay = 1000;
  const releaseGrace = 120;
  const pulseFrames = new Map();
  const utilityPulseFrames = new Map();
  const menuFlashTimers = new Map();
  let activeIndex = 0;
  let activeUi = 'none';
  let initialized = false;
  let initializationRun = 0;
  let menuCloseTimer = 0;
  let addFlashTimer = 0;
  let composerPulseFrame = 0;
  let menuPulseFrame = 0;
  let contentRevealFrame = 0;
  let contentTransitionTimer = 0;
  let geometryFrame = 0;
  let portraitFrame = 0;
  let portraitTimer = 0;
  let scrollFrame = 0;
  let navAlignmentFrame = 0;
  let sectionLocked = false;
  let compositionReady = false;
  let stateOneImageBottom = 0;
  let transitionDistance = 0;
  let endpointLockScrollY = 0;
  let endpointPointerId = null;
  let endpointPointerStartY = 0;
  let reverseIntent = false;
  let releaseTimer = 0;
  let releaseFrame = 0;
  let releaseTarget = null;
  let releaseLastScrollY = 0;
  let releaseStableFrames = 0;
  let releaseStartedAt = 0;
  let releasePointerActive = false;
  let heroGeometryFrozen = false;
  let viewportWidth = root.clientWidth;
  let viewportOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  let inactivityTimer = 0;
  let faceController = null;

  const setLocalizedText = (element, value) => {
    const fragment = document.createDocumentFragment();
    value.split('\n').forEach((line, index) => {
      const span = document.createElement('span');
      span.className = 's-page__reveal-line';
      span.textContent = line;
      span.style.setProperty('--s-reveal-delay', `${index * 110}ms`);
      fragment.append(span);
    });
    element.replaceChildren(fragment);
  };

  const measureTextHeight = (element, value, language) => {
    const width = element.getBoundingClientRect().width;
    if (!width) return 0;
    const probe = element.cloneNode(false);
    probe.removeAttribute('id');
    probe.removeAttribute('data-s-reveal');
    probe.lang = language;
    probe.dir = language === 'ar' ? 'rtl' : 'ltr';
    Object.assign(probe.style, {
      position: 'fixed', inset: '0 auto auto -10000px', width: `${width}px`, maxWidth: 'none',
      height: 'auto', minHeight: '0', margin: '0', opacity: '1', filter: 'none',
      clipPath: 'none', visibility: 'hidden', pointerEvents: 'none', transition: 'none',
      fontFamily: language === 'ar' ? 'OOXMETosh, OOXMEScript, Arial, sans-serif' : 'OOXMEScript, OOXMEEnglish, Arial, sans-serif'
    });
    setLocalizedText(probe, value);
    document.body.append(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
  };

  const stabilizeLocalizedGeometry = () => {
    geometryFrame = 0;
    [title, summary].forEach((element, index) => {
      element.style.height = '';
      const height = Math.max(
        measureTextHeight(element, firstGroupCopy.en[index], 'en'),
        measureTextHeight(element, firstGroupCopy.ar[index], 'ar')
      );
      if (height) element.style.height = `${Math.ceil(height)}px`;
    });
    schedulePortraitLayout();
  };

  const scheduleGeometry = () => {
    if (geometryFrame) cancelAnimationFrame(geometryFrame);
    geometryFrame = requestAnimationFrame(stabilizeLocalizedGeometry);
  };

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
    clearTimeout(addFlashTimer);
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
    setLocalizedText(title, firstGroupCopy[language][0]);
    setLocalizedText(summary, firstGroupCopy[language][1]);
    menuLabels.forEach((label, index) => { label.textContent = menuCopy[language][index]; });
    nav.setAttribute('aria-label', copy.nav);
    previousButton.setAttribute('aria-label', copy.previous);
    nextButton.setAttribute('aria-label', copy.next);
    addButton.setAttribute('aria-label', copy.add);
    submitButton.setAttribute('aria-label', copy.submit);
    languageUtility.classList.toggle('is-active', language === 'en');
    languageUtility.setAttribute('aria-pressed', String(language === 'en'));
    languageUtility.setAttribute('aria-label', language === 'en' ? copy.toArabic : copy.toEnglish);
    updateThemeLabel();
    resetNavAlignment();
    scheduleGeometry();
    if (persist) {
      try { localStorage.setItem('ooxme-language', language); } catch (_) {}
    }
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language } }));
  };

  const syncBoxHorizontalGeometry = () => {
    const rect = composerMenu.getBoundingClientRect();
    nav.style.setProperty('--s-rpn-secondary-nav-left', `${rect.left.toFixed(3)}px`);
    nav.style.setProperty('--s-rpn-secondary-nav-width', `${rect.width.toFixed(3)}px`);
  };

  const syncApplyButtonGeometry = () => {
    if (!nav.classList.contains('is-rpn-transition-ready')) return;
    const selector = navItems[activeIndex];
    if (!selector) return;
    const boxRect = nav.getBoundingClientRect();
    const selectorRect = selector.getBoundingClientRect();
    nav.style.setProperty('--s-rpn-active-selector-width', `${selectorRect.width.toFixed(3)}px`);
    nav.setAttribute('data-s-rpn-selector-top-inset', (selectorRect.top - boxRect.top).toFixed(3));
  };

  const syncBoxHeight = () => {
    if (compositionReady && window.scrollY > .5) return;
    nav.classList.add('is-rpn-measuring');
    let largestHeight = 0;
    let largestIndex = 0;
    panels.forEach((panel, index) => {
      panel.classList.add('is-rpn-measuring-panel');
      const copies = Array.from(panel.children).filter((copy) => copy.hasAttribute('lang'));
      const displays = copies.map((copy) => copy.style.display);
      let panelHeight = 0;
      copies.forEach((activeCopy) => {
        copies.forEach((copy) => { copy.style.display = copy === activeCopy ? (panel === applyPanel ? 'flex' : 'block') : 'none'; });
        panelHeight = Math.max(panelHeight, Math.ceil(panel.scrollHeight));
      });
      copies.forEach((copy, copyIndex) => { copy.style.display = displays[copyIndex]; });
      panel.setAttribute('data-s-rpn-natural-height', `${panelHeight}`);
      if (panelHeight > largestHeight) {
        largestHeight = panelHeight;
        largestIndex = index;
      }
      panel.classList.remove('is-rpn-measuring-panel');
    });
    nav.classList.remove('is-rpn-measuring');
    nav.setAttribute('data-s-rpn-largest-panel', ['Description', 'Requirements', 'Rewards', 'Apply'][largestIndex]);
    nav.setAttribute('data-s-rpn-largest-content-height', `${largestHeight}`);
    const style = getComputedStyle(nav);
    const chrome = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
      .reduce((total, property) => total + (parseFloat(style[property]) || 0), 0);
    const height = Math.ceil((navRail.offsetHeight || 36) + (parseFloat(style.rowGap) || 0) + largestHeight + chrome);
    nav.style.setProperty('--s-rpn-content-box-height', `${height}px`);
  };

  const syncTextAlignment = () => {
    const language = root.lang === 'ar' ? 'ar' : 'en';
    const source = description.querySelector(`.s-page__rpn-description-copy[lang="${language}"] h2`);
    if (!source) return;
    const sourceRect = source.getBoundingClientRect();
    const firstRect = firstGroup.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    if (!sourceRect.width || !firstRect.width || !heroRect.width) return;
    const rtl = language === 'ar';
    const firstOffset = rtl ? firstRect.right - sourceRect.right : sourceRect.left - firstRect.left;
    const heroOffset = rtl ? heroRect.right - sourceRect.right : sourceRect.left - heroRect.left;
    firstGroup.style.setProperty('--s-rpn-content-text-width', `${sourceRect.width.toFixed(3)}px`);
    firstGroup.style.setProperty('--s-rpn-content-text-inline-offset', `${firstOffset.toFixed(3)}px`);
    heroCopy.style.setProperty('--s-rpn-content-text-width', `${sourceRect.width.toFixed(3)}px`);
    heroCopy.style.setProperty('--s-rpn-content-text-inline-offset', `${heroOffset.toFixed(3)}px`);
  };

  const syncActiveContent = (attached = sectionLocked) => {
    if (contentRevealFrame) cancelAnimationFrame(contentRevealFrame);
    if (contentTransitionTimer) clearTimeout(contentTransitionTimer);
    contentRevealFrame = 0;
    contentTransitionTimer = 0;
    const outgoingIndex = panels.findIndex((panel, index) => panel.classList.contains(panelClasses[index][0]) && panel.classList.contains(panelClasses[index][1]));
    panels.forEach((panel) => panel.classList.remove('is-rpn-panel-exiting'));
    if (!attached) {
      panels.forEach((panel, index) => panel.classList.remove(...panelClasses[index]));
      return;
    }
    const target = panels[activeIndex];
    const [attachedClass, revealedClass] = panelClasses[activeIndex];
    const reveal = () => {
      panels.forEach((panel, index) => panel.classList.remove(...panelClasses[index]));
      target.classList.add(attachedClass);
      contentRevealFrame = requestAnimationFrame(() => {
        contentRevealFrame = 0;
        if (panels[activeIndex] !== target) return;
        target.classList.add(revealedClass);
        syncApplyButtonGeometry();
        requestAnimationFrame(syncApplyButtonGeometry);
      });
    };
    if (outgoingIndex !== -1 && panels[outgoingIndex] !== target) {
      const outgoing = panels[outgoingIndex];
      outgoing.classList.remove(panelClasses[outgoingIndex][1]);
      outgoing.classList.add('is-rpn-panel-exiting');
      contentTransitionTimer = window.setTimeout(() => {
        contentTransitionTimer = 0;
        outgoing.classList.remove('is-rpn-panel-exiting');
        reveal();
      }, 180);
    } else {
      reveal();
    }
  };

  const syncStateOneGeometry = () => {
    if (sectionLocked || (compositionReady && window.scrollY > .5)) return;
    const x = composer.getBoundingClientRect().left || 18;
    const heroRect = hero.getBoundingClientRect();
    nav.classList.add('is-rpn-transition-ready');
    const boxRect = nav.getBoundingClientRect();
    const desiredTop = heroRect.bottom + x;
    const resolvedTop = nav.offsetTop + desiredTop - boxRect.top;
    nav.style.setProperty('--s-rpn-secondary-nav-state-one-top', `${resolvedTop.toFixed(3)}px`);
    const positionedBox = nav.getBoundingClientRect();
    stateOneImageBottom = heroRect.bottom;
    transitionDistance = Math.max(1, Math.round(positionedBox.bottom - heroRect.bottom));
    page.style.setProperty('--s-rpn-transition-distance', `${transitionDistance}px`);
    compositionReady = true;
    firstGroup.setAttribute('data-s-rpn-state-one-text-image-gap', (heroRect.top - summary.getBoundingClientRect().bottom).toFixed(3));
    firstGroup.setAttribute('data-s-rpn-state-one-image-box-gap', (positionedBox.top - heroRect.bottom).toFixed(3));
    firstGroup.setAttribute('data-s-rpn-state-one-image-bottom', stateOneImageBottom.toFixed(3));
    syncActiveContent(true);
  };

  const resetNavAlignment = () => {
    if (navAlignmentFrame) cancelAnimationFrame(navAlignmentFrame);
    navAlignmentFrame = requestAnimationFrame(() => {
      navAlignmentFrame = 0;
      syncBoxHorizontalGeometry();
      syncBoxHeight();
      syncStateOneGeometry();
      syncTextAlignment();
      syncApplyButtonGeometry();
    });
  };

  const resetPortraitLayout = () => {
    root.style.removeProperty('--s-portrait-measured-x');
    root.style.removeProperty('--s-portrait-section-height');
    root.style.removeProperty('--s-portrait-final-section-height');
    root.removeAttribute('data-s-portrait-composer-top');
    root.removeAttribute('data-s-portrait-viewport-height');
    root.removeAttribute('data-s-portrait-section-top');
    root.removeAttribute('data-s-portrait-reference-y');
    hero.style.removeProperty('bottom');
    hero.classList.remove('is-portrait-composed');
  };

  const syncFirstGroupGap = () => {
    const heroRect = hero.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const summaryRect = summary.getBoundingClientRect();
    const x = composer.getBoundingClientRect().left || 18;
    const currentShift = parseFloat(firstGroup.style.getPropertyValue('--s-rpn-first-group-shift')) || 0;
    const shift = heroRect.top - (summaryRect.bottom - currentShift) - x;
    if (!firstGroup.hasAttribute('data-s-rpn-original-y')) firstGroup.setAttribute('data-s-rpn-original-y', (titleRect.top - currentShift).toFixed(3));
    firstGroup.style.setProperty('--s-rpn-first-group-shift', `${shift.toFixed(3)}px`);
    firstGroup.setAttribute('data-s-rpn-final-y', (titleRect.top + shift).toFixed(3));
    firstGroup.setAttribute('data-s-rpn-text-image-gap', x.toFixed(3));
  };

  const syncPortraitLayout = () => {
    portraitFrame = 0;
    if (!window.matchMedia('(orientation: portrait)').matches) {
      resetPortraitLayout();
      syncFirstGroupGap();
      scheduleScrollSync();
      return;
    }
    const x = parseFloat(getComputedStyle(root).getPropertyValue('--s-x')) || 18;
    // The former structural anchor was fixed to the visual viewport with a
    // bottom offset of X. Preserve that exact fractional Safari baseline now
    // that the unused anchor has been removed.
    const viewportHeight = window.visualViewport?.height || root.clientHeight;
    const composerRect = composer.getBoundingClientRect();
    const firstRect = firstGroup.getBoundingClientRect();
    const sectionTop = parseFloat(getComputedStyle(content).paddingTop) || 0;
    const baseline = viewportHeight - x;
    const relativeBottom = baseline - sectionTop;
    root.style.setProperty('--s-portrait-section-height', `${viewportHeight}px`);
    root.style.setProperty('--s-portrait-final-section-height', `${relativeBottom}px`);
    root.style.setProperty('--s-portrait-measured-x', `${x}px`);
    root.setAttribute('data-s-portrait-composer-top', composerRect.top.toFixed(3));
    root.setAttribute('data-s-portrait-viewport-height', viewportHeight.toFixed(3));
    root.setAttribute('data-s-portrait-section-top', sectionTop.toFixed(3));
    root.setAttribute('data-s-portrait-reference-y', baseline.toFixed(3));
    if (!sectionLocked) {
      hero.style.setProperty('bottom', `${firstRect.height - relativeBottom}px`);
      hero.classList.add('is-portrait-composed');
    }
    firstGroup.setAttribute('data-s-portrait-layout', 'composed');
    firstGroup.setAttribute('data-s-portrait-final-gap', (composerRect.top - baseline).toFixed(3));
    firstGroup.setAttribute('data-s-portrait-final-y', baseline.toFixed(3));
    firstGroup.setAttribute('data-s-portrait-reference-delta', '0.000');
    firstGroup.setAttribute('data-s-portrait-live-gap', '0.000');
    syncFirstGroupGap();
    scheduleScrollSync();
  };

  function schedulePortraitLayout() {
    clearTimeout(portraitTimer);
    portraitTimer = 0;
    if (!portraitFrame) portraitFrame = requestAnimationFrame(syncPortraitLayout);
  }

  const scheduleStablePortraitLayout = () => {
    clearTimeout(portraitTimer);
    portraitTimer = window.setTimeout(() => {
      portraitTimer = 0;
      schedulePortraitLayout();
    }, 180);
  };

  const syncScroll = () => {
    scrollFrame = 0;
    if (!compositionReady) {
      syncBoxHorizontalGeometry();
      syncBoxHeight();
      syncStateOneGeometry();
      syncApplyButtonGeometry();
    }
    if (!compositionReady || transitionDistance <= 0) return;
    const scrollY = window.scrollY;
    const rawProgress = Math.min(1, Math.max(0, scrollY / transitionDistance));
    const nativeLimit = Math.max(0, root.scrollHeight - window.innerHeight);
    const reachableEndpoint = Math.min(transitionDistance, nativeLimit);
    const reachedEndpoint = nativeLimit > endpointTolerance && scrollY >= reachableEndpoint - endpointTolerance;
    let progress = rawProgress;
    if (sectionLocked) {
      progress = 1;
      if (reverseIntent && scrollY <= endpointLockScrollY - reverseIntentDistance) {
        sectionLocked = false;
        reverseIntent = false;
        progress = rawProgress;
        faceController?.rejectApply();
      }
    } else if (reachedEndpoint) {
      sectionLocked = true;
      endpointLockScrollY = scrollY;
      reverseIntent = false;
      progress = 1;
      nav.setAttribute('data-s-rpn-final-content-baseline', stateOneImageBottom.toFixed(3));
    }
    firstGroup.style.setProperty('--s-rpn-first-group-scroll-progress', progress.toFixed(4));
    nav.style.setProperty('--s-rpn-composition-progress', progress.toFixed(4));
    nav.style.setProperty('--s-rpn-content-blur', `${((1 - progress) * 12).toFixed(3)}px`);
    nav.classList.toggle('is-rpn-content-interactive', progress > .05);
    firstGroup.setAttribute('data-s-rpn-text-scroll-progress', progress.toFixed(4));
    nav.setAttribute('data-s-rpn-composition-progress', progress.toFixed(4));
  };

  function scheduleScrollSync() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  }

  const beginEndpointGesture = (pointerId, clientY) => {
    if (!sectionLocked) return;
    endpointPointerId = pointerId;
    endpointPointerStartY = clientY;
    reverseIntent = false;
  };
  const updateEndpointGesture = (pointerId, clientY) => {
    if (sectionLocked && pointerId === endpointPointerId) reverseIntent = clientY - endpointPointerStartY >= reverseIntentDistance;
  };
  const endEndpointGesture = (pointerId) => {
    if (pointerId !== endpointPointerId) return;
    if (reverseIntent && sectionLocked) syncScroll();
    endpointPointerId = null;
    endpointPointerStartY = 0;
    reverseIntent = false;
  };

  const cancelReleaseSettle = ({ stopNativeScroll = false } = {}) => {
    if (releaseTimer) clearTimeout(releaseTimer);
    if (releaseFrame) cancelAnimationFrame(releaseFrame);
    const settling = releaseTarget !== null;
    releaseTimer = 0;
    releaseFrame = 0;
    releaseTarget = null;
    releaseLastScrollY = 0;
    releaseStableFrames = 0;
    releaseStartedAt = 0;
    if (stopNativeScroll && settling) window.scrollTo({ top: window.scrollY, left: 0, behavior: 'auto' });
  };

  const watchReleaseSettle = () => {
    releaseFrame = 0;
    if (releaseTarget === null) return;
    const target = releaseTarget;
    const scrollY = window.scrollY;
    releaseStableFrames = Math.abs(scrollY - releaseLastScrollY) <= .01 ? releaseStableFrames + 1 : 0;
    releaseLastScrollY = scrollY;
    const reached = Math.abs(scrollY - target) <= endpointTolerance;
    const stopped = releaseStableFrames >= 3 && performance.now() - releaseStartedAt >= releaseGrace;
    if (reached || stopped) {
      if (target > 0 && !sectionLocked) {
        sectionLocked = true;
        endpointLockScrollY = scrollY;
        reverseIntent = false;
        nav.setAttribute('data-s-rpn-final-content-baseline', stateOneImageBottom.toFixed(3));
      } else if (target === 0 && scrollY > endpointTolerance) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
      releaseTarget = null;
      releaseStableFrames = 0;
      releaseStartedAt = 0;
      syncScroll();
      return;
    }
    releaseFrame = requestAnimationFrame(watchReleaseSettle);
  };

  const scheduleReleaseSettle = () => {
    if (releasePointerActive || releaseTarget !== null || !compositionReady || sectionLocked) return;
    if (releaseTimer) clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      releaseTimer = 0;
      if (releasePointerActive || releaseTarget !== null || sectionLocked) return;
      const target = window.scrollY < transitionDistance / 2 ? 0 : transitionDistance;
      if (Math.abs(window.scrollY - target) <= endpointTolerance) {
        if (target > 0) syncScroll();
        return;
      }
      releaseTarget = target;
      releaseLastScrollY = window.scrollY;
      releaseStableFrames = 0;
      releaseStartedAt = performance.now();
      window.scrollTo({ top: target, left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      releaseFrame = requestAnimationFrame(watchReleaseSettle);
    }, releaseDelay);
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

  const setActiveSection = (index) => {
    activeIndex = (index + navItems.length) % navItems.length;
    navItems.forEach((item, itemIndex) => {
      const active = itemIndex === activeIndex;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    syncActiveContent(nav.classList.contains('is-rpn-transition-ready'));
    syncApplyButtonGeometry();
    faceController?.setApply(activeIndex === 3);
  };

  let swipeStart = null;
  let lastSwipeAt = -Infinity;
  const beginSwipe = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  };
  const finishSwipe = (event) => {
    if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) < 36 || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
    lastSwipeAt = performance.now();
    const forward = root.dir === 'rtl' ? dx > 0 : dx < 0;
    setActiveSection(activeIndex + (forward ? 1 : -1));
    pulseSurface(nav);
  };
  const suppressSwipeClick = () => performance.now() - lastSwipeAt < 250;

  const prepareHero = ({ freeze = false } = {}) => {
    if (heroGeometryFrozen || window.scrollY > .5) return;
    [geometryFrame, portraitFrame, navAlignmentFrame, scrollFrame].forEach((frame) => { if (frame) cancelAnimationFrame(frame); });
    geometryFrame = 0; portraitFrame = 0; navAlignmentFrame = 0; scrollFrame = 0;
    stabilizeLocalizedGeometry();
    if (portraitFrame) cancelAnimationFrame(portraitFrame);
    portraitFrame = 0;
    syncPortraitLayout();
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    syncBoxHorizontalGeometry();
    syncBoxHeight();
    syncStateOneGeometry();
    syncTextAlignment();
    syncApplyButtonGeometry();
    syncScroll();
    heroLayers.forEach((layer) => {
      layer.classList.add('is-rpn-compositor-ready');
      const style = getComputedStyle(layer);
      void style.transform; void style.opacity; void style.filter; void style.webkitBackdropFilter;
      void layer.getBoundingClientRect();
    });
    root.setAttribute('data-s-rpn-hero-geometry-ready', 'true');
    if (freeze) {
      heroGeometryFrozen = true;
      root.setAttribute('data-s-rpn-hero-assets-stable', 'true');
    }
  };

  const initialize = () => {
    initializationRun += 1;
    root.classList.add('s-x-initializing');
    initialized = false;
    cancelReleaseSettle({ stopNativeScroll: true });
    releasePointerActive = false;
    sectionLocked = false;
    compositionReady = false;
    stateOneImageBottom = 0;
    transitionDistance = 0;
    endpointLockScrollY = 0;
    endpointPointerId = null;
    endpointPointerStartY = 0;
    reverseIntent = false;
    heroGeometryFrozen = false;
    root.removeAttribute('data-s-rpn-hero-assets-stable');
    nav.classList.remove('is-rpn-content-interactive');
    nav.classList.add('is-rpn-transition-ready');
    nav.style.removeProperty('--s-rpn-secondary-nav-state-one-top');
    nav.style.removeProperty('--s-rpn-composition-progress');
    nav.style.removeProperty('--s-rpn-content-blur');
    page.style.removeProperty('--s-rpn-transition-distance');
    syncActiveContent(false);
    firstGroup.style.setProperty('--s-rpn-first-group-scroll-progress', '0');
    resetTopBar();
    composer.classList.remove('is-pulsing');
    firstGroup.classList.add('is-visible');
    heroMedia.classList.add('is-visible');
    heroCopy.classList.add('is-visible');
    heroCopy.setAttribute('aria-hidden', 'false');
    prepareHero();
    const run = initializationRun;
    const fontsReady = document.fonts?.ready || Promise.resolve();
    const imageReady = heroMedia.complete && heroMedia.naturalWidth ? Promise.resolve() : (heroMedia.decode?.().catch(() => {}) || Promise.resolve());
    Promise.all([fontsReady, imageReady]).then(() => {
      if (initializationRun === run && window.scrollY <= .5) prepareHero({ freeze: true });
    });
    initialized = true;
    root.classList.remove('s-x-initializing');
  };

  const resetPage = () => {
    clearTimeout(inactivityTimer);
    clearTimeout(portraitTimer);
    if (portraitFrame) cancelAnimationFrame(portraitFrame);
    portraitFrame = 0;
    pulseFrames.forEach(cancelAnimationFrame);
    pulseFrames.clear();
    utilityPulseFrames.forEach(cancelAnimationFrame);
    utilityPulseFrames.clear();
    menuFlashTimers.forEach(clearTimeout);
    menuFlashTimers.clear();
    document.querySelectorAll('.is-pulsing').forEach((element) => element.classList.remove('is-pulsing'));
    applyLanguage('en', { persist: false, emit: false });
    applyTheme('dark');
    setActiveSection(0);
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
  hero.addEventListener('animationend', (event) => { if (event.animationName === 's-page-composer-pulse') hero.classList.remove('is-pulsing'); });
  [statusUtility, themeUtility, languageUtility].forEach((control) => {
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
  addButton.addEventListener('click', () => {
    clearTimeout(addFlashTimer);
    addButton.classList.add('is-active');
    addFlashTimer = window.setTimeout(() => addButton.classList.remove('is-active'), 120);
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

  let heroTapStart = null;
  hero.addEventListener('pointerdown', (event) => { if (event.pointerType !== 'mouse' || event.button === 0) heroTapStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; }, { passive: true });
  hero.addEventListener('pointerup', (event) => {
    if (!heroTapStart || event.pointerId !== heroTapStart.id) return;
    const moved = Math.hypot(event.clientX - heroTapStart.x, event.clientY - heroTapStart.y);
    heroTapStart = null;
    if (moved <= 8) pulseSurface(hero);
  }, { passive: true });
  hero.addEventListener('pointercancel', () => { heroTapStart = null; }, { passive: true });

  [navRail, contentSlot].forEach((target) => {
    target.addEventListener('pointerdown', beginSwipe, { passive: true });
    target.addEventListener('pointerup', finishSwipe, { passive: true });
    target.addEventListener('pointercancel', () => { swipeStart = null; }, { passive: true });
  });
  navItems.forEach((item, index) => item.addEventListener('click', () => {
    if (suppressSwipeClick()) return;
    setActiveSection(index);
    pulseSurface(nav);
  }));
  [[previousButton, -1], [nextButton, 1]].forEach(([button, step]) => button.addEventListener('click', () => {
    if (suppressSwipeClick()) return;
    setActiveSection(activeIndex + step);
    pulseSurface(nav);
  }));
  applyButtons.forEach((button) => button.addEventListener('click', () => {
    if (suppressSwipeClick()) return;
    pulseSurface(nav);
    const destination = button.getAttribute('data-s-rpn-apply-destination');
    if (destination) window.setTimeout(() => window.location.assign(destination), 180);
  }));

  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') beginEndpointGesture(event.pointerId, event.clientY);
    releasePointerActive = true;
    cancelReleaseSettle({ stopNativeScroll: true });
    faceController?.begin(event);
  }, { capture: true, passive: true });
  document.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    if (touch) beginEndpointGesture(`touch:${touch.identifier}`, touch.clientY);
  }, { capture: true, passive: true });
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch') updateEndpointGesture(event.pointerId, event.clientY);
    faceController?.move(event);
  }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => {
    const touch = Array.from(event.changedTouches).find((item) => `touch:${item.identifier}` === endpointPointerId);
    if (touch) updateEndpointGesture(`touch:${touch.identifier}`, touch.clientY);
  }, { capture: true, passive: true });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach((eventName) => document.addEventListener(eventName, (event) => {
    if (eventName.startsWith('pointer')) {
      if (event.pointerType !== 'touch') {
        endEndpointGesture(event.pointerId);
        releasePointerActive = false;
        scheduleReleaseSettle();
      }
      faceController?.end(event, eventName === 'pointercancel');
    } else {
      const touch = Array.from(event.changedTouches).find((item) => `touch:${item.identifier}` === endpointPointerId);
      if (touch) endEndpointGesture(`touch:${touch.identifier}`);
      if (releasePointerActive) {
        releasePointerActive = false;
        scheduleReleaseSettle();
      }
    }
  }, { passive: true }));
  window.addEventListener('wheel', (event) => {
    cancelReleaseSettle({ stopNativeScroll: true });
    if (sectionLocked && event.deltaY < 0) reverseIntent = true;
  }, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (![' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) return;
    cancelReleaseSettle({ stopNativeScroll: true });
    if (sectionLocked && ['ArrowUp', 'PageUp', 'Home'].includes(event.key)) reverseIntent = true;
  }, { passive: true });
  window.addEventListener('scroll', () => {
    scheduleScrollSync();
    scheduleReleaseSettle();
    noteInteraction();
  }, { passive: true });

  const viewportChanged = () => {
    const nextWidth = root.clientWidth;
    const nextOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    if (Math.abs(nextWidth - viewportWidth) > .5 || nextOrientation !== viewportOrientation) {
      viewportWidth = nextWidth;
      viewportOrientation = nextOrientation;
      scheduleGeometry();
      resetNavAlignment();
    } else if (!window.visualViewport) {
      scheduleStablePortraitLayout();
    }
  };
  window.addEventListener('resize', viewportChanged, { passive: true });
  window.addEventListener('orientationchange', () => {
    viewportWidth = root.clientWidth;
    viewportOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    scheduleGeometry();
    resetNavAlignment();
  }, { passive: true });
  ['pointerdown', 'mousemove', 'touchstart', 'click', 'keydown'].forEach((eventName) => document.addEventListener(eventName, noteInteraction, { passive: true }));
  window.addEventListener('pageshow', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    initialize();
  });

  setActiveSection(0);
  initialize();
  noteInteraction();
})();
