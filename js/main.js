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
const setStableViewportHeight = () => root.style.setProperty('--ooxme-stable-viewport-height', `${window.innerHeight}px`);
setStableViewportHeight();
window.addEventListener('orientationchange', () => window.setTimeout(setStableViewportHeight, 160));
document.querySelectorAll('[data-progress]').forEach((progress) => {
  const value = Math.min(100, Math.max(0, Number(progress.dataset.progress) || 0));
  const segmentCount = 20;
  const completedSegments = Math.round((value / 100) * segmentCount);
  progress.setAttribute('aria-valuenow', String(value));
  progress.replaceChildren(...Array.from({ length: segmentCount }, (_, index) => {
    const segment = document.createElement('i');
    segment.classList.toggle('is-complete', index < completedSegments);
    return segment;
  }));
});
const searchInput = document.querySelector('[data-search-input]');
const applyLanguage = (next) => {
  language = next;
  root.lang = next;
  root.dir = next === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[next]; });
  searchInput.placeholder = searchInput.dataset[`${next}Placeholder`];
  document.querySelectorAll('[data-home-search-input]').forEach((input) => { input.placeholder = input.dataset[`${next}Placeholder`]; });
  document.querySelectorAll('[data-home-account-input]').forEach((input) => { input.placeholder = input.dataset[`${next}Placeholder`]; });
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.setAttribute('aria-label', next === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'));
  try { localStorage.setItem('ooxme-language', next); } catch (_) {}
  window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language: next } }));
};
let language = 'en';
try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
applyLanguage(language);
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar')));
window.addEventListener('storage', (event) => { if (event.key === 'ooxme-language') applyLanguage(event.newValue === 'ar' ? 'ar' : 'en'); });
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchSuggestion = document.querySelector('[data-search-suggestion]');
let searchCloseTimer;
const searchOverlayCloseDuration = 1450;
const resizeSearchInput = () => {
  searchInput.style.height = '24px';
  searchInput.style.height = `${searchInput.scrollHeight}px`;
  searchOverlay.querySelector('.search-overlay-field').style.height = `${Math.max(48, searchInput.scrollHeight + 24)}px`;
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
const panelIds = ['intro', 'portfolio', 'plans', 'services', 'consultation', 'contact', 'employee-dashboard'];
const originalPanels = [...track.querySelectorAll('.master-panel-screen')];
originalPanels.forEach((panel, index) => { panel.dataset.panelId = panelIds[index]; });
const plansPanel = track.querySelector('[data-panel-id="plans"]');
const servicesPanel = track.querySelector('[data-panel-id="services"]');
if (plansPanel && servicesPanel) track.insertBefore(servicesPanel, plansPanel);
const panels = [...document.querySelectorAll('.master-panel-screen')];
track.style.height = `calc(var(--ooxme-stable-viewport-height) * ${panels.length})`;
const requestedPanel = new URLSearchParams(window.location.search).get('panel');
const requestedPanelId = /^\d+$/.test(requestedPanel || '') ? panelIds[Number(requestedPanel)] : requestedPanel;
const requestedPanelIndex = HOMEPAGE_NAVIGATION_LOCKED && requestedPanelId !== 'employee-dashboard'
  ? 0
  : panels.findIndex((panel) => panel.dataset.panelId === requestedPanelId);
let panelIndex = requestedPanelIndex >= 0 ? requestedPanelIndex : 0;
if (panelIndex) track.style.transform = `translateY(calc(var(--ooxme-stable-viewport-height) * ${-panelIndex}))`;
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
  track.style.transform = `translateY(calc(var(--ooxme-stable-viewport-height) * ${-panelIndex}))`;
  window.clearTimeout(panelTransitionTimer);
  panelTransitionTimer = window.setTimeout(() => revealPanel(panelIndex), 620);
};
if (!HOMEPAGE_NAVIGATION_LOCKED) window.OOXMEMasterPanelDrag?.register({ experience, track, panels, getIndex: () => panelIndex, moveTo });
revealPanel(panelIndex);
const homepageBottomNavigation = document.querySelector('.homepage-bottom-navigation');
const homepageMenuTrigger = document.querySelector('[data-home-menu-trigger]');
const homepageMenu = document.querySelector('[data-home-menu]');
const homepageNotifications = document.querySelector('[data-notifications]');
const homepageSearch = document.querySelector('[data-home-search]');
const homepageAccount = document.querySelector('[data-home-account]');
const homepageServices = document.querySelector('[data-home-services]');
const homepageLanguage = document.querySelector('[data-home-language]');
const homepageLanguageSelector = document.querySelector('[data-home-language-selector]');
const homepageSearchInput = document.querySelector('[data-home-search-input]');
const homepageSearchSuggestions = document.querySelector('[data-home-search-suggestions]');
const normalizeSharedNotificationLayout = (container) => container?.querySelectorAll('[data-notification]').forEach((item) => {
  const date = item.querySelector('.homepage-notification-summary time');
  const details = item.querySelector('.homepage-notification-details');
  if (date && details) details.append(date);
});
normalizeSharedNotificationLayout(homepageNotifications);
homepageNotifications?.querySelectorAll('[data-notifications-option]').forEach((button) => button.addEventListener('click', () => {
  const selector = homepageNotifications.querySelector('[data-notifications-selector]');
  const panel = homepageNotifications.querySelector('[data-notifications-panel]');
  selector.dataset.active = button.dataset.notificationsOption;
  panel.dataset.active = button.dataset.notificationsOption;
  selector.querySelectorAll('[data-notifications-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
}));
const employeeDashboardNavigation = document.querySelector('[data-employee-dashboard-navigation]');
const employeeDashboardMenuTrigger = document.querySelector('[data-employee-dashboard-menu-trigger]');
const employeeDashboardMenu = document.querySelector('[data-employee-dashboard-menu]');
let homepageMenuInactivityTimer;
let homepageMenuSelectionTimer;
let homepageMenuCloseTimer;
let homepageNotificationsCloseTimer;
let homepageNotificationSelectionTimer;
let homepageSearchCloseTimer;
let homepageAccountCloseTimer;
let homepageServicesCloseTimer;
let homepageLanguageCloseTimer;
let employeeDashboardMenuTimer;
const setEmployeeDashboardMenuOpen = (open) => {
  if (!employeeDashboardNavigation || !employeeDashboardMenuTrigger) return;
  window.clearTimeout(employeeDashboardMenuTimer);
  const wasOpen = employeeDashboardNavigation.classList.contains('is-menu-open');
  employeeDashboardNavigation.classList.toggle('is-menu-open', open);
  employeeDashboardNavigation.classList.toggle('is-menu-closing', !open && wasOpen);
  employeeDashboardMenuTrigger.setAttribute('aria-expanded', String(open));
  employeeDashboardMenuTimer = window.setTimeout(() => {
    if (open) setEmployeeDashboardMenuOpen(false);
    else employeeDashboardNavigation.classList.remove('is-menu-closing');
  }, open ? 5000 : 340);
};
employeeDashboardMenuTrigger?.addEventListener('click', () => setEmployeeDashboardMenuOpen(!employeeDashboardNavigation.classList.contains('is-menu-open')));
employeeDashboardMenu?.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
  if (button.hasAttribute('data-employee-dashboard-menu-services')) return;
  const buttons = [...employeeDashboardMenu.querySelectorAll('button')];
  employeeDashboardMenu.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  employeeDashboardMenu.dataset.active = ['account', 'gallery', 'home', 'menu', 'services'][buttons.indexOf(button)];
}));
document.querySelector('[data-employee-dashboard-menu-notifications]')?.addEventListener('click', () => setHomepageNotificationsOpen(true));
document.addEventListener('pointerdown', (event) => {
  if (employeeDashboardNavigation?.classList.contains('is-menu-open') && !event.target.closest('[data-employee-dashboard-navigation]')) setEmployeeDashboardMenuOpen(false);
});
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
    const selected = (active === 'account' && button.matches('[data-home-menu-account]')) || (active === 'gallery' && button.matches('[data-home-menu-gallery]')) || (active === 'home' && button.matches('[data-home-menu-home]')) || (active === 'menu' && button.matches('[data-home-menu-menu]')) || (active === 'services' && button.matches('[data-home-menu-services]'));
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
};
const homepageOverlayMotionTimers = new WeakMap();
const prepareHomepageOverlayMotion = (overlay) => {
  window.clearTimeout(homepageOverlayMotionTimers.get(overlay));
  overlay.classList.add('is-animating');
  homepageOverlayMotionTimers.set(overlay, window.setTimeout(() => overlay.classList.remove('is-animating'), 420));
};
const setHomepageNotificationsOpen = (open) => {
  if (!homepageNotifications) return;
  window.clearTimeout(homepageNotificationsCloseTimer);
  if (open) {
    setHomepageMenuOpen(false);
    homepageNotifications.hidden = false;
    homepageNotifications.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-notifications-open');
      homepageNotifications.classList.add('is-open');
    });
    return;
  }
  homepageNotifications.classList.remove('is-open');
  document.body.classList.remove('homepage-notifications-open');
  homepageNotifications.setAttribute('aria-hidden', 'true');
  homepageNotificationsCloseTimer = window.setTimeout(() => { homepageNotifications.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const homepageSearchEntries = [
  { en: 'Reengineered', ar: 'إعادة هندسة' },
  { en: 'Ooxme v4.0', ar: 'التحديث الرابع لأوكسوم' },
  { en: 'Redesign Website', ar: 'إعادة تصميم الموقع' },
  { en: 'The Client Profile', ar: 'ملف العميل' },
  { en: 'The Gallery', ar: 'المعرض' },
  { en: 'Notifications', ar: 'الإشعارات' },
];
const renderHomepageSearchSuggestions = () => {
  if (!homepageSearchInput || !homepageSearchSuggestions) return;
  const query = homepageSearchInput.value.trim().toLocaleLowerCase();
  homepageSearchSuggestions.hidden = false;
  const matches = homepageSearchEntries
    .map((entry, index) => {
      const label = entry[root.lang === 'ar' ? 'ar' : 'en'];
      const normalized = label.toLocaleLowerCase();
      const position = normalized.indexOf(query);
      const overlap = [...query].filter((character) => normalized.includes(character)).length;
      return { entry, index, score: position < 0 ? 100 - overlap : position };
    })
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, 3);
  homepageSearchSuggestions.innerHTML = matches.map(({ entry }) => `<button class="homepage-search-suggestion" type="button">${entry[root.lang === 'ar' ? 'ar' : 'en']}</button>`).join('');
};
const setHomepageSearchOpen = (open) => {
  if (!homepageSearch) return;
  window.clearTimeout(homepageSearchCloseTimer);
  if (open) {
    setHomepageMenuOpen(false);
    homepageSearch.hidden = false;
    homepageSearch.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageSearch);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-search-open');
      homepageSearch.classList.add('is-open');
      renderHomepageSearchSuggestions();
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageSearch);
  homepageSearch.classList.remove('is-open');
  document.body.classList.remove('homepage-search-open');
  homepageSearch.setAttribute('aria-hidden', 'true');
  homepageSearchCloseTimer = window.setTimeout(() => { homepageSearch.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const setHomepageAccountOpen = (open) => {
  if (!homepageAccount) return;
  window.clearTimeout(homepageAccountCloseTimer);
  if (open) {
    setHomepageMenuOpen(false);
    homepageAccount.hidden = false;
    homepageAccount.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageAccount);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-account-open');
      homepageAccount.classList.add('is-open');
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageAccount);
  homepageAccount.classList.remove('is-open');
  document.body.classList.remove('homepage-account-open');
  homepageAccount.setAttribute('aria-hidden', 'true');
  homepageAccountCloseTimer = window.setTimeout(() => { homepageAccount.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const setHomepageServicesOpen = (open) => {
  if (!homepageServices) return;
  window.clearTimeout(homepageServicesCloseTimer);
  if (open) {
    setHomepageMenuOpen(false);
    setEmployeeDashboardMenuOpen(false);
    homepageServices.hidden = false;
    homepageServices.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageServices);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-services-open');
      homepageServices.classList.add('is-open');
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageServices);
  homepageServices.classList.remove('is-open');
  document.body.classList.remove('homepage-services-open');
  homepageServices.setAttribute('aria-hidden', 'true');
  homepageServicesCloseTimer = window.setTimeout(() => { homepageServices.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const setHomepageLanguageOpen = (open) => {
  if (!homepageLanguage || !homepageLanguageSelector) return;
  window.clearTimeout(homepageLanguageCloseTimer);
  if (open) {
    const activeLanguage = root.lang === 'ar' ? 'ar' : 'en';
    homepageLanguageSelector.dataset.active = activeLanguage;
    homepageLanguageSelector.querySelectorAll('[data-home-language-option]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.homeLanguageOption === activeLanguage)));
    setHomepageMenuOpen(false);
    homepageLanguage.hidden = false;
    homepageLanguage.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageLanguage);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-language-open');
      homepageLanguage.classList.add('is-open');
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageLanguage);
  homepageLanguage.classList.remove('is-open');
  document.body.classList.remove('homepage-language-open');
  homepageLanguage.setAttribute('aria-hidden', 'true');
  homepageLanguageCloseTimer = window.setTimeout(() => { homepageLanguage.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
document.querySelector('[data-employee-dashboard-menu-services]')?.addEventListener('click', () => setHomepageServicesOpen(true));
const queueHomepageMenuSelection = (active, action) => {
  setHomepageMenuActive(active);
  resetHomepageMenuInactivityTimer();
  window.clearTimeout(homepageMenuSelectionTimer);
  homepageMenuSelectionTimer = undefined;
  if (action) action();
  else setHomepageMenuOpen(false);
};
window.setTimeout(() => {
  if (homepageBottomNavigation?.classList.contains('is-menu-open') || homepageNotifications?.classList.contains('is-open') || homepageSearch?.classList.contains('is-open') || homepageAccount?.classList.contains('is-open') || homepageServices?.classList.contains('is-open')) return;
  setHomepageMenuOpen(true);
  window.setTimeout(() => setHomepageMenuOpen(false), 2000);
}, 3000);
homepageMenuTrigger?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  setHomepageMenuOpen(!homepageBottomNavigation.classList.contains('is-menu-open'));
});
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => setHomepageMenuOpen(false)));
document.querySelector('[data-home-menu-home]')?.addEventListener('click', () => queueHomepageMenuSelection('home', () => setHomepageLanguageOpen(true)));
document.querySelector('[data-home-menu-account]')?.addEventListener('click', () => queueHomepageMenuSelection('account', () => setHomepageAccountOpen(true)));
document.querySelector('[data-home-menu-gallery]')?.addEventListener('click', () => queueHomepageMenuSelection('gallery', () => location.assign('/studio')));
document.querySelector('[data-employee-dashboard-menu-gallery]')?.addEventListener('click', () => location.assign('/studio'));
document.querySelector('[data-home-menu-services]')?.addEventListener('click', () => queueHomepageMenuSelection('services', () => setHomepageServicesOpen(true)));
document.querySelector('[data-home-menu-menu]')?.addEventListener('click', () => queueHomepageMenuSelection('menu', () => {
  setHomepageNotificationsOpen(true);
}));
homepageNotifications?.addEventListener('click', (event) => {
  if (!event.target.closest('.homepage-notifications-panel')) setHomepageNotificationsOpen(false);
});
const renderSharedNotifications = (notifications) => {
  const list = homepageNotifications?.querySelector('.homepage-notifications-list');
  if (!list || !Array.isArray(notifications)) return;
  list.replaceChildren(...notifications.map(notification => {
    const item = document.createElement('button'); item.type = 'button'; item.className = 'homepage-notification'; item.dataset.notification = ''; item.setAttribute('aria-expanded', 'false');
    const summary = document.createElement('span'); summary.className = 'homepage-notification-summary'; const summaryCopy = document.createElement('span'); const title = document.createElement('strong'); title.textContent = notification.title; const date = document.createElement('time'); date.dateTime = notification.publish_date; date.textContent = new Intl.DateTimeFormat(root.lang === 'ar' ? 'ar-IQ' : 'en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(notification.publish_date)); summaryCopy.append(title); const unread = document.createElement('span'); unread.className = 'homepage-notification-unread'; unread.setAttribute('aria-hidden', 'true'); summary.append(summaryCopy, unread);
    const details = document.createElement('span'); details.className = 'homepage-notification-details'; const copy = document.createElement('span'); copy.className = 'homepage-notification-copy'; copy.textContent = notification.body; details.append(copy, date); item.append(summary, details); return item;
  }));
};
const loadSharedNotifications = async () => {
  try { const response = await fetch('/api/accounts/index?route=notifications', { credentials: 'same-origin' }); if (response.ok) renderSharedNotifications(await response.json()); } catch (_) {}
};
loadSharedNotifications();
homepageNotifications?.addEventListener('click', (event) => {
  const notification = event.target.closest('[data-notification]');
  if (!notification) return;
  const expanded = !notification.classList.contains('is-expanded');
  homepageNotifications.querySelectorAll('[data-notification].is-expanded').forEach((openNotification) => {
    openNotification.classList.remove('is-expanded');
    openNotification.setAttribute('aria-expanded', 'false');
  });
  notification.classList.toggle('is-expanded', expanded);
  notification.classList.add('is-read', 'is-selected');
  notification.setAttribute('aria-expanded', String(expanded));
  window.clearTimeout(homepageNotificationSelectionTimer);
  homepageNotificationSelectionTimer = window.setTimeout(() => notification.classList.remove('is-selected'), 340);
});
homepageSearch?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-search-panel')) setHomepageSearchOpen(false);
});
homepageAccount?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-account-panel')) setHomepageAccountOpen(false);
});
homepageServices?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-services-panel')) setHomepageServicesOpen(false);
});
homepageLanguage?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-account-panel')) setHomepageLanguageOpen(false);
});
homepageLanguageSelector?.querySelectorAll('[data-home-language-option]').forEach((button) => button.addEventListener('click', () => {
  const next = button.dataset.homeLanguageOption;
  applyLanguage(next);
  homepageLanguageSelector.dataset.active = next;
  homepageLanguageSelector.querySelectorAll('[data-home-language-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
  setHomepageLanguageOpen(false);
}));
homepageServices?.querySelectorAll('[data-home-services-option]').forEach((button) => button.addEventListener('click', () => {
  const selector = homepageServices.querySelector('[data-home-services-selector]');
  const panel = homepageServices.querySelector('[data-home-services-panel]');
  selector.dataset.active = button.dataset.homeServicesOption;
  panel.dataset.active = button.dataset.homeServicesOption;
  selector.querySelectorAll('[data-home-services-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
}));
homepageAccount?.querySelectorAll('[data-home-account-type]').forEach((button) => button.addEventListener('click', () => {
  const selector = homepageAccount.querySelector('[data-home-account-selector]');
  if (!selector) return;
  const accountType = button.dataset.homeAccountType;
  selector.dataset.active = accountType;
  selector.querySelectorAll('[data-home-account-type]').forEach((item) => item.setAttribute('aria-selected', String(item === button)));
}));
homepageAccount?.querySelectorAll('.homepage-account-login').forEach((button) => button.addEventListener('click', async () => {
  const [usernameInput, passwordInput] = homepageAccount.querySelectorAll('[data-home-account-input]');
  if (!usernameInput || !passwordInput) return;
  const expectedAccountType = homepageAccount.querySelector('[data-home-account-selector]')?.dataset.active;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  usernameInput.removeAttribute('aria-invalid');
  passwordInput.removeAttribute('aria-invalid');
  try {
    const response = await fetch('/api/accounts/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    });
    const account = await response.json().catch(() => ({}));
    if (!response.ok || account.accountType !== expectedAccountType) throw new Error('invalid_credentials');
    await loadSharedNotifications();
    if (account.accountType === 'employee') location.assign('/?panel=employee-dashboard');
  } catch (_) {
    usernameInput.setAttribute('aria-invalid', 'true');
    passwordInput.setAttribute('aria-invalid', 'true');
    passwordInput.focus();
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}));
homepageAccount?.querySelectorAll('.homepage-account-selector, .homepage-account-form, .homepage-account-login').forEach((element) => element.addEventListener('pointerdown', (event) => event.stopPropagation()));
homepageSearchInput?.addEventListener('input', renderHomepageSearchSuggestions);
homepageSearchSuggestions?.addEventListener('click', (event) => event.stopPropagation());
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
