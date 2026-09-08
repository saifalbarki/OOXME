(() => {
  const root = document.documentElement;
  const page = document.querySelector('.s-page--update');
  const composer = document.querySelector('[data-s-composer]');
  const menu = document.querySelector('[data-s-composer-menu]');
  const menuPanel = document.querySelector('[data-s-composer-menu-panel]');
  const utilities = document.querySelector('[data-s-send-utilities]');
  const face = document.querySelector('.s-page__add');
  const submit = composer?.querySelector('.s-page__x-top-bar-submit');
  const theme = document.querySelector('[data-s-utility="theme"]');
  const language = document.querySelector('[data-s-utility="language"]');
  const input = composer?.querySelector('.s-page__composer-input');
  const firstGroup = document.querySelector('[data-s-first-group]');
  const updateScroll = document.querySelector('[data-s-update-scroll]');
  const title = firstGroup?.querySelector('.s-page__group-title');
  const labels = [...document.querySelectorAll('.s-page__composer-menu-label')];
  if (!page || !composer || !menu || !menuPanel || !utilities || !face || !submit || !theme || !language || !input || !firstGroup || !title || !updateScroll) return;

  const copy = {
    en: {
      title: 'What’s New in the Update?',
      menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'], placeholder: 'Type...', ask: 'Ask ooxme',
      home: 'Go to OOXME', submit: 'Submit question', toArabic: 'Switch to Arabic', toEnglish: 'Switch to English', toDay: 'Switch to Day Mode', toDark: 'Switch to Dark Mode'
    },
    ar: {
      title: 'ما الجديد في التحديث؟',
      menu: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'], placeholder: 'اكتب...', ask: 'اسأل اوكسوم',
      home: 'الذهاب إلى اوكسوم', submit: 'ارسال السؤال', toArabic: 'التبديل الى العربية', toEnglish: 'التبديل الى الانجليزية', toDay: 'التبديل الى الوضع النهاري', toDark: 'التبديل الى الوضع الداكن'
    }
  };

  const setText = (element, value) => {
    const fragment = document.createDocumentFragment();
    value.split('\n').forEach((line) => {
      const revealLine = document.createElement('span');
      revealLine.className = 's-page__reveal-line';
      revealLine.textContent = line;
      fragment.appendChild(revealLine);
    });
    element.replaceChildren(fragment);
  };
  const setRevealLineDelays = () => {
    firstGroup.querySelectorAll('.s-page__reveal-line').forEach((line, index) => {
      line.style.setProperty('--s-reveal-delay', `${index * 110}ms`);
    });
  };
  const syncTextGeometry = () => {
    const rect = menu.getBoundingClientRect();
    if (!rect.width) return;
    const style = getComputedStyle(menu);
    const borderStart = Number.parseFloat(style.borderInlineStartWidth) || 0;
    const borderEnd = Number.parseFloat(style.borderInlineEndWidth) || 0;
    const paddingStart = Number.parseFloat(style.paddingInlineStart) || 0;
    const paddingEnd = Number.parseFloat(style.paddingInlineEnd) || 0;
    const width = Math.max(0, rect.width - borderStart - borderEnd - paddingStart - paddingEnd - 16);
    const offset = (root.lang === 'ar' ? borderEnd + paddingEnd : borderStart + paddingStart) + 8;
    firstGroup.style.setProperty('--s-x-first-group-text-width', `${width.toFixed(3)}px`);
    firstGroup.style.setProperty('--s-x-first-group-text-inline-offset', `${offset.toFixed(3)}px`);
  };
  const applyLanguage = (next) => {
    const current = next === 'ar' ? 'ar' : 'en';
    const strings = copy[current];
    root.lang = current; root.dir = current === 'ar' ? 'rtl' : 'ltr';
    setText(title, strings.title); setRevealLineDelays();
    labels.forEach((label, index) => { label.textContent = strings.menu[index]; });
    input.placeholder = strings.placeholder; input.lang = current; input.dir = current === 'ar' ? 'rtl' : 'ltr';
    input.classList.toggle('is-arabic-input', current === 'ar'); input.classList.toggle('is-english-input', current === 'en');
    face.setAttribute('aria-label', strings.home); submit.setAttribute('aria-label', strings.submit);
    language.classList.toggle('is-active', current === 'en'); language.setAttribute('aria-pressed', String(current === 'en'));
    language.setAttribute('aria-label', current === 'en' ? strings.toArabic : strings.toEnglish);
    syncTextGeometry();
  };
  const applyTheme = (next) => {
    const day = next === 'day'; const strings = copy[root.lang === 'ar' ? 'ar' : 'en'];
    root.classList.toggle('is-day-mode', day); theme.classList.toggle('is-active', !day); theme.setAttribute('aria-pressed', String(!day));
    theme.setAttribute('aria-label', day ? strings.toDark : strings.toDay); document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000');
  };
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open); menuPanel.classList.toggle('is-open', open); utilities.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open)); menuPanel.setAttribute('aria-hidden', String(!open)); utilities.setAttribute('aria-hidden', String(!open));
  };
  const settleUpdateScroll = () => {
    requestAnimationFrame(() => {
      const maximum = Math.max(0, updateScroll.scrollHeight - updateScroll.clientHeight);
      const settled = Math.min(maximum, Math.max(0, updateScroll.scrollTop));
      if (Math.abs(updateScroll.scrollTop - settled) > .5) updateScroll.scrollTop = settled;
      if (updateScroll.scrollTop <= 1) updateScroll.scrollTop = 0;
    });
  };

  face.addEventListener('click', () => window.location.assign('/'));
  composer.addEventListener('submit', (event) => { event.preventDefault(); setMenu(!menu.classList.contains('is-open')); });
  document.addEventListener('pointerdown', (event) => {
    if (!menu.classList.contains('is-open')) return;
    const target = event.target;
    if (menu.contains(target) || menuPanel.contains(target) || utilities.contains(target) || composer.contains(target)) return;
    setMenu(false);
  });
  updateScroll.addEventListener('scrollend', settleUpdateScroll);
  document.addEventListener('pointerup', settleUpdateScroll, { passive: true });
  document.addEventListener('touchend', settleUpdateScroll, { passive: true });
  theme.addEventListener('click', () => applyTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day'));
  language.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar'));
  window.addEventListener('resize', syncTextGeometry, { passive: true });
  applyLanguage('en'); applyTheme('dark');
  requestAnimationFrame(() => { syncTextGeometry(); root.classList.remove('s-x-initializing'); firstGroup.querySelectorAll('[data-s-reveal]').forEach((element) => element.classList.add('is-visible')); });
})();
