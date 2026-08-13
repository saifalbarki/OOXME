const track = document.querySelector('[data-master-track]');
const SERVICES_NAVIGATION_ENABLED = true;
const CONSULTATION_NAVIGATION_ENABLED = true;
const blockNavigation = (selector, enabled) => document.querySelectorAll(selector).forEach((action) => action.addEventListener('click', (event) => {
  if (enabled) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true));
blockNavigation('[data-service-option]:not([data-service-option="brand-management"])', SERVICES_NAVIGATION_ENABLED);
blockNavigation('[data-consultation-option]', CONSULTATION_NAVIGATION_ENABLED);
const brandsWeDesignedLink = document.querySelector('[data-portfolio-option="brands-we-designed"]');
if (brandsWeDesignedLink) brandsWeDesignedLink.href = 'brands-designed-gallery.html';
const uniqueWorksLink = document.querySelector('[data-portfolio-option="unique-works"]');
if (uniqueWorksLink) uniqueWorksLink.href = 'unique-works-gallery.html';
const experience = document.querySelector('.master-panel-experience');
const root = document.documentElement;
const searchInput = document.querySelector('[data-search-input]');
const applyLanguage = (language) => {
  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[language]; });
  searchInput.placeholder = searchInput.dataset[`${language}Placeholder`];
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.setAttribute('aria-label', language === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'));
  try { localStorage.setItem('ooxme-language', language); } catch (_) {}
};
let language = 'en';
try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
applyLanguage(language);
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar')));
window.addEventListener('storage', (event) => { if (event.key === 'ooxme-language') applyLanguage(event.newValue === 'ar' ? 'ar' : 'en'); });
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchSuggestion = document.querySelector('[data-search-suggestion]');
const visualViewport = window.visualViewport;
const initialVisualViewportHeight = visualViewport?.height ?? window.innerHeight;
let searchCloseTimer;
const searchOverlayCloseDuration = 1450;
const resizeSearchInput = () => {
  searchInput.style.height = '24px';
  searchInput.style.height = `${searchInput.scrollHeight}px`;
  searchOverlay.querySelector('.search-overlay-field').style.height = `${Math.max(48, searchInput.scrollHeight + 24)}px`;
};
const updateKeyboardSafeArea = () => {
  if (!visualViewport) return;
  searchOverlay.style.setProperty('--visual-viewport-height', `${visualViewport.height}px`);
  searchOverlay.style.setProperty('--visual-viewport-top', `${visualViewport.offsetTop}px`);
  const keyboardOpen = document.activeElement === searchInput && initialVisualViewportHeight - visualViewport.height > 120;
  searchOverlay.classList.toggle('is-keyboard-open', keyboardOpen);
};
const updateSearchState = () => {
  const query = searchInput.value.trim();
  searchOverlay.classList.toggle('is-typing', Boolean(query));
  searchSuggestion.hidden = !query;
  if (query) searchSuggestion.textContent = root.lang === 'ar' ? `اقتراح: «${query}»` : `Search for “${query}”`;
  resizeSearchInput();
};
const setSearchOpen = (open) => {
  window.clearTimeout(searchCloseTimer);
  if (open) {
    searchOverlay.hidden = false;
    updateSearchState();
    window.requestAnimationFrame(() => searchOverlay.classList.add('is-open'));
    return;
  }
  searchOverlay.classList.remove('is-open');
  searchCloseTimer = window.setTimeout(() => { searchOverlay.hidden = true; }, searchOverlayCloseDuration);
};
document.querySelectorAll('[data-search-toggle]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); setSearchOpen(searchOverlay.hidden); }));
searchOverlay.addEventListener('click', () => setSearchOpen(false));
searchOverlay.querySelectorAll('a, label, [data-search-suggestion]').forEach((element) => element.addEventListener('click', (event) => event.stopPropagation()));
searchInput.addEventListener('input', updateSearchState);
searchInput.addEventListener('focus', updateKeyboardSafeArea);
searchInput.addEventListener('blur', () => window.setTimeout(updateKeyboardSafeArea, 0));
visualViewport?.addEventListener('resize', updateKeyboardSafeArea);
visualViewport?.addEventListener('scroll', updateKeyboardSafeArea);
const panels = [...document.querySelectorAll('.master-panel-screen')];
track.style.height = `${panels.length * 100}dvh`;
const requestedPanel = Number(new URLSearchParams(window.location.search).get('panel'));
let panelIndex = Number.isInteger(requestedPanel) && requestedPanel >= 0 && requestedPanel < panels.length ? requestedPanel : 0;
if (panelIndex) track.style.transform = `translateY(${-panelIndex * 100}dvh)`;
let panelTransitionTimer;
const revealPanel = (index) => {
  panels.forEach((panel, panelNumber) => panel.classList.toggle('is-active', panelNumber === index));
};
const moveTo = (next) => {
  const target = Math.max(0, Math.min(panels.length - 1, next));
  if (target === panelIndex) return;
  panelIndex = target;
  panels.forEach((panel) => panel.classList.remove('is-active'));
  track.style.transform = `translateY(${-panelIndex * 100}dvh)`;
  window.clearTimeout(panelTransitionTimer);
  panelTransitionTimer = window.setTimeout(() => revealPanel(panelIndex), 620);
};
window.OOXMEMasterPanelDrag?.register({ experience, track, panels, getIndex: () => panelIndex, moveTo });
revealPanel(panelIndex);
document.querySelectorAll('[data-next-panel]').forEach((button) => button.addEventListener('click', () => moveTo(panelIndex + 1)));
document.querySelectorAll('[data-home-panel]').forEach((button) => button.addEventListener('click', () => moveTo(0)));
searchOverlay.querySelectorAll('[data-panel-index]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  setSearchOpen(false);
  moveTo(Number(link.dataset.panelIndex));
}));
