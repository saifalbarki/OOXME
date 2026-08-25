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
  const calendarDays = document.querySelector('[data-book-calendar-days]');
  const calendarViewport = document.querySelector('[data-book-calendar-viewport]');
  const calendarMonthLabel = document.querySelector('[data-book-calendar-month]');
  const calendarWeekdays = document.querySelector('[data-book-calendar-weekdays]');
  const fields = Object.fromEntries([...document.querySelectorAll('[data-book-field]')].map(field => [field.dataset.bookField, field]));
  const fieldDisplays = [...document.querySelectorAll('[data-book-field-display]')];
  const selectDisplays = [...document.querySelectorAll('[data-book-select-display]')];
  const stageNames = ['information', 'schedule', 'review'];
  const navigationStateKey = 'consultation-last-navigation-direction';
  let mode = 'book';
  let stageIndex = 0;
  let lastNavigationDirection = pill?.dataset.active === 'work' ? 'work' : 'details';
  try {
    const savedDirection = sessionStorage.getItem(navigationStateKey);
    if (savedDirection === 'work' || savedDirection === 'details') lastNavigationDirection = savedDirection;
  } catch (_) {}
  let selectedDate = '';
  let language = 'en';
  const calendarToday = new Date();
  let displayedCalendar = new Date(calendarToday.getFullYear(), calendarToday.getMonth(), 1);
  let swipeStartX = null;
  let swipeStartY = null;
  let swipeTracking = false;
  let ignoreNextCalendarClick = false;

  const labels = {
    en: { view: 'Consultation view', home: 'Home', previous: 'Previous', next: 'Next' },
    ar: { view: 'عرض الاستشارة', home: 'الرئيسية', previous: 'السابق', next: 'التالي' }
  };

  const getValue = name => fields[name]?.value?.trim() || '';
  const numericContentPattern = /[\d\u0660-\u0669\u06F0-\u06F9]+(?:[.,:/\-\u066B\u066C][\d\u0660-\u0669\u06F0-\u06F9]+)*/g;
  const renderNumericContent = (element, text) => {
    if (!element) return;
    const value = String(text ?? '');
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    value.replace(numericContentPattern, (match, offset) => {
      if (offset > cursor) fragment.append(value.slice(cursor, offset));
      const numeric = document.createElement('span');
      numeric.className = 'consultation-numeric-content';
      numeric.textContent = match;
      fragment.append(numeric);
      cursor = offset + match.length;
      return match;
    });
    if (cursor < value.length) fragment.append(value.slice(cursor));
    element.replaceChildren(fragment);
  };
  const renderWeekdays = () => {
    if (!calendarWeekdays) return;
    const weekdays = language === 'ar' ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    calendarWeekdays.replaceChildren(...weekdays.map(day => {
      const label = document.createElement('span');
      label.textContent = day;
      return label;
    }));
  };
  const renderCalendar = () => {
    if (!calendarDays) return;
    const calendarYear = displayedCalendar.getFullYear();
    const calendarMonth = displayedCalendar.getMonth();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstWeekday = new Date(calendarYear, calendarMonth, 1).getDay();
    const rowCount = Math.ceil((firstWeekday + daysInMonth) / 7);
    const totalCells = rowCount * 7;
    if (calendarMonthLabel) renderNumericContent(calendarMonthLabel, new Intl.DateTimeFormat(language, { month: 'long' }).format(displayedCalendar));
    renderWeekdays();
    calendarDays.style.gridTemplateRows = `repeat(${rowCount}, minmax(0, 1fr))`;
    calendarDays.replaceChildren(...Array.from({ length: totalCells }, (_, cellIndex) => {
      const day = cellIndex - firstWeekday + 1;
      if (day < 1 || day > daysInMonth) return document.createElement('span');
      const date = new Date(calendarYear, calendarMonth, day);
      const dateValue = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.bookDate = dateValue;
      renderNumericContent(button, String(day));
      button.disabled = date < new Date(calendarToday.getFullYear(), calendarToday.getMonth(), calendarToday.getDate());
      button.classList.toggle('is-selected', selectedDate === dateValue);
      return button;
    }));
  };
  const animateCalendarMonth = delta => {
    if (!calendarDays || delta === 0) return;
    displayedCalendar = new Date(displayedCalendar.getFullYear(), displayedCalendar.getMonth() + delta, 1);
    calendarDays.style.transition = 'none';
    calendarDays.style.transform = `translateX(${delta > 0 ? '100%' : '-100%'})`;
    renderCalendar();
    calendarDays.offsetWidth;
    calendarDays.style.transition = 'transform 220ms ease-out';
    calendarDays.style.transform = 'translateX(0)';
  };
  const selectedOptionText = name => fields[name]?.selectedOptions?.[0]?.textContent?.trim() || '';
  const renderReview = () => {
    if (!review) return;
    const copy = language === 'ar'
      ? { name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', sector: 'قطاع العمل', topic: 'موضوع الاستشارة', date: 'التاريخ', time: 'الوقت', duration: 'المدة', fee: 'الرسوم', discount: 'الخصم', finalFee: 'الرسوم النهائية', none: '—' }
      : { name: 'Name', email: 'Email', phone: 'Phone', sector: 'Business Sector', topic: 'Consultation Topic', date: 'Date', time: 'Time', duration: 'Duration', fee: 'Fee', discount: 'Discount', finalFee: 'Final Fee', none: '—' };
    const rows = [[copy.name, getValue('name') || copy.none], [copy.email, getValue('email') || copy.none], [copy.phone, getValue('phone') || copy.none], [copy.sector, selectedOptionText('sector') || copy.none], [copy.topic, selectedOptionText('topic') || copy.none], [copy.date, selectedDate || copy.none], [copy.time, selectedOptionText('time') || copy.none], [copy.duration, selectedOptionText('duration') || copy.none], [copy.fee, copy.none], [copy.discount, copy.none], [copy.finalFee, copy.none]];
    review.replaceChildren(...rows.map(([termText, valueText]) => { const row = document.createElement('div'); const term = document.createElement('dt'); const value = document.createElement('dd'); term.textContent = termText; renderNumericContent(value, valueText); row.append(term, value); return row; }));
  };
  const isScheduleValid = () => Boolean(selectedDate && getValue('time') && getValue('duration'));
  const syncSelectDisplays = () => {
    selectDisplays.forEach(display => {
      const select = display.previousElementSibling;
      const selectedText = select?.selectedOptions?.[0]?.textContent?.trim() || '';
      if (select?.dataset.bookField === 'duration') display.replaceChildren(document.createTextNode(selectedText));
      else renderNumericContent(display, selectedText);
      display.classList.toggle('is-placeholder', !select?.value);
      display.classList.toggle('is-selected', Boolean(select?.value));
    });
  };
  const syncFieldDisplays = () => {
    fieldDisplays.forEach(display => {
      const field = display.previousElementSibling;
      const hasValue = Boolean(field?.value);
      renderNumericContent(display, hasValue ? field.value : (field?.placeholder || ''));
      display.classList.toggle('is-placeholder', !hasValue);
      display.classList.toggle('is-selected', hasValue);
    });
  };
  const isInformationValid = () => Boolean(getValue('name') && fields.email?.checkValidity() && getValue('phone').length >= 7 && getValue('sector') && getValue('topic'));

  const setNavigationDirection = direction => {
    lastNavigationDirection = direction === 'work' ? 'work' : 'details';
    try { sessionStorage.setItem(navigationStateKey, lastNavigationDirection); } catch (_) {}
    pill?.setAttribute('data-active', lastNavigationDirection);
    backButton?.setAttribute('aria-pressed', String(lastNavigationDirection === 'work'));
    forwardButton?.setAttribute('aria-pressed', String(lastNavigationDirection === 'details'));
  };
  const updateNavigation = () => {
    const inBook = mode === 'book';
    backButton.disabled = !inBook;
    forwardButton.disabled = false;
    setNavigationDirection(lastNavigationDirection);
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
    renderCalendar();
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
    setNavigationDirection('work');
    if (stageIndex === 0) setMode('work'); else setStage(stageIndex - 1);
  });
  forwardButton?.addEventListener('click', () => {
    setNavigationDirection('details');
    if (mode !== 'book') { stageIndex = 0; setMode('details'); return; }
    if (stageIndex === stageNames.length - 1) setMode('work'); else setStage(stageIndex + 1);
  });
  Object.values(fields).forEach(field => field?.addEventListener('input', () => { syncFieldDisplays(); updateNavigation(); }));
  Object.values(fields).forEach(field => field?.addEventListener('change', () => { syncSelectDisplays(); updateNavigation(); }));
  calendarDays?.addEventListener('click', event => {
    if (ignoreNextCalendarClick) {
      ignoreNextCalendarClick = false;
      return;
    }
    const button = event.target.closest('[data-book-date]');
    if (!button || button.disabled) return;
    selectedDate = button.dataset.bookDate || '';
    calendarDays.querySelectorAll('[data-book-date]').forEach(day => day.classList.toggle('is-selected', day === button));
    updateNavigation();
  });
  calendarViewport?.addEventListener('pointerdown', event => {
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
    swipeTracking = true;
    calendarViewport.setPointerCapture?.(event.pointerId);
  });
  calendarViewport?.addEventListener('pointermove', event => {
    if (!swipeTracking || swipeStartX === null || swipeStartY === null) return;
    if (Math.abs(event.clientX - swipeStartX) > 8 && Math.abs(event.clientX - swipeStartX) > Math.abs(event.clientY - swipeStartY)) event.preventDefault();
  });
  calendarViewport?.addEventListener('pointerup', event => {
    if (!swipeTracking || swipeStartX === null || swipeStartY === null) return;
    const deltaX = event.clientX - swipeStartX;
    const deltaY = event.clientY - swipeStartY;
    swipeTracking = false;
    swipeStartX = null;
    swipeStartY = null;
    if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
      ignoreNextCalendarClick = true;
      animateCalendarMonth(deltaX < 0 ? 1 : -1);
    }
  });
  calendarViewport?.addEventListener('pointercancel', () => {
    swipeTracking = false;
    swipeStartX = null;
    swipeStartY = null;
  });
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  setMode('details');
  window.addEventListener('storage', event => { if (event.key === 'ooxme-language') applyLanguage(event.newValue); });
  window.addEventListener('ooxme-language-change', event => applyLanguage(event.detail?.language));
})();
