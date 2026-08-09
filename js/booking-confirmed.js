(() => {
  const copy = {
    en: { label: 'BOOKING CONFIRMED', heading: 'Done.', message: 'Check your email for instructions.', home: 'Home', id: 'Booking ID', date: 'Date', time: 'Time', duration: 'Session length', promo: 'Promo code', original: 'Original price', discount: 'Discount', final: 'Final price', noPromo: 'Not applied' },
    ar: { label: 'تم تاكيد الحجز', heading: 'تم.', message: 'تحقق من بريدك الالكتروني للتعليمات.', home: 'الرئيسية', id: 'رقم الحجز', date: 'التاريخ', time: 'الوقت', duration: 'مدة الجلسة', promo: 'الرمز الترويجي', original: 'السعر الاصلي', discount: 'الخصم', final: 'السعر النهائي', noPromo: 'غير مطبق' }
  };
  let language = 'en'; let booking = null;
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; booking = JSON.parse(sessionStorage.getItem('ooxme-booking') || 'null'); } catch (_) {}
  const languageButton = document.querySelector('.language-toggle');
  languageButton.innerHTML = '<img src="assets/icons/globe.png" alt="" aria-hidden="true" />';
  const searchButton = document.querySelector('.global-header-icon:last-child');
  searchButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>';
  const render = () => {
    const text = copy[language]; const root = document.documentElement;
    root.lang = language; root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelector('[data-confirmed-label]').textContent = text.label;
    document.querySelector('[data-confirmed-heading]').textContent = text.heading;
    document.querySelector('[data-confirmed-message]').textContent = text.message;
    document.querySelector('[data-confirmed-home]').textContent = text.home;
    const summary = document.querySelector('[data-confirmed-summary]');
    if (!booking) { summary.innerHTML = ''; return; }
    const date = new Intl.DateTimeFormat(language === 'ar' ? 'ar-IQ' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(booking.year, booking.month, booking.day));
    const rows = [[text.id, booking.bookingId], [text.date, date], [text.time, booking.time], [text.duration, `${booking.durationMinutes} ${language === 'ar' ? 'دقيقة' : 'min'}`], [text.promo, booking.promoCode || text.noPromo], [text.original, `$${booking.originalPrice}`], [text.discount, `${booking.discountPercent || 0}%`], [text.final, `$${booking.finalPrice}`]];
    summary.innerHTML = rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value || '—'}</dd></div>`).join('');
  };
  languageButton.addEventListener('click', () => { language = language === 'en' ? 'ar' : 'en'; try { localStorage.setItem('ooxme-language', language); } catch (_) {} render(); });
  render();
})();
