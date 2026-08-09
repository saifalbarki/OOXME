'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { mainSections, searchNavigation } from '../config/site-structure';

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.8" /><path d="m15 15 4.1 4.1" /></svg>;
}

function GlobeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.35 2.2 3.55 4.86 3.55 8S14.35 17.8 12 20c-2.35-2.2-3.55-4.86-3.55-8S9.65 6.2 12 4" /></svg>;
}

export default function GlobalSearchOverlay({ language = 'en', closing = false, onClose, onToggleLanguage }) {
  const [query, setQuery] = useState('');
  const isArabic = language === 'ar';
  const results = useMemo(
    () => (query.trim() ? searchNavigation : mainSections).filter(({ en, ar }) => `${en} ${ar}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div
      className={`global-search-overlay${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? 'بحث' : 'Search'}
      onPointerDown={(event) => {
        if (!event.target.closest('a, button, input, label')) onClose();
      }}
    >
      <div className="global-search-content">
        <header className="global-search-header">
          <button className="global-header-icon" type="button" onClick={onToggleLanguage} aria-label={isArabic ? 'Switch to English' : 'Switch to Arabic'}><GlobeIcon /></button>
          <Link className="global-header-logo" href="/" aria-label="OOXME home"><img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME" /></Link>
          <button className="global-header-icon" type="button" onClick={() => document.querySelector('.global-search-input input')?.focus()} aria-label="Search"><SearchIcon /></button>
        </header>
        <nav className="global-search-links">
          {results.map(({ href, en, ar }) => <Link key={href} href={href}>{isArabic ? ar : en}</Link>)}
        </nav>
        <label className="global-search-input"><span className="sr-only">{isArabic ? 'بحث' : 'Search'}</span><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? 'ابحث في أوكسوم' : 'Search OOXME'} /></label>
      </div>
    </div>
  );
}
