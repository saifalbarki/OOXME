(() => {
  'use strict';

  const root = document.documentElement;
  const page = document.querySelector('.s-page--rpn');
  const content = page?.querySelector('.s-page__content');
  const composer = page?.querySelector('[data-s-composer]');
  const composerMenu = page?.querySelector('[data-s-composer-menu]');
  const sendUtilities = page?.querySelector('[data-s-send-utilities]');
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
  const carouselNav = page?.querySelector('[data-s-rpn-carousel-nav]');
  const carouselPrevious = page?.querySelector('[data-s-rpn-carousel-previous]');
  const carouselNext = page?.querySelector('[data-s-rpn-carousel-next]');
  const carouselCount = page?.querySelector('[data-s-rpn-carousel-count]');
  const contentSlot = page?.querySelector('[data-s-rpn-content-slot]');
  const description = page?.querySelector('[data-s-rpn-description]');
  const requirements = page?.querySelector('[data-s-rpn-requirements]');
  const rewards = page?.querySelector('[data-s-rpn-rewards]');
  const applyPanel = page?.querySelector('[data-s-rpn-apply]');
  const applyButtons = Array.from(page?.querySelectorAll('[data-s-rpn-apply-destination]') || []);
  const menuLabels = Array.from(composerMenu?.querySelectorAll('.s-page__composer-menu-label') || []);
  const menuItems = Array.from(composerMenu?.querySelectorAll('.s-page__composer-menu-item') || []);
  const title = firstGroup?.querySelector('.s-page__group-title');
  const summary = firstGroup?.querySelector('.s-page__group-description');
  const titleOutput = firstGroup?.querySelector('[data-s-rpn-title-output]');
  const summaryOutput = firstGroup?.querySelector('[data-s-rpn-summary-output]');
  const titleCursor = firstGroup?.querySelector('[data-s-rpn-title-cursor]');
  const summaryCursor = firstGroup?.querySelector('[data-s-rpn-summary-cursor]');
  const pageSections = Array.from(page?.querySelectorAll('[data-s-rpn-page-section]') || []);

  if (!page || !content || !composer || !composerMenu || !sendUtilities
    || !themeUtility || !languageUtility || !addButton || !submitButton || !firstGroup
    || !title || !summary || !titleOutput || !summaryOutput || !titleCursor || !summaryCursor || pageSections.length !== 2 || !hero || !heroMedia || !heroCopy || !nav || !navRail
    || !previousButton || !nextButton || !carouselNav || !carouselPrevious || !carouselNext || !carouselCount || !contentSlot || !description || !requirements
    || !rewards || !applyPanel || navItems.length !== 4 || menuItems.length !== 5) return;

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
    ar: ['مرحبــا\nشريكنا القادم', 'شبكة شركاء الاحالة لاوكسوم متاحة الان للتقديم\nانضم الينا واستفد من مزايا ومكافآت حصرية.']
  };
  const menuCopy = {
    en: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'],
    ar: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل']
  };
  const utilityCopy = {
    en: { submit: 'Submit question', previous: 'Previous section', next: 'Next section', previousCard: 'Previous card', nextCard: 'Next card', nav: 'Section navigation', toArabic: 'Switch to Arabic', toDay: 'Switch to Day Mode', toDark: 'Switch to Dark Mode' },
    ar: { submit: 'ارسال السؤال', previous: 'القسم السابق', next: 'القسم التالي', previousCard: 'البطاقة السابقة', nextCard: 'البطاقة التالية', nav: 'التنقل بين الاقسام', toEnglish: 'Switch to English', toDay: 'التبديل الى الوضع النهاري', toDark: 'التبديل الى الوضع الداكن' }
  };

  const pulseFrames = new Map();
  const utilityPulseFrames = new Map();
  const menuFlashTimers = new Map();
  let activeIndex = 0;
  let activeUi = 'none';
  let initialized = false;
  let initializationRun = 0;
  let menuCloseTimer = 0;
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
  let heroGeometryFrozen = false;
  let viewportWidth = root.clientWidth;
  let viewportOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  let inactivityTimer = 0;
  let faceController = null;
  let pageSectionIndex = 0;
  let pageSectionLocked = false;
  let pageSectionUnlockTimer = 0;
  let pageTouchStart = null;

  const syncCarouselNav = () => {
    const labels = utilityCopy[root.lang === 'ar' ? 'ar' : 'en'];
    carouselCount.textContent = `${activeIndex + 1} / ${panels.length}`;
    carouselPrevious.disabled = activeIndex === 0;
    carouselNext.disabled = activeIndex === panels.length - 1;
    carouselPrevious.setAttribute('aria-label', labels.previousCard);
    carouselNext.setAttribute('aria-label', labels.nextCard);
  };

  const setPageSectionState = (index) => {
    pageSectionIndex = index;
    sectionLocked = index === 1;
    pageSections.forEach((section, sectionIndex) => section.classList.toggle('is-rpn-page-section-active', sectionIndex === index));
  };

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
    menuLabels.forEach((label, index) => { label.textContent = menuCopy[language][index]; });
    nav.setAttribute('aria-label', copy.nav);
    previousButton.setAttribute('aria-label', copy.previous);
    nextButton.setAttribute('aria-label', copy.next);
    addButton.setAttribute('aria-label', language === 'ar' ? 'الذهاب الى اوكسوم' : 'Go to OOXME');
    submitButton.setAttribute('aria-label', copy.submit);
    languageUtility.classList.toggle('is-active', language === 'en');
    languageUtility.setAttribute('aria-pressed', String(language === 'en'));
    languageUtility.setAttribute('aria-label', language === 'en' ? copy.toArabic : copy.toEnglish);
    updateThemeLabel();
    startTypewriter();
    resetNavAlignment();
    scheduleGeometry();
    if (persist) {
      try { localStorage.setItem('ooxme-language', language); } catch (_) {}
    }
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language } }));
  };

  const startTypewriter = () => {
    const language = root.lang === 'ar' ? 'ar' : 'en';
    const stages = [
      { element: title, output: titleOutput, cursor: titleCursor, phrase: firstGroupCopy[language][0] },
      { element: summary, output: summaryOutput, cursor: summaryCursor, phrase: firstGroupCopy[language][1] }
    ];
    stages.forEach((stage) => {
      stage.element.lang = language;
      stage.element.dir = language === 'ar' ? 'rtl' : 'ltr';
      stage.output.lang = language;
      stage.output.dir = language === 'ar' ? 'rtl' : 'ltr';
      stage.output.textContent = stage.phrase;
      stage.cursor.style.removeProperty('left');
      stage.cursor.style.removeProperty('top');
      stage.element.classList.remove('is-cursor-visible', 'is-typewriter-prelude');
    });
  };

  const syncBoxHorizontalGeometry = () => {
    const rect = composerMenu.getBoundingClientRect();
    nav.style.setProperty('--s-rpn-secondary-nav-width', `${rect.width.toFixed(3)}px`);
  };

  const syncApplyButtonGeometry = () => {
    if (!nav.classList.contains('is-rpn-transition-ready')) return;
    const selector = navItems[activeIndex];
    if (!selector) return;
    const selectorRect = selector.getBoundingClientRect();
    const selectorWidth = selectorRect.width || Math.min(contentSlot.getBoundingClientRect().width * .76, 340);
    nav.style.setProperty('--s-rpn-active-selector-width', `${selectorWidth.toFixed(3)}px`);
  };

  const syncBoxHeight = () => {
    if (compositionReady && window.scrollY > .5) return;
    nav.classList.add('is-rpn-measuring');
    let largestHeight = 0;
    panels.forEach((panel) => {
      panel.classList.add('is-rpn-measuring-panel');
      const copies = Array.from(panel.children).filter((copy) => copy.hasAttribute('lang'));
      const displays = copies.map((copy) => copy.style.display);
      let panelHeight = 0;
      copies.forEach((activeCopy) => {
        copies.forEach((copy) => { copy.style.display = copy === activeCopy ? (panel === applyPanel ? 'flex' : 'block') : 'none'; });
        panelHeight = Math.max(panelHeight, Math.ceil(panel.scrollHeight));
      });
      copies.forEach((copy, copyIndex) => { copy.style.display = displays[copyIndex]; });
      largestHeight = Math.max(largestHeight, panelHeight);
      panel.classList.remove('is-rpn-measuring-panel');
    });
    nav.classList.remove('is-rpn-measuring');
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
      panels.forEach((panel, index) => {
        panel.classList.remove(...panelClasses[index], 'is-rpn-card-layer', 'is-rpn-card-active', 'is-rpn-card-hidden');
        panel.style.removeProperty('--s-rpn-card-stack-index');
        panel.style.removeProperty('--s-rpn-card-stack-scale');
        panel.style.removeProperty('--s-rpn-card-stack-offset');
        panel.style.removeProperty('--s-rpn-card-stack-left');
        panel.style.removeProperty('--s-rpn-card-stack-width');
        panel.style.removeProperty('--s-rpn-card-stack-opacity');
        panel.style.removeProperty('z-index');
      });
      return;
    }
    const target = panels[activeIndex];
    const [attachedClass, revealedClass] = panelClasses[activeIndex];
    const reveal = () => {
      panels.forEach((panel, index) => panel.classList.remove(...panelClasses[index]));
      target.classList.add(attachedClass);
      const slotRect = contentSlot.getBoundingClientRect();
      const cardWidth = Math.min(slotRect.width * .76, 340);
      const cardGap = parseFloat(getComputedStyle(root).getPropertyValue('--s-x')) || 18;
      const cardCenter = (slotRect.width - cardWidth) / 2;
      panels.forEach((panel, index) => {
        const relativeIndex = index - activeIndex;
        const visible = Math.abs(relativeIndex) <= 1;
        const cardLeft = cardCenter + (relativeIndex * (cardWidth + cardGap));
        panel.classList.toggle('is-rpn-card-layer', visible && relativeIndex !== 0);
        panel.classList.toggle('is-rpn-card-active', relativeIndex === 0);
        panel.classList.toggle('is-rpn-card-hidden', !visible);
        panel.style.setProperty('--s-rpn-card-stack-index', String(Math.abs(relativeIndex)));
        panel.style.setProperty('--s-rpn-card-stack-scale', '1');
        panel.style.setProperty('--s-rpn-card-stack-offset', '0px');
        panel.style.setProperty('--s-rpn-card-stack-left', `${cardLeft.toFixed(3)}px`);
        panel.style.setProperty('--s-rpn-card-stack-width', `${cardWidth.toFixed(3)}px`);
        panel.style.setProperty('--s-rpn-card-stack-opacity', relativeIndex === 0 ? '1' : '.46');
        panel.style.zIndex = String(relativeIndex === 0 ? 2 : 1);
      });
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
    page.style.setProperty('--s-rpn-transition-distance', `${Math.max(1, Math.round(positionedBox.bottom - heroRect.bottom))}px`);
    compositionReady = true;
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
    hero.style.removeProperty('bottom');
    hero.classList.remove('is-portrait-composed');
  };

  const syncFirstGroupGap = () => {
    const heroRect = hero.getBoundingClientRect();
    const summaryRect = summary.getBoundingClientRect();
    const x = composer.getBoundingClientRect().left || 18;
    const currentShift = parseFloat(firstGroup.style.getPropertyValue('--s-rpn-first-group-shift')) || 0;
    const shift = heroRect.top - (summaryRect.bottom - currentShift) - x;
    firstGroup.style.setProperty('--s-rpn-first-group-shift', `${shift.toFixed(3)}px`);
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
    const firstRect = firstGroup.getBoundingClientRect();
    const sectionTop = parseFloat(getComputedStyle(content).paddingTop) || 0;
    const baseline = viewportHeight - x;
    const relativeBottom = baseline - sectionTop;
    root.style.setProperty('--s-portrait-section-height', `${viewportHeight}px`);
    root.style.setProperty('--s-portrait-final-section-height', `${relativeBottom}px`);
    root.style.setProperty('--s-portrait-measured-x', `${x}px`);
    if (!sectionLocked) {
      hero.style.setProperty('bottom', `${firstRect.height - relativeBottom}px`);
      hero.classList.add('is-portrait-composed');
    }
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
    const referenceY = Number.parseFloat(getComputedStyle(content).paddingTop) || 0;
    const current = pageSections.reduce((closest, section, index) => {
      const distance = Math.abs(section.getBoundingClientRect().top - referenceY);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: pageSectionIndex, distance: Number.POSITIVE_INFINITY }).index;
    if (!pageSectionLocked && current !== pageSectionIndex) {
      setPageSectionState(current);
      if (current === 1) {
        syncActiveContent(true);
        syncCarouselNav();
      } else {
        syncActiveContent(false);
        startTypewriter();
      }
    }
    const progress = current === 1 || pageSectionIndex === 1 ? 1 : 0;
    firstGroup.style.setProperty('--s-rpn-first-group-scroll-progress', progress.toFixed(4));
    nav.style.setProperty('--s-rpn-composition-progress', progress.toFixed(4));
    nav.style.setProperty('--s-rpn-content-blur', '0px');
    nav.classList.toggle('is-rpn-content-interactive', progress > .05);
  };

  function scheduleScrollSync() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  }

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
    activeIndex = Math.max(0, Math.min(navItems.length - 1, index));
    navItems.forEach((item, itemIndex) => {
      const active = itemIndex === activeIndex;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    syncActiveContent(nav.classList.contains('is-rpn-transition-ready'));
    syncApplyButtonGeometry();
    syncCarouselNav();
    faceController?.setApply(activeIndex === 3);
  };

  const setPageSection = (index) => {
    const next = Math.max(0, Math.min(pageSections.length - 1, index));
    if (next === pageSectionIndex) return;
    setPageSectionState(next);
    if (next === 1) {
      nav.style.setProperty('--s-rpn-composition-progress', '1');
      nav.style.setProperty('--s-rpn-content-blur', '0px');
      nav.classList.add('is-rpn-content-interactive');
      syncActiveContent(true);
      syncBoxHeight();
      requestAnimationFrame(() => {
        syncActiveContent(true);
        syncCarouselNav();
      });
    } else {
      startTypewriter();
    }
  };

  const transitionPageSection = (direction) => {
    if (!direction || pageSectionLocked) return;
    const referenceY = Number.parseFloat(getComputedStyle(content).paddingTop) || 0;
    const current = pageSections.reduce((closest, section, index) => {
      const distance = Math.abs(section.getBoundingClientRect().top - referenceY);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: pageSectionIndex, distance: Number.POSITIVE_INFINITY }).index;
    const target = Math.max(0, Math.min(pageSections.length - 1, current + direction));
    if (target === current) return;
    const targetSection = pageSections[target];
    pageSectionLocked = true;
    clearTimeout(pageSectionUnlockTimer);
    setPageSection(target);
    const correction = targetSection.getBoundingClientRect().top - referenceY;
    window.scrollTo({ top: window.scrollY + correction, left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    pageSectionUnlockTimer = window.setTimeout(() => { pageSectionLocked = false; }, 820);
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
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 36) return;
    lastSwipeAt = performance.now();
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const forward = horizontal
      ? (root.dir === 'rtl' ? dx > 0 : dx < 0)
      : dy < 0;
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
    if (freeze) {
      heroGeometryFrozen = true;
    }
  };

  const initialize = () => {
    initializationRun += 1;
    root.classList.add('s-x-initializing');
    initialized = false;
    sectionLocked = false;
    compositionReady = false;
    heroGeometryFrozen = false;
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
    setPageSectionState(0);
    pageSectionLocked = false;
    clearTimeout(pageSectionUnlockTimer);
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

  let heroTapStart = null;
  hero.addEventListener('pointerdown', (event) => { if (event.pointerType !== 'mouse' || event.button === 0) heroTapStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; }, { passive: true });
  hero.addEventListener('pointerup', (event) => {
    if (!heroTapStart || event.pointerId !== heroTapStart.id) return;
    const moved = Math.hypot(event.clientX - heroTapStart.x, event.clientY - heroTapStart.y);
    heroTapStart = null;
    if (moved <= 8) {
      pulseSurface(hero);
      if (pageSectionIndex === 0) transitionPageSection(1);
    }
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
  [[carouselPrevious, -1], [carouselNext, 1]].forEach(([button, step]) => button.addEventListener('click', () => {
    if (button.disabled || suppressSwipeClick()) return;
    setActiveSection(activeIndex + step);
    pulseSurface(carouselNav);
  }));
  applyButtons.forEach((button) => button.addEventListener('click', () => {
    if (suppressSwipeClick()) return;
    pulseSurface(nav);
    const destination = button.getAttribute('data-s-rpn-apply-destination');
    if (destination) window.setTimeout(() => window.location.assign(destination), 180);
  }));

  document.addEventListener('pointerdown', (event) => {
    faceController?.begin(event);
  }, { capture: true, passive: true });
  document.addEventListener('pointermove', (event) => {
    faceController?.move(event);
  }, { capture: true, passive: true });
  ['pointerup', 'pointercancel'].forEach((eventName) => document.addEventListener(eventName, (event) => {
    faceController?.end(event, eventName === 'pointercancel');
  }, { passive: true }));
  window.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) >= 8 && !event.target.closest('[data-s-rpn-secondary-nav]')) {
      event.preventDefault();
      transitionPageSection(event.deltaY > 0 ? 1 : -1);
    }
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) return;
    event.preventDefault();
    transitionPageSection(['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1);
  }, { passive: true });
  document.addEventListener('touchstart', (event) => {
    if (event.target.closest('[data-s-rpn-secondary-nav]')) return;
    const touch = event.changedTouches[0];
    if (touch) pageTouchStart = { id: touch.identifier, y: touch.clientY };
  }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => {
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === pageTouchStart?.id);
    if (touch && Math.abs(touch.clientY - pageTouchStart.y) > 4) event.preventDefault();
  }, { capture: true, passive: false });
  document.addEventListener('touchend', (event) => {
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === pageTouchStart?.id);
    if (touch && Math.abs(touch.clientY - pageTouchStart.y) >= 36) transitionPageSection(touch.clientY < pageTouchStart.y ? 1 : -1);
    if (touch) pageTouchStart = null;
  }, { capture: true, passive: true });
  window.addEventListener('scroll', () => {
    scheduleScrollSync();
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

  page.classList.add('s-rpn-discrete-sections');
  root.classList.add('s-rpn-discrete-sections');
  setPageSectionState(0);
  setActiveSection(0);
  initialize();
  noteInteraction();
})();
