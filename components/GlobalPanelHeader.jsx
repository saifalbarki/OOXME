'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const links = [
  ['/', 'Home', 'الرئيسية'],
  ['/portfolio', 'Portfolio', 'المعرض'],
  ['/services', 'Services', 'الخدمات'],
  ['/consultation', 'Consultation', 'استشارة'],
];

function GlobeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.35 2.2 3.55 4.86 3.55 8S14.35 17.8 12 20c-2.35-2.2-3.55-4.86-3.55-8S9.65 6.2 12 4" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.8" /><path d="m15 15 4.1 4.1" /></svg>;
}

export default function GlobalPanelHeader({ pageId, home = false }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const syncLanguage = () => setLanguage(document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    syncLanguage();
    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  const results = useMemo(() => links.filter(([, english, arabic]) => `${english} ${arabic}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const isArabic = language === 'ar';

  const toggleLanguage = () => {
    const legacyControl = pageId ? document.querySelector(`[data-ooxme-page="${pageId}"] .language-toggle`) : null;
    if (legacyControl) {
      legacyControl.click();
      return;
    }
    const nextLanguage = isArabic ? 'en' : 'ar';
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('ooxme-language', nextLanguage);
    setLanguage(nextLanguage);
  };

  return (
    <>
      <header className={`global-panel-header${home ? ' global-panel-header-home' : ''}${pageId ? ` global-panel-header-${pageId}` : ''}${searchOpen ? ' is-search-open' : ''}`}>
        <button className="global-header-icon" type="button" onClick={toggleLanguage} aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}><GlobeIcon /></button>
        <Link className="global-header-logo" href="/" aria-label="OOXME home"><img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME" /></Link>
        <button className="global-header-icon" type="button" onClick={() => setSearchOpen(true)} aria-label={isArabic ? 'بحث' : 'Search'}><SearchIcon /></button>
      </header>

      {searchOpen && (
        <div className="global-search-overlay" role="dialog" aria-modal="true" aria-label={isArabic ? 'بحث' : 'Search'}>
          <div className="global-search-content">
            <Link className="global-header-logo" href="/" aria-label="OOXME home" onClick={() => setSearchOpen(false)}><img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME" /></Link>
            <nav className="global-search-links">
              {results.map(([href, english, arabic]) => <Link key={href} href={href} onClick={() => setSearchOpen(false)}>{isArabic ? arabic : english}</Link>)}
            </nav>
            <label className="global-search-input"><span className="sr-only">{isArabic ? 'بحث' : 'Search'}</span><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? 'ابحث في أوكسوم' : 'Search OOXME'} /></label>
            <button className="global-search-close" type="button" onClick={() => setSearchOpen(false)} aria-label={isArabic ? 'إغلاق' : 'Close'}>×</button>
          </div>
        </div>
      )}
    </>
  );
}
