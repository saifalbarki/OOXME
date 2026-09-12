(() => {
  'use strict';
  const root = document.documentElement;
  const page = document.querySelector('.s-page--update');
  const composer = page?.querySelector('[data-s-composer]');
  const menu = page?.querySelector('[data-s-composer-menu]');
  const menuPanel = page?.querySelector('[data-s-composer-menu-panel]');
  const utilities = page?.querySelector('[data-s-send-utilities]');
  const face = page?.querySelector('.s-page__add');
  const submit = page?.querySelector('.s-page__x-top-bar-submit');
  const theme = page?.querySelector('[data-s-utility="theme"]');
  const language = page?.querySelector('[data-s-utility="language"]');
  const input = page?.querySelector('.s-page__composer-input');
  const cards = [...page?.querySelectorAll('[data-update-card]') || []];
  const viewport = page?.querySelector('[data-update-carousel-viewport]');
  const track = page?.querySelector('[data-update-carousel-track]');
  const previous = page?.querySelector('[data-update-prev]');
  const next = page?.querySelector('[data-update-next]');
  const counter = page?.querySelector('[data-update-counter]');
  if (!page || !composer || !menu || !menuPanel || !utilities || !face || !submit || !theme || !language || !input || cards.length !== 6 || !viewport || !track || !previous || !next || !counter) return;

  const menuCopy = { en: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'], ar: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'] };
  const utilityCopy = { en: { submit: 'Submit question', previous: 'Previous card', next: 'Next card', nav: 'Card navigation', toArabic: 'Switch to Arabic', toDay: 'Switch to Day Mode', toDark: 'Switch to Dark Mode' }, ar: { submit: 'ارسال السؤال', previous: 'البطاقة السابقة', next: 'البطاقة التالية', nav: 'التنقل بين البطاقات', toEnglish: 'Switch to English', toDay: 'التبديل الى الوضع النهاري', toDark: 'التبديل الى الوضع الداكن' } };
  const cardCopy = {
    en: [
      { title: 'Reengineered', description: 'We rebuilt the OOXME operating system for engineering, construction, contracting, and related sectors, with more precise management and execution.' },
      { title: 'Website Launch', description: 'The OOXME website is officially live: a new space to explore our services and work, connect with us, and work together more smoothly.' },
      { title: 'OXO Persona', description: 'Meet OXO, the new OOXME persona: a clean, premium, minimal character joining the brand experience on our website before expanding across other platforms.' },
      { title: 'Consultation Open', description: 'Our consultation service is now available to support clearer decisions and confident next steps, with a special limited-time launch discount.' },
      { title: 'The Store', description: 'The OOXME Store has entered its first stage, with products and digital offerings added progressively in one OOXME experience.' },
      { title: 'Continuous Publishing', description: 'We introduced continuous publishing across platforms to keep updates consistent, improve reach, and create more value for clients and the OOXME community.' }
    ],
    ar: [
      { title: 'اعادة هندسة', description: 'اعادة بناء نظام اوكسوم التشغيلي للهندسة والانشاءات والمقاولات والقطاعات ذات الصلة، بادارة وتنفيذ اكثر دقة.' },
      { title: 'اطلاق الموقع', description: 'موقع اوكسوم متاح رسميا: مساحة جديدة لاستكشاف خدماتنا واعمالنا، والتواصل معنا، والعمل معا بسلاسة اكبر.' },
      { title: 'شخصية اوكسو', description: 'تعرفوا على اوكسو، شخصية اوكسوم الجديدة: شخصية نظيفة وراقية وبسيطة تنضم الى تجربة العلامة على موقعنا قبل توسعها الى منصات اخرى.' },
      { title: 'فتح الاستشارات', description: 'اصبحت خدمة الاستشارات متاحة لدعم قرارات اوضح وخطوات تالية اكثر ثقة، مع خصم اطلاق خاص لفترة محدودة.' },
      { title: 'المتجر', description: 'دخل متجر اوكسوم مرحلته الاولى، مع اضافة المنتجات والعروض الرقمية تدريجيا ضمن تجربة اوكسوم واحدة.' },
      { title: 'النشر المستمر', description: 'اطلقنا النشر المستمر عبر المنصات للحفاظ على اتساق التحديثات، وتحسين الوصول، وتقديم قيمة اكبر للعملاء ومجتمع اوكسوم.' }
    ]
  };
  let activeCard = 0;
  let drag = null;

  const syncCarousel = (animate = true, dragOffset = 0) => {
    const card = cards[activeCard];
    if (!card) return;
    const rtl = root.lang === 'ar';
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const centerOffset = (viewport.clientWidth / 2) - (card.offsetWidth / 2);
    const position = rtl ? -(track.scrollWidth - card.offsetWidth - centerOffset) + (activeCard * (card.offsetWidth + gap)) + dragOffset : centerOffset - (activeCard * (card.offsetWidth + gap)) + dragOffset;
    track.classList.toggle('is-dragging', !animate);
    track.style.transform = `translate3d(${position.toFixed(2)}px, 0, 0)`;
    cards.forEach((item, index) => { const active = index === activeCard; item.classList.toggle('is-active', active); item.setAttribute('aria-current', String(active)); item.dir = root.lang === 'ar' ? 'rtl' : 'ltr'; item.lang = root.lang === 'ar' ? 'ar' : 'en'; });
    counter.textContent = `${activeCard + 1} / ${cards.length}`;
    previous.disabled = activeCard === 0;
    next.disabled = activeCard === cards.length - 1;
  };
  const selectCard = (index) => { activeCard = Math.max(0, Math.min(cards.length - 1, index)); syncCarousel(); };
  const applyLanguage = (nextLanguage, { persist = true, emit = true } = {}) => {
    const current = nextLanguage === 'ar' ? 'ar' : 'en';
    const utility = utilityCopy[current];
    root.lang = current; root.dir = current === 'ar' ? 'rtl' : 'ltr'; input.lang = current; input.dir = current === 'ar' ? 'rtl' : 'ltr';
    page.querySelectorAll('.s-page__composer-menu-label').forEach((label, index) => { label.textContent = menuCopy[current][index]; });
    cards.forEach((card) => {
      const copy = cardCopy[current][Number(card.dataset.updateCardIndex)];
      card.querySelector('[data-update-copy="title"]').textContent = copy.title;
      card.querySelector('[data-update-copy="description"]').textContent = copy.description;
    });
    face.setAttribute('aria-label', current === 'ar' ? 'الذهاب الى اوكسوم' : 'Go to OOXME'); submit.setAttribute('aria-label', utility.submit); language.classList.toggle('is-active', current === 'en'); language.setAttribute('aria-pressed', String(current === 'en')); language.setAttribute('aria-label', current === 'en' ? utility.toArabic : utility.toEnglish); previous.setAttribute('aria-label', utility.previous); next.setAttribute('aria-label', utility.next); page.querySelector('[data-update-carousel-nav]').setAttribute('aria-label', utility.nav);
    syncCarousel(false);
    if (persist) try { localStorage.setItem('ooxme-language', current); } catch (_) {}
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language: current } }));
  };
  const applyTheme = (nextTheme) => { const day = nextTheme === 'day'; root.classList.toggle('is-day-mode', day); theme.classList.toggle('is-active', !day); theme.setAttribute('aria-pressed', String(!day)); theme.setAttribute('aria-label', day ? utilityCopy[root.lang === 'ar' ? 'ar' : 'en'].toDark : utilityCopy[root.lang === 'ar' ? 'ar' : 'en'].toDay); document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000'); };
  const setMenu = (open) => { menu.classList.toggle('is-open', open); menuPanel.classList.toggle('is-open', open); utilities.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open)); menuPanel.setAttribute('aria-hidden', String(!open)); utilities.setAttribute('aria-hidden', String(!open)); };

  previous.addEventListener('click', () => selectCard(activeCard - 1));
  next.addEventListener('click', () => selectCard(activeCard + 1));
  viewport.addEventListener('pointerdown', (event) => { if (event.target.closest('button')) return; drag = { id: event.pointerId, startX: event.clientX, delta: 0 }; viewport.setPointerCapture?.(event.pointerId); syncCarousel(false); });
  viewport.addEventListener('pointermove', (event) => { if (!drag || event.pointerId !== drag.id) return; drag.delta = event.clientX - drag.startX; syncCarousel(false, drag.delta); });
  const finishDrag = (event) => { if (!drag || event.pointerId !== drag.id) return; const delta = drag.delta; drag = null; if (Math.abs(delta) >= 42) selectCard(activeCard + ((delta < 0 ? 1 : -1) * (root.lang === 'ar' ? -1 : 1))); else syncCarousel(); };
  viewport.addEventListener('pointerup', finishDrag); viewport.addEventListener('pointercancel', finishDrag);
  face.addEventListener('click', () => window.location.assign('/'));
  composer.addEventListener('submit', (event) => { event.preventDefault(); setMenu(!menu.classList.contains('is-open')); });
  document.addEventListener('pointerdown', (event) => { if (menu.classList.contains('is-open') && !composer.contains(event.target)) setMenu(false); }, { passive: true });
  theme.addEventListener('click', () => applyTheme(root.classList.contains('is-day-mode') ? 'dark' : 'day'));
  language.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar'));
  window.addEventListener('ooxme-language-change', (event) => { if (event.detail?.language && event.detail.language !== root.lang) applyLanguage(event.detail.language, { persist: false, emit: false }); });
  window.addEventListener('resize', () => syncCarousel(false), { passive: true });
  let initialLanguage = 'en'; try { initialLanguage = localStorage.getItem('ooxme-language') || 'en'; } catch (_) {}
  applyLanguage(initialLanguage, { persist: false, emit: false }); applyTheme('dark'); syncCarousel(false);
  requestAnimationFrame(() => syncCarousel(false));
  document.fonts?.ready.then(() => syncCarousel(false));
  root.classList.remove('s-x-initializing');
})();
