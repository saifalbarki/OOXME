'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import SwipeDownControl from './SwipeDownControl';
import GlobalSearchOverlay from './GlobalSearchOverlay';
import { crossesSectionThreshold, gestureOffset, SECTION_TRANSITION } from '../utilities/section-transition';
import { portfolioPanelSections } from '../config/site-structure';

const copy = {
  en: {
    portfolio: 'Portfolio',
    statement: 'Work designed to move businesses forward.',
    manage: 'Brands We Manage',
    designed: 'Brands We Designed',
    featured: 'Unique Works',
    plans: 'Plans',
    plansTitle: 'Flexible Monthly Growth Plans',
    plansText: 'Choose the partnership level that best matches your business needs.',
    services: 'Services',
    servicesTitle: 'Everything Your Business Needs To Grow',
    servicesText: 'A connected team of specialists for every important move your business needs to make.',
    consultation: 'Consultation',
    consultationTitle: 'Let’s Build Your Business Together',
    consultationText: 'Book a consultation with OOXME to discuss your business, identify opportunities, and create a clear growth strategy.',
    schedule: 'Schedule Consultation',
    contact: 'Contact',
    contactTitle: 'Let’s Connect',
    contactText: 'Have an opportunity, an ambition, or a challenge worth discussing? OOXME is ready to start the conversation.',
    next: 'Continue',
    previous: 'Back',
    search: 'Search',
  },
  ar: {
    portfolio: 'المعرض',
    statement: 'أعمال صُممت لدفع الأعمال الى الأمام.',
    manage: 'علامات نديرها',
    designed: 'علامات صممناها',
    featured: 'أعمال مميزة',
    plans: 'الباقات',
    plansTitle: 'باقات نمو شهرية مرنــــة',
    plansText: 'اختر مستوى الشراكة الذي يناسب احتياجات عملك.',
    services: 'الخدمات',
    servicesTitle: 'كل ما يحتاجه عملك للنمو',
    servicesText: 'فريق متخصص ومترابط لكل خطوة مهمة يحتاجها عملك.',
    consultation: 'استشارة',
    consultationTitle: 'لنبنِ أعمالك معاً',
    consultationText: 'احجز استشارة مع أوكسوم لمناقشة عملك وتحديد الفرص وبناء استراتيجية نمو واضحة.',
    schedule: 'جدولة استشارة',
    contact: 'تواصل',
    contactTitle: 'لنتواصل',
    contactText: 'لديك فرصة أو طموح أو تحدٍ يستحق النقاش؟ أوكسوم جاهزة لبدء المحادثة.',
    next: 'متابعة',
    previous: 'رجوع',
    search: 'بحث',
  },
};

function Arrow() {
  return (
    <span className="portfolio-panel-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="m8 5 7 7-7 7" />
      </svg>
    </span>
  );
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.35 2.2 3.55 4.86 3.55 8S14.35 17.8 12 20c-2.35-2.2-3.55-4.86-3.55-8S9.65 6.2 12 4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="6.8" />
      <path d="m15 15 4.1 4.1" />
    </svg>
  );
}

function Card({ href, children }) {
  return (
    <Link className="portfolio-nav-card" href={href}>
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

function PanelFrame({ children, language, index, onLanguage, onSearch, onNext, total, continueLabel }) {
  const text = copy[language];
  return (
    <section className="portfolio-viewport-section" aria-label={`${text.portfolio} ${index + 1}`}>
      <div className="portfolio-full-panel">
        <header className="portfolio-panel-header">
          <button className="portfolio-panel-icon" onClick={onLanguage} aria-label={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}>
            <LanguageIcon />
          </button>
          <Link className="portfolio-panel-logo" href="/" aria-label="OOXME home">
            <img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME" />
          </Link>
          <button className="portfolio-panel-icon" onClick={onSearch} aria-label={text.search}>
            <SearchIcon />
          </button>
        </header>

        <div className="portfolio-panel-content">{children}</div>

        <footer className="portfolio-panel-footer">
          {index < total - 1 && (
            <button className="portfolio-continue-control" onClick={onNext}>
              <SwipeDownControl label={continueLabel || text.next} />
            </button>
          )}
        </footer>
      </div>
    </section>
  );
}

export default function PortfolioPanels({ initialPanel = 1, basePath = '/portfolio' }) {
  const [language, setLanguage] = useState('en');
  const [panel, setPanel] = useState(initialPanel);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchClosing, setSearchClosing] = useState(false);
  const startY = useRef(null);
  const dragDistance = useRef(0);
  const wheelTimer = useRef(null);
  const wheelDistance = useRef(0);
  const panelCount = portfolioPanelSections.length + 1;

  useEffect(() => {
    const syncPanelFromUrl = () => {
      const requestedSection = new URLSearchParams(window.location.search).get('section');
      const requestedPanel = portfolioPanelSections.indexOf(requestedSection);
      setPanel(requestedPanel >= 0 ? requestedPanel + 1 : initialPanel);
      setDragOffset(0);
      setDragging(false);
    };
    syncPanelFromUrl();
    window.addEventListener('popstate', syncPanelFromUrl);
    return () => window.removeEventListener('popstate', syncPanelFromUrl);
  }, [initialPanel]);

  const openSearch = () => {
    setSearchClosing(false);
    setSearchOpen(true);
  };

  const closeSearch = () => {
    if (!searchOpen || searchClosing) return;
    setSearchClosing(true);
    window.setTimeout(() => {
      setSearchOpen(false);
      setSearchClosing(false);
    }, 200);
  };

  useEffect(() => {
    const saved = window.localStorage.getItem('ooxme-language');
    if (saved === 'ar' || saved === 'en') setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('ooxme-language', language);
    return () => {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    };
  }, [language]);

  const moveTo = useCallback((next) => {
    const safePanel = Math.max(0, Math.min(panelCount - 1, next));
    setPanel(safePanel);
    const section = portfolioPanelSections[safePanel - 1];
    if (basePath === '/portfolio' && safePanel > 0) {
      window.history.replaceState(null, '', section === 'portfolio' ? '/portfolio' : `/portfolio?section=${section}`);
    }
    setDragOffset(0);
    setDragging(false);
  }, [basePath, panelCount]);

  const finishDrag = useCallback((distance) => {
    if (crossesSectionThreshold(distance) && distance > 0) moveTo(panel + 1);
    else if (crossesSectionThreshold(distance) && distance < 0) moveTo(panel - 1);
    else {
      setDragOffset(0);
      setDragging(false);
    }
  }, [moveTo, panel]);

  const onPointerDown = (event) => {
    if (event.target.closest('button,a,input')) return;
    startY.current = event.clientY;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (startY.current == null) return;
    const distance = startY.current - event.clientY;
    const atStart = panel === 0 && distance < 0;
    const atEnd = panel === panelCount - 1 && distance > 0;
    dragDistance.current = distance;
    setDragOffset(-gestureOffset(distance, atStart || atEnd));
  };

  const onPointerEnd = () => {
    if (startY.current == null) return;
    const distance = dragDistance.current;
    startY.current = null;
    dragDistance.current = 0;
    finishDrag(distance);
  };

  useEffect(() => {
    const onWheel = (event) => {
      if (searchOpen || Math.abs(event.deltaY) < 4) return;
      event.preventDefault();
      wheelDistance.current += event.deltaY;
      window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        if (crossesSectionThreshold(wheelDistance.current) && wheelDistance.current > 0) moveTo(panel + 1);
        if (crossesSectionThreshold(wheelDistance.current) && wheelDistance.current < 0) moveTo(panel - 1);
        wheelDistance.current = 0;
      }, SECTION_TRANSITION.wheelSettleDelay);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.clearTimeout(wheelTimer.current);
    };
  }, [moveTo, panel, searchOpen]);

  const text = copy[language];
  const transform = `translate3d(0, calc(${-panel * 100}dvh + ${dragOffset}px), 0)`;
  const contacts = language === 'en' ? [
    ['WhatsApp Business', '+964 772 111 7110', 'whatsapp.png', 'https://wa.me/9647721117110'],
    ['Phone', '+964 772 111 7110', 'call.png', 'tel:+9647721117110'],
    ['Email', 'hello@ooxme.com', 'mail.png', 'mailto:hello@ooxme.com'],
    ['Instagram', '@ooxme', 'instagram.png', 'https://www.instagram.com/ooxme/'],
    ['LinkedIn', 'OOXME', 'linkedin.png', 'https://www.linkedin.com/in/ooxme/'],
    ['Facebook', 'OOXME', 'facebook.png', 'https://www.facebook.com/share/18hpFHdJDv/?mibextid=wwXIfr'],
    ['Website', 'ooxme.com', 'globe.png', 'https://ooxme.com/'],
  ] : [
    ['واتساب الأعمال', '+964 772 111 7110', 'whatsapp.png', 'https://wa.me/9647721117110'],
    ['الهاتف', '+964 772 111 7110', 'call.png', 'tel:+9647721117110'],
    ['البريد الإلكتروني', 'hello@ooxme.com', 'mail.png', 'mailto:hello@ooxme.com'],
    ['إنستغرام', '@ooxme', 'instagram.png', 'https://www.instagram.com/ooxme/'],
    ['لينكدإن', 'OOXME', 'linkedin.png', 'https://www.linkedin.com/in/ooxme/'],
    ['فيسبوك', 'OOXME', 'facebook.png', 'https://www.facebook.com/share/18hpFHdJDv/?mibextid=wwXIfr'],
    ['الموقع الإلكتروني', 'ooxme.com', 'globe.png', 'https://ooxme.com/'],
  ];

  return (
    <main
      className={`portfolio-panel-experience${dragging ? ' is-dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div className="portfolio-panel-track" style={{ transform, '--panel-count': panelCount }}>
        <PanelFrame language={language} index={0} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={openSearch} onNext={() => moveTo(1)} continueLabel={language === 'en' ? 'Swipe up for more' : 'اسحب للأعلى للمزيد'}>
          <div className="portfolio-home-content" aria-hidden="true" />
        </PanelFrame>

        <PanelFrame language={language} index={1} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={openSearch} onNext={() => moveTo(2)}>
          <div className="portfolio-intro-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.portfolio}</p>
            <h1>{text.statement}</h1>
            <nav className="portfolio-primary-links" aria-label={text.portfolio}>
              <Card href="/businesses-we-managed">{text.manage}</Card>
              <Card href="/brands-we-designed">{text.designed}</Card>
              <Card href="/unique-works">{text.featured}</Card>
            </nav>
          </div>
        </PanelFrame>

        <PanelFrame language={language} index={2} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={openSearch} onNext={() => moveTo(3)}>
          <div className="portfolio-section-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.plans}</p>
            <h2>{text.plansTitle}</h2>
            <p>{text.plansText}</p>
            <div className="portfolio-primary-links compact-links">
              <Card href="/plan-starter">{language === 'en' ? 'Starter' : 'البداية'}</Card>
              <Card href="/plan-standard">{language === 'en' ? 'Standard' : 'القياسية'}</Card>
              <Card href="/plan-plus">{language === 'en' ? 'Premium' : 'بريميوم'}</Card>
            </div>
          </div>
        </PanelFrame>

        <PanelFrame language={language} index={3} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={openSearch} onNext={() => window.location.assign('/services')}>
          <div className="portfolio-section-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.services}</p>
            <h2>{text.servicesTitle}</h2>
            <p>{text.servicesText}</p>
            <div className="portfolio-primary-links compact-links">
              <Card href="/services-business-development">{language === 'en' ? 'Business Development' : 'تطوير الأعمال'}</Card>
              <Card href="/services-brand-strategy">{language === 'en' ? 'Brand Strategy' : 'استراتيجية العلامة'}</Card>
              <Card href="/services-creative-digital">{language === 'en' ? 'Creative & Digital Services' : 'الخدمات الإبداعية والرقمية'}</Card>
            </div>
          </div>
        </PanelFrame>

        <PanelFrame language={language} index={4} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={openSearch} onNext={() => moveTo(5)}>
          <div className="portfolio-section-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.consultation}</p>
            <h2>{text.consultationTitle}</h2>
            <p>{text.consultationText}</p>
            <Link className="portfolio-solid-action" href="/consultation" onClick={(event) => event.stopPropagation()}>{text.schedule}</Link>
          </div>
        </PanelFrame>

        <PanelFrame language={language} index={5} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={openSearch} onNext={() => moveTo(5)}>
          <div className="portfolio-section-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.contact}</p>
            <h2>{text.contactTitle}</h2>
            <p>{text.contactText}</p>
            <div className="portfolio-contact-cards" aria-label={text.contact}>
              {contacts.map(([name, detail, icon, href]) => (
                <a key={name} className="portfolio-contact-card" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>
                  <span className="portfolio-contact-icon"><img src={`/assets/icons/${icon}`} alt="" /></span>
                  <span className="portfolio-contact-copy"><strong>{name}</strong><small>{detail}</small></span>
                  <Arrow />
                </a>
              ))}
            </div>
          </div>
        </PanelFrame>
      </div>

      {searchOpen && <GlobalSearchOverlay language={language} closing={searchClosing} onClose={closeSearch} onToggleLanguage={() => setLanguage((current) => current === 'en' ? 'ar' : 'en')} />}
    </main>
  );
}
