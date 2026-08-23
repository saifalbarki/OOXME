(() => {
  const root = document.documentElement;
  const contextual = document.querySelector('[data-brand-management-contextual]');
  const pill = document.querySelector('[data-brand-management-pill]');
  const selector = document.querySelector('[data-brand-management-selector]');
  const mainNavigation = document.querySelector('[data-authenticated-navigation]');
  const statePanels = [...document.querySelectorAll('[data-brand-management-panel]')];
  let state = 'work';
  const applyLanguage = next => {
    const language = next === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(element => { element.textContent = element.dataset[language]; });
    try { localStorage.setItem('ooxme-language', language); } catch (_) {}
  };
  const setState = next => {
    state = next === 'details' ? 'details' : 'work';
    pill?.setAttribute('data-active', state);
    selector?.setAttribute('data-active', state);
    selector?.querySelectorAll('[data-brand-management-state]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.brandManagementState === state)));
    pill?.querySelectorAll('[data-brand-management-context]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.brandManagementContext === state)));
    statePanels.forEach(panel => { panel.hidden = panel.dataset.brandManagementPanel !== state; });
  };
  const setMainNavigation = open => {
    if (!contextual || !mainNavigation) return;
    const trigger = mainNavigation.querySelector('[data-auth-nav-trigger]');
    contextual.classList.toggle('brand-management-contextual-hidden', open);
    mainNavigation.classList.toggle('brand-management-main-navigation-hidden', !open);
    mainNavigation.classList.toggle('brand-management-main-navigation-active', open);
    // Keep the shared bar in its open geometry in both modes; only opacity/pointer state changes.
    mainNavigation.classList.add('is-menu-open');
    mainNavigation.classList.remove('is-menu-closing');
    trigger?.setAttribute('aria-expanded', String(open));
  };
  selector?.querySelectorAll('[data-brand-management-state]').forEach(button => button.addEventListener('click', () => setState(button.dataset.brandManagementState)));
  pill?.querySelectorAll('[data-brand-management-context]').forEach(button => button.addEventListener('click', () => setState(button.dataset.brandManagementContext)));
  const mainToggle = document.querySelector('[data-brand-management-main-toggle]');
  mainToggle?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    setMainNavigation(true);
  });
  mainNavigation?.querySelector('[data-auth-nav-item="services"]')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    setMainNavigation(false);
  }, { capture: true });
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  let language = 'en';
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  setState(state);
  setMainNavigation(false);
})();
