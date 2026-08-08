'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const transitionThreshold = 86;

const copy = {
  en: {
    portfolio: 'Portfolio',
    statement: 'Work designed to move businesses forward.',
    manage: 'Brands We Manage',
    designed: 'Brands We Designed',
    featured: 'Featured Work',
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
    close: 'Close',
    searchPlaceholder: 'Search OOXME',
    noResults: 'No matching pages found.',
  },
  ar: {
    portfolio: 'المعرض',
    statement: 'أعمال صُممت لدفع الأعمال إلى الأمام.',
    manage: 'علامات نديرها',
    designed: 'علامات صممناها',
    featured: 'أعمال مميزة',
    plans: 'الباقات',
    plansTitle: 'باقات نمو شهرية مرنة',
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
    close: 'إغلاق',
    searchPlaceholder: 'ابحث في أوكسوم',
    noResults: 'لا توجد صفحات مطابقة.',
  },
};

const searchLinks = [
  { href: '/project-albasri-commercial-group', en: 'Brands We Manage', ar: 'علامات نديرها' },
  { href: '/project-alfayha-eyewear', en: 'Brands We Designed', ar: 'علامات صممناها' },
  { href: '/project-sawa-university', en: 'Featured Work', ar: 'أعمال مميزة' },
  { href: '/plan-starter', en: 'Growth Plans', ar: 'باقات النمو' },
  { href: '/services', en: 'Services', ar: 'الخدمات' },
  { href: '/consultation', en: 'Consultation', ar: 'استشارة' },
];

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

function PanelFrame({ children, language, index, onLanguage, onSearch, onNext, onPrevious, total }) {
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
              <span>{text.next}</span>
              <i aria-hidden="true" />
            </button>
          )}
        </footer>
      </div>
    </section>
  );
}

export default function PortfolioPanels() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [panel, setPanel] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isReturningHome, setIsReturningHome] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const startY = useRef(null);
  const dragDistance = useRef(0);
  const wheelTimer = useRef(null);
  const wheelDistance = useRef(0);
  const isReturningHomeRef = useRef(false);
  const panelCount = 5;

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
    if (next < 0) {
      if (isReturningHomeRef.current) return;
      isReturningHomeRef.current = true;
      setDragging(false);
      setDragOffset(0);
      setIsReturningHome(true);
      window.setTimeout(() => router.push('/'), 240);
      return;
    }
    setPanel(Math.max(0, Math.min(panelCount - 1, next)));
    setDragOffset(0);
    setDragging(false);
  }, [router]);

  const finishDrag = useCallback((distance) => {
    if (distance <= -transitionThreshold) moveTo(panel + 1);
    else if (distance >= transitionThreshold) moveTo(panel - 1);
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
    const rawDistance = event.clientY - startY.current;
    const atStart = panel === 0 && rawDistance > 0;
    const atEnd = panel === panelCount - 1 && rawDistance < 0;
    const offset = (atStart || atEnd) ? rawDistance * 0.18 : rawDistance * 0.52;
    dragDistance.current = rawDistance;
    setDragOffset(offset);
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
        if (wheelDistance.current > transitionThreshold) moveTo(panel + 1);
        if (wheelDistance.current < -transitionThreshold) moveTo(panel - 1);
        wheelDistance.current = 0;
      }, 120);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.clearTimeout(wheelTimer.current);
    };
  }, [moveTo, panel, searchOpen]);

  const text = copy[language];
  const results = searchLinks.filter((item) => item[language].toLowerCase().includes(query.toLowerCase()));
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
      className={`portfolio-panel-experience${dragging ? ' is-dragging' : ''}${isReturningHome ? ' is-returning-home' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <div className="portfolio-panel-track" style={{ transform }}>
        <PanelFrame language={language} index={0} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={() => setSearchOpen(true)} onNext={() => moveTo(1)} onPrevious={() => moveTo(-1)}>
          <div className="portfolio-intro-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.portfolio}</p>
            <h1>{text.statement}</h1>
            <nav className="portfolio-primary-links" aria-label={text.portfolio}>
              <Card href="/businesses-we-managed">{text.manage}</Card>
              <Card href="/brands-we-designed">{text.designed}</Card>
              <Card href="/visual-identities">{text.featured}</Card>
            </nav>
          </div>
        </PanelFrame>

        <PanelFrame language={language} index={1} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={() => setSearchOpen(true)} onNext={() => moveTo(2)} onPrevious={() => moveTo(0)}>
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

        <PanelFrame language={language} index={2} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={() => setSearchOpen(true)} onNext={() => moveTo(3)} onPrevious={() => moveTo(1)}>
          <div className="portfolio-section-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.services}</p>
            <h2>{text.servicesTitle}</h2>
            <p>{text.servicesText}</p>
            <div className="portfolio-primary-links compact-links">
              <Card href="/service-business-development">{language === 'en' ? 'Business Development' : 'تطوير الأعمال'}</Card>
              <Card href="/service-brand-strategy">{language === 'en' ? 'Brand Strategy' : 'استراتيجية العلامة'}</Card>
              <Card href="/services">{language === 'en' ? 'Explore Services' : 'استكشف الخدمات'}</Card>
            </div>
          </div>
        </PanelFrame>

        <PanelFrame language={language} index={3} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={() => setSearchOpen(true)} onNext={() => moveTo(4)} onPrevious={() => moveTo(2)}>
          <div className="portfolio-section-content portfolio-panel-reveal">
            <p className="portfolio-panel-label">{text.consultation}</p>
            <h2>{text.consultationTitle}</h2>
            <p>{text.consultationText}</p>
            <Link className="portfolio-solid-action" href="/consultation">{text.schedule}</Link>
          </div>
        </PanelFrame>

        <PanelFrame language={language} index={4} total={panelCount} onLanguage={() => setLanguage(language === 'en' ? 'ar' : 'en')} onSearch={() => setSearchOpen(true)} onNext={() => moveTo(4)} onPrevious={() => moveTo(3)}>
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

      {searchOpen && (
        <div className="portfolio-search-layer" role="dialog" aria-modal="true" aria-label={text.search}>
          <div className="portfolio-search-shell">
            <header className="portfolio-search-header">
              <Link className="portfolio-panel-logo" href="/" aria-label="OOXME home" onClick={() => setSearchOpen(false)}>
                <img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME" />
              </Link>
              <button className="portfolio-search-close" onClick={() => setSearchOpen(false)} aria-label={text.close}>×</button>
            </header>
            <nav className="portfolio-search-results" aria-label={text.search}>
              {results.length ? results.map((item) => <Link key={item.href} href={item.href} onClick={() => setSearchOpen(false)}>{item[language]}<Arrow /></Link>) : <p>{text.noResults}</p>}
            </nav>
            <label className="portfolio-search-input">
              <span className="sr-only">{text.search}</span>
              <SearchIcon />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} />
            </label>
          </div>
        </div>
      )}
    </main>
  );
}
