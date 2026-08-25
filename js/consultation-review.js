(() => {
  const root = document.documentElement;
  const list = document.querySelector('[data-review-route-list]');
  const backButton = document.querySelector('[data-review-back]');
  const overviewButton = document.querySelector('[data-review-overview]');
  const labels = {
    en: { view: 'Consultation view', home: 'Home', previous: 'Previous', next: 'Next', none: '—', name: 'Name', email: 'Email', phone: 'Phone', sector: 'Business Sector', topic: 'Consultation Topic', date: 'Date', time: 'Time', duration: 'Duration', fee: 'Fee', discount: 'Discount', finalFee: 'Final Fee' },
    ar: { view: 'عرض الاستشارة', home: 'الرئيسية', previous: 'السابق', next: 'التالي', none: '—', name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', sector: 'قطاع العمل', topic: 'موضوع الاستشارة', date: 'التاريخ', time: 'الوقت', duration: 'المدة', fee: 'الرسوم', discount: 'الخصم', finalFee: 'الرسوم النهائية' }
  };
  let language = 'en';
  const render = () => {
    if (!list) return;
    const copy = labels[language];
    const rows = [copy.name, copy.email, copy.phone, copy.sector, copy.topic, copy.date, copy.time, copy.duration, copy.fee, copy.discount, copy.finalFee];
    list.replaceChildren(...rows.map(label => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const value = document.createElement('dd');
      term.textContent = label;
      value.textContent = copy.none;
      row.append(term, value);
      return row;
    }));
  };
  const applyLanguage = next => {
    language = next === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(element => { element.textContent = element.dataset[language]; });
    document.querySelector('[data-review-selector]')?.setAttribute('aria-label', labels[language].view);
    document.querySelector('[data-review-home]')?.setAttribute('aria-label', labels[language].home);
    backButton?.setAttribute('aria-label', labels[language].previous);
    document.querySelector('.brand-management-contextual-pill button:disabled')?.setAttribute('aria-label', labels[language].next);
    render();
  };
  overviewButton?.addEventListener('click', () => { window.location.assign('/consultation'); });
  backButton?.addEventListener('click', () => { window.history.back(); });
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  window.addEventListener('ooxme-language-change', event => applyLanguage(event.detail?.language));
})();
