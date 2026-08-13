const root = document.documentElement;
const track = document.querySelector('[data-booking-track]');
const panels = [...document.querySelectorAll('.booking-panel')];
const experience = document.querySelector('.master-panel-experience');
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchInput = document.querySelector('[data-search-input]');
const suggestion = document.querySelector('[data-search-suggestion]');
const bookingViewportMeta = document.querySelector('meta[name="viewport"]');
if (bookingViewportMeta && !/maximum-scale/i.test(bookingViewportMeta.content)) {
  bookingViewportMeta.content = `${bookingViewportMeta.content}, maximum-scale=1`;
}
const copy = { en: { months:['January','February','March','April','May','June','July','August','September','October','November','December'], weekdays:['S','M','T','W','T','F','S'], summary:{name:'Customer name',email:'Email',phone:'Phone',topic:'Consultation topic',sector:'Business sector',date:'Selected date',time:'Selected time',duration:'Duration',promo:'Promo code',fee:'Consultation fee',discount:'Discount',total:'Final amount'}, confirmPay:'Confirm & Pay',confirm:'Confirm',promoValid:'Discount applied', promoInvalid:'Invalid code' }, ar: { months:['يناير','فبراير','مارس','ابريل','مايو','يونيو','يوليو','اغسطس','سبتمبر','اكتوبر','نوفمبر','ديسمبر'], weekdays:['ح','ن','ث','ر','خ','ج','س'], summary:{name:'اسم العميل',email:'البريد الالكتروني',phone:'الهاتف',topic:'موضوع الاستشارة',sector:'قطاع العمل',date:'التاريخ المختار',time:'الوقت المختار',duration:'المدة',promo:'كود الخصم',fee:'سعر الاستشارة',discount:'الخصم',total:'المبلغ النهائي'}, confirmPay:'تأكيد والدفع',confirm:'تأكيد',promoValid:'تم تطبيق الخصم',promoInvalid:'الكود غير صالح' } };
const empty = { promo:'', offerToken:'', offerSession:'', serverQuote:null, name:'', email:'', phone:'', sector:'', topic:'', additional:'', date:'', time:'', duration:'', payment:'' };
// Keep the approved design while enforcing the existing booking-step validation.
const BOOKING_DESIGN_MODE = false;
let state = {...empty};
try { state = {...empty, ...JSON.parse(sessionStorage.getItem('ooxme-rebuild-booking') || '{}')}; } catch (_) {}
const offerTokenFromUrl = new URLSearchParams(window.location.search).get('offerToken') || '';
const offerSessionFromUrl = new URLSearchParams(window.location.search).get('offerSession') || '';
state.offerToken = offerTokenFromUrl;
state.offerSession = offerSessionFromUrl;
if (state.offerToken) state.duration = '45';
let updateBookingSummary = () => {};
const save = () => {
  try { sessionStorage.setItem('ooxme-rebuild-booking', JSON.stringify(state)); } catch (_) {}
  updateBookingSummary();
  /* The final panel is a live projection of booking data, not a reached-step flag. */
  updateConfirmationPanel?.({ animate: step === panels.length - 1 });
};
const price = () => ({45:25,60:40,90:60}[Number(state.duration)] || 0);
const activeServerQuote = () => state.serverQuote && Number(state.serverQuote.durationMinutes) === Number(state.duration) ? state.serverQuote : null;
const discount = () => Number(activeServerQuote()?.discountAmount || 0);
const total = () => activeServerQuote() ? Number(activeServerQuote().finalAmount) : price();
let language = 'en'; try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
const consultationCopy = {
  en: {
    promoDescription: 'Have a valid discount code? Use it now or skip.', promoPlaceholder: 'Discount code', promoApplied: 'Code applied', promoTestApplied: 'Test code applied', promoInvalid: 'Inactive code',
    calendarAvailable: 'Available days are shown in blue', calendarBooked: 'Fully booked days are shown in gray', calendarWarning: 'This day is fully booked. Choose another day.',
    errors: { name: 'Name is required', email: 'Email is invalid', phone: 'Phone number is incomplete', topic: 'Consultation topic is required', sector: 'Business sector is required', additional: 'Additional information is required' }
  },
  ar: {
    promoDescription: 'هل لديك كود خصم ساري؟ استخدمه الان او تخطى', promoPlaceholder: 'كود الخصم', promoApplied: 'تم تطبيق الكود', promoTestApplied: 'تم تطبيق كود اختباري', promoInvalid: 'كود غير فعال',
    calendarAvailable: 'الايام المتاحة تظهر باللون الازرق', calendarBooked: 'الايام الممتلئة تظهر باللون الرمادي', calendarWarning: 'هذا اليوم ممتلئ بالحجوزات، اختر يوم اخر',
    errors: { name: 'الاسم مطلوب', email: 'البريد الالكتروني غير صحيح', phone: 'رقم الهاتف غير مكتمل', topic: 'موضوع الاستشارة مطلوب', sector: 'قطاع العمل مطلوب', additional: 'معلومات اضافية مطلوبة' }
  }
};
const landscapeStepCopy = { promo:{en:'Enter a promo code if you have one',ar:'ادخل كود الخصم اذا كان لديك'}, customer:{en:'Tell us the details we need for your consultation',ar:'ادخل المعلومات المطلوبة للاستشارة'}, date:{en:'Choose an available date for your consultation',ar:'اختر يوماً متاحاً للاستشارة'}, time:{en:'Choose the consultation time and duration',ar:'اختر وقت ومدة الاستشارة'}, summary:{en:'Review your booking details before confirming',ar:'راجع تفاصيل الحجز قبل التأكيد'}, payment:{en:'Choose your preferred payment method',ar:'اختر طريقة الدفع المناسبة'}, confirmation:{en:'Your consultation booking has been confirmed',ar:'تم تأكيد حجز الاستشارة'} };
const applyLandscapeStepText = () => { const wide = window.matchMedia('(min-aspect-ratio: 4 / 3)').matches; panels.forEach(panel => { const label = panel.querySelector('.master-panel-label'); if (!label) return; label.textContent = wide ? landscapeStepCopy[panel.dataset.step][language] : label.dataset[language]; }); };
const updateCustomerPlaceholders = () => { document.querySelectorAll('[data-customer-form] label').forEach(label => { const input = label.querySelector('input'); const labelText = label.querySelector('span'); if (input && !input.classList.contains('is-inline-error')) input.placeholder = labelText?.dataset[language] || ''; }); };
let refreshConsultationTopicMenu = () => {};
let refreshBusinessSectorMenu = () => {};
const applyLanguage = (next) => { language=next; root.lang=next; root.dir=next==='ar'?'rtl':'ltr'; document.querySelectorAll('[data-en][data-ar]').forEach(x=>x.textContent=x.dataset[next]); applyLandscapeStepText(); updateCustomerPlaceholders(); refreshConsultationTopicMenu(); refreshBusinessSectorMenu(); document.querySelectorAll('[data-language-toggle]').forEach(x=>x.setAttribute('aria-label',next==='ar'?'التبديل الى الانجليزية':'Switch to Arabic')); searchInput.placeholder=searchInput.dataset[`${next}Placeholder`]; renderCalendar(); renderChoices(); renderSummary(); updateConfirmationPanel(); try { localStorage.setItem('ooxme-language',next); } catch (_) {} };
document.querySelectorAll('[data-language-toggle]').forEach(x=>x.addEventListener('click',()=>applyLanguage(language==='en'?'ar':'en')));
window.addEventListener('storage',e=>{if(e.key==='ooxme-language')applyLanguage(e.newValue==='ar'?'ar':'en')});
const alignBookingTrack = () => {
  if (!track) return;
  track.style.transform = `translateY(${-step * 100}dvh)`;
};
window.addEventListener('resize', () => {
  applyLandscapeStepText();
  updateCustomerPlaceholders();
  track.style.transition = 'none';
  alignBookingTrack();
  window.requestAnimationFrame(() => { track.style.transition = ''; });
});
track.style.height=`${panels.length*100}dvh`;
let step=0, transitionTimer;
let restoreConsultationPromoPanel = () => {};
let updateConfirmationPanel = () => {};
const customerPanel = document.querySelector('.booking-panel[data-step="customer"]');
const updateCustomerStepLock = () => {
  experience?.classList.toggle('is-customer-step-locked', step === 1);
  customerPanel?.setAttribute('aria-current', step === 1 ? 'step' : 'false');
};
const confirmationDescription = document.querySelector('.booking-panel[data-step="confirmation"] .master-panel-content > p:not(.master-panel-label)');
if (confirmationDescription) {
  confirmationDescription.dataset.ar = '\u0633\u0648\u0641 \u062a\u0633\u062a\u0644\u0645 \u0627\u0644\u0627\u0631\u0634\u0627\u062f\u0627\u062a \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0639\u0628\u0631 \u0627\u0644\u0627\u064a\u0645\u064a\u0644 \u0628\u0639\u062f \u062a\u0623\u0643\u064a\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0645\u062f\u0641\u0648\u0639\u0627\u062a\u0643';
  if (language === 'ar') confirmationDescription.textContent = confirmationDescription.dataset.ar;
}
const confirmationContent = document.querySelector('.booking-panel[data-step="confirmation"] .confirmation-content');
const confirmationTitle = confirmationContent?.querySelector('h1');
let confirmationWasComplete = null;
const confirmationIncompleteCopy = {
  en: {
    title: 'Did you forget something?',
    description: 'Review the required details about you and your project, then enter the consultation booking details that suit you to confirm your booking.'
  },
  ar: {
    title: 'هل نسيت شيء؟',
    description: 'راجع المعلومات المطلوبة عنك وعن مشروعك، وادخل جميع تفاصيل حجز الاستشارة حسب ما يناسبك لتأكيد حجزك'
  }
};
const ensureConfirmationSuccessMark = () => {
  if (!confirmationContent || confirmationContent.querySelector('.confirmation-success-mark')) return confirmationContent?.querySelector('.confirmation-success-mark');
  const successMark = document.createElement('div');
  successMark.className = 'confirmation-success-mark';
  successMark.setAttribute('aria-hidden', 'true');
  successMark.innerHTML = '<svg viewBox="0 0 100 100" focusable="false"><path class="confirmation-success-circle" pathLength="1" d="M 50 14 A 36 36 0 1 1 49.999 14"/><path class="confirmation-success-check" pathLength="1" d="M 29 53 L 44 68 L 72 37"/></svg>';
  confirmationContent.append(successMark);
  return successMark;
};
const ensureConfirmationIncompleteMark = () => {
  if (!confirmationContent || confirmationContent.querySelector('.confirmation-incomplete-mark')) return confirmationContent?.querySelector('.confirmation-incomplete-mark');
  const incompleteMark = document.createElement('div');
  incompleteMark.className = 'confirmation-incomplete-mark';
  incompleteMark.setAttribute('aria-hidden', 'true');
  incompleteMark.innerHTML = '<svg viewBox="0 0 100 100" focusable="false"><path class="confirmation-incomplete-circle" pathLength="1" d="M 50 14 A 36 36 0 1 1 49.999 14"/><path class="confirmation-incomplete-symbol" pathLength="1" d="M 50 39 L 50 67"/><circle class="confirmation-incomplete-dot" cx="50" cy="29" r="3.5"/></svg>';
  confirmationContent.append(incompleteMark);
  return incompleteMark;
};
const replayConfirmationSuccessMark = () => {
  const mark = ensureConfirmationSuccessMark();
  if (!mark) return;
  mark.classList.remove('is-drawing');
  void mark.offsetWidth;
  mark.classList.add('is-drawing');
};
const replayConfirmationIncompleteMark = () => {
  const mark = ensureConfirmationIncompleteMark();
  if (!mark) return;
  mark.classList.remove('is-drawing');
  void mark.offsetWidth;
  mark.classList.add('is-drawing');
};
const consultationInformationComplete = () => customerComplete(false) && dateAvailable() && timeDurationComplete(false);
updateConfirmationPanel = ({ animate = false } = {}) => {
  if (!confirmationTitle || !confirmationDescription || !confirmationContent) return;
  const complete = consultationInformationComplete();
  const changed = confirmationWasComplete !== complete;
  confirmationWasComplete = complete;
  confirmationTitle.textContent = complete ? confirmationTitle.dataset[language] : confirmationIncompleteCopy[language].title;
  confirmationDescription.textContent = complete ? confirmationDescription.dataset[language] : confirmationIncompleteCopy[language].description;
  confirmationContent.classList.toggle('is-incomplete', !complete);
  confirmationContent.querySelector(complete ? '.confirmation-incomplete-mark' : '.confirmation-success-mark')?.remove();
  if (!animate && !(changed && step === panels.length - 1)) return;
  if (complete) replayConfirmationSuccessMark();
  else replayConfirmationIncompleteMark();
};
const reveal = () => panels.forEach((panel,i)=>panel.classList.toggle('is-active',i===step));
const fieldsRequired = ['name','email','phone','topic','sector','additional'];
const markInvalid = (element, invalid) => { if (!element) return; element.classList.toggle('is-invalid', invalid); if ('setAttribute' in element) invalid ? element.setAttribute('aria-invalid', 'true') : element.removeAttribute('aria-invalid'); };
const fieldPlaceholder = (field) => field?.closest('label')?.querySelector('span')?.dataset[language] || '';
const setFieldError = (field, key, invalid) => {
  if (!field) return;
  field.classList.toggle('is-inline-error', invalid);
  field.placeholder = invalid ? consultationCopy[language].errors[key] : fieldPlaceholder(field);
  markInvalid(field, invalid);
  field.closest('label')?.classList.toggle('is-invalid', invalid);
};
const promoValid = () => true;
const customerComplete = (show = false) => { let valid = true; fieldsRequired.forEach((key) => { const field = document.querySelector(`[data-field="${key}"]`); const value = String(state[key] || '').trim(); const usablePhone = key !== 'phone' || value.replace(/\D/g, '').length >= 7; const usableEmail = key !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); const missing = !value || !usablePhone || !usableEmail; if (missing) valid = false; if (show) setFieldError(field, key, missing); }); return valid; };
let liveAvailability = null;
let liveAvailabilityKey = '';
let liveAvailabilityRequest = null;
const usesLiveBookingApi = !['localhost', '127.0.0.1'].includes(window.location.hostname);
const fallbackTimesForDate = (date) => {
  const value = new Date(`${date}T12:00:00`);
  if (Number.isNaN(value.valueOf()) || [4, 5].includes(value.getDay()) || value.getDate() % 4 === 0) return [];
  return ['10:00', '13:00', '16:00'];
};
const availableTimesForDate = (date) => liveAvailability?.days?.[date] || fallbackTimesForDate(date);
const dateAvailable = () => /^\d{4}-\d{2}-\d{2}$/.test(state.date || '') && availableTimesForDate(state.date).length > 0;
const loadLiveAvailability = async (year, month) => {
  if (!usesLiveBookingApi) return;
  const key = `${year}-${month}`;
  if (liveAvailabilityKey === key || liveAvailabilityRequest === key) return;
  liveAvailabilityRequest = key;
  try {
    const response = await fetch(`/api/booking/available-slots?year=${year}&month=${month}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Availability request failed');
    liveAvailability = await response.json(); liveAvailabilityKey = key;
    if (state.date && !availableTimesForDate(state.date).includes(state.time)) state.time = '';
    if (state.date && !dateAvailable()) { state.date = ''; state.time = ''; }
    save(); renderCalendar(); renderChoices();
  } catch (_) {
    // Preserve the current local schedule if production availability is temporarily unavailable.
  } finally { liveAvailabilityRequest = null; }
};
const timeDurationComplete = (show = false) => { const validTime = ['10:00','13:00','16:00'].includes(state.time); const validDuration = [45,60,90].includes(Number(state.duration)); if (show) { markInvalid(document.querySelector('[data-times]')?.closest('.booking-card'), !validTime); markInvalid(document.querySelector('[data-durations]')?.closest('.booking-card'), !validDuration); } return validTime && validDuration; };
const bookingComplete = () => promoValid(false) && customerComplete(false) && dateAvailable() && timeDurationComplete(false);
const canProceed = (show = true) => { if (BOOKING_DESIGN_MODE) return true; if (step === 0) return promoValid(show); if (step === 1) return customerComplete(show); if (step === 2) { const valid = dateAvailable(); if (show) markInvalid(document.querySelector('[data-calendar]'), !valid); return valid; } if (step === 3) return timeDurationComplete(show); if (step === 4) { const valid = bookingComplete(); if (show) markInvalid(document.querySelector('[data-summary]'), !valid); return valid; } if (step === 5) { const valid = total() === 0 || Boolean(state.payment); if (show) markInvalid(document.querySelector('[data-payment-options]'), !valid); return valid; } return true; };
const moveTo = (index) => { const next=Math.max(0,Math.min(panels.length-1,index)); if(next===step || (next>step && !canProceed(true)))return; if(next===0) restoreConsultationPromoPanel(); step=next; updateCustomerStepLock(); panels.forEach(p=>p.classList.remove('is-active')); alignBookingTrack(); clearTimeout(transitionTimer); transitionTimer=setTimeout(()=>{reveal(); if (step === panels.length - 1) updateConfirmationPanel({ animate: true });},620); };
window.OOXMEMasterPanelDrag?.register({ experience, track, panels, getIndex: () => step, moveTo, allowGestureNavigation: () => step !== 1 });
updateCustomerStepLock();
let bookingSubmission = null;
const submitBooking = async () => {
  if (!usesLiveBookingApi || bookingSubmission) return bookingSubmission;
  const button = document.querySelector('.booking-panel[data-step="payment"] [data-next]');
  const message = document.querySelector('[data-payment-options]')?.closest('.master-panel-content')?.querySelector('.booking-submit-message') || (() => { const element=document.createElement('p'); element.className='booking-message booking-submit-message'; document.querySelector('[data-payment-options]')?.after(element); return element; })();
  button?.setAttribute('aria-busy', 'true'); if (button) button.disabled = true;
  message.textContent = language === 'ar' ? 'جارٍ تأكيد الحجز...' : 'Confirming your booking...';
  bookingSubmission = fetch('/api/booking/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ date: state.date, time: state.time, duration: Number(state.duration), payment: state.payment, promoCode: state.promo, offerToken: state.offerToken, offerSession: state.offerSession, customer: { name: state.name, email: state.email, phone: state.phone, topic: state.topic, sector: state.sector, additional: state.additional } }) })
    .then(async (response) => { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error || 'booking_unavailable'); state.bookingId = body.id; state.serverQuote = { ...(state.serverQuote || {}), finalAmount: body.finalAmount, currency: body.currency, durationMinutes: Number(state.duration) }; save(); })
    .catch((error) => { message.textContent = error.message === 'slot_unavailable' ? (language === 'ar' ? 'هذا الموعد لم يعد متاحاً. اختر وقتاً آخر.' : 'This time is no longer available. Please choose another.') : (language === 'ar' ? 'تعذر تأكيد الحجز الآن. حاول مرة أخرى.' : 'We could not confirm your booking right now. Please try again.'); throw error; })
    .finally(() => { bookingSubmission = null; button?.removeAttribute('aria-busy'); if (button) button.disabled = false; });
  return bookingSubmission;
};
const continueStep = async (event) => { if(!canProceed(true)) return; if (step === 0) { state.promo = promoInputField?.value.trim() || state.promo; if (!await refreshServerPromotion({ showFeedback: Boolean(state.promo || state.offerToken) })) return; } if (step === 3 && !await refreshServerPromotion()) return; const confirmsPayment = event?.currentTarget?.closest('.booking-panel')?.dataset.step === 'payment'; if (confirmsPayment && usesLiveBookingApi && bookingComplete()) { try { await submitBooking(); } catch (_) { return; } } moveTo(step + 1); };
document.querySelectorAll('[data-next]:not([data-summary-next])').forEach(x=>x.addEventListener('click',continueStep));
const continueSummaryStep = async () => {
  if (!canProceed(true)) return;
  if (!await refreshServerPromotion({ showFeedback: true })) return;
  if (total() === 0) {
    if (usesLiveBookingApi && bookingComplete()) { try { await submitBooking(); } catch (_) { return; } }
    moveTo(6);
    return;
  }
  moveTo(5);
};
experience.addEventListener('ooxme:bottom-action', event => {
  if (event.detail?.action !== 'tap' || panels[step]?.dataset.step !== 'summary') return;
  event.preventDefault();
  void continueSummaryStep();
});
document.querySelectorAll('[data-field]').forEach(field=>{ field.value=state[field.dataset.field]||''; field.addEventListener('input',()=>{state[field.dataset.field]=field.value;markInvalid(field,false);field.closest('label')?.classList.remove('is-invalid');save();}); field.addEventListener('change',()=>{state[field.dataset.field]=field.value;markInvalid(field,false);field.closest('label')?.classList.remove('is-invalid');save();}); });
const consultationTopicOptions = [
  { en: 'Brand Management', ar: 'إدارة العلامة التجارية' },
  { en: 'Business Development', ar: 'تطوير الأعمال' },
  { en: 'Marketing', ar: 'التسويق' },
  { en: 'Sales', ar: 'المبيعات' },
  { en: 'Operations Management', ar: 'إدارة العمليات' },
  { en: 'Digital Transformation', ar: 'التحول الرقمي' },
  { en: 'Human Resources', ar: 'الموارد البشرية' },
  { en: 'Other', ar: 'أخرى' }
];
const businessSectorOptions = [
  { en: 'Contracting & Engineering', ar: 'مقاولات وهندسة' },
  { en: 'Real Estate', ar: 'عقارات' },
  { en: 'Trading & Manufacturing', ar: 'تجارة وصناعة' },
  { en: 'Restaurants & Hospitality', ar: 'مطاعم وضيافة' },
  { en: 'Healthcare & Beauty', ar: 'صحة وتجميل' },
  { en: 'Education & Technology', ar: 'تعليم وتقنية' },
  { en: 'Services & Automotive', ar: 'خدمات وسيارات' },
  { en: 'Other', ar: 'أخرى' }
];
const createConsultationDropdown = ({ key, menuClass, menuDataKey, optionDataKey, options, label }) => {
  const field = document.querySelector(`[data-customer-form] input[data-field="${key}"]`);
  if (!field) return () => {};
  const menu = document.createElement('div');
  menu.className = `calendar-month-menu ${menuClass}`;
  menu.dataset[menuDataKey] = '';
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', label);
  menu.hidden = true;
  field.insertAdjacentElement('afterend', menu);
  let closeTimer;
  let positionFrame;
  let isOpen = false;
  const selectedOption = () => options.find(option => option.en === state[key] || option.ar === state[key]) || null;
  const positionMenu = () => {
    if (!isOpen || menu.hidden) return;
    window.cancelAnimationFrame(positionFrame);
    positionFrame = window.requestAnimationFrame(() => {
      const bounds = menu.getBoundingClientRect();
      const viewport = window.visualViewport;
      const centerX = (viewport?.offsetLeft || 0) + (viewport?.width || window.innerWidth) / 2;
      const centerY = (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight) / 2;
      const offsetX = parseFloat(menu.style.getPropertyValue('--month-menu-center-x')) || 0;
      const offsetY = parseFloat(menu.style.getPropertyValue('--month-menu-center-y')) || 0;
      menu.style.setProperty('--month-menu-center-x', `${offsetX + centerX - (bounds.left + (bounds.width / 2))}px`);
      menu.style.setProperty('--month-menu-center-y', `${offsetY + centerY - (bounds.top + (bounds.height / 2)) - 4}px`);
      menu.classList.add('is-open');
    });
  };
  const setMenuOpen = open => {
    window.clearTimeout(closeTimer);
    if (open) {
      isOpen = true;
      menu.hidden = false;
      field.setAttribute('aria-expanded', 'true');
      positionMenu();
      return;
    }
    isOpen = false;
    window.cancelAnimationFrame(positionFrame);
    field.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    closeTimer = window.setTimeout(() => { menu.hidden = true; }, 210);
  };
  const renderMenu = () => {
    const selected = selectedOption();
    field.value = selected ? selected[language] : state[key] || '';
    menu.innerHTML = options.map(option => `<button type="button" class="calendar-month-option" role="option" ${optionDataKey}="${option.en}" aria-selected="${selected === option}">${option[language]}</button>`).join('');
    menu.querySelectorAll(`[${optionDataKey}]`).forEach(option => option.addEventListener('click', () => {
      state[key] = option.getAttribute(optionDataKey);
      setFieldError(field, key, false);
      save();
      setMenuOpen(false);
      renderMenu();
    }));
  };
  field.readOnly = true;
  field.setAttribute('aria-haspopup', 'listbox');
  field.setAttribute('aria-expanded', 'false');
  field.addEventListener('pointerdown', event => event.preventDefault());
  field.addEventListener('click', event => { event.preventDefault(); setMenuOpen(menu.hidden); });
  field.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setMenuOpen(menu.hidden); } });
  document.addEventListener('click', event => { if (!menu.contains(event.target) && event.target !== field) setMenuOpen(false); });
  document.addEventListener('touchstart', event => { if (!menu.contains(event.target) && event.target !== field) setMenuOpen(false); }, { passive: true });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenuOpen(false); });
  window.addEventListener('resize', positionMenu);
  window.addEventListener('orientationchange', positionMenu);
  window.visualViewport?.addEventListener('resize', positionMenu);
  window.visualViewport?.addEventListener('scroll', positionMenu);
  renderMenu();
  return renderMenu;
};
refreshConsultationTopicMenu = createConsultationDropdown({ key: 'topic', menuClass: 'consultation-topic-menu', menuDataKey: 'topicMenu', optionDataKey: 'data-topic-option', options: consultationTopicOptions, label: 'Consultation Topic' });
refreshBusinessSectorMenu = createConsultationDropdown({ key: 'sector', menuClass: 'business-sector-menu', menuDataKey: 'sectorMenu', optionDataKey: 'data-sector-option', options: businessSectorOptions, label: 'Business Sector' });
experience?.addEventListener('touchmove', event => {
  if (step !== 1) return;
  event.preventDefault();
}, { capture: true, passive: false });
experience?.addEventListener('scroll', event => {
  if (step !== 1 || event.target !== experience) return;
  experience.scrollTop = 0;
  alignBookingTrack();
}, true);
const consultationViewport = window.visualViewport;
const consultationWritableFields = [...document.querySelectorAll('.booking-panel :is(input, textarea)')];
let activeConsultationField = null;
let activeConsultationGroup = null;
let consultationFocusShift = 0;
const resetConsultationInputPosition = () => {
  if (!activeConsultationGroup) return;
  activeConsultationGroup.classList.remove('is-keyboard-active');
  activeConsultationGroup.style.removeProperty('--consultation-keyboard-shift');
  activeConsultationField = null;
  activeConsultationGroup = null;
  consultationFocusShift = 0;
};
const updateConsultationInputPosition = () => {
  if (!activeConsultationField || !activeConsultationGroup || document.activeElement !== activeConsultationField) {
    resetConsultationInputPosition();
    return;
  }
  const viewport = consultationViewport;
  if (!viewport || window.innerHeight - viewport.height <= 120) {
    consultationFocusShift = 0;
    activeConsultationGroup.classList.remove('is-keyboard-active');
    activeConsultationGroup.style.removeProperty('--consultation-keyboard-shift');
    return;
  }
  const panel = activeConsultationField.closest('.master-panel');
  const panelSafe = parseFloat(getComputedStyle(panel || document.documentElement).getPropertyValue('--panel-safe')) || 16;
  const inputBounds = activeConsultationField.getBoundingClientRect();
  const baseTop = inputBounds.top - consultationFocusShift;
  const baseBottom = inputBounds.bottom - consultationFocusShift;
  const safeTop = viewport.offsetTop + panelSafe;
  const safeBottom = viewport.offsetTop + viewport.height - panelSafe;
  const requiredShift = Math.max(0, baseBottom - safeBottom);
  const allowedShift = Math.max(0, baseTop - safeTop);
  consultationFocusShift = -Math.min(requiredShift, allowedShift);
  activeConsultationGroup.style.setProperty('--consultation-keyboard-shift', `${consultationFocusShift}px`);
  activeConsultationGroup.classList.toggle('is-keyboard-active', consultationFocusShift !== 0);
};
consultationWritableFields.forEach(field => {
  field.addEventListener('focus', () => {
    const nextGroup = field.closest('[data-promo-form], [data-customer-form]');
    if (activeConsultationGroup && activeConsultationGroup !== nextGroup) {
      activeConsultationGroup.classList.remove('is-keyboard-active');
      activeConsultationGroup.style.removeProperty('--consultation-keyboard-shift');
    }
    activeConsultationField = field;
    activeConsultationGroup = nextGroup;
    consultationFocusShift = 0;
    window.requestAnimationFrame(updateConsultationInputPosition);
    window.setTimeout(updateConsultationInputPosition, 80);
  });
  field.addEventListener('blur', () => {
    window.setTimeout(() => {
      if (!consultationWritableFields.includes(document.activeElement)) resetConsultationInputPosition();
    });
  });
});
consultationViewport?.addEventListener('resize', updateConsultationInputPosition);
consultationViewport?.addEventListener('scroll', updateConsultationInputPosition);
document.querySelectorAll('[data-customer-form] [data-field]').forEach((field) => {
  const key = field.dataset.field;
  field.addEventListener('input', () => {
    if (key === 'phone') field.value = field.value.replace(/[^0-9+\-\s()]/g, '');
    state[key] = field.value;
    setFieldError(field, key, false);
    save();
  });
  field.addEventListener('blur', () => {
    const value = String(field.value || '').trim();
    const invalid = !value || (key === 'phone' && value.replace(/\D/g, '').length < 7) || (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    setFieldError(field, key, invalid);
  });
});
const promoInputField = document.querySelector('[data-field="promo"]');
const promoInputCard = promoInputField.closest('.promo-input-card');
const promoFeedback = document.querySelector('[data-promo-message]');
const TEST_PROMO_CODE = 'TEST';
const testBookingCustomer = {
  name: 'TEST',
  email: 'hello@ooxme.com',
  phone: '+9647840440011',
  topic: 'TEST',
  sector: 'TEST',
  additional: 'TEST'
};
let promoFeedbackTimer;
const setPromoFeedback = (message = '', clearAfter = false) => { window.clearTimeout(promoFeedbackTimer); promoFeedback.textContent = message; promoInputCard.classList.toggle('is-feedback', Boolean(message)); if (clearAfter) promoFeedbackTimer = window.setTimeout(() => { promoFeedback.textContent = ''; promoInputCard.classList.remove('is-feedback'); promoInputField.value = ''; }, 1100); };
promoInputField.addEventListener('input', () => { const normalized = promoInputField.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(); if (promoInputField.value !== normalized) promoInputField.value = normalized; markInvalid(promoInputField,false); setPromoFeedback(); });
const promoDescription = document.querySelector('[data-step="promo"] .master-panel-content > p');
let consultationPromoSuccess = false;
let consultationPromoSuccessTimer;
const promoPlaceholderCopy = {
  ar: '\u0627\u0643\u062A\u0628 \u0643\u0648\u062F \u0627\u0644\u062E\u0635\u0645 \u0647\u0646\u0627',
  en: 'Enter discount code here'
};
let promoPlaceholderTimer;
let promoPlaceholderRunning = false;
let promoPlaceholderStep = 0;
let promoPlaceholderPhase = 'typing';
const promoPlaceholderCanRun = () => !promoInputField.value && document.activeElement !== promoInputField && !promoInputCard.classList.contains('is-feedback');
const stopPromoPlaceholderAnimation = (clear = true) => {
  window.clearTimeout(promoPlaceholderTimer);
  promoPlaceholderRunning = false;
  if (clear && !promoInputField.value) promoInputField.placeholder = '';
};
const runPromoPlaceholderAnimation = () => {
  if (!promoPlaceholderCanRun()) { stopPromoPlaceholderAnimation(); return; }
  const text = promoPlaceholderCopy[language];
  promoPlaceholderRunning = true;
  if (promoPlaceholderPhase === 'typing') {
    promoPlaceholderStep += 1;
    promoInputField.placeholder = text.slice(0, promoPlaceholderStep);
    if (promoPlaceholderStep < text.length) promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 55);
    else { promoPlaceholderPhase = 'holding'; promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 600); }
    return;
  }
  if (promoPlaceholderPhase === 'holding') { promoPlaceholderPhase = 'deleting'; promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 35); return; }
  promoPlaceholderStep -= 1;
  promoInputField.placeholder = text.slice(0, Math.max(0, promoPlaceholderStep));
  if (promoPlaceholderStep > 0) { promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 35); return; }
  promoPlaceholderPhase = 'typing';
  promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 200);
};
const startPromoPlaceholderAnimation = () => {
  if (!promoPlaceholderCanRun()) return;
  stopPromoPlaceholderAnimation();
  promoPlaceholderPhase = 'typing';
  promoPlaceholderStep = 0;
  promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 260);
};
const updateConsultationPromoCopy = () => {
  if (promoPlaceholderCanRun()) startPromoPlaceholderAnimation(); else stopPromoPlaceholderAnimation();
  if (promoDescription) promoDescription.textContent = consultationPromoSuccess ? consultationCopy[language].promoApplied : consultationCopy[language].promoDescription;
};
const clearConsultationPromoTimers = () => {
  window.clearTimeout(consultationPromoSuccessTimer);
};
const showConsultationPromoFeedback = (message = '', clearAfter = false) => {
  setPromoFeedback(message, clearAfter);
  promoInputCard.classList.toggle('is-invalid', Boolean(message) && message === consultationCopy[language].promoInvalid);
  promoInputCard.classList.toggle('is-test-feedback', message === consultationCopy[language].promoTestApplied);
};
const refreshServerPromotion = async ({ showFeedback = false } = {}) => {
  const promoCode = String(state.promo || '').trim();
  if (!promoCode && !state.offerToken) { state.serverQuote = null; save(); return true; }
  if (!usesLiveBookingApi) {
    if (promoCode.toUpperCase() === TEST_PROMO_CODE) {
      state.serverQuote = {
        durationMinutes: 45,
        discountAmount: price(),
        finalAmount: 0,
        currency: 'USD'
      };
      save(); renderChoices(); renderSummary();
    }
    return true;
  }
  try {
    const response = await fetch('/api/promo/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ promoCode, offerToken: state.offerToken, offerSession: state.offerSession, serviceCode: 'consultation', durationMinutes: Number(state.duration) || 45 })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.success) throw new Error(body.error || 'promotion_unavailable');
    state.serverQuote = body.data.quote;
    if (body.data.grantedDurationMinutes) state.duration = String(body.data.grantedDurationMinutes);
    save(); renderChoices(); renderSummary();
    if (showFeedback) showConsultationPromoFeedback(language === 'ar' ? 'تم التحقق من كود الخصم' : 'Discount code verified');
    return true;
  } catch (_) {
    state.serverQuote = null;
    save(); renderSummary();
    if (showFeedback) showConsultationPromoFeedback(consultationCopy[language].promoInvalid, true);
    return false;
  }
};
const prepareTestPromoBooking = () => {
  if (!activeServerQuote() || total() !== 0) throw new Error('promotion_unavailable');
  Object.assign(state, testBookingCustomer, { duration: '45', payment: '' });
  document.querySelectorAll('[data-customer-form] [data-field]').forEach(field => { field.value = state[field.dataset.field] || ''; });
  save(); renderChoices(); renderSummary();
};
promoInputField.addEventListener('input', () => {
  promoInputCard.classList.remove('is-invalid');
  promoInputCard.classList.remove('is-test-feedback');
  stopPromoPlaceholderAnimation();
});
promoInputField.addEventListener('focus', () => stopPromoPlaceholderAnimation());
promoInputField.addEventListener('blur', () => {
  if (!promoInputField.value) window.setTimeout(startPromoPlaceholderAnimation, 260);
});
restoreConsultationPromoPanel = () => {
  clearConsultationPromoTimers();
  consultationPromoSuccess = false;
  promoInputField.value = state.promo;
  showConsultationPromoFeedback();
  updateConsultationPromoCopy();
};
document.querySelector('[data-promo-form]').addEventListener('submit', async (event) => {
  event.preventDefault();
  const code = promoInputField.value.trim().toUpperCase();
  promoInputField.value = code;
  if (!code && !state.offerToken) {
    state.promo = ''; state.serverQuote = null;
    save();
    showConsultationPromoFeedback();
    moveTo(1);
    return;
  }
  state.promo = code;
  if (code.toUpperCase() === TEST_PROMO_CODE) state.duration = '45';
  if (!await refreshServerPromotion({ showFeedback: true })) return;
  if (code.toUpperCase() === TEST_PROMO_CODE) {
    showConsultationPromoFeedback(consultationCopy[language].promoTestApplied);
    try {
      prepareTestPromoBooking();
      window.setTimeout(() => moveTo(1), 500);
    } catch (_) {
      showConsultationPromoFeedback(consultationCopy[language].promoInvalid, true);
    }
    return;
  }
  clearConsultationPromoTimers();
  consultationPromoSuccess = true;
  promoInputField.value = '';
  showConsultationPromoFeedback(consultationCopy[language].promoApplied);
  updateConsultationPromoCopy();
  consultationPromoSuccessTimer = window.setTimeout(() => {
    consultationPromoSuccess = false;
    moveTo(1);
  }, 1000);
});
const monthCursor = new Date(); monthCursor.setDate(1);
let clearMonthDropdownListeners = () => {};
let monthDropdownChangeTimer;
const renderCalendar = () => {
  clearMonthDropdownListeners();
  const box=document.querySelector('[data-calendar]');
  if(!box)return;
  const year=monthCursor.getFullYear(),month=monthCursor.getMonth(), days=new Date(year,month+1,0).getDate(), first=new Date(year,month,1).getDay(), t=copy[language];
  void loadLiveAvailability(year, month + 1);
  const monthOptions = t.months.map((name,index)=>`<button type="button" class="calendar-month-option" role="option" data-month-option="${index}" aria-selected="${index===month}">${name}</button>`).join('');
  let html=`<div class="calendar-head"><div class="calendar-month-picker"><button type="button" class="calendar-month-trigger" data-month-trigger aria-haspopup="listbox" aria-expanded="false"><span>${t.months[month]}</span><span class="calendar-month-arrow" aria-hidden="true"></span></button><div class="calendar-month-menu" data-month-menu role="listbox" aria-label="Month" hidden>${monthOptions}</div></div><span class="calendar-year">${year}</span></div><div class="calendar-weekdays">${t.weekdays.map(d=>`<span class="calendar-weekday">${d}</span>`).join('')}</div><div class="calendar-grid">`;
  html+=Array(first).fill('<span></span>').join('');
  for(let day=1;day<=days;day++){
    const key=`${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`, unavailable=availableTimesForDate(key).length===0, cls=unavailable?'is-unavailable':state.date===key?'is-selected':'';
    html+=`<button type="button" class="calendar-day ${cls}" data-date="${key}"${unavailable ? ' disabled aria-disabled="true"' : ''}><span class="calendar-day-number">${day}</span></button>`;
  }
  box.innerHTML=html+`</div>`;
  const picker=box.querySelector('.calendar-month-picker');
  const trigger=box.querySelector('[data-month-trigger]');
  const menu=box.querySelector('[data-month-menu]');
  let closeTimer;
  const setMonthMenuOpen = (open) => {
    window.clearTimeout(closeTimer);
    if(open){
      menu.hidden=false;
      trigger.setAttribute('aria-expanded','true');
      window.requestAnimationFrame(()=>{
        const bounds=menu.getBoundingClientRect();
        menu.style.setProperty('--month-menu-center-x',`${(window.innerWidth/2)-(bounds.left+(bounds.width/2))}px`);
        menu.style.setProperty('--month-menu-center-y',`${(window.innerHeight/2)-(bounds.top+(bounds.height/2))-4}px`);
        picker.classList.add('is-open');
      });
      return;
    }
    trigger.setAttribute('aria-expanded','false');
    picker.classList.remove('is-open');
    closeTimer=window.setTimeout(()=>{menu.hidden=true;picker.classList.remove('opens-upward');},210);
  };
  const onOutsideMonthInteraction = event => { if(!picker.contains(event.target)) setMonthMenuOpen(false); };
  const onEscape = (event) => { if(event.key==='Escape') setMonthMenuOpen(false); };
  trigger.addEventListener('click',()=>setMonthMenuOpen(menu.hidden));
  menu.querySelectorAll('[data-month-option]').forEach(option=>option.addEventListener('click',()=>{
    const nextMonth=Number(option.dataset.monthOption);
    if(nextMonth===month){setMonthMenuOpen(false);return;}
    setMonthMenuOpen(false);
    window.clearTimeout(monthDropdownChangeTimer);
    monthDropdownChangeTimer=window.setTimeout(()=>{monthCursor.setMonth(nextMonth);renderCalendar();},210);
  }));
  document.addEventListener('click',onOutsideMonthInteraction);
  document.addEventListener('touchstart',onOutsideMonthInteraction,{passive:true});
  document.addEventListener('keydown',onEscape);
  clearMonthDropdownListeners=()=>{
    window.clearTimeout(closeTimer);
    document.removeEventListener('click',onOutsideMonthInteraction);
    document.removeEventListener('touchstart',onOutsideMonthInteraction);
    document.removeEventListener('keydown',onEscape);
  };
  box.querySelectorAll('[data-date]').forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('is-unavailable')||b.classList.contains('is-booked')) return;
    state.date=b.dataset.date;markInvalid(box,false);save();renderCalendar();setTimeout(()=>{if(step===2&&dateAvailable())moveTo(3)},180);
  }));
};
let timeSelectionAdvanceTimer;
const renderChoices = () => { const times=document.querySelector('[data-times]'),durations=document.querySelector('[data-durations]'); if(!times)return; const options=state.date?availableTimesForDate(state.date):['10:00','13:00','16:00']; const durationLocked=Boolean(state.offerToken); const advanceAfterTimeSelection=async()=>{ if(!timeDurationComplete(false))return; if(!await refreshServerPromotion())return; if(step===3)moveTo(4); }; times.innerHTML=options.map(value=>`<button type="button" class="${state.time===value?'is-selected':''}" data-time="${value}">${value}</button>`).join(''); durations.innerHTML=[45,60,90].map(value=>`<button type="button" class="${Number(state.duration)===value?'is-selected':''}" data-duration="${value}" ${durationLocked&&value!==45?'disabled aria-disabled="true"':''}>${value} ${language==='ar'?'دقيقة':'minutes'}</button>`).join(''); times.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{window.clearTimeout(timeSelectionAdvanceTimer);state.time=b.dataset.time;markInvalid(times.closest('.booking-card'),false);save();renderChoices();timeSelectionAdvanceTimer=window.setTimeout(()=>{void advanceAfterTimeSelection();},240);}));durations.querySelectorAll('[data-duration]').forEach(b=>b.addEventListener('click',()=>{if(durationLocked&&Number(b.dataset.duration)!==45)return;window.clearTimeout(timeSelectionAdvanceTimer);state.duration=b.dataset.duration;state.serverQuote=null;markInvalid(durations.closest('.booking-card'),false);save();renderChoices();})); };
const money = value => `${value} USD`;
const renderSummary = () => { const box=document.querySelector('[data-summary]'); if(!box)return; const labels=copy[language].summary; const rows=[['name',state.name],['email',state.email],['phone',state.phone],['topic',state.topic],['sector',state.sector],['date',state.date],['time',state.time],['duration',state.duration?`${state.duration} ${language==='ar'?'دقيقة':'minutes'}`:''],['promo',state.promo||'—'],['fee',money(price())],['discount',money(discount())],['total',money(total())]]; box.innerHTML=rows.map(([key,value])=>`<div><dt>${labels[key]}</dt><dd>${value||'—'}</dd></div>`).join(''); document.querySelector('[data-confirm-label]').textContent=total()===0?copy[language].confirm:copy[language].confirmPay; };
updateBookingSummary = renderSummary;
const paymentOptionsContainer = document.querySelector('[data-payment-options]');
const superQiPaymentOption = paymentOptionsContainer?.querySelector('[data-payment="Qi"]');
const comingSoonPaymentOption = paymentOptionsContainer?.querySelector('.payment-option--coming');
if (superQiPaymentOption && comingSoonPaymentOption) {
  const newPaymentMethodClone = superQiPaymentOption.cloneNode(true);
  newPaymentMethodClone.removeAttribute('data-payment');
  newPaymentMethodClone.classList.add('payment-option--coming');
  newPaymentMethodClone.dataset.paymentCopy = 'coming';
  newPaymentMethodClone.disabled = true;
  newPaymentMethodClone.tabIndex = -1;
  newPaymentMethodClone.setAttribute('aria-disabled', 'true');
  paymentOptionsContainer.replaceChild(newPaymentMethodClone, comingSoonPaymentOption);
}
const paymentOptions = [...document.querySelectorAll('[data-payment-options] .payment-option:not(.payment-option--coming)')];
const comingPaymentDetail = document.querySelector('.payment-option--coming .payment-option-detail-inner');
if (comingPaymentDetail && !comingPaymentDetail.querySelector('.payment-qr-placeholder')) {
  const qrPlaceholder = document.createElement('span');
  qrPlaceholder.className = 'payment-qr-placeholder';
  qrPlaceholder.setAttribute('aria-hidden', 'true');
  comingPaymentDetail.append(qrPlaceholder);
}
const paymentExpandedCopy = {
  en: { instructions: 'Use the number to pay\nor use the QR code below', coming: 'A new payment method\nis coming soon' },
  ar: { instructions: 'استخدم "الرقم" للدفع\nاو الكيو ار كود بالاسفل', coming: 'وسيلة دفع جديدة\nقادمة قريباً' }
};
const paymentMethodInstructions = {
  ZainCash: {
    en: 'Use +9647840440011 to pay\nor use the QR Code shown below',
    ar: '\u0627\u0633\u062a\u062e\u062f\u0645 +9647840440011 \u0644\u0644\u062f\u0641\u0639\n\u0627\u0648 \u0639\u0646 \u0637\u0631\u064a\u0642 QR Code \u0627\u0644\u0638\u0627\u0647\u0631'
  },
  Qi: {
    en: 'Use +9647721117110 to pay\nor use the QR Code shown below',
    ar: '\u0627\u0633\u062a\u062e\u062f\u0645 +9647721117110 \u0644\u0644\u062f\u0641\u0639\n\u0627\u0648 \u0639\u0646 \u0637\u0631\u064a\u0642 QR Code \u0627\u0644\u0638\u0627\u0647\u0631'
  }
};
const paymentMethodImages = { ZainCash: 'assets/payment/zaincash.png', Qi: 'assets/payment/super%20qi.png' };
const formatPaymentInstructions = () => {
  document.querySelectorAll('.payment-instruction').forEach(instruction => {
    const option = instruction.closest('.payment-option');
    const isComing = option?.dataset.paymentCopy === 'coming';
    instruction.textContent = isComing ? paymentExpandedCopy[language].coming : paymentMethodInstructions[option?.dataset.payment]?.[language] || paymentExpandedCopy[language].instructions;
  });
  document.querySelectorAll('.payment-option:not([data-payment-copy])').forEach(option => {
    const image = paymentMethodImages[option.dataset.payment];
    const placeholder = option.querySelector('.payment-qr-placeholder');
    if (image && placeholder) placeholder.innerHTML = `<img src="${image}" alt="" />`;
  });
  const clonedPaymentLabel = document.querySelector('[data-payment-copy="coming"] .payment-option-label');
  if (clonedPaymentLabel) clonedPaymentLabel.textContent = language === 'ar' ? 'قريباً' : 'Coming soon';
  const comingMessage = document.querySelector('.payment-coming-message');
  if (comingMessage) comingMessage.textContent = paymentExpandedCopy[language].coming;
};
formatPaymentInstructions();
window.setTimeout(formatPaymentInstructions);
document.querySelectorAll('[data-language-toggle]').forEach(button => button.addEventListener('click', () => setTimeout(formatPaymentInstructions)));
const setOpenPaymentOption = (nextOption) => {
  const shouldOpen = !nextOption.classList.contains('is-open');
  paymentOptions.forEach(option => {
    const isOpen = shouldOpen && option === nextOption;
    option.classList.toggle('is-open', isOpen);
    option.setAttribute('aria-expanded', String(isOpen));
  });
};
const closeOpenPaymentOption = () => {
  paymentOptions.forEach(option => {
    option.classList.remove('is-open');
    option.setAttribute('aria-expanded', 'false');
  });
};
paymentOptions.forEach(button => button.addEventListener('click', () => {
  if (button.dataset.payment) {
    state.payment = button.dataset.payment;
    markInvalid(document.querySelector('[data-payment-options]'), false);
    save();
    document.querySelectorAll('[data-payment]').forEach(option => option.classList.toggle('is-selected', option === button));
  }
  setOpenPaymentOption(button);
}));
let paymentClickToSuppress = null;
document.addEventListener('pointerdown', event => {
  if (step !== 5 || !paymentOptions.some(option => option.classList.contains('is-open'))) return;
  if (event.target.closest('.payment-qr-placeholder > img, .site-image-preview')) return;
  const option = event.target.closest('.payment-option');
  if (option?.classList.contains('is-open')) paymentClickToSuppress = option;
  closeOpenPaymentOption();
});
paymentOptions.forEach(option => option.addEventListener('click', event => {
  if (paymentClickToSuppress !== option) return;
  paymentClickToSuppress = null;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true));
let searchTimer;
const searchOverlayField = searchOverlay.querySelector('.search-overlay-field');
const searchMenuOptions = [...searchOverlay.querySelectorAll('.search-overlay-links a')];
const normalizeSearchText = value => String(value || '')
  .toLocaleLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();
const searchDistance = (left, right) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex + 1;
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const saved = previous[rightIndex + 1];
      previous[rightIndex + 1] = Math.min(previous[rightIndex + 1] + 1, previous[rightIndex] + 1, diagonal + (left[leftIndex] === right[rightIndex] ? 0 : 1));
      diagonal = saved;
    }
  }
  return previous[right.length];
};
const updateSearchResults = query => {
  const term = normalizeSearchText(query);
  if (!term) {
    searchMenuOptions.forEach(option => {
      option.hidden = false;
      option.style.order = '';
    });
    return;
  }
  const ranked = searchMenuOptions
    .map((option, index) => {
      const label = normalizeSearchText(`${option.dataset.en || ''} ${option.dataset.ar || ''} ${option.getAttribute('href') || ''}`);
      const words = label.split(' ').filter(Boolean);
      const exact = label === term ? 1000 : 0;
      const starts = words.some(word => word.startsWith(term)) ? 700 : 0;
      const contains = label.includes(term) ? 500 - label.indexOf(term) : 0;
      const distance = Math.min(...words.map(word => searchDistance(term, word)));
      return { option, index, score: exact + starts + contains - distance };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 3)
    .map(({ option }) => option);
  searchMenuOptions.forEach(option => {
    const resultIndex = ranked.indexOf(option);
    option.hidden = resultIndex === -1;
    option.style.order = resultIndex === -1 ? '' : String(resultIndex);
  });
};
const closeSearch = () => {
  window.clearTimeout(searchTimer);
  if (searchOverlay.hidden) return;
  searchOverlay.classList.remove('is-open');
  searchTimer = window.setTimeout(() => { searchOverlay.hidden = true; }, 180);
};
const openSearch = () => {
  window.clearTimeout(searchTimer);
  searchOverlay.hidden = false;
  window.requestAnimationFrame(() => searchOverlay.classList.add('is-open'));
};
const resizeSearch = () => {
  searchInput.style.height = '0px';
  const textHeight = Math.max(parseFloat(getComputedStyle(searchInput).fontSize) * 1.35, searchInput.scrollHeight);
  searchInput.style.height = `${textHeight}px`;
  searchOverlayField.style.height = `${Math.max(48, textHeight + 24)}px`;
};
const viewport=window.visualViewport;
const fullViewport=viewport?.height??innerHeight;
let searchKeyboardShift=0;
const resetSearchInputPosition=()=>{
  searchKeyboardShift=0;
  searchOverlay.classList.remove('is-keyboard-open');
  searchOverlayField.style.removeProperty('--search-keyboard-shift');
};
const updateKeyboard=()=>{
  if(!viewport) return;
  const keyboardOpen=document.activeElement===searchInput&&fullViewport-viewport.height>120;
  searchOverlay.classList.toggle('is-keyboard-open',keyboardOpen);
  if(!keyboardOpen){
    searchKeyboardShift=0;
    searchOverlayField.style.removeProperty('--search-keyboard-shift');
    return;
  }
  const safe=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--panel-safe'))||16;
  const bounds=searchOverlayField.getBoundingClientRect();
  const keyboardTop=viewport.offsetTop+viewport.height-safe;
  const unshiftedBottom=bounds.bottom-searchKeyboardShift;
  searchKeyboardShift=Math.min(0,keyboardTop-unshiftedBottom);
  searchOverlayField.style.setProperty('--search-keyboard-shift',`${searchKeyboardShift}px`);
};
document.querySelectorAll('[data-search-toggle]').forEach(button=>button.addEventListener('click',event=>{
  event.stopPropagation();
  if (searchOverlay.hidden || !searchOverlay.classList.contains('is-open')) openSearch();
  else closeSearch();
}));
searchOverlay.addEventListener('click', event => {
  if (event.target !== searchInput) {
    searchInput.blur();
    resetSearchInputPosition();
  }
  closeSearch();
});
searchOverlayField.addEventListener('click', event => event.stopPropagation());
searchOverlayField.addEventListener('pointerdown', event => {
  if (event.target !== searchInput && document.activeElement === searchInput) {
    searchInput.blur();
    resetSearchInputPosition();
  }
});
searchOverlay.querySelectorAll('.search-overlay-links a, [data-search-suggestion]').forEach(option=>option.addEventListener('click',event=>{
  event.stopPropagation();
  closeSearch();
}));
searchInput.addEventListener('input',()=>{const q=searchInput.value.trim();searchOverlay.classList.toggle('is-typing',!!q);suggestion.hidden=true;updateSearchResults(q);resizeSearch()});
searchInput.addEventListener('focus',updateKeyboard);
searchInput.addEventListener('blur',()=>setTimeout(updateKeyboard));
viewport?.addEventListener('resize',updateKeyboard);
viewport?.addEventListener('scroll',updateKeyboard);
applyLanguage(language);updateConsultationPromoCopy();renderCalendar();renderChoices();renderSummary();updateConfirmationPanel();reveal();if(state.offerToken) void refreshServerPromotion({ showFeedback: true });
