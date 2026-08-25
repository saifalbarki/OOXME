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
  const stageNames = ['information', 'schedule', 'review', 'payment'];
  let mode = 'work';
  let stageIndex = 0;
  let selectedDate = '';
  let autoAdvanceTimer;
  let language = 'en';

  const labels = {
    en: { view: 'Consultation view', home: 'Home', previous: 'Previous', next: 'Next', name: 'Name', email: 'Email', phone: 'Phone', sector: 'Business sector', topic: 'Consultation topic', additional: 'Additional information', discountCode: 'Discount code', date: 'Date', time: 'Time', duration: 'Duration', price: 'Price', discount: 'Discount', finalPrice: 'Final price', none: '—' },
    ar: { view: 'عرض الاستشارة', home: 'الرئيسية', previous: 'السابق', next: 'التالي', name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', sector: 'قطاع العمل', topic: 'موضوع الاستشارة', additional: 'معلومات إضافية', discountCode: 'كود الخصم', date: 'التاريخ', time: 'الوقت', duration: 'المدة', price: 'السعر', discount: 'الخصم', finalPrice: 'السعر النهائي', none: '—' }
  };

  const getValue = name => fields[name]?.value?.trim() || '';
  const selectedOptionText = name => fields[name]?.selectedOptions?.[0]?.textContent?.trim() || '';
  const isInformationValid = () => Boolean(getValue('name') && fields.email?.checkValidity() && getValue('phone').length >= 7 && getValue('sector') && getValue('topic'));
  const isScheduleValid = () => Boolean(selectedDate && getValue('time') && getValue('duration'));
  const isCurrentStageValid = () => {
    if (stageIndex === 0) return isInformationValid();
    if (stageIndex === 1) return isScheduleValid();
    return true;
  };

  const renderReview = () => {
    if (!review) return;
    const copy = labels[language];
    const price = 120;
    const code = getValue('discount');
    const discount = code ? price * .1 : 0;
    const rows = [
      [copy.name, getValue('name') || copy.none], [copy.email, getValue('email') || copy.none], [copy.phone, getValue('phone') || copy.none],
      [copy.sector, selectedOptionText('sector') || copy.none], [copy.topic, selectedOptionText('topic') || copy.none], [copy.additional, getValue('additional') || copy.none],
      [copy.discountCode, code || copy.none], [copy.date, selectedDate || copy.none], [copy.time, selectedOptionText('time') || copy.none], [copy.duration, selectedOptionText('duration') || copy.none],
      [copy.price, '$' + price.toFixed(2)], [copy.discount, '-$' + discount.toFixed(2)], [copy.finalPrice, '$' + (price - discount).toFixed(2)]
    ];
    review.replaceChildren(...rows.map(([label, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const definition = document.createElement('dd');
      term.textContent = label;
      definition.textContent = value;
      row.append(term, definition);
      return row;
    }));
  };

  const clearAutoAdvance = () => {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = undefined;
  };
  const scheduleAutoAdvance = () => {
    clearAutoAdvance();
    if (mode !== 'book' || stageIndex >= 3 || !isCurrentStageValid()) return;
    const expectedStage = stageIndex;
    autoAdvanceTimer = window.setTimeout(() => {
      if (mode === 'book' && stageIndex === expectedStage && isCurrentStageValid()) setStage(stageIndex + 1);
    }, 2000);
  };
  const updateNavigation = () => {
    const inBook = mode === 'book';
    const valid = !inBook || isCurrentStageValid();
    backButton.disabled = !inBook;
    forwardButton.disabled = inBook && stageIndex < 3 && !valid;
    backButton.setAttribute('aria-pressed', String(inBook && stageIndex > 0));
    forwardButton.setAttribute('aria-pressed', String(inBook && stageIndex < 3 && valid));
    pill?.setAttribute('data-active', inBook && stageIndex > 0 ? 'details' : 'work');
    renderReview();
    scheduleAutoAdvance();
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
    topSelector?.setAttribute('aria-label', labels[language].view);
    document.querySelector('[data-brand-management-home]')?.setAttribute('aria-label', labels[language].home);
    backButton?.setAttribute('aria-label', labels[language].previous);
    forwardButton?.setAttribute('aria-label', labels[language].next);
    bookCard?.setAttribute('aria-label', language === 'ar' ? 'حجز استشارة' : 'Book consultation');
    renderReview();
  };

  topButtons.forEach(button => button.addEventListener('click', () => {
    clearAutoAdvance();
    const next = button.dataset.brandManagementState;
    if (next === 'details' && mode !== 'book') stageIndex = 0;
    setMode(next);
  }));
  backButton?.addEventListener('click', () => {
    clearAutoAdvance();
    if (mode !== 'book') return;
    if (stageIndex === 0) setMode('work'); else setStage(stageIndex - 1);
  });
  forwardButton?.addEventListener('click', () => {
    clearAutoAdvance();
    if (mode !== 'book') { setMode('details'); return; }
    if (stageIndex === 3) { setMode('work'); return; }
    if (isCurrentStageValid()) setStage(stageIndex + 1);
  });
  Object.values(fields).forEach(field => field?.addEventListener('input', updateNavigation));
  Object.values(fields).forEach(field => field?.addEventListener('change', updateNavigation));
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
  setMode('work');
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  window.addEventListener('ooxme-language-change', event => applyLanguage(event.detail?.language));
})();
