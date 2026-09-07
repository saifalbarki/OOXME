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
  const title = firstGroup?.querySelector('.s-page__group-title');
  const description = firstGroup?.querySelector('.s-page__group-description');
  const labels = [...document.querySelectorAll('.s-page__composer-menu-label')];
  if (!page || !composer || !menu || !menuPanel || !utilities || !face || !submit || !theme || !language || !input || !firstGroup || !title || !description) return;

  const copy = {
    en: {
      title: 'Welcome\nOur Next Client', description: 'Iraq’s one and only brand management service\nPremium business development service',
      menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'], placeholder: 'Type...', ask: 'Ask ooxme',
      home: 'Go to OOXME', submit: 'Submit question', toArabic: 'Switch to Arabic', toEnglish: 'Switch to English', toDay: 'Switch to Day Mode', toDark: 'Switch to Dark Mode'
    },
    ar: {
      title: 'مرحبــا\nعميلنا القادم', description: 'ادارة العلامات التجارية الواحد والوحيد في العراق\nخدمة بريميوم لتطوير الاعمال',
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
  const measureTextHeight = (element, value, language) => {
    const width = element.getBoundingClientRect().width;
    if (!width) return 0;
    const probe = element.cloneNode(false);
    probe.removeAttribute('id');
    probe.removeAttribute('data-s-reveal');
    probe.lang = language;
    probe.dir = language === 'ar' ? 'rtl' : 'ltr';
    Object.assign(probe.style, {
      position: 'fixed', inset: '0 auto auto -10000px', width: `${width}px`, maxWidth: 'none', height: 'auto', minHeight: '0', margin: '0', opacity: '1', filter: 'none', clipPath: 'none', visibility: 'hidden', pointerEvents: 'none', transition: 'none',
      fontFamily: language === 'ar' ? 'OOXMETosh, OOXMEScript, Arial, sans-serif' : 'OOXMEScript, OOXMEEnglish, Arial, sans-serif'
    });
    setText(probe, value);
    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
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
  let baselineFrame = 0;
  const syncBaseline = () => {
    baselineFrame = 0;
    const x = composer.getBoundingClientRect().top;
    const target = root.clientHeight - (x * (matchMedia('(orientation: portrait)').matches ? 1 : .5));
    const delta = description.getBoundingClientRect().bottom - target;
    if (Math.abs(delta) <= .005) return;
    firstGroup.style.setProperty('--s-first-group-baseline-correction', `${((Number.parseFloat(firstGroup.style.getPropertyValue('--s-first-group-baseline-correction')) || 0) + delta).toFixed(3)}px`);
    baselineFrame = requestAnimationFrame(syncBaseline);
  };
  const applyLanguage = (next) => {
    const current = next === 'ar' ? 'ar' : 'en';
    const strings = copy[current];
    root.lang = current; root.dir = current === 'ar' ? 'rtl' : 'ltr';
    setText(title, strings.title); setText(description, strings.description); setRevealLineDelays();
    labels.forEach((label, index) => { label.textContent = strings.menu[index]; });
    input.placeholder = strings.placeholder; input.lang = current; input.dir = current === 'ar' ? 'rtl' : 'ltr';
    input.classList.toggle('is-arabic-input', current === 'ar'); input.classList.toggle('is-english-input', current === 'en');
    face.setAttribute('aria-label', strings.home); submit.setAttribute('aria-label', strings.submit);
    language.classList.toggle('is-active', current === 'en'); language.setAttribute('aria-pressed', String(current === 'en'));
    language.setAttribute('aria-label', current === 'en' ? strings.toArabic : strings.toEnglish);
    syncTextGeometry();
    title.style.height = `${Math.ceil(measureTextHeight(title, strings.title, current))}px`;
    description.style.height = `${Math.ceil(measureTextHeight(description, strings.description, current))}px`;
    firstGroup.style.removeProperty('--s-first-group-baseline-correction');
    if (!baselineFrame) baselineFrame = requestAnimationFrame(syncBaseline);
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

  face.addEventListener('click', () => window.location.assign('/x'));
  composer.addEventListener('submit', (event) => { event.preventDefault(); setMenu(!menu.classList.contains('is-open')); });
  theme.addEventListener('click', () => applyTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day'));
  language.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar'));
  window.addEventListener('resize', () => { syncTextGeometry(); firstGroup.style.removeProperty('--s-first-group-baseline-correction'); if (!baselineFrame) baselineFrame = requestAnimationFrame(syncBaseline); }, { passive: true });
  applyLanguage('en'); applyTheme('dark');
  requestAnimationFrame(() => { syncTextGeometry(); if (!baselineFrame) baselineFrame = requestAnimationFrame(syncBaseline); root.classList.remove('s-x-initializing'); firstGroup.querySelectorAll('[data-s-reveal]').forEach((element) => element.classList.add('is-visible')); });
})();
