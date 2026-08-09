'use client';

import { useEffect, useState } from 'react';
import GlobalPanelHeader from './GlobalPanelHeader';

const copy = {
  en: {
    label: 'BOOKING CONFIRMED',
    heading: 'Done.',
    message: 'Check your email for instructions.',
  },
  ar: {
    label: 'تم تاكيد الحجز',
    heading: 'تم.',
    message: 'تحقق من بريدك الالكتروني للتعليمات.',
  },
};

export default function BookingConfirmed() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const syncLanguage = () => setLanguage(document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    syncLanguage();
    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  const content = copy[language];
  return (
    <main className="booking-confirmed-page" data-ooxme-page="booking-confirmed">
      <section className="booking-confirmed-panel" aria-labelledby="booking-confirmed-heading">
        <GlobalPanelHeader pageId="booking-confirmed" />
        <div className="booking-confirmed-content">
          <p className="booking-confirmed-label">{content.label}</p>
          <h1 id="booking-confirmed-heading">{content.heading}</h1>
          <p>{content.message}</p>
        </div>
      </section>
    </main>
  );
}
