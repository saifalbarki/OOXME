(() => {
  const root = document.documentElement;
  const content = document.querySelector('.consultation-content');
  const topSelector = document.querySelector('[data-brand-management-selector]');
  const topButtons = [...document.querySelectorAll('[data-brand-management-state]')];
  const squareCard = document.querySelector('.consultation-square-card');
  const bookCard = document.querySelector('[data-book-card]');
  const stages = [...document.querySelectorAll('[data-book-stage]')];
  const backButton = document.querySelector('[data-brand-management-context="work"]');
  const forwardButton = document.querySelector('[data-brand-management-context="details"]');
  const pill = document.querySelector('[data-brand-management-pill]');
  const review = document.querySelector('[data-book-review]');
  const fields = Object.fromEntries([...document.querySelectorAll('[data-book-field]')].map(field => [field.dataset.bookField, field]));
  const fieldDisplays = [...document.querySelectorAll('[data-book-field-display]')];
  const selectDisplays = [...document.querySelectorAll('[data-book-select-display]')];
  const stageNames = ['information', 'schedule', 'review', 'payment'];
  let mode = 'book';
  let stageIndex = 0;
  let selectedDate = '';
  let language = 'en';

  const labels = {
    en: { view: 'Consultation view', home: 'Home', previous: 'Previous', next: 'Next' },
    ar: { view: 'عرض الاستشارة', home: 'الرئيسية', previous: 'السابق', next: 'التالي' }
  };

  const getValue = name => fields[name]?.value?.trim() || '';
  const selectedOptionText = name => fields[name]?.selectedOptions?.[0]?.textContent?.trim() || '';
  const renderReview = () => {
    if (!review) return;
    const copy = language === 'ar'
      ? { name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', sector: 'قطاع العمل', topic: 'موضوع الاستشارة', additional: 'معلومات إضافية', discountCode: 'كود الخصم', date: 'التاريخ', time: 'الوقت', duration: 'المدة', none: '—' }
      : { name: 'Name', email: 'Email', phone: 'Phone', sector: 'Business Sector', topic: 'Consultation Topic', additional: 'Additional Information', discountCode: 'Discount Code', date: 'Date', time: 'Time', duration: 'Duration', none: '—' };
    const rows = [[copy.name, getValue('name') || copy.none], [copy.email, getValue('email') || copy.none], [copy.phone, getValue('phone') || copy.none], [copy.sector, selectedOptionText('sector') || copy.none], [copy.topic, selectedOptionText('topic') || copy.none], [copy.additional, getValue('additional') || copy.none], [copy.discountCode, getValue('discount') || copy.none], [copy.date, selectedDate || copy.none], [copy.time, selectedOptionText('time') || copy.none], [copy.duration, selectedOptionText('duration') || copy.none]];
    review.replaceChildren(...rows.map(([termText, valueText]) => { const row = document.createElement('div'); const term = document.createElement('dt'); const value = document.createElement('dd'); term.textContent = termText; value.textContent = valueText; row.append(term, value); return row; }));
  };
  const isScheduleValid = () => Boolean(selectedDate && getValue('time') && getValue('duration'));
  const syncSelectDisplays = () => {
    selectDisplays.forEach(display => {
      const select = display.previousElementSibling;
      display.textContent = select?.selectedOptions?.[0]?.textContent?.trim() || '';
      display.classList.toggle('is-placeholder', !select?.value);
      display.classList.toggle('is-selected', Boolean(select?.value));
    });
  };
  const syncFieldDisplays = () => {
    fieldDisplays.forEach(display => {
      const field = display.previousElementSibling;
      const hasValue = Boolean(field?.value);
      display.textContent = hasValue ? field.value : (field?.placeholder || '');
      display.classList.toggle('is-placeholder', !hasValue);
      display.classList.toggle('is-selected', hasValue);
    });
  };
  const isInformationValid = () => Boolean(getValue('name') && fields.email?.checkValidity() && getValue('phone').length >= 7 && getValue('sector') && getValue('topic'));

  const updateNavigation = () => {
    const inBook = mode === 'book';
    backButton.disabled = !inBook;
    forwardButton.disabled = false;
    backButton.setAttribute('aria-pressed', String(inBook && stageIndex > 0));
    forwardButton.setAttribute('aria-pressed', String(inBook));
    pill?.setAttribute('data-active', inBook && stageIndex % 2 === 0 ? 'details' : 'work');
    renderReview();
  };
  const setStage = next => {
    stageIndex = Math.max(0, Math.min(stageNames.length - 1, next));
    stages.forEach(stage => { stage.hidden = stage.dataset.bookStage !== stageNames[stageIndex]; });
    updateNavigation();
  };
  const setMode = next => {
    mode = next === 'details' ? 'book' : 'work';
    const inBook = mode === 'book';
    content?.setAttribute('data-book-mode', inBook ? 'book' : 'overview');
    topSelector?.setAttribute('data-active', inBook ? 'details' : 'work');
    topButtons.forEach(button => button.setAttribute('aria-selected', String((button.dataset.brandManagementState === 'details') === inBook)));
    squareCard?.toggleAttribute('hidden', inBook);
    if (bookCard) bookCard.hidden = !inBook;
    if (inBook) setStage(stageIndex); else updateNavigation();
  };
  const applyLanguage = next => {
    language = next === 'ar' ? 'ar' : 'en';
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach(element => { element.textContent = element.dataset[language]; });
    document.querySelectorAll('[data-en-placeholder][data-ar-placeholder]').forEach(element => { element.placeholder = element.dataset[language + 'Placeholder']; });
    syncFieldDisplays();
    syncSelectDisplays();
    topSelector?.setAttribute('aria-label', labels[language].view);
    document.querySelector('[data-brand-management-home]')?.setAttribute('aria-label', labels[language].home);
    backButton?.setAttribute('aria-label', labels[language].previous);
    forwardButton?.setAttribute('aria-label', labels[language].next);
    bookCard?.setAttribute('aria-label', language === 'ar' ? 'حجز استشارة' : 'Book consultation');
    renderReview();
  };

  topButtons.forEach(button => button.addEventListener('click', () => {
    const next = button.dataset.brandManagementState;
    if (next === 'details' && mode !== 'book') stageIndex = 0;
    setMode(next);
  }));
  backButton?.addEventListener('click', () => {
    if (mode !== 'book') return;
    if (stageIndex === 0) setMode('work'); else setStage(stageIndex - 1);
  });
  forwardButton?.addEventListener('click', () => {
    if (mode !== 'book') { stageIndex = 0; setMode('details'); return; }
    if (stageIndex === stageNames.length - 1) setMode('work'); else setStage(stageIndex + 1);
  });
  Object.values(fields).forEach(field => field?.addEventListener('input', () => { syncFieldDisplays(); updateNavigation(); }));
  Object.values(fields).forEach(field => field?.addEventListener('change', () => { syncSelectDisplays(); updateNavigation(); }));
  document.querySelectorAll('[data-book-date]').forEach(button => button.addEventListener('click', () => {
    selectedDate = button.dataset.bookDate || '';
    document.querySelectorAll('[data-book-date]').forEach(day => day.classList.toggle('is-selected', day === button));
    updateNavigation();
  }));
  document.querySelectorAll('[data-book-payment]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-book-payment]').forEach(option => option.classList.toggle('is-selected', option === button));
  }));
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  setMode('details');
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  window.addEventListener('ooxme-language-change', event => applyLanguage(event.detail?.language));
})();
