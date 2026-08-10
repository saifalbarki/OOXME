const root = document.documentElement;
const searchInput = document.querySelector('[data-search-input]');
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchSuggestion = document.querySelector('[data-search-suggestion]');
const pages = {
  'brands-we-manage': { en: ['Portfolio', 'Brands We Manage'], ar: ['المعــــرض', 'العلامات التي نديرها'] },
  'brands-we-designed': { en: ['Portfolio', 'Brands We Designed'], ar: ['المعــــرض', 'العلامات التي صممناها'] },
  'unique-works': { en: ['Portfolio', 'Unique Works'], ar: ['المعــــرض', 'اعمــــال مميزة'] },
  start: { en: ['Growth Plans', 'Start'], ar: ['باقات النمو', 'البداية'] },
  standard: { en: ['Growth Plans', 'Standard'], ar: ['باقات النمو', 'القياسية'] },
  premium: { en: ['Growth Plans', 'Premium'], ar: ['باقات النمو', 'المميزة'] },
  'consultation-booking': { en: ['Consultation', 'Book a Consultation'], ar: ['استشارة', 'حجز موعد استشارة'] },
  'brand-management': { en: ['Services', 'Brand Management'], ar: ['الخدمات', 'ادارة العلامة التجارية'] },
  'brand-development': { en: ['Services', 'Brand Development'], ar: ['الخدمات', 'تطوير العلامة التجارية'] },
  'more-services': { en: ['Services', 'More Services'], ar: ['الخدمات', 'المزيد من الخدمات'] }
};
const target = new URLSearchParams(window.location.search).get('target');
const page = pages[target] ?? pages['brands-we-manage'];
const applyLanguage = (language) => {
  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelector('[data-internal-label]').textContent = page[language][0];
  document.querySelector('[data-internal-title]').textContent = page[language][1];
  document.querySelector('[data-internal-description]').textContent = language === 'ar' ? 'هذه البنية المشتركة جاهزة للمحتوى التفصيلي.' : 'This shared page structure is ready for its detailed content.';
  document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[language]; });
  searchInput.placeholder = searchInput.dataset[`${language}Placeholder`];
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.setAttribute('aria-label', language === 'ar' ? 'التبديل الى الانجليزية' : 'Switch to Arabic'));
  try { localStorage.setItem('ooxme-language', language); } catch (_) {}
};
let language = 'en';
try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
applyLanguage(language);
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar')));
window.addEventListener('storage', (event) => { if (event.key === 'ooxme-language') applyLanguage(event.newValue === 'ar' ? 'ar' : 'en'); });
let searchCloseTimer;
const setSearchOpen = (open) => {
  window.clearTimeout(searchCloseTimer);
  if (open) {
    searchOverlay.hidden = false;
    window.requestAnimationFrame(() => searchOverlay.classList.add('is-open'));
    return;
  }
  searchOverlay.classList.remove('is-open');
  searchCloseTimer = window.setTimeout(() => { searchOverlay.hidden = true; }, 1450);
};
document.querySelectorAll('[data-search-toggle]').forEach((button) => button.addEventListener('click', () => setSearchOpen(searchOverlay.hidden)));
searchOverlay.addEventListener('click', () => setSearchOpen(false));
searchOverlay.querySelectorAll('a, label, [data-search-suggestion]').forEach((element) => element.addEventListener('click', (event) => event.stopPropagation()));
const visualViewport = window.visualViewport;
const initialVisualViewportHeight = visualViewport?.height ?? window.innerHeight;
const updateKeyboardSafeArea = () => {
  if (!visualViewport) return;
  searchOverlay.style.setProperty('--visual-viewport-height', `${visualViewport.height}px`);
  searchOverlay.style.setProperty('--visual-viewport-top', `${visualViewport.offsetTop}px`);
  const keyboardOpen = document.activeElement === searchInput && initialVisualViewportHeight - visualViewport.height > 120;
  searchOverlay.classList.toggle('is-keyboard-open', keyboardOpen);
};
const resizeSearchInput = () => {
  searchInput.style.height = '20px';
  searchInput.style.height = `${searchInput.scrollHeight}px`;
  searchOverlay.querySelector('.search-overlay-field').style.height = `${Math.max(48, searchInput.scrollHeight + 28)}px`;
};
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  searchOverlay.classList.toggle('is-typing', Boolean(query));
  searchSuggestion.hidden = !query;
  if (query) searchSuggestion.textContent = root.lang === 'ar' ? `اقتراح: «${query}»` : `Search for “${query}”`;
  resizeSearchInput();
});
searchInput.addEventListener('focus', updateKeyboardSafeArea);
searchInput.addEventListener('blur', () => window.setTimeout(updateKeyboardSafeArea, 0));
visualViewport?.addEventListener('resize', updateKeyboardSafeArea);
visualViewport?.addEventListener('scroll', updateKeyboardSafeArea);
