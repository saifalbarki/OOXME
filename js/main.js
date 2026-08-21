const track = document.querySelector('[data-master-track]');
const HOMEPAGE_NAVIGATION_LOCKED = true;
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
const moreServicesLink = document.querySelector('[data-service-option="more-services"]');
if (moreServicesLink) moreServicesLink.href = 'services.html';
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
document.querySelectorAll('[data-search-toggle]').forEach((button) => button.addEventListener('click', (event) => {
  if (HOMEPAGE_NAVIGATION_LOCKED) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  event.stopPropagation();
  setSearchOpen(searchOverlay.hidden);
}));
searchOverlay.addEventListener('click', () => setSearchOpen(false));
searchOverlay.querySelectorAll('a, label, [data-search-suggestion]').forEach((element) => element.addEventListener('click', (event) => event.stopPropagation()));
searchInput.addEventListener('input', updateSearchState);
searchInput.addEventListener('focus', updateKeyboardSafeArea);
searchInput.addEventListener('blur', () => window.setTimeout(updateKeyboardSafeArea, 0));
visualViewport?.addEventListener('resize', updateKeyboardSafeArea);
visualViewport?.addEventListener('scroll', updateKeyboardSafeArea);
const panelIds = ['intro', 'portfolio', 'plans', 'services', 'consultation', 'contact'];
const originalPanels = [...track.querySelectorAll('.master-panel-screen')];
originalPanels.forEach((panel, index) => { panel.dataset.panelId = panelIds[index]; });
const plansPanel = track.querySelector('[data-panel-id="plans"]');
const servicesPanel = track.querySelector('[data-panel-id="services"]');
if (plansPanel && servicesPanel) track.insertBefore(servicesPanel, plansPanel);
const panels = [...document.querySelectorAll('.master-panel-screen')];
track.style.height = `${panels.length * 100}dvh`;
const requestedPanel = new URLSearchParams(window.location.search).get('panel');
const requestedPanelId = /^\d+$/.test(requestedPanel || '') ? panelIds[Number(requestedPanel)] : requestedPanel;
const requestedPanelIndex = HOMEPAGE_NAVIGATION_LOCKED ? 0 : panels.findIndex((panel) => panel.dataset.panelId === requestedPanelId);
let panelIndex = requestedPanelIndex >= 0 ? requestedPanelIndex : 0;
if (panelIndex) track.style.transform = `translateY(${-panelIndex * 100}dvh)`;
let panelTransitionTimer;
const revealPanel = (index) => {
  panels.forEach((panel, panelNumber) => panel.classList.toggle('is-active', panelNumber === index));
};
const moveTo = (next) => {
  if (HOMEPAGE_NAVIGATION_LOCKED) return;
  const target = Math.max(0, Math.min(panels.length - 1, next));
  if (target === panelIndex) return;
  panelIndex = target;
  panels.forEach((panel) => panel.classList.remove('is-active'));
  track.style.transform = `translateY(${-panelIndex * 100}dvh)`;
  window.clearTimeout(panelTransitionTimer);
  panelTransitionTimer = window.setTimeout(() => revealPanel(panelIndex), 620);
};
if (!HOMEPAGE_NAVIGATION_LOCKED) window.OOXMEMasterPanelDrag?.register({ experience, track, panels, getIndex: () => panelIndex, moveTo });
revealPanel(panelIndex);
const homepageBottomNavigation = document.querySelector('.homepage-bottom-navigation');
const homepageMenuTrigger = document.querySelector('[data-home-menu-trigger]');
const homepageMenu = document.querySelector('[data-home-menu]');
let homepageMenuInactivityTimer;
let homepageMenuSelectionTimer;
let homepageMenuCloseTimer;
const resetHomepageMenuInactivityTimer = () => {
  window.clearTimeout(homepageMenuInactivityTimer);
  if (!homepageBottomNavigation?.classList.contains('is-menu-open')) return;
  homepageMenuInactivityTimer = window.setTimeout(() => setHomepageMenuOpen(false), 5000);
};
const setHomepageMenuOpen = (open) => {
  if (!open) window.clearTimeout(homepageMenuSelectionTimer);
  window.clearTimeout(homepageMenuCloseTimer);
  if (open) {
    homepageBottomNavigation?.classList.remove('is-menu-closing');
    homepageBottomNavigation?.classList.add('is-menu-open');
  } else if (homepageBottomNavigation?.classList.contains('is-menu-open')) {
    homepageBottomNavigation.classList.remove('is-menu-open');
    homepageBottomNavigation.classList.add('is-menu-closing');
    homepageMenuCloseTimer = window.setTimeout(() => {
      homepageBottomNavigation.classList.remove('is-menu-closing');
      homepageMenuCloseTimer = undefined;
    }, 340);
  }
  homepageMenuTrigger?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('homepage-navigation-open', open);
  resetHomepageMenuInactivityTimer();
};
const setHomepageMenuActive = (active) => {
  if (!homepageMenu) return;
  homepageMenu.dataset.active = active;
  document.querySelectorAll('.homepage-bottom-menu-button').forEach((button) => {
    const selected = (active === 'account' && button.matches('[data-home-menu-account]')) || (active === 'gallery' && button.matches('[data-home-menu-gallery]')) || (active === 'home' && button.matches('[data-home-menu-home]')) || (active === 'search' && button.matches('[data-home-menu-search]')) || (active === 'menu' && button.matches('[data-home-menu-menu]'));
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
};
const queueHomepageMenuSelection = (active, action) => {
  setHomepageMenuActive(active);
  resetHomepageMenuInactivityTimer();
  window.clearTimeout(homepageMenuSelectionTimer);
  homepageMenuSelectionTimer = window.setTimeout(() => {
    homepageMenuSelectionTimer = undefined;
    if (action) action();
    else setHomepageMenuOpen(false);
  }, 3000);
};
homepageMenuTrigger?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  setHomepageMenuOpen(!homepageBottomNavigation.classList.contains('is-menu-open'));
});
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => setHomepageMenuOpen(false)));
document.querySelector('[data-home-menu-home]')?.addEventListener('click', () => {
  queueHomepageMenuSelection('home', () => {
    setHomepageMenuOpen(false);
    moveTo(0);
  });
});
document.querySelector('[data-home-menu-account]')?.addEventListener('click', () => queueHomepageMenuSelection('account'));
document.querySelector('[data-home-menu-gallery]')?.addEventListener('click', () => queueHomepageMenuSelection('gallery'));
document.querySelector('[data-home-menu-search]')?.addEventListener('click', () => queueHomepageMenuSelection('search'));
document.querySelector('[data-home-menu-menu]')?.addEventListener('click', () => queueHomepageMenuSelection('menu'));
document.addEventListener('pointerdown', (event) => {
  if (!homepageBottomNavigation?.classList.contains('is-menu-open')) return;
  resetHomepageMenuInactivityTimer();
  if (event.target.closest('[data-language-toggle]')) return;
  if (event.target.closest('.homepage-bottom-menu-button, [data-home-menu-trigger]')) return;
  setHomepageMenuOpen(false);
  event.preventDefault();
  event.stopPropagation();
}, true);
document.addEventListener('pointermove', resetHomepageMenuInactivityTimer, { passive: true });
document.addEventListener('keydown', resetHomepageMenuInactivityTimer);
document.addEventListener('wheel', resetHomepageMenuInactivityTimer, { passive: true });
document.querySelectorAll('[data-next-panel]').forEach((button) => button.addEventListener('click', () => moveTo(panelIndex + 1)));
document.querySelectorAll('[data-home-panel]').forEach((button) => button.addEventListener('click', () => moveTo(0)));
searchOverlay.querySelectorAll('[data-panel-index]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  setSearchOpen(false);
  const targetIndex = panels.findIndex((panel) => panel.dataset.panelId === panelIds[Number(link.dataset.panelIndex)]);
  if (targetIndex >= 0) moveTo(targetIndex);
}));
