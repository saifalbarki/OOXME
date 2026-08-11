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
const empty = { promo:'', name:'', email:'', phone:'', sector:'', topic:'', additional:'', date:'', time:'', duration:'', payment:'' };
// Temporary design-review switch. Set to false to restore the full step-validation lock.
const BOOKING_DESIGN_MODE = true;
let state = {...empty};
try { state = {...empty, ...JSON.parse(sessionStorage.getItem('ooxme-rebuild-booking') || '{}')}; } catch (_) {}
const save = () => { try { sessionStorage.setItem('ooxme-rebuild-booking', JSON.stringify(state)); } catch (_) {} };
const price = () => ({45:25,60:40,90:60}[Number(state.duration)] || 0);
const discount = () => state.promo.trim().toUpperCase() === 'R100' ? price() : 0;
const total = () => Math.max(0, price() - discount());
let language = 'en'; try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
const consultationCopy = {
  en: {
    promoDescription: 'Have a valid discount code? Use it now or skip.', promoPlaceholder: 'Discount code', promoApplied: 'Discount code applied successfully', promoInvalid: 'Invalid code',
    calendarAvailable: 'Available days are shown in blue', calendarBooked: 'Fully booked days are shown in gray', calendarWarning: 'This day is fully booked. Choose another day.',
    errors: { name: 'Name is required', email: 'Email is invalid', phone: 'Phone number is incomplete', topic: 'Consultation topic is required', sector: 'Business sector is required', additional: 'Additional information is required' }
  },
  ar: {
    promoDescription: 'هل لديك كود خصم ساري؟ استخدمه الان او تخطى', promoPlaceholder: 'كود الخصم', promoApplied: 'تم تطبيق كود الخصم بنجاح', promoInvalid: 'الكود غير صالح',
    calendarAvailable: 'الايام المتاحة تظهر باللون الازرق', calendarBooked: 'الايام الممتلئة تظهر باللون الرمادي', calendarWarning: 'هذا اليوم ممتلئ بالحجوزات، اختر يوم اخر',
    errors: { name: 'الاسم مطلوب', email: 'البريد الالكتروني غير صحيح', phone: 'رقم الهاتف غير مكتمل', topic: 'موضوع الاستشارة مطلوب', sector: 'قطاع العمل مطلوب', additional: 'معلومات اضافية مطلوبة' }
  }
};
const landscapeStepCopy = { promo:{en:'Enter a promo code if you have one',ar:'ادخل كود الخصم اذا كان لديك'}, customer:{en:'Tell us the details we need for your consultation',ar:'ادخل المعلومات المطلوبة للاستشارة'}, date:{en:'Choose an available date for your consultation',ar:'اختر يوماً متاحاً للاستشارة'}, time:{en:'Choose the consultation time and duration',ar:'اختر وقت ومدة الاستشارة'}, summary:{en:'Review your booking details before confirming',ar:'راجع تفاصيل الحجز قبل التأكيد'}, payment:{en:'Choose your preferred payment method',ar:'اختر طريقة الدفع المناسبة'}, confirmation:{en:'Your consultation booking has been confirmed',ar:'تم تأكيد حجز الاستشارة'} };
const applyLandscapeStepText = () => { const wide = window.matchMedia('(min-aspect-ratio: 4 / 3)').matches; panels.forEach(panel => { const label = panel.querySelector('.master-panel-label'); if (!label) return; label.textContent = wide ? landscapeStepCopy[panel.dataset.step][language] : label.dataset[language]; }); };
const updateCustomerPlaceholders = () => { document.querySelectorAll('[data-customer-form] label').forEach(label => { const input = label.querySelector('input'); const labelText = label.querySelector('span'); if (input && !input.classList.contains('is-inline-error')) input.placeholder = labelText?.dataset[language] || ''; }); };
const applyLanguage = (next) => { language=next; root.lang=next; root.dir=next==='ar'?'rtl':'ltr'; document.querySelectorAll('[data-en][data-ar]').forEach(x=>x.textContent=x.dataset[next]); applyLandscapeStepText(); updateCustomerPlaceholders(); document.querySelectorAll('[data-language-toggle]').forEach(x=>x.setAttribute('aria-label',next==='ar'?'التبديل الى الانجليزية':'Switch to Arabic')); searchInput.placeholder=searchInput.dataset[`${next}Placeholder`]; renderCalendar(); renderChoices(); renderSummary(); if (state.promo === 'R100' && promoInputCard?.classList.contains('is-feedback')) setPromoFeedback(next === 'ar' ? 'تم تطبيق الكود' : 'Code applied'); try { localStorage.setItem('ooxme-language',next); } catch (_) {} };
document.querySelectorAll('[data-language-toggle]').forEach(x=>x.addEventListener('click',()=>applyLanguage(language==='en'?'ar':'en')));
window.addEventListener('storage',e=>{if(e.key==='ooxme-language')applyLanguage(e.newValue==='ar'?'ar':'en')});
window.addEventListener('resize', () => { applyLandscapeStepText(); updateCustomerPlaceholders(); });
track.style.height=`${panels.length*100}dvh`;
let step=0, transitionTimer;
let restoreConsultationPromoPanel = () => {};
const confirmationDescription = document.querySelector('.booking-panel[data-step="confirmation"] .master-panel-content > p:not(.master-panel-label)');
if (confirmationDescription) {
  confirmationDescription.dataset.ar = '\u0633\u0648\u0641 \u062a\u0633\u062a\u0644\u0645 \u0627\u0644\u0627\u0631\u0634\u0627\u062f\u0627\u062a \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0639\u0628\u0631 \u0627\u0644\u0627\u064a\u0645\u064a\u0644 \u0628\u0639\u062f \u062a\u0623\u0643\u064a\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0645\u062f\u0641\u0648\u0639\u0627\u062a\u0643';
  if (language === 'ar') confirmationDescription.textContent = confirmationDescription.dataset.ar;
}
const confirmationContent = document.querySelector('.booking-panel[data-step="confirmation"] .confirmation-content');
const ensureConfirmationSuccessMark = () => {
  if (!confirmationContent || confirmationContent.querySelector('.confirmation-success-mark')) return confirmationContent?.querySelector('.confirmation-success-mark');
  const successMark = document.createElement('div');
  successMark.className = 'confirmation-success-mark';
  successMark.setAttribute('aria-hidden', 'true');
  successMark.innerHTML = '<svg viewBox="0 0 100 100" focusable="false"><path class="confirmation-success-circle" pathLength="1" d="M 50 14 A 36 36 0 1 1 49.999 14"/><path class="confirmation-success-check" pathLength="1" d="M 29 53 L 44 68 L 72 37"/></svg>';
  confirmationContent.append(successMark);
  return successMark;
};
const replayConfirmationSuccessMark = () => {
  const mark = ensureConfirmationSuccessMark();
  if (!mark) return;
  mark.classList.remove('is-drawing');
  void mark.offsetWidth;
  mark.classList.add('is-drawing');
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
const promoValid = (show = false) => { const field = document.querySelector('[data-field="promo"]'); const code = (field?.value.trim() || state.promo || '').toUpperCase(); const valid = !code || code === 'R100'; markInvalid(field, show && !valid); if (show && !valid) setPromoFeedback(copy[language].promoInvalid, true); return valid; };
const customerComplete = (show = false) => { let valid = true; fieldsRequired.forEach((key) => { const field = document.querySelector(`[data-field="${key}"]`); const value = String(state[key] || '').trim(); const usablePhone = key !== 'phone' || value.replace(/\D/g, '').length >= 7; const usableEmail = key !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); const missing = !value || !usablePhone || !usableEmail; if (missing) valid = false; if (show) setFieldError(field, key, missing); }); return valid; };
const dateAvailable = () => { if (!/^\d{4}-\d{2}-\d{2}$/.test(state.date || '')) return false; const date = new Date(`${state.date}T12:00:00`); return !Number.isNaN(date.valueOf()) && ![4, 5].includes(date.getDay()) && date.getDate() % 4 !== 0; };
const timeDurationComplete = (show = false) => { const validTime = ['10:00','13:00','16:00'].includes(state.time); const validDuration = [45,60,90].includes(Number(state.duration)) && !(state.promo.toUpperCase() === 'R100' && Number(state.duration) !== 45); if (show) { markInvalid(document.querySelector('[data-times]')?.closest('.booking-card'), !validTime); markInvalid(document.querySelector('[data-durations]')?.closest('.booking-card'), !validDuration); } return validTime && validDuration; };
const bookingComplete = () => promoValid(false) && customerComplete(false) && dateAvailable() && timeDurationComplete(false);
const canProceed = (show = true) => { if (BOOKING_DESIGN_MODE) return true; if (step === 0) { const valid = promoValid(show); const code = promoInputField?.value.trim().toUpperCase() || state.promo.toUpperCase(); if (!valid) return false; if (code === 'R100') { state.promo = 'R100'; state.duration = '45'; save(); renderChoices(); if (show) setPromoFeedback(language === 'ar' ? 'تم تطبيق الكود' : 'Code applied'); } else { state.promo = ''; save(); } return true; } if (step === 1) return customerComplete(show); if (step === 2) { const valid = dateAvailable(); if (show) markInvalid(document.querySelector('[data-calendar]'), !valid); return valid; } if (step === 3) return timeDurationComplete(show); if (step === 4) { const valid = bookingComplete(); if (show) markInvalid(document.querySelector('[data-summary]'), !valid); return valid; } if (step === 5) { const valid = total() === 0 || Boolean(state.payment); if (show) markInvalid(document.querySelector('[data-payment-options]'), !valid); return valid; } return true; };
const moveTo = (index) => { const next=Math.max(0,Math.min(panels.length-1,index)); const completingFlow = step === panels.length - 2 && next === panels.length - 1; if(next===step || (next>step && !canProceed(true)))return; if(next===0) restoreConsultationPromoPanel(); step=next; panels.forEach(p=>p.classList.remove('is-active')); track.style.transform=`translateY(${-step*100}dvh)`; clearTimeout(transitionTimer); transitionTimer=setTimeout(()=>{reveal(); if (completingFlow) replayConfirmationSuccessMark();},620); };
window.OOXMEMasterPanelDrag?.register({ experience, track, panels, getIndex: () => step, moveTo });
const continueStep = () => { if(!canProceed(true)) return; if(!BOOKING_DESIGN_MODE && step===4 && total()===0) moveTo(6); else moveTo(step+1); };
document.querySelectorAll('[data-next]').forEach(x=>x.addEventListener('click',continueStep));
document.querySelectorAll('[data-field]').forEach(field=>{ field.value=state[field.dataset.field]||''; field.addEventListener('input',()=>{state[field.dataset.field]=field.value;markInvalid(field,false);field.closest('label')?.classList.remove('is-invalid');save(); if(step===1&&customerComplete(false))setTimeout(()=>{if(step===1&&customerComplete(false))moveTo(2)},180)}); field.addEventListener('change',()=>{state[field.dataset.field]=field.value;markInvalid(field,false);field.closest('label')?.classList.remove('is-invalid');save();if(step===1&&customerComplete(false))moveTo(2)}); field.addEventListener('focus',()=>field.scrollIntoView({block:'center',behavior:'smooth'})); });
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
let promoFeedbackTimer;
const setPromoFeedback = (message = '', clearAfter = false) => { window.clearTimeout(promoFeedbackTimer); promoFeedback.textContent = message; promoInputCard.classList.toggle('is-feedback', Boolean(message)); if (clearAfter) promoFeedbackTimer = window.setTimeout(() => { promoFeedback.textContent = ''; promoInputCard.classList.remove('is-feedback'); promoInputField.value = ''; }, 1100); };
promoInputField.addEventListener('input', () => { const normalized = promoInputField.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(); if (promoInputField.value !== normalized) promoInputField.value = normalized; markInvalid(promoInputField,false); setPromoFeedback(); });
document.querySelector('[data-promo-form]').addEventListener('submit',e=>{e.preventDefault(); const code=promoInputField.value.trim(); if (!code) { state.promo=''; save(); setPromoFeedback(); return; } if (code !== 'R100') { state.promo=''; save(); setPromoFeedback(copy[language].promoInvalid, true); return; } state.promo='R100'; state.duration='45'; save(); renderChoices(); setPromoFeedback(language==='ar'?'تم تطبيق الكود':'Code applied'); });
const promoDescription = document.querySelector('[data-step="promo"] .master-panel-content > p');
let consultationPromoSuccess = false;
let consultationPromoSuccessTimer;
const updateConsultationPromoCopy = () => {
  promoInputField.placeholder = consultationCopy[language].promoPlaceholder;
  if (promoDescription) promoDescription.textContent = consultationPromoSuccess ? 'تم تطبيق الخصم' : consultationCopy[language].promoDescription;
};
const clearConsultationPromoTimers = () => {
  window.clearTimeout(consultationPromoSuccessTimer);
};
const showConsultationPromoFeedback = (message = '', clearAfter = false) => {
  setPromoFeedback(message, clearAfter);
  promoInputCard.classList.toggle('is-invalid', Boolean(message) && message === consultationCopy[language].promoInvalid);
};
promoInputField.addEventListener('input', () => {
  promoInputCard.classList.remove('is-invalid');
  promoInputField.placeholder = consultationCopy[language].promoPlaceholder;
});
restoreConsultationPromoPanel = () => {
  clearConsultationPromoTimers();
  consultationPromoSuccess = false;
  promoInputField.value = state.promo;
  showConsultationPromoFeedback();
  updateConsultationPromoCopy();
};
const promoExampleCodes = ['OOXME25', 'START10', 'HELLO20', 'WELCOME', 'OOX15'];
let promoPlaceholderTimer;
let promoPlaceholderRunning = false;
let promoPlaceholderIndex = -1;
let promoPlaceholderStep = 0;
let promoPlaceholderPhase = 'typing';
const promoPlaceholderCanRun = () => !promoInputField.value && document.activeElement !== promoInputField && !promoInputCard.classList.contains('is-feedback');
const stopPromoPlaceholderAnimation = (clear = true) => {
  window.clearTimeout(promoPlaceholderTimer);
  promoPlaceholderRunning = false;
  if (clear && !promoInputField.value) promoInputField.placeholder = '';
};
const nextPromoExample = () => {
  let next = promoPlaceholderIndex;
  while (next === promoPlaceholderIndex) next = Math.floor(Math.random() * promoExampleCodes.length);
  promoPlaceholderIndex = next;
  return promoExampleCodes[next];
};
const runPromoPlaceholderAnimation = () => {
  if (!promoPlaceholderCanRun()) return;
  promoPlaceholderRunning = true;
  const code = promoExampleCodes[promoPlaceholderIndex] || nextPromoExample();
  if (promoPlaceholderPhase === 'typing') {
    promoPlaceholderStep += 1;
    promoInputField.placeholder = code.slice(0, promoPlaceholderStep);
    if (promoPlaceholderStep < code.length) promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 55);
    else { promoPlaceholderPhase = 'holding'; promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 600); }
    return;
  }
  if (promoPlaceholderPhase === 'holding') { promoPlaceholderPhase = 'deleting'; promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 35); return; }
  promoPlaceholderStep -= 1;
  promoInputField.placeholder = code.slice(0, Math.max(0, promoPlaceholderStep));
  if (promoPlaceholderStep > 0) { promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 35); return; }
  promoPlaceholderPhase = 'typing';
  nextPromoExample();
  promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 200);
};
const startPromoPlaceholderAnimation = () => {
  if (promoPlaceholderRunning || !promoPlaceholderCanRun()) return;
  promoPlaceholderPhase = 'typing';
  promoPlaceholderStep = 0;
  nextPromoExample();
  promoPlaceholderTimer = window.setTimeout(runPromoPlaceholderAnimation, 260);
};
promoInputField.addEventListener('focus', () => stopPromoPlaceholderAnimation());
promoInputField.addEventListener('input', () => stopPromoPlaceholderAnimation(false));
promoInputField.addEventListener('blur', () => {
  if (!promoInputField.value) window.setTimeout(startPromoPlaceholderAnimation, 260);
});
window.setTimeout(startPromoPlaceholderAnimation, 320);
document.querySelector('[data-promo-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const code = promoInputField.value.trim();
  if (!code) {
    state.promo = '';
    save();
    showConsultationPromoFeedback();
    moveTo(1);
    return;
  }
  if (code !== 'R100') {
    state.promo = '';
    save();
    showConsultationPromoFeedback(consultationCopy[language].promoInvalid, true);
    return;
  }
  state.promo = 'R100';
  state.duration = '45';
  save();
  renderChoices();
  clearConsultationPromoTimers();
  consultationPromoSuccess = true;
  promoInputField.value = '';
  showConsultationPromoFeedback();
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
  const monthOptions = t.months.map((name,index)=>`<button type="button" class="calendar-month-option" role="option" data-month-option="${index}" aria-selected="${index===month}">${name}</button>`).join('');
  let html=`<div class="calendar-head"><div class="calendar-month-picker"><button type="button" class="calendar-month-trigger" data-month-trigger aria-haspopup="listbox" aria-expanded="false"><span>${t.months[month]}</span><span class="calendar-month-arrow" aria-hidden="true"></span></button><div class="calendar-month-menu" data-month-menu role="listbox" aria-label="Month" hidden>${monthOptions}</div></div><span class="calendar-year">${year}</span></div><div class="calendar-weekdays">${t.weekdays.map(d=>`<span class="calendar-weekday">${d}</span>`).join('')}</div><div class="calendar-grid">`;
  html+=Array(first).fill('<span></span>').join('');
  for(let day=1;day<=days;day++){
    const date=new Date(year,month,day),dow=date.getDay(),key=date.toISOString().slice(0,10), unavailable=dow===4||dow===5, booked=!unavailable&&day%4===0, cls=unavailable?'is-unavailable':booked?'is-booked':state.date===key?'is-selected':'';
    html+=`<button type="button" class="calendar-day ${cls}" data-date="${key}">${day}</button>`;
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
        /* The resting animation begins 4px above its final centered position. */
        menu.style.setProperty('--month-menu-center-y',`${(window.innerHeight/2)-(bounds.top+(bounds.height/2))-4}px`);
        picker.classList.add('is-open');
      });
      return;
    }
    trigger.setAttribute('aria-expanded','false');
    picker.classList.remove('is-open');
    closeTimer=window.setTimeout(()=>{menu.hidden=true;picker.classList.remove('opens-upward');},210);
  };
  /* Only the white month menu itself keeps the picker open. */
  const onOutsidePointerDown = (event) => { if(!menu.contains(event.target)) setMonthMenuOpen(false); };
  const onEscape = (event) => { if(event.key==='Escape') setMonthMenuOpen(false); };
  trigger.addEventListener('click',()=>setMonthMenuOpen(menu.hidden));
  menu.querySelectorAll('[data-month-option]').forEach(option=>option.addEventListener('click',()=>{
    const nextMonth=Number(option.dataset.monthOption);
    if(nextMonth===month){setMonthMenuOpen(false);return;}
    setMonthMenuOpen(false);
    window.clearTimeout(monthDropdownChangeTimer);
    monthDropdownChangeTimer=window.setTimeout(()=>{monthCursor.setMonth(nextMonth);renderCalendar();},210);
  }));
  document.addEventListener('pointerdown',onOutsidePointerDown);
  document.addEventListener('keydown',onEscape);
  clearMonthDropdownListeners=()=>{
    window.clearTimeout(closeTimer);
    document.removeEventListener('pointerdown',onOutsidePointerDown);
    document.removeEventListener('keydown',onEscape);
  };
  box.querySelectorAll('[data-date]').forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('is-unavailable')||b.classList.contains('is-booked')) return;
    state.date=b.dataset.date;markInvalid(box,false);save();renderCalendar();setTimeout(()=>{if(step===2&&dateAvailable())moveTo(3)},180);
  }));
};
const renderChoices = () => { const times=document.querySelector('[data-times]'),durations=document.querySelector('[data-durations]'); if(!times)return; const options=['10:00','13:00','16:00']; times.innerHTML=options.map(value=>`<button type="button" class="${state.time===value?'is-selected':''}" data-time="${value}">${value}</button>`).join(''); durations.innerHTML=[45,60,90].map(value=>`<button type="button" class="${Number(state.duration)===value?'is-selected':''}" data-duration="${value}">${value} ${language==='ar'?'دقيقة':'minutes'}</button>`).join(''); times.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{state.time=b.dataset.time;markInvalid(times.closest('.booking-card'),false);save();renderChoices();if(state.duration)setTimeout(()=>{if(step===3&&timeDurationComplete(false))moveTo(4)},180)}));durations.querySelectorAll('[data-duration]').forEach(b=>b.addEventListener('click',()=>{state.duration=b.dataset.duration;if(state.promo.trim().toUpperCase()==='R100')state.duration='45';markInvalid(durations.closest('.booking-card'),false);save();renderChoices();if(state.time)setTimeout(()=>{if(step===3&&timeDurationComplete(false))moveTo(4)},180)})); };
const money = value => `${value} USD`;
const renderSummary = () => { const box=document.querySelector('[data-summary]'); if(!box)return; const labels=copy[language].summary; const rows=[['name',state.name],['email',state.email],['phone',state.phone],['topic',state.topic],['sector',state.sector],['date',state.date],['time',state.time],['duration',state.duration?`${state.duration} ${language==='ar'?'دقيقة':'minutes'}`:''],['promo',state.promo||'—'],['fee',money(price())],['discount',money(discount())],['total',money(total())]]; box.innerHTML=rows.map(([key,value])=>`<div><dt>${labels[key]}</dt><dd>${value||'—'}</dd></div>`).join(''); document.querySelector('[data-confirm-label]').textContent=total()===0?copy[language].confirm:copy[language].confirmPay; };
const paymentOptionsContainer = document.querySelector('[data-payment-options]');
const superQiPaymentOption = paymentOptionsContainer?.querySelector('[data-payment="Qi"]');
const comingSoonPaymentOption = paymentOptionsContainer?.querySelector('.payment-option--coming');
if (superQiPaymentOption && comingSoonPaymentOption) {
  const newPaymentMethodClone = superQiPaymentOption.cloneNode(true);
  newPaymentMethodClone.dataset.paymentCopy = 'coming';
  paymentOptionsContainer.replaceChild(newPaymentMethodClone, comingSoonPaymentOption);
}
const paymentOptions = [...document.querySelectorAll('[data-payment-options] .payment-option')];
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
document.addEventListener('pointerdown', event => {
  if (step !== 5 || !paymentOptions.some(option => option.classList.contains('is-open'))) return;
  if (event.target.closest('.payment-option')) return;
  closeOpenPaymentOption();
});
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
const updateKeyboard=()=>{if(!viewport)return;searchOverlay.style.setProperty('--visual-viewport-height',`${viewport.height}px`);searchOverlay.style.setProperty('--visual-viewport-top',`${viewport.offsetTop}px`);searchOverlay.classList.toggle('is-keyboard-open',document.activeElement===searchInput&&fullViewport-viewport.height>120)};
document.querySelectorAll('[data-search-toggle]').forEach(button=>button.addEventListener('click',event=>{
  event.stopPropagation();
  if (searchOverlay.hidden || !searchOverlay.classList.contains('is-open')) openSearch();
  else closeSearch();
}));
searchOverlay.addEventListener('click', closeSearch);
searchOverlayField.addEventListener('click', event => event.stopPropagation());
searchOverlay.querySelectorAll('.search-overlay-links a, [data-search-suggestion]').forEach(option=>option.addEventListener('click',event=>{
  event.stopPropagation();
  closeSearch();
}));
searchInput.addEventListener('input',()=>{const q=searchInput.value.trim();searchOverlay.classList.toggle('is-typing',!!q);suggestion.hidden=true;updateSearchResults(q);resizeSearch()});
searchInput.addEventListener('focus',updateKeyboard);
searchInput.addEventListener('blur',()=>setTimeout(updateKeyboard));
viewport?.addEventListener('resize',updateKeyboard);
viewport?.addEventListener('scroll',updateKeyboard);
applyLanguage(language);updateConsultationPromoCopy();renderCalendar();renderChoices();renderSummary();reveal();
