'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobalPanelHeader from './GlobalPanelHeader';

const copy = {
  en: { label: 'BOOKING CONFIRMED', heading: 'Done.', message: 'Check your email for instructions.', id: 'Booking ID', date: 'Date', time: 'Time', duration: 'Session length', promo: 'Promo code', original: 'Original price', discount: 'Discount', final: 'Final price', home: 'Home', noPromo: 'Not applied' },
  ar: { label: 'تم تاكيد الحجز', heading: 'تم.', message: 'تحقق من بريدك الالكتروني للتعليمات.', id: 'رقم الحجز', date: 'التاريخ', time: 'الوقت', duration: 'مدة الجلسة', promo: 'الرمز الترويجي', original: 'السعر الاصلي', discount: 'الخصم', final: 'السعر النهائي', home: 'الرئيسية', noPromo: 'غير مطبق' },
};

export default function BookingConfirmed() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const sync = () => setLanguage(document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    sync();
    try { setBooking(JSON.parse(sessionStorage.getItem('ooxme-booking') || 'null')); } catch { setBooking(null); }
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  const text = copy[language];
  const appointmentDate = booking ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-IQ' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(booking.year, booking.month, booking.day)) : '—';
  const rows = booking ? [
    [text.id, booking.bookingId || '—'], [text.date, appointmentDate], [text.time, booking.time || '—'],
    [text.duration, `${booking.durationMinutes || 45} ${language === 'ar' ? 'دقيقة' : 'min'}`], [text.promo, booking.promoCode || text.noPromo],
    [text.original, `$${booking.originalPrice ?? 0}`], [text.discount, `${booking.discountPercent ?? 0}%`], [text.final, `$${booking.finalPrice ?? 0}`],
  ] : [];

  return <main className="booking-confirmed-page" data-ooxme-page="booking-confirmed">
    <section className="booking-confirmed-panel" aria-labelledby="booking-confirmed-heading">
      <GlobalPanelHeader pageId="booking-confirmed" />
      <div className="booking-confirmed-content">
        <p className="booking-confirmed-label">{text.label}</p>
        <h1 id="booking-confirmed-heading">{text.heading}</h1>
        <p>{text.message}</p>
        {rows.length > 0 && <dl className="booking-confirmed-summary">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      </div>
      <button className="booking-confirmed-home" type="button" onClick={() => router.push('/')}>{text.home}</button>
    </section>
  </main>;
}
