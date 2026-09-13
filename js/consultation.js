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
  const sectionAnswerHistory = page?.querySelector('[data-s-consultation-answer-history]');
  const sectionChoiceTray = page?.querySelector('[data-s-consultation-choice-tray]');
  const sectionSuccess = page?.querySelector('[data-s-consultation-composer-success]');
  const sectionSend = sectionComposer?.querySelector('.s-page__consultation-composer-send');
  const summary = page?.querySelector('[data-s-consultation-summary]');
  const discountForm = page?.querySelector('[data-s-consultation-discount-form]');
  const discountInput = page?.querySelector('[data-s-consultation-discount-input]');
  const discountStatus = page?.querySelector('[data-s-consultation-discount-status]');
  const paymentOptions = Array.from(page?.querySelectorAll('[data-consultation-payment]') || []);
  const paymentStatus = page?.querySelector('[data-s-consultation-payment-status]');
  const menuItems = Array.from(page?.querySelectorAll('.s-page__composer-menu-item') || []);
  if (!page || !content || !composer || !menu || !utilities || !addButton || !input || !submit || !theme || !language || !sectionComposerUnit || !sectionComposer || !sectionInput || !sectionLanguage || !sectionAnswerHistory || !sectionChoiceTray || !sectionSuccess || !sectionSend || !summary || !discountForm || !discountInput || !discountStatus || !paymentStatus || sections.length !== 2) return;

  const copy = {
    en: { menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'], ask: 'Ask ooxme', add: 'Add context', submit: 'Submit question', language: 'Switch to Arabic', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode' },
    ar: { menu: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'], ask: 'اسأل اوكسوم', add: 'اضف سياقًا', submit: 'ارسال السؤال', language: 'Switch to English', day: 'Switch to Day Mode', dark: 'Switch to Dark Mode' }
  };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let menuTimer = 0, locked = false, unlockTimer = 0, transitionSettleTimer = 0, touch = null;
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
        day: [],
        time: [],
        duration: [['45', '45 minutes'], ['60', '60 minutes'], ['90', '90 minutes'], ['120', '120 minutes']]
      },
      success: 'Booking received successfully', send: 'Submit answer', confirm: 'Confirm booking', message: 'Consultation answer'
    },
    ar: {
      questions: { name: 'ما اسمك؟', phone: 'ما رقم هاتفك؟', email: 'ما بريدك الإلكتروني؟', sector: 'اختر قطاع عملك:', topic: 'اختر موضوع الاستشارة:', day: 'اختر يوماً مناسباً:', time: 'اختر وقتاً مناسباً:', duration: 'اختر المدة التي تحتاجها:', confirm: 'تأكيد ومتابعة' },
      options: {
        sector: [['engineering', 'هندسي'], ['commercial', 'تجاري'], ['other', 'أخرى']],
        topic: [['brand-management', 'إدارة العلامة التجارية'], ['business-development', 'تطوير الأعمال'], ['other', 'أخرى']],
        day: [],
        time: [],
        duration: [['45', '45 دقيقة'], ['60', '60 دقيقة'], ['90', '90 دقيقة'], ['120', '120 دقيقة']]
      },
      success: 'تم استلام حجزك بنجاح', send: 'إرسال الإجابة', confirm: 'تأكيد الحجز', message: 'إجابة الاستشارة'
    }
  };
  const booking = { index: 0, answers: [], complete: false, payment: '' };
  const successMessages = {
    en: { full: 'Booking received successfully', short: 'Received successfully' },
    ar: { full: 'تم استلام حجزك بنجاح', short: 'استلم بنجاح' }
  };
  const consultationPrices = new Map([[45, 30], [60, 50], [90, 75], [120, 100]]);
  const bookingAvailability = { days: [], timesByDate: new Map(), loadingDays: false, loadingDate: '' };
  let discountCode = '';
  let discountQuote = null;
  let discountLoading = false;
  let bookingSubmission = null;
  let bookingStatus = '';
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
  const formatDayLabel = (date, language) => {
    const value = new Date(`${date}T12:00:00+03:00`);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-IQ' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Baghdad' }).format(value);
  };
  const choicesFor = (step, language) => {
    if (step.id === 'day') return bookingAvailability.days.map(({ date }) => [date, formatDayLabel(date, language)]);
    if (step.id === 'time') {
      const selectedDay = booking.answers.find((item) => item.step === 'day')?.choice;
      return (selectedDay ? (bookingAvailability.timesByDate.get(`${selectedDay}:45`) || []) : []).map((time) => [time, time]);
    }
    return bookingCopy[language].options[step.options] || [];
  };
  const resolveChoice = (answer, language) => {
    if (!answer.choice) return answer.value;
    const step = bookingSteps.find((item) => item.id === answer.step);
    if (step?.id === 'day') return formatDayLabel(answer.choice, language);
    return choicesFor(step, language).find(([id]) => id === answer.choice)?.[1] || answer.value;
  };
  const answerFor = (stepId) => booking.answers.find((item) => item.step === stepId);
  const selectedDuration = () => Number(answerFor('duration')?.choice || answerFor('duration')?.value || 0);
  const currentQuote = () => discountQuote && Number(discountQuote.durationMinutes) === selectedDuration() ? discountQuote : null;
  const formatMoney = (value) => Number.isFinite(Number(value)) ? `$${Number(value).toFixed(0)}` : '—';
  const renderSummary = () => {
    const language = bookingLanguage();
    const ar = language === 'ar';
    const labels = ar ? {
      title: 'ملخص الاستشارة', topic: 'موضوع الاستشارة', day: 'اليوم المحدد', time: 'الوقت المحدد', duration: 'المدة المحددة', pricing: 'الأسعار', base: 'السعر الأساسي', discount: 'مبلغ الخصم', total: 'الإجمالي النهائي', discountCode: 'رمز الخصم', discountInput: 'رمز الخصم', placeholder: 'غير محدد', codePlaceholder: 'أدخل الرمز', apply: 'تطبيق', applied: 'تم تطبيق الرمز', applying: 'جارٍ التحقق…', payment: 'الدفع', paymentMethod: 'وسيلة الدفع', zainCash: 'زين كاش', qi: 'سوبر كي', pay: 'ادفع وأكد', choosePayment: 'اختر وسيلة الدفع', paymentRequired: 'اختر وسيلة دفع للمتابعة', booking: 'جارٍ تأكيد الحجز…', bookingError: 'تعذر تأكيد الحجز الآن.'
    } : {
      title: 'Consultation Summary', topic: 'Consultation topic', day: 'Selected day', time: 'Selected time', duration: 'Selected duration', pricing: 'Pricing', base: 'Base Price', discount: 'Discount Amount', total: 'Final Total', discountCode: 'Discount Code', discountInput: 'Discount code', placeholder: 'Not selected', codePlaceholder: 'Enter code', apply: 'Apply', applied: 'Discount applied', applying: 'Checking…', payment: 'Payment', paymentMethod: 'Payment method', zainCash: 'Zain Cash', qi: 'SuperQi', pay: 'Pay & Confirm', choosePayment: 'Choose a payment method', paymentRequired: 'Choose a payment method to continue', booking: 'Confirming booking…', bookingError: 'We could not confirm the booking right now.'
    };
    const valueFor = (stepId) => { const answer = answerFor(stepId); return answer ? resolveChoice(answer, language) : labels.placeholder; };
    const duration = selectedDuration();
    const baseAmount = currentQuote()?.baseAmount ?? consultationPrices.get(duration);
    const quote = currentQuote();
    const discountAmount = quote ? quote.discountAmount : 0;
    const finalAmount = quote ? quote.finalAmount : baseAmount;
    summary.querySelector('[data-s-summary-title]').textContent = labels.title;
    summary.querySelectorAll('[data-s-summary-label]').forEach((node) => { const key = node.dataset.sSummaryLabel; if (labels[key]) node.textContent = labels[key]; });
    summary.querySelectorAll('[data-s-summary-heading]').forEach((node) => { const key = node.dataset.sSummaryHeading; if (labels[key]) node.textContent = labels[key]; });
    ['topic', 'day', 'time', 'duration'].forEach((key) => { summary.querySelector(`[data-s-summary-value="${key}"]`).textContent = valueFor(key); });
    const baseValue = summary.querySelector('[data-s-summary-value="base"]');
    const discountCodeValue = summary.querySelector('[data-s-summary-value="discountCode"]');
    const discountValue = summary.querySelector('[data-s-summary-value="discount"]');
    const totalValue = summary.querySelector('[data-s-summary-value="total"]');
    baseValue.textContent = duration ? formatMoney(baseAmount) : '—';
    discountCodeValue.textContent = discountCode || '—';
    discountValue.textContent = quote ? formatMoney(discountAmount) : discountLoading ? labels.applying : '—';
    totalValue.textContent = duration ? (quote || !discountCode ? formatMoney(finalAmount) : labels.applying) : '—';
    discountValue.classList.toggle('is-applied', Boolean(quote && discountAmount));
    totalValue.classList.toggle('is-pending', Boolean(discountCode && !quote));
    discountInput.placeholder = labels.codePlaceholder;
    discountInput.setAttribute('aria-label', labels.discountInput);
    page.querySelector('[data-s-consultation-apply]').textContent = labels.apply;
    page.querySelector('[data-s-consultation-pay]').textContent = quote?.finalAmount === 0 ? (ar ? 'تأكيد الحجز' : 'Confirm Booking') : labels.pay;
    discountStatus.textContent = discountLoading ? labels.applying : (discountCode && quote ? `${labels.applied}: ${discountCode}` : bookingStatus);
    summary.dir = language === 'ar' ? 'rtl' : 'ltr';
    summary.lang = language;
    const paymentGroup = page.querySelector('[data-s-consultation-payment-options]');
    if (paymentGroup) paymentGroup.setAttribute('aria-label', labels.paymentMethod);
    paymentOptions.forEach((button) => {
      button.textContent = button.dataset.consultationPayment === 'ZainCash' ? labels.zainCash : labels.qi;
    });
    paymentStatus.textContent = quote?.finalAmount === 0 || booking.payment ? '' : (paymentStatus.classList.contains('is-error') ? labels.paymentRequired : labels.choosePayment);
    paymentOptions.forEach((button) => button.classList.toggle('is-selected', button.dataset.consultationPayment === booking.payment));
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
    booking.answers.forEach((answer, answerIndex) => {
      const row = document.createElement('p');
      row.className = `s-page__consultation-answer-row ${language === 'ar' ? 'is-arabic-answer' : 'is-english-answer'}`;
      row.lang = language;
      row.dir = language === 'ar' ? 'rtl' : 'ltr';
      row.textContent = resolveChoice(answer, language);
      if (!booking.complete) {
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        const rewind = () => {
          booking.answers = booking.answers.slice(0, answerIndex);
          booking.index = answerIndex;
          bookingStatus = '';
          renderBookingFlow({ clearSectionInput: true });
        };
        row.addEventListener('click', rewind);
        row.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); rewind(); } });
      }
      fragment.append(row);
    });
    sectionAnswerHistory.replaceChildren(fragment);
    sectionComposerUnit.classList.toggle('has-history', booking.answers.length > 0);
  };
  const loadNearestBookingDays = async () => {
    if (bookingAvailability.loadingDays || bookingAvailability.days.length) return;
    bookingAvailability.loadingDays = true;
    renderBookingFlow();
    try {
      const response = await fetch('/api/booking/available-slots?duration=45&limit=4', { headers: { Accept: 'application/json' } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(body.days)) throw new Error(body.error || 'availability_unavailable');
      bookingAvailability.days = body.days.filter((item) => item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Array.isArray(item.times) && item.times.length);
    } catch (_) {
      bookingStatus = bookingLanguage() === 'ar' ? 'تعذر تحميل المواعيد المتاحة.' : 'Available times could not be loaded.';
    } finally {
      bookingAvailability.loadingDays = false;
      renderBookingFlow();
    }
  };
  const loadTimesForDate = async (date, duration = 45) => {
    const key = `${date}:${duration}`;
    if (!date || bookingAvailability.timesByDate.has(key) || bookingAvailability.loadingDate === date) return;
    bookingAvailability.loadingDate = date;
    renderBookingFlow();
    try {
      const response = await fetch(`/api/booking/available-slots?date=${encodeURIComponent(date)}&duration=${duration}&limit=4`, { headers: { Accept: 'application/json' } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(body.times)) throw new Error(body.error || 'availability_unavailable');
      bookingAvailability.timesByDate.set(key, body.times.slice(0, 4));
    } catch (_) {
      bookingStatus = bookingLanguage() === 'ar' ? 'تعذر تحميل الأوقات المتاحة.' : 'Available times could not be loaded.';
    } finally {
      bookingAvailability.loadingDate = '';
      renderBookingFlow();
    }
  };
  const renderChoices = (step, language) => {
    sectionChoiceTray.replaceChildren();
    if (booking.complete || step.type !== 'choice') {
      sectionChoiceTray.classList.remove('is-visible');
      return;
    }
    const selectedDay = answerFor('day')?.choice;
    if (step.id === 'time' && selectedDay && !bookingAvailability.timesByDate.has(`${selectedDay}:45`)) void loadTimesForDate(selectedDay, 45);
    const choices = choicesFor(step, language);
    const loading = (step.id === 'day' && bookingAvailability.loadingDays) || (step.id === 'time' && bookingAvailability.loadingDate === selectedDay);
    const visibleChoices = loading ? [['loading', language === 'ar' ? 'جارٍ تحميل المواعيد…' : 'Loading availability…']] : choices;
    if (!visibleChoices.length) {
      sectionChoiceTray.classList.remove('is-visible');
      return;
    }
    const fragment = document.createDocumentFragment();
    visibleChoices.forEach(([id, label]) => {
      const option = document.createElement('button');
      option.className = `s-page__consultation-choice ${language === 'ar' ? 'is-arabic-choice' : 'is-english-choice'}`;
      option.type = 'button';
      option.dataset.sConsultationChoice = id;
      option.textContent = label;
      option.lang = language;
      option.dir = language === 'ar' ? 'rtl' : 'ltr';
      option.disabled = loading;
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
  const stableChoiceValue = (stepId) => {
    const answer = answerFor(stepId);
    if (!answer) return '';
    if (!answer.choice) return answer.value;
    const step = bookingSteps.find((item) => item.id === stepId);
    if (stepId === 'day' || stepId === 'time') return answer.choice;
    return bookingCopy.en.options[step?.options]?.find(([id]) => id === answer.choice)?.[1] || answer.value;
  };
  const verifySelectedSlot = async (date, time, duration) => {
    const response = await fetch(`/api/booking/available-slots?date=${encodeURIComponent(date)}&duration=${duration}&limit=4`, { headers: { Accept: 'application/json' } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'availability_unavailable');
    if (!Array.isArray(body.times) || !body.times.includes(time)) throw new Error('slot_unavailable');
  };
  async function submitCalendarBooking() {
    if (bookingSubmission || booking.complete) return bookingSubmission;
    const date = stableChoiceValue('day');
    const time = stableChoiceValue('time');
    const duration = selectedDuration();
    if (!date || !time || !duration) return false;
    const quote = currentQuote();
    if (discountCode && !quote) {
      bookingStatus = bookingLanguage() === 'ar' ? 'يرجى انتظار التحقق من الخصم.' : 'Please wait for the discount to finish checking.';
      renderSummary();
      return false;
    }
    if ((quote?.finalAmount ?? consultationPrices.get(duration)) > 0 && !booking.payment) {
      paymentStatus.textContent = bookingLanguage() === 'ar' ? 'اختر وسيلة دفع للمتابعة.' : 'Choose a payment method to continue.';
      paymentStatus.classList.add('is-error');
      return false;
    }
    paymentStatus.classList.remove('is-error');
    bookingStatus = bookingLanguage() === 'ar' ? 'جارٍ تأكيد الحجز…' : 'Confirming booking…';
    renderSummary();
    bookingSubmission = verifySelectedSlot(date, time, duration).then(() => fetch('/api/booking/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        date,
        time,
        duration,
        payment: booking.payment,
        promoCode: discountCode,
        customer: {
          name: stableChoiceValue('name'),
          email: stableChoiceValue('email'),
          phone: stableChoiceValue('phone'),
          topic: stableChoiceValue('topic'),
          sector: stableChoiceValue('sector'),
          additional: ''
        }
      })
    })).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'booking_unavailable');
      booking.complete = true;
      bookingStatus = bookingLanguage() === 'ar' ? `تم تأكيد الحجز ${body.id || ''}`.trim() : `Booking confirmed${body.id ? ` — ${body.id}` : ''}`;
      if (currentQuote()) discountQuote = { ...currentQuote(), finalAmount: Number(body.finalAmount), currency: body.currency };
      renderBookingFlow({ clearSectionInput: true });
      return body;
    }).catch((error) => {
      bookingStatus = error.message === 'slot_unavailable'
        ? (bookingLanguage() === 'ar' ? 'هذا الوقت لم يعد متاحاً. اختر وقتاً آخر.' : 'This time is no longer available. Choose another.')
        : (bookingLanguage() === 'ar' ? 'تعذر تأكيد الحجز الآن.' : 'We could not confirm the booking right now.');
      renderSummary();
      throw error;
    }).finally(() => { bookingSubmission = null; });
    return bookingSubmission;
  }
  const addBookingAnswer = (step, value, choice = '') => {
    const keepTextFocus = step.type === 'text' && document.activeElement === sectionInput;
    booking.answers.push({ step: step.id, value, choice });
    booking.index += 1;
    renderBookingFlow({ clearSectionInput: step.type === 'text', placeSectionCaret: keepTextFocus });
    if (step.id === 'duration' && discountCode) void validateDiscountCode({ showFeedback: false });
  };
  const completeBooking = () => {
    if (booking.complete) return;
    void submitCalendarBooking();
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
    try { localStorage.setItem('ooxme-language', current); } catch (_) {}
    window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language: current } }));
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
    // Section 2 must be entered from a clean Section 1 visual state. Clear the
    // keyboard transform and any native-pan correction before reading geometry.
    restoreClosedSectionComposerBaseline();
    const current = activeIndex(), targetIndex = Math.max(0, Math.min(sections.length - 1, current + direction)), target = sections[targetIndex];
    if (!target || targetIndex === current) return;
    clearTimeout(transitionSettleTimer);
    locked = true; clearTimeout(unlockTimer); unlockTimer = setTimeout(() => { locked = false; }, 800);
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - referenceY(), left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    const settleTargetSection = () => {
      clearTimeout(transitionSettleTimer);
      transitionSettleTimer = 0;
      const correction = target.getBoundingClientRect().top - referenceY();
      if (Math.abs(correction) > .5) window.scrollTo({ top: window.scrollY + correction, left: 0, behavior: 'auto' });
    };
    if ('onscrollend' in window) window.addEventListener('scrollend', settleTargetSection, { once: true, passive: true });
    transitionSettleTimer = setTimeout(settleTargetSection, reducedMotion.matches ? 80 : 900);
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
  const validateDiscountCode = async ({ showFeedback = true } = {}) => {
    const code = discountInput.value.trim().toUpperCase();
    discountCode = code;
    discountQuote = null;
    discountLoading = Boolean(code);
    bookingStatus = '';
    renderSummary();
    if (!code) {
      discountLoading = false;
      renderSummary();
      return true;
    }
    const duration = selectedDuration();
    if (!duration) {
      discountLoading = false;
      bookingStatus = bookingLanguage() === 'ar' ? 'اختر المدة أولاً.' : 'Choose a duration first.';
      renderSummary();
      return false;
    }
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ promoCode: code, serviceCode: 'consultation', durationMinutes: duration })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.success || !body.data?.quote) throw new Error(body.error || 'promotion_unavailable');
      discountQuote = body.data.quote;
      discountCode = body.data.promoCode || code;
      discountInput.value = discountCode;
      if (showFeedback) bookingStatus = '';
      return true;
    } catch (_) {
      discountCode = '';
      discountInput.value = code;
      bookingStatus = bookingLanguage() === 'ar' ? 'رمز الخصم غير صالح.' : 'Invalid discount code.';
      return false;
    } finally {
      discountLoading = false;
      renderSummary();
    }
  };
  discountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    void validateDiscountCode();
  });
  page.querySelector('[data-s-consultation-pay]').addEventListener('click', (event) => {
    event.preventDefault();
    if (!booking.complete) void submitCalendarBooking();
  });
  paymentOptions.forEach((button) => button.addEventListener('click', () => {
    if (booking.complete) return;
    booking.payment = button.dataset.consultationPayment || '';
    paymentStatus.classList.remove('is-error');
    paymentStatus.textContent = '';
    renderSummary();
  }));
  sectionSend.addEventListener('pointerdown', (event) => { if (!booking.complete) event.preventDefault(); });
  sectionChoiceTray.addEventListener('click', (event) => {
    const option = event.target.closest('[data-s-consultation-choice]');
    const step = currentBookingStep();
    if (!option || !sectionChoiceTray.contains(option) || step.type !== 'choice' || booking.complete) return;
    event.preventDefault();
    const language = bookingLanguage();
    const value = choicesFor(step, language).find(([id]) => id === option.dataset.sConsultationChoice)?.[1];
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
  let initialLanguage = 'en';
  try { initialLanguage = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(initialLanguage); applyTheme('dark'); setupFace(); establishClosedComposerBaseline();
  requestAnimationFrame(() => { renderBookingFlow(); restoreClosedSectionComposerBaseline(); document.documentElement.classList.remove('s-x-initializing'); void loadNearestBookingDays(); });
})();
