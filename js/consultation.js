(() => {
  const root = document.documentElement;
  const selector = document.querySelector('[data-brand-management-selector]');
  const selectorButtons = [...document.querySelectorAll('[data-brand-management-state]')];
  const setSelectorState = next => {
    const state = next === 'details' ? 'details' : 'work';
    selector?.setAttribute('data-active', state);
    selectorButtons.forEach(button => button.setAttribute('aria-selected', String(button.dataset.brandManagementState === state)));
  };
  selectorButtons.forEach(button => button.addEventListener('click', () => setSelectorState(button.dataset.brandManagementState)));
  const applyLanguage = next => {
    const language = next === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(element => { element.textContent = element.dataset[language]; });
    selector?.setAttribute('aria-label', language === 'ar' ? 'عرض الاستشارة' : 'Consultation view');
    document.querySelector('[data-brand-management-home]')?.setAttribute('aria-label', language === 'ar' ? 'الرئيسية' : 'Home');
    document.querySelector('[data-brand-management-context="work"]')?.setAttribute('aria-label', language === 'ar' ? 'نظرة عامة' : 'Overview');
    document.querySelector('[data-brand-management-context="details"]')?.setAttribute('aria-label', language === 'ar' ? 'التفاصيل' : 'Details');
  };
  let language = 'en';
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  setSelectorState('work');
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  window.addEventListener('ooxme-language-change', event => applyLanguage(event.detail?.language));
})();
