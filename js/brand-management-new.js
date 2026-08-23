(() => {
  const root = document.documentElement;
  const contextual = document.querySelector('[data-brand-management-contextual]');
  const pill = document.querySelector('[data-brand-management-pill]');
  const selector = document.querySelector('[data-brand-management-selector]');
  const statePanels = [...document.querySelectorAll('[data-brand-management-panel]')];
  const detailsList = document.querySelector('[data-brand-management-details-list]');
  let state = 'work';
  let detailsSelectionTimer;
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
  selector?.querySelectorAll('[data-brand-management-state]').forEach(button => button.addEventListener('click', () => setState(button.dataset.brandManagementState)));
  pill?.querySelectorAll('[data-brand-management-context]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    setState(button.dataset.brandManagementContext);
  }));
  detailsList?.addEventListener('click', event => {
    const item = event.target.closest('[data-notification]');
    if (!item || !detailsList.contains(item)) return;
    const expanded = !item.classList.contains('is-expanded');
    detailsList.querySelectorAll('[data-notification].is-expanded').forEach(openItem => {
      openItem.classList.remove('is-expanded');
      openItem.setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('is-expanded', expanded);
    item.classList.add('is-read', 'is-selected');
    item.setAttribute('aria-expanded', String(expanded));
    window.clearTimeout(detailsSelectionTimer);
    detailsSelectionTimer = window.setTimeout(() => item.classList.remove('is-selected'), 340);
  });
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  let language = 'en';
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  setState(state);
})();
