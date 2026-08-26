(() => {
  const root = document.documentElement;
  const contextual = document.querySelector('[data-brand-management-contextual]');
  const pill = document.querySelector('[data-brand-management-pill]');
  const selector = document.querySelector('[data-brand-management-selector]');
  const statePanels = [...document.querySelectorAll('[data-brand-management-panel]')];
  const detailCards = [...document.querySelectorAll('[data-brand-management-detail-card]')];
  const consultationCta = document.querySelector('[data-brand-management-consultation-cta]');
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
  selector?.querySelectorAll('[data-brand-management-state]').forEach(button => button.addEventListener('click', () => setState(button.dataset.brandManagementState)));
  detailCards.forEach(detailCard => detailCard.addEventListener('click', () => {
    const expanded = !detailCard.classList.contains('is-expanded');
    detailCards.forEach(card => {
      const isCurrent = card === detailCard && expanded;
      card.classList.toggle('is-expanded', isCurrent);
      card.setAttribute('aria-expanded', String(isCurrent));
    });
  }));
  consultationCta?.addEventListener('click', () => window.location.assign('/consultation?entry=brand-management'));
  pill?.querySelectorAll('[data-brand-management-context]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    setState(button.dataset.brandManagementContext);
  }));
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  let language = 'en';
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  setState(state);
})();
