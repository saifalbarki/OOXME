(() => {
  'use strict';

  const page = document.querySelector('.s-page--brand-management');
  const composer = document.querySelector('[data-s-composer]');
  const menu = document.querySelector('[data-s-composer-menu]');
  const utilities = document.querySelector('[data-s-send-utilities]');
  const addButton = document.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  const themeButton = document.querySelector('[data-s-utility="theme"]');
  const languageButton = document.querySelector('[data-s-utility="language"]');
  const firstGroup = document.querySelector('[data-s-first-group]');
  const title = document.querySelector('[data-s-first-typewriter]');
  const output = document.querySelector('[data-s-first-typewriter-output]');
  const menuItems = Array.from(document.querySelectorAll('.s-page__composer-menu-item'));
  if (!page || !composer || !menu || !utilities || !addButton || !submitButton || !themeButton || !languageButton || !firstGroup || !title || !output) return;

  const copy = {
    en: {
      menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'],
      switchToArabic: 'Switch to Arabic', switchToEnglish: 'Switch to English',
      switchToDay: 'Switch to Day Mode', switchToDark: 'Switch to Dark Mode'
    },
    ar: {
      menu: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'],
      switchToArabic: 'التبديل الى العربية', switchToEnglish: 'التبديل الى الانجليزية',
      switchToDay: 'التبديل الى الوضع النهاري', switchToDark: 'التبديل الى الوضع الداكن'
    }
  };
  const phrases = {
    en: ['Welcome', 'To OOXME', "Iraq's one and only brand management"],
    ar: ['مرحبـــا', 'فيـ اوكسوم', 'ادارة العلامة التجارية الواحد والوحيد في العراق']
  };
  let typeTimer = 0;
  let typeRun = 0;
  let baselineFrame = 0;
  let baselineLocked = false;

  const schedule = (callback, delay, run) => {
    typeTimer = window.setTimeout(() => { if (run === typeRun) callback(); }, delay);
  };

  const startTypewriter = () => {
    window.clearTimeout(typeTimer);
    typeRun += 1;
    const run = typeRun;
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const sequence = phrases[language];
    let phraseIndex = 0;
    title.lang = language;
    title.dir = 'ltr';
    output.lang = language;
    output.dir = language === 'ar' ? 'rtl' : 'ltr';
    output.textContent = '';
    title.classList.add('is-typewriter-prelude');
    const typePhrase = () => {
      const phrase = sequence[phraseIndex];
      let characterIndex = 0;
      title.classList.remove('is-typewriter-prelude');
      const typeCharacter = () => {
        characterIndex += 1;
        output.textContent = phrase.slice(0, characterIndex);
        if (characterIndex < phrase.length) return schedule(typeCharacter, 52, run);
        schedule(erasePhrase, 520, run);
      };
      schedule(typeCharacter, 52, run);
    };
    const erasePhrase = () => {
      const eraseCharacter = () => {
        const current = output.textContent;
        output.textContent = current.slice(0, -1);
        if (current.length > 1) return schedule(eraseCharacter, 32, run);
        phraseIndex = (phraseIndex + 1) % sequence.length;
        schedule(typePhrase, 180, run);
      };
      schedule(eraseCharacter, 32, run);
    };
    schedule(typePhrase, 1000, run);
  };

  const syncTextGeometry = () => {
    const menuRect = menu.getBoundingClientRect();
    if (!menuRect.width) return;
    const style = getComputedStyle(menu);
    const borderStart = Number.parseFloat(style.borderInlineStartWidth) || 0;
    const borderEnd = Number.parseFloat(style.borderInlineEndWidth) || 0;
    const paddingStart = Number.parseFloat(style.paddingInlineStart) || 0;
    const paddingEnd = Number.parseFloat(style.paddingInlineEnd) || 0;
    const textWidth = Math.max(0, menuRect.width - borderStart - borderEnd - paddingStart - paddingEnd - 16);
    const inlineOffset = document.documentElement.lang === 'ar'
      ? borderEnd + paddingEnd + 8
      : borderStart + paddingStart + 8;
    firstGroup.style.setProperty('--s-x-first-group-text-width', `${textWidth.toFixed(3)}px`);
    firstGroup.style.setProperty('--s-x-first-group-text-inline-offset', `${inlineOffset.toFixed(3)}px`);
  };

  const syncBaseline = () => {
    baselineFrame = 0;
    if (baselineLocked) return;
    const x = composer.getBoundingClientRect().top;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    const targetBottom = document.documentElement.clientHeight - (x * (portrait ? 1 : .5));
    const difference = title.getBoundingClientRect().bottom - targetBottom;
    const correction = Number.parseFloat(firstGroup.style.getPropertyValue('--s-first-group-baseline-correction')) || 0;
    firstGroup.setAttribute('data-s-first-group-baseline', targetBottom.toFixed(3));
    firstGroup.setAttribute('data-s-first-group-bottom', title.getBoundingClientRect().bottom.toFixed(3));
    firstGroup.setAttribute('data-s-first-group-baseline-difference', difference.toFixed(3));
    if (Math.abs(difference) <= .005) { baselineLocked = true; return; }
    firstGroup.style.setProperty('--s-first-group-baseline-correction', `${(correction + difference).toFixed(3)}px`);
    baselineFrame = window.requestAnimationFrame(syncBaseline);
  };

  const layout = () => {
    syncTextGeometry();
    baselineLocked = false;
    if (!baselineFrame) baselineFrame = window.requestAnimationFrame(syncBaseline);
  };

  const updateLabels = () => {
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const labels = copy[language];
    menuItems.forEach((item, index) => { item.querySelector('.s-page__composer-menu-label').textContent = labels.menu[index]; });
    languageButton.classList.toggle('is-active', language === 'en');
    languageButton.setAttribute('aria-pressed', String(language === 'en'));
    languageButton.setAttribute('aria-label', language === 'en' ? labels.switchToArabic : labels.switchToEnglish);
    themeButton.setAttribute('aria-label', document.documentElement.classList.contains('is-day-mode') ? labels.switchToDark : labels.switchToDay);
  };

  const applyLanguage = (language) => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    updateLabels();
    startTypewriter();
    layout();
  };
  const applyTheme = (theme) => {
    const isDay = theme === 'day';
    document.documentElement.classList.toggle('is-day-mode', isDay);
    themeButton.classList.toggle('is-active', !isDay);
    themeButton.setAttribute('aria-pressed', String(!isDay));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDay ? '#FFFFFF' : '#000000');
    updateLabels();
  };

  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    utilities.classList.toggle('is-open', open);
    utilities.setAttribute('aria-hidden', String(!open));
    submitButton.classList.toggle('is-active', open);
    if (open) composer.style.setProperty('--s-composer-menu-height', `${menu.offsetHeight}px`);
  };

  const setupFace = () => {
    const face = addButton.querySelector('[data-s-x-face]');
    const shell = face?.querySelector('.s-page__x-face-shell');
    const eyes = face?.querySelector('.s-page__x-face-eyes');
    const motion = face?.querySelector('.s-page__x-face-eye-motion');
    if (!face || !shell || !eyes || !motion) return;
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
      window.requestAnimationFrame(render);
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
    window.requestAnimationFrame(render);
  };

  composer.addEventListener('submit', (event) => { event.preventDefault(); setOpen(!menu.classList.contains('is-open')); });
  composer.addEventListener('pointerdown', (event) => { if (event.target === composer) composer.classList.add('is-pulsing'); }, { passive: true });
  composer.addEventListener('animationend', () => composer.classList.remove('is-pulsing'));
  menuItems.forEach((item) => item.addEventListener('pointerdown', () => { item.classList.add('is-active'); window.setTimeout(() => item.classList.remove('is-active'), 120); }, { passive: true }));
  addButton.addEventListener('click', () => { window.location.assign('/x'); });
  themeButton.addEventListener('click', (event) => { event.stopPropagation(); applyTheme(document.documentElement.classList.contains('is-day-mode') ? 'dark' : 'day'); });
  languageButton.addEventListener('click', (event) => { event.stopPropagation(); applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar'); });
  document.addEventListener('pointerdown', (event) => { if (!composer.contains(event.target)) setOpen(false); }, { passive: true });
  window.addEventListener('resize', layout, { passive: true });
  window.addEventListener('orientationchange', layout, { passive: true });

  applyLanguage('en');
  applyTheme('dark');
  setupFace();
  document.fonts?.ready.then(layout);
  window.requestAnimationFrame(() => document.documentElement.classList.remove('s-x-initializing'));
})();
