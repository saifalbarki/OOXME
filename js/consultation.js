(() => {
  'use strict';
  const page = document.querySelector('.s-page--consultation');
  const content = page?.querySelector('.s-page__content');
  const composer = page?.querySelector('[data-s-composer]');
  const menu = page?.querySelector('[data-s-composer-menu]');
  const utilities = page?.querySelector('[data-s-send-utilities]');
  const addButton = page?.querySelector('.s-page__add');
  const input = page?.querySelector('.s-page__composer-input');
  const submit = composer?.querySelector('button[type="submit"]');
  const theme = page?.querySelector('[data-s-utility="theme"]');
  const language = page?.querySelector('[data-s-utility="language"]');
  const sections = Array.from(page?.querySelectorAll('[data-s-major-section]') || []);
  const sectionComposerUnit = page?.querySelector('[data-s-consultation-composer-unit]');
  const sectionComposer = page?.querySelector('[data-s-consultation-composer]');
  const sectionInput = page?.querySelector('[data-s-consultation-composer-input]');
  const sectionLanguage = page?.querySelector('[data-s-consultation-composer-language]');
  const sectionBackPanel = page?.querySelector('[data-s-consultation-composer-back-panel]');
  const sectionAnswerHistory = page?.querySelector('[data-s-consultation-answer-history]');
  const sectionChoiceTray = page?.querySelector('[data-s-consultation-choice-tray]');
  const sectionSuccess = page?.querySelector('[data-s-consultation-composer-success]');
  const sectionSend = sectionComposer?.querySelector('.s-page__consultation-composer-send');
  const summary = page?.querySelector('[data-s-consultation-summary]');
  const discountForm = page?.querySelector('[data-s-consultation-discount-form]');
  const discountInput = page?.querySelector('[data-s-consultation-discount-input]');
  const discountStatus = page?.querySelector('[data-s-consultation-discount-status]');
  const menuItems = Array.from(page?.querySelectorAll('.s-page__composer-menu-item') || []);
  if (!page || !content || !composer || !menu || !utilities || !addButton || !input || !submit || !theme || !language || !sectionComposerUnit || !sectionComposer || !sectionInput || !sectionLanguage || !sectionBackPanel || !sectionAnswerHistory || !sectionChoiceTray || !sectionSuccess || !sectionSend || !summary || !discountForm || !discountInput || !discountStatus || sections.length !== 2) return;

  const copy = {
    en: { menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'], ask: 'Ask ooxme', add: 'Add context', submit: 'Submit question', language: 'Switch to Arabic', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode' },
    ar: { menu: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'], ask: 'اسأل اوكسوم', add: 'اضف سياقًا', submit: 'ارسال السؤال', language: 'Switch to English', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode' }
  };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let typeTimer = 0, typeRun = 0, menuTimer = 0, locked = false, unlockTimer = 0, touch = null;
  let closedComposerFrameHeight = 0, closedComposerBottom = 0, keyboardSyncFrame = 0, appliedKeyboardOffset = 0, keyboardViewportRevision = 0;
  let keyboardBaselineViewportHeight = 0, keyboardSessionScrollY = null, keyboardSessionActive = false, keyboardOpen = false;

  const setMenuOpen = (open) => {
    clearTimeout(menuTimer);
    if (open) {
      composer.style.setProperty('--s-composer-menu-height', `${menu.offsetHeight}px`);
      menu.classList.add('is-open'); utilities.classList.add('is-open'); submit.classList.add('is-active');
      menu.setAttribute('aria-hidden', 'false'); utilities.setAttribute('aria-hidden', 'false');
      return;
    }
    submit.classList.remove('is-active');
    menuTimer = setTimeout(() => { menu.classList.remove('is-open'); utilities.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); utilities.setAttribute('aria-hidden', 'true'); }, 60);
  };
  const updateInputLanguage = () => {
    const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(input.value);
    input.lang = isArabic ? 'ar' : 'en'; input.dir = isArabic ? 'rtl' : 'ltr'; input.classList.toggle('is-english-input', !isArabic);
  };
  const applySectionInputLanguage = (language) => {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    sectionInput.lang = language;
    sectionInput.dir = direction;
    sectionInput.classList.toggle('is-arabic-input', language === 'ar');
    sectionInput.classList.toggle('is-english-input', language === 'en');
  };
  const bookingSteps = [
    { id: 'name', type: 'text' },
    { id: 'phone', type: 'text' },
    { id: 'email', type: 'text' },
    { id: 'sector', type: 'choice', options: 'sector' },
    { id: 'topic', type: 'choice', options: 'topic' },
    { id: 'day', type: 'choice', options: 'day' },
    { id: 'time', type: 'choice', options: 'time' },
    { id: 'duration', type: 'choice', options: 'duration' },
    { id: 'confirm', type: 'confirm' }
  ];
  const bookingCopy = {
    en: {
      questions: { name: 'What is your name?', phone: 'What is your phone number?', email: 'What is your email?', sector: 'Choose your business sector:', topic: 'Choose the consultation topic:', day: 'Choose a suitable day:', time: 'Choose a suitable time:', duration: 'Choose the duration you need:', confirm: 'Confirm & Continue' },
      options: {
        sector: [['engineering', 'Engineering'], ['commercial', 'Commercial'], ['other', 'Other']],
        topic: [['brand-management', 'Brand Management'], ['business-development', 'Business Development'], ['other', 'Other']],
        day: [['day-one', 'Day 1'], ['day-two', 'Day 2'], ['day-three', 'Day 3'], ['day-four', 'Day 4']],
        time: [['morning', '09:00'], ['afternoon', '13:00'], ['evening', '17:00'], ['night', '21:00']],
        duration: [['short', '45 minutes'], ['standard', '60 minutes'], ['extended', '90 minutes'], ['custom', 'Custom']]
      },
      success: 'Booking received successfully', send: 'Submit answer', confirm: 'Confirm booking', message: 'Consultation answer'
    },
    ar: {
      questions: { name: 'ما اسمك؟', phone: 'ما رقم هاتفك؟', email: 'ما بريدك الإلكتروني؟', sector: 'اختر قطاع عملك:', topic: 'اختر موضوع الاستشارة:', day: 'اختر يوماً مناسباً:', time: 'اختر وقتاً مناسباً:', duration: 'اختر المدة التي تحتاجها:', confirm: 'تأكيد ومتابعة' },
      options: {
        sector: [['engineering', 'هندسي'], ['commercial', 'تجاري'], ['other', 'أخرى']],
        topic: [['brand-management', 'إدارة العلامة التجارية'], ['business-development', 'تطوير الأعمال'], ['other', 'أخرى']],
        day: [['day-one', 'اليوم الأول'], ['day-two', 'اليوم الثاني'], ['day-three', 'اليوم الثالث'], ['day-four', 'اليوم الرابع']],
        time: [['morning', '09:00'], ['afternoon', '13:00'], ['evening', '17:00'], ['night', '21:00']],
        duration: [['short', '45 دقيقة'], ['standard', '60 دقيقة'], ['extended', '90 دقيقة'], ['custom', 'مخصص']]
      },
      success: 'تم استلام حجزك بنجاح', send: 'إرسال الإجابة', confirm: 'تأكيد الحجز', message: 'إجابة الاستشارة'
    }
  };
  const booking = { index: 0, answers: [], complete: false };
  const successMessages = {
    en: { full: 'Booking received successfully', short: 'Received successfully' },
    ar: { full: 'تم استلام حجزك بنجاح', short: 'استلم بنجاح' }
  };
  let discountApplied = false;
  let bookingGeometryFrame = 0;
  const bookingLanguage = () => document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const currentBookingStep = () => bookingSteps[booking.index] || bookingSteps[bookingSteps.length - 1];
  const renderSectionSuccessMessage = (language) => {
    if (!booking.complete) {
      sectionSuccess.textContent = '';
      return;
    }
    const messages = successMessages[language];
    const zone = sectionSuccess.closest('.s-page__consultation-composer-text-zone');
    if (!zone || zone.clientWidth === 0) {
      sectionSuccess.textContent = messages.short;
      return;
    }
    const computed = getComputedStyle(sectionSuccess);
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'nowrap';
    probe.style.fontFamily = computed.fontFamily;
    probe.style.fontSize = computed.fontSize;
    probe.style.fontWeight = computed.fontWeight;
    probe.style.lineHeight = computed.lineHeight;
    probe.style.letterSpacing = computed.letterSpacing;
    probe.dir = language === 'ar' ? 'rtl' : 'ltr';
    probe.textContent = messages.full;
    zone.append(probe);
    const visualWidth = probe.getBoundingClientRect().width * .75;
    probe.remove();
    sectionSuccess.textContent = visualWidth <= Math.max(0, zone.clientWidth - 8) ? messages.full : messages.short;
  };
  const resolveChoice = (answer, language) => {
    if (!answer.choice) return answer.value;
    const step = bookingSteps.find((item) => item.id === answer.step);
    return bookingCopy[language].options[step?.options]?.find(([id]) => id === answer.choice)?.[1] || answer.value;
  };
  const renderSummary = () => {
    const language = bookingLanguage();
    const ar = language === 'ar';
    const labels = ar ? {
      title: 'ملخص الاستشارة', topic: 'موضوع الاستشارة', day: 'اليوم المحدد', time: 'الوقت المحدد', duration: 'المدة المحددة', pricing: 'الأسعار', base: 'السعر الأساسي', discount: 'الخصم', total: 'الإجمالي', discountCode: 'رمز الخصم', discountInput: 'رمز الخصم', placeholder: 'غير محدد', codePlaceholder: 'أدخل الرمز', apply: 'تطبيق', applied: 'تم تطبيق الرمز مؤقتاً', payment: 'الدفع', pay: 'ادفع وأكد'
    } : {
      title: 'Consultation Summary', topic: 'Consultation topic', day: 'Selected day', time: 'Selected time', duration: 'Selected duration', pricing: 'Pricing', base: 'Base Price', discount: 'Discount', total: 'Total', discountCode: 'Discount Code', discountInput: 'Discount code', placeholder: 'Not selected', codePlaceholder: 'Enter code', apply: 'Apply', applied: 'Code applied temporarily', payment: 'Payment', pay: 'Pay & Confirm'
    };
    const valueFor = (stepId) => {
      const answer = booking.answers.find((item) => item.step === stepId);
      return answer ? resolveChoice(answer, language) : labels.placeholder;
    };
    summary.querySelector('[data-s-summary-title]').textContent = labels.title;
    summary.querySelectorAll('[data-s-summary-label]').forEach((node) => { const key = node.dataset.sSummaryLabel; if (labels[key]) node.textContent = labels[key]; });
    summary.querySelectorAll('[data-s-summary-heading]').forEach((node) => { const key = node.dataset.sSummaryHeading; if (labels[key]) node.textContent = labels[key]; });
    ['topic', 'day', 'time', 'duration'].forEach((key) => { summary.querySelector(`[data-s-summary-value="${key}"]`).textContent = valueFor(key); });
    const discountValue = summary.querySelector('[data-s-summary-value="discount"]');
    const totalValue = summary.querySelector('[data-s-summary-value="total"]');
    discountValue.textContent = discountApplied ? labels.applied : '—';
    totalValue.textContent = discountApplied ? (ar ? 'قيد التحديث' : 'Pending') : '—';
    discountValue.classList.toggle('is-applied', discountApplied);
    totalValue.classList.toggle('is-pending', discountApplied);
    discountInput.placeholder = labels.codePlaceholder;
    discountInput.setAttribute('aria-label', labels.discountInput);
    page.querySelector('[data-s-consultation-apply]').textContent = labels.apply;
    page.querySelector('[data-s-consultation-pay]').textContent = labels.pay;
    discountStatus.textContent = discountApplied ? labels.applied : '';
    summary.dir = language === 'ar' ? 'rtl' : 'ltr';
    summary.lang = language;
  };
  const scheduleBookingGeometry = () => {
    if (bookingGeometryFrame) return;
    bookingGeometryFrame = requestAnimationFrame(() => {
      bookingGeometryFrame = 0;
      const unitRect = sectionComposerUnit.getBoundingClientRect();
      const topBarRect = composer.getBoundingClientRect();
      const composerHeight = Number.parseFloat(getComputedStyle(sectionComposerUnit).getPropertyValue('--s-consultation-composer-height')) || 48;
      const x = Number.parseFloat(getComputedStyle(page).getPropertyValue('--s-x')) || 0;
      const panelBottom = unitRect.bottom - (booking.complete ? composerHeight + x : composerHeight / 2);
      const maximum = Math.max(0, panelBottom - (topBarRect.bottom + x));
      const desired = booking.answers.length * 48 + (booking.complete ? 0 : composerHeight / 2);
      const height = Math.min(desired, maximum);
      sectionComposerUnit.style.setProperty('--s-consultation-history-height', `${height.toFixed(2)}px`);
      sectionComposerUnit.style.setProperty('--s-consultation-history-max-height', `${maximum.toFixed(2)}px`);
      sectionAnswerHistory.scrollTop = sectionAnswerHistory.scrollHeight;
    });
  };
  const renderAnswerHistory = () => {
    const language = bookingLanguage();
    const fragment = document.createDocumentFragment();
    booking.answers.forEach((answer) => {
      const row = document.createElement('p');
      row.className = `s-page__consultation-answer-row ${language === 'ar' ? 'is-arabic-answer' : 'is-english-answer'}`;
      row.lang = language;
      row.dir = language === 'ar' ? 'rtl' : 'ltr';
      row.textContent = resolveChoice(answer, language);
      fragment.append(row);
    });
    sectionAnswerHistory.replaceChildren(fragment);
    sectionComposerUnit.classList.toggle('has-history', booking.answers.length > 0);
  };
  const renderChoices = (step, language) => {
    sectionChoiceTray.replaceChildren();
    const choices = step.type === 'choice' ? bookingCopy[language].options[step.options] : null;
    if (!choices || booking.complete) {
      sectionChoiceTray.classList.remove('is-visible');
      return;
    }
    const fragment = document.createDocumentFragment();
    choices.forEach(([id, label]) => {
      const option = document.createElement('button');
      option.className = `s-page__consultation-choice ${language === 'ar' ? 'is-arabic-choice' : 'is-english-choice'}`;
      option.type = 'button';
      option.dataset.sConsultationChoice = id;
      option.textContent = label;
      option.lang = language;
      option.dir = language === 'ar' ? 'rtl' : 'ltr';
      fragment.append(option);
    });
    sectionChoiceTray.append(fragment);
    sectionChoiceTray.classList.add('is-visible');
  };
  const renderBookingFlow = ({ clearSectionInput = false, placeSectionCaret = false } = {}) => {
    const language = bookingLanguage();
    const labels = bookingCopy[language];
    const step = currentBookingStep();
    if (clearSectionInput) sectionInput.value = '';
    applySectionInputLanguage(language);
    renderAnswerHistory();
    renderChoices(step, language);
    sectionSuccess.hidden = !booking.complete;
    sectionSuccess.lang = language;
    sectionSuccess.dir = language === 'ar' ? 'rtl' : 'ltr';
    sectionSuccess.classList.toggle('is-arabic-success', language === 'ar');
    renderSectionSuccessMessage(language);
    sectionInput.hidden = booking.complete;
    sectionInput.disabled = booking.complete || step.type !== 'text';
    sectionInput.placeholder = booking.complete ? '' : labels.questions[step.id];
    sectionInput.autocomplete = step.id === 'name' ? 'name' : step.id === 'phone' ? 'tel' : step.id === 'email' ? 'email' : 'off';
    sectionInput.setAttribute('aria-label', booking.complete ? labels.success : labels.questions[step.id]);
    sectionInput.closest('label').querySelector('.s-page__visually-hidden').textContent = booking.complete ? labels.success : labels.message;
    sectionSend.classList.toggle('is-confirm', !booking.complete && step.type === 'confirm');
    sectionSend.classList.toggle('is-success', booking.complete);
    sectionSend.disabled = false;
    sectionSend.setAttribute('aria-label', step.type === 'confirm' ? labels.confirm : labels.send);
    sectionComposerUnit.classList.toggle('is-booking-complete', booking.complete);
    renderSummary();
    scheduleBookingGeometry();
    if (placeSectionCaret && !booking.complete && step.type === 'text' && document.activeElement === sectionInput && sectionInput.value === '') {
      sectionInput.setSelectionRange(0, 0, 'none');
    }
  };
  const addBookingAnswer = (step, value, choice = '') => {
    const keepTextFocus = step.type === 'text' && document.activeElement === sectionInput;
    booking.answers.push({ step: step.id, value, choice });
    booking.index += 1;
    renderBookingFlow({ clearSectionInput: step.type === 'text', placeSectionCaret: keepTextFocus });
  };
  const completeBooking = () => {
    if (booking.complete) return;
    booking.complete = true;
    if (document.activeElement === sectionInput) sectionInput.blur();
    renderBookingFlow({ clearSectionInput: true });
  };
  const submitBooking = () => {
    const step = currentBookingStep();
    if (booking.complete) return;
    if (step.type === 'confirm') { completeBooking(); return; }
    if (step.type !== 'text') return;
    const value = sectionInput.value.trim();
    if (!value) return;
    addBookingAnswer(step, value);
  };
  const applyLanguage = (next, { clearSectionInput = false, placeSectionCaret = false } = {}) => {
    const current = next === 'ar' ? 'ar' : 'en', labels = copy[current];
    document.documentElement.lang = current; document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
    page.querySelectorAll('.s-page__composer-menu-label').forEach((label, index) => { label.textContent = labels.menu[index]; });
    page.querySelector('.s-page__visually-hidden').textContent = labels.ask; addButton.setAttribute('aria-label', labels.add); submit.setAttribute('aria-label', labels.submit);
    language.classList.toggle('is-active', current === 'en'); language.setAttribute('aria-pressed', String(current === 'en')); language.setAttribute('aria-label', labels.language);
    sectionLanguage.classList.toggle('is-active', current === 'en'); sectionLanguage.setAttribute('aria-pressed', String(current === 'en')); sectionLanguage.setAttribute('aria-label', labels.language);
    updateInputLanguage();
    renderBookingFlow({ clearSectionInput, placeSectionCaret });
  };
  const toggleSectionComposerLanguage = () => {
    const wasFocused = document.activeElement === sectionInput;
    applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar', {
      clearSectionInput: true,
      placeSectionCaret: wasFocused
    });
  };
  const applyTheme = (next) => {
    const day = next === 'day', labels = copy[document.documentElement.lang === 'ar' ? 'ar' : 'en'];
    document.documentElement.classList.toggle('is-day-mode', day); theme.classList.toggle('is-active', !day); theme.setAttribute('aria-pressed', String(!day)); theme.setAttribute('aria-label', day ? labels.dark : labels.day); document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000');
  };
  const referenceY = () => Number.parseFloat(getComputedStyle(content).paddingTop) || 0;
  const activeIndex = () => sections.reduce((closest, section, index) => { const distance = Math.abs(section.getBoundingClientRect().top - referenceY()); return !closest || distance < closest.distance ? { index, distance } : closest; }, null)?.index ?? 0;
  const transition = (direction) => {
    if (!direction || locked) return;
    const current = activeIndex(), targetIndex = Math.max(0, Math.min(sections.length - 1, current + direction)), target = sections[targetIndex];
    if (!target || targetIndex === current) return;
    locked = true; clearTimeout(unlockTimer); unlockTimer = setTimeout(() => { locked = false; }, 800);
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - referenceY(), left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };
  // Section 1 gets one closed-keyboard frame at load. It is intentionally never
  // re-measured on resize/orientation events: those events can arrive while a
  // mobile browser is still reporting its keyboard viewport.
  const establishClosedComposerBaseline = () => {
    if (closedComposerFrameHeight) return;
    closedComposerFrameHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight));
    page.style.setProperty('--s-consultation-frame-height', `${closedComposerFrameHeight}px`);
    closedComposerBottom = sectionComposerUnit.getBoundingClientRect().bottom;
  };
  const setSectionComposerKeyboardOffset = (offset) => {
    const nextOffset = Math.max(0, Number.isFinite(offset) ? offset : 0);
    if (Math.abs(nextOffset - appliedKeyboardOffset) < .01) return;
    appliedKeyboardOffset = nextOffset;
    page.style.setProperty('--s-consultation-keyboard-offset', `${nextOffset.toFixed(2)}px`);
    sectionComposerUnit.classList.toggle('is-keyboard-offset', nextOffset > 0);
  };
  const cancelSectionComposerKeyboardSync = () => {
    keyboardViewportRevision += 1;
    if (!keyboardSyncFrame) return;
    cancelAnimationFrame(keyboardSyncFrame);
    keyboardSyncFrame = 0;
  };
  const restoreClosedSectionComposerBaseline = () => {
    const shouldRestorePageScroll = keyboardSessionActive && keyboardSessionScrollY !== null;
    const targetScrollY = keyboardSessionScrollY;
    keyboardSessionActive = false;
    keyboardOpen = false;
    keyboardSessionScrollY = null;
    keyboardBaselineViewportHeight = 0;
    cancelSectionComposerKeyboardSync();
    // This is the single closed state writer. Clearing the class removes the
    // transform entirely, rather than leaving a zero-valued translate behind.
    appliedKeyboardOffset = 0;
    page.style.setProperty('--s-consultation-keyboard-offset', '0px');
    sectionComposerUnit.classList.remove('is-keyboard-offset');
    // Mobile browsers can native-pan the document to keep the focused field
    // visible. Restore only that pre-keyboard position on close; navigation
    // remains the only other code path allowed to call scrollTo.
    if (shouldRestorePageScroll && Math.abs(window.scrollY - targetScrollY) > .5) {
      window.scrollTo({ top: targetScrollY, left: 0, behavior: 'auto' });
    }
  };
  const currentVisualViewport = () => {
    const viewport = window.visualViewport;
    return viewport && Number.isFinite(viewport.height) && Number.isFinite(viewport.offsetTop) ? viewport : null;
  };
  const beginSectionKeyboardSession = () => {
    const viewport = currentVisualViewport();
    keyboardSessionActive = true;
    keyboardOpen = false;
    keyboardSessionScrollY = window.scrollY;
    keyboardBaselineViewportHeight = Math.max(window.innerHeight, viewport?.height || 0);
    closedComposerBottom = sectionComposerUnit.getBoundingClientRect().bottom;
  };
  const isSectionKeyboardClosed = () => {
    const viewport = currentVisualViewport();
    return document.activeElement !== sectionInput
      || !viewport
      || keyboardBaselineViewportHeight <= 0
      || !keyboardOpen
      || keyboardBaselineViewportHeight - viewport.height < 80;
  };
  const syncSectionComposerKeyboard = (revision) => {
    if (revision !== keyboardViewportRevision) return;
    if (isSectionKeyboardClosed()) {
      restoreClosedSectionComposerBaseline();
      return;
    }
    const viewport = currentVisualViewport();
    if (!viewport) return;
    // Restore the proven 12px gap method: calculate only the amount needed to
    // place the fixed closed-baseline bottom above the CURRENT visual viewport.
    // No document scroll, previous transform, or previous keyboard offset is used.
    const keyboardTop = viewport.offsetTop + viewport.height;
    const nextOffset = Math.max(0, closedComposerBottom - keyboardTop + 12);
    setSectionComposerKeyboardOffset(nextOffset);
  };
  const scheduleSectionComposerKeyboard = () => {
    if (document.activeElement !== sectionInput) {
      restoreClosedSectionComposerBaseline();
      return;
    }
    if (!keyboardSessionActive) beginSectionKeyboardSession();
    const viewport = currentVisualViewport();
    if (!viewport) return;
    if (keyboardBaselineViewportHeight - viewport.height < 80) {
      if (keyboardOpen) restoreClosedSectionComposerBaseline();
      return;
    }
    keyboardOpen = true;
    if (keyboardSyncFrame) return;
    const revision = keyboardViewportRevision;
    keyboardSyncFrame = requestAnimationFrame(() => {
      keyboardSyncFrame = 0;
      syncSectionComposerKeyboard(revision);
    });
  };
  const setupFace = () => {
    const face = addButton.querySelector('[data-s-x-face]');
    const eyes = face?.querySelector('.s-page__x-face-eyes');
    const motion = face?.querySelector('.s-page__x-face-eye-motion');
    if (!face || !eyes || !motion) return;
    let pointer = null;
    let gaze = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    const render = (time) => {
      gaze.x += (target.x - gaze.x) * .16;
      gaze.y += (target.y - gaze.y) * .16;
      const blinkPhase = ((time / 1000 + .7) % 5.6) / 5.6;
      const blink = 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .022, 2)));
      eyes.setAttribute('transform', `translate(${gaze.x.toFixed(3)} ${gaze.y.toFixed(3)})`);
      motion.setAttribute('transform', `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)`);
      requestAnimationFrame(render);
    };
    addButton.addEventListener('pointerdown', (event) => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
    addButton.addEventListener('pointermove', (event) => {
      if (!pointer) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y, magnitude = Math.max(1, Math.hypot(dx, dy));
      target = { x: Math.max(-1.1, Math.min(1.1, dx / magnitude * 1.1)), y: Math.max(-1.1, Math.min(1.1, dy / magnitude * 1.1)) };
    }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => addButton.addEventListener(name, () => { pointer = null; target = { x: 0, y: 0 }; }, { passive: true }));
    requestAnimationFrame(render);
  };

  composer.addEventListener('submit', (event) => { event.preventDefault(); setMenuOpen(!menu.classList.contains('is-open')); });
  composer.addEventListener('pointerdown', (event) => { if (event.target === composer) composer.classList.add('is-pulsing'); }, { passive: true });
  composer.addEventListener('animationend', () => composer.classList.remove('is-pulsing'));
  input.addEventListener('input', updateInputLanguage);
  sectionInput.addEventListener('focus', beginSectionKeyboardSession);
  sectionInput.addEventListener('blur', restoreClosedSectionComposerBaseline);
  sectionComposer.addEventListener('submit', (event) => {
    event.preventDefault();
    if (booking.complete) { transition(1); return; }
    submitBooking();
  });
  discountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    discountApplied = discountInput.value.trim().length > 0;
    renderSummary();
  });
  page.querySelector('[data-s-consultation-pay]').addEventListener('click', (event) => { event.preventDefault(); });
  sectionSend.addEventListener('pointerdown', (event) => { if (!booking.complete) event.preventDefault(); });
  sectionChoiceTray.addEventListener('click', (event) => {
    const option = event.target.closest('[data-s-consultation-choice]');
    const step = currentBookingStep();
    if (!option || !sectionChoiceTray.contains(option) || step.type !== 'choice' || booking.complete) return;
    event.preventDefault();
    const language = bookingLanguage();
    const value = bookingCopy[language].options[step.options]?.find(([id]) => id === option.dataset.sConsultationChoice)?.[1];
    if (value) addBookingAnswer(step, value, option.dataset.sConsultationChoice);
  });
  sectionLanguage.addEventListener('pointerdown', (event) => { event.preventDefault(); event.stopPropagation(); });
  sectionLanguage.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleSectionComposerLanguage(); });
  addButton.addEventListener('click', (event) => { event.stopPropagation(); setMenuOpen(false); });
  theme.addEventListener('click', (event) => { event.stopPropagation(); applyTheme(document.documentElement.classList.contains('is-day-mode') ? 'dark' : 'day'); });
  language.addEventListener('pointerdown', (event) => { event.preventDefault(); event.stopPropagation(); });
  language.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleSectionComposerLanguage(); });
  menuItems.forEach((item, index) => { item.addEventListener('pointerdown', () => { item.classList.add('is-active'); setTimeout(() => item.classList.remove('is-active'), 120); }, { passive: true }); if (index === 0) item.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); setMenuOpen(false); window.location.assign('/bm'); }); });
  document.addEventListener('pointerdown', (event) => {
    if (!composer.contains(event.target)) setMenuOpen(false);
    if (!sectionComposer.contains(event.target) && document.activeElement === sectionInput) sectionInput.blur();
  }, { passive: true });
  document.addEventListener('touchstart', (event) => { if (event.target.closest('[data-s-composer], [data-s-consultation-composer], [data-s-consultation-choice-tray]')) return; const item = event.changedTouches[0]; if (item) touch = { id: item.identifier, y: item.clientY }; }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => { const item = Array.from(event.changedTouches).find((candidate) => candidate.identifier === touch?.id); if (item && item.clientY !== touch.y) event.preventDefault(); }, { capture: true, passive: false });
  document.addEventListener('touchend', (event) => { const item = Array.from(event.changedTouches).find((candidate) => candidate.identifier === touch?.id); if (item && Math.abs(item.clientY - touch.y) >= 36) transition(item.clientY < touch.y ? 1 : -1); if (item) touch = null; }, { capture: true, passive: true });
  window.addEventListener('wheel', (event) => { event.preventDefault(); if (Math.abs(event.deltaY) >= 8) transition(event.deltaY > 0 ? 1 : -1); }, { passive: false });
  window.addEventListener('keydown', (event) => { if (![' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key) || event.target.closest('input, textarea, [contenteditable="true"]')) return; event.preventDefault(); if (event.key === 'Home') transition(-sections.length); else if (event.key === 'End') transition(sections.length); else transition([' ', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1); }, { passive: false });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      scheduleSectionComposerKeyboard();
    }, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleSectionComposerKeyboard, { passive: true });
  }
  window.addEventListener('resize', () => {
    // Layout/orientation changes may update booking geometry, but never the
    // Section 1 composer baseline. The viewport listener owns keyboard lift.
    if (!window.visualViewport) restoreClosedSectionComposerBaseline();
    scheduleBookingGeometry();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    if (!keyboardSessionActive || !keyboardOpen || keyboardSessionScrollY === null) return;
    if (Math.abs(window.scrollY - keyboardSessionScrollY) > .5) {
      // Keep Section 1 fixed while the browser tries to native-pan the focused
      // field. This is a corrective guard, not part of keyboard offset math.
      window.scrollTo({ top: keyboardSessionScrollY, left: 0, behavior: 'auto' });
    }
  }, { passive: true });
  document.documentElement.classList.add('s-x-discrete-sections');
  applyLanguage('en'); applyTheme('dark'); setupFace(); establishClosedComposerBaseline();
  requestAnimationFrame(() => { renderBookingFlow(); restoreClosedSectionComposerBaseline(); document.documentElement.classList.remove('s-x-initializing'); });
})();
