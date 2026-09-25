(() => {
  'use strict';

  const root = document.documentElement;
  const page = document.querySelector('.s-page--space');
  const composer = page?.querySelector('[data-s-composer]');
  const composerMenu = composer?.querySelector('[data-s-composer-menu]');
  const sendUtilities = composer?.querySelector('[data-s-send-utilities]');
  const themeUtility = composer?.querySelector('[data-s-utility="theme"]');
  const languageUtility = composer?.querySelector('[data-s-utility="language"]');
  const emailAction = page?.querySelector('.space-application__button[data-s-contact="email"]');
  const addButton = composer?.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  const numberNode = page?.querySelector('[data-space-hero-number]');
  const spaceMark = page?.querySelector('.space-details__mark');
  const pulseTargets = [
    ...page?.querySelectorAll('.space-rewards-stage, .space-application__surface, .space-application__button, .space-details__mark, .space-faq__question') || []
  ];
  const faq = page?.querySelector('.space-faq');

  if (!page || !composer || !composerMenu || !sendUtilities || !themeUtility
    || !languageUtility || !addButton || !submitButton || !numberNode) return;

  const utilityCopy = {
    en: { submit: 'Submit question', toArabic: 'Switch to Arabic', toDay: 'Switch to Day Mode', toDark: 'Switch to Dark Mode' },
    ar: { submit: 'ارسال السؤال', toEnglish: 'Switch to English', toDay: 'التبديل الى الوضع النهاري', toDark: 'التبديل الى الوضع الداكن' }
  };

  const updateEmailAction = () => {
    if (!emailAction) return;
    const subject = root.lang === 'ar'
      ? 'مهتم بالانضمام لبرنامج شركاء اوكسوم'
      : 'Interested in Joining the OOXME Partner Program';
    emailAction.href = `mailto:hello@ooxme.com?subject=${encodeURIComponent(subject)}`;
  };

  let menuOpen = false;
  const setMenuOpen = (open) => {
    menuOpen = Boolean(open);
    submitButton.classList.toggle('is-active', menuOpen);
    composerMenu.classList.toggle('is-open', menuOpen);
    composerMenu.setAttribute('aria-hidden', String(!menuOpen));
    sendUtilities.classList.toggle('is-open', menuOpen);
    sendUtilities.setAttribute('aria-hidden', String(!menuOpen));
    if (menuOpen) composer.style.setProperty('--s-composer-menu-height', `${composerMenu.offsetHeight}px`);
  };

  const updateThemeLabel = () => {
    const copy = utilityCopy[root.lang === 'ar' ? 'ar' : 'en'];
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

  const applyLanguage = (next, { emit = true } = {}) => {
    const language = next === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    const copy = utilityCopy[language];
    addButton.setAttribute('aria-label', language === 'ar' ? 'الذهاب الى اوكسوم' : 'Go to OOXME');
    submitButton.setAttribute('aria-label', copy.submit);
    languageUtility.classList.toggle('is-active', language === 'en');
    languageUtility.setAttribute('aria-pressed', String(language === 'en'));
    languageUtility.setAttribute('aria-label', language === 'en' ? copy.toArabic : copy.toEnglish);
    updateThemeLabel();
    updateEmailAction();
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language } }));
  };

  window.addEventListener('ooxme-language-change', (event) => {
    const language = event.detail?.language;
    if (language && language !== root.lang) applyLanguage(language, { emit: false });
  });

  const numberTarget = 500000;
  const numberDurationMs = 1100;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let numberAnimationHasRun = false;
  let numberCounterComplete = false;
  let numberFrame = 0;
  const formatNumber = (value) => Math.max(0, Math.min(numberTarget, Math.round(value)))
    .toLocaleString('en-US').replace(/,/g, "'");
  const setNumber = (value) => { numberNode.textContent = formatNumber(value); };
  const spaceMarkWidthRatio = 0.9821849746479709;
  const fitSpaceMarkToNumber = () => {
    if (!spaceMark || (numberAnimationHasRun && !numberCounterComplete)) return;
    const numberWidth = numberNode.getBoundingClientRect().width;
    if (numberWidth > 0) {
      spaceMark.style.setProperty('--space-logo-fit-width', `${numberWidth / spaceMarkWidthRatio}px`);
    }
  };
  const visibleTextBounds = (selector) => {
    const language = root.lang === 'ar' ? 'ar' : 'en';
    const text = page.querySelector(`${selector}[lang="${language}"]`);
    if (!text || getComputedStyle(text).display === 'none') return null;
    const range = document.createRange();
    range.selectNodeContents(text);
    const bounds = range.getBoundingClientRect();
    return bounds.width || bounds.height ? bounds : null;
  };
  const setMeasuredSectionGap = (target, previousBottom, nextTop, gap) => {
    if (!target || !Number.isFinite(previousBottom) || !Number.isFinite(nextTop)) return;
    const currentMargin = Number.parseFloat(getComputedStyle(target).marginTop) || 0;
    const correctedMargin = currentMargin + gap - (nextTop - previousBottom);
    if (Math.abs(correctedMargin - currentMargin) > 0.01) {
      target.style.marginTop = `${correctedMargin}px`;
    }
  };
  const syncMeasuredSectionGaps = () => {
    const rewardStage = page.querySelector('.space-rewards-stage');
    const rewardPanel = page.querySelector('.space-rewards__header');
    const rewardCard = page.querySelector('.space-rewards');
    const compositionStage = page.querySelector('.space-composition-stage');
    const application = page.querySelector('.space-application');
    const applicationSurface = page.querySelector('.space-application__surface');
    const faqSection = page.querySelector('.space-faq');
    const firstSectionLast = visibleTextBounds('.space-details__description');
    // The logo's approved bottom margin is 3X; derive X from its computed length.
    const spaceX = Number.parseFloat(getComputedStyle(spaceMark).marginBottom) / 3;
    const spaceGap = spaceX * 4
      * (window.matchMedia('(orientation: portrait)').matches ? 2 : 1);

    if (!Number.isFinite(spaceGap)) return;
    if (firstSectionLast && rewardStage && rewardPanel) {
      setMeasuredSectionGap(rewardStage, firstSectionLast.bottom, rewardPanel.getBoundingClientRect().top, spaceGap);
    }
    const compositionFirst = visibleTextBounds('.space-message');
    if (rewardCard && compositionStage && compositionFirst) {
      setMeasuredSectionGap(compositionStage, rewardCard.getBoundingClientRect().bottom, compositionFirst.top, spaceGap);
    }
    const compositionLast = visibleTextBounds('.space-baseline');
    const faqHeading = visibleTextBounds('.space-faq__heading');
    if (faqSection && faqHeading && compositionLast) {
      setMeasuredSectionGap(faqSection, compositionLast.bottom, faqHeading.top, spaceGap);
    }
    if (faqSection && application && applicationSurface) {
      setMeasuredSectionGap(application, faqSection.getBoundingClientRect().bottom, applicationSurface.getBoundingClientRect().top, spaceGap);
    }
  };
  const scheduleSectionGapSync = () => requestAnimationFrame(syncMeasuredSectionGaps);
  window.addEventListener('resize', scheduleSectionGapSync, { passive: true });
  window.addEventListener('ooxme-language-change', scheduleSectionGapSync);
  document.fonts?.ready.then(scheduleSectionGapSync);
  scheduleSectionGapSync();
  faq?.addEventListener('click', (event) => {
    const question = event.target.closest('.space-faq__question');
    if (!question || !faq.contains(question)) return;
    const shouldOpen = question.getAttribute('aria-expanded') !== 'true';
    faq.querySelectorAll('.space-faq__question').forEach((item) => {
      const isOpen = item === question && shouldOpen;
      item.setAttribute('aria-expanded', String(isOpen));
      item.closest('.space-faq__item')?.classList.toggle('is-open', isOpen);
      const answer = document.getElementById(item.getAttribute('aria-controls'));
      answer?.setAttribute('aria-hidden', String(!isOpen));
    });
  });
  const enableSpaceMarkFit = () => {
    numberCounterComplete = true;
    fitSpaceMarkToNumber();
    document.fonts?.ready.then(fitSpaceMarkToNumber);
  };
  if ('ResizeObserver' in window) {
    new ResizeObserver(fitSpaceMarkToNumber).observe(numberNode);
  }
  window.addEventListener('resize', fitSpaceMarkToNumber, { passive: true });
  fitSpaceMarkToNumber();
  const setNumberDigits = (animate = true) => {
    numberNode.classList.remove('is-digit-looping');
    numberNode.replaceChildren();
    '500000'.split('').forEach((digit, index) => {
      const digitNode = document.createElement('span');
      digitNode.className = 's-main-hero-digit';
      digitNode.style.setProperty('--s-main-digit-delay', `${index * 250}ms`);
      digitNode.textContent = digit;
      numberNode.appendChild(digitNode);
      if (index === 2) {
        const apostrophe = document.createElement('span');
        apostrophe.className = 's-main-hero-apostrophe';
        apostrophe.setAttribute('aria-hidden', 'true');
        apostrophe.textContent = "'";
        numberNode.appendChild(apostrophe);
      }
    });
    if (animate) requestAnimationFrame(() => numberNode.classList.add('is-digit-looping'));
  };
  const animateNumber = () => {
    if (numberAnimationHasRun) return;
    numberAnimationHasRun = true;
    if (numberFrame) cancelAnimationFrame(numberFrame);
    setNumber(0);
    if (reducedMotion.matches) {
      setNumber(numberTarget);
      setNumberDigits(false);
      enableSpaceMarkFit();
      return;
    }
    const startedAt = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / numberDurationMs);
      setNumber(numberTarget * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) {
        numberFrame = requestAnimationFrame(step);
      } else {
        numberFrame = 0;
        setNumber(numberTarget);
        setNumberDigits();
        enableSpaceMarkFit();
      }
    };
    numberFrame = requestAnimationFrame(step);
  };

  applyLanguage(root.lang === 'ar' ? 'ar' : 'en', { emit: false });
  applyTheme('dark');
  setMenuOpen(false);
  pulseTargets.forEach((target) => {
    target.addEventListener('pointerdown', () => {
      target.classList.remove('is-pulsing');
      requestAnimationFrame(() => target.classList.add('is-pulsing'));
    }, { passive: true });
    target.addEventListener('animationend', (event) => {
      if (event.target === target && event.animationName === 's-page-composer-pulse') {
        target.classList.remove('is-pulsing');
      }
    });
  });
  if ('IntersectionObserver' in window) {
    const numberObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.target === numberNode && entry.isIntersecting) animateNumber(); });
    }, { threshold: 0.15 });
    numberObserver.observe(numberNode);
  } else {
    animateNumber();
  }

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  });
  document.addEventListener('pointerdown', (event) => {
    if (!composer.contains(event.target)) setMenuOpen(false);
  }, { passive: true });
  themeUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day');
  });
  languageUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyLanguage(root.lang === 'ar' ? 'en' : 'ar');
  });

  requestAnimationFrame(() => root.classList.remove('s-x-initializing'));
})();
