'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const links = [
  ['/', 'Home', 'الرئيسية'],
  ['/portfolio', 'Portfolio', 'المعرض'],
  ['/services', 'Services', 'الخدمات'],
  ['/consultation', 'Consultation', 'استشارة'],
];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.8" /><path d="m15 15 4.1 4.1" /></svg>;
}

export default function GlobalSearchOverlay({ language = 'en', closing = false, onClose }) {
  const [query, setQuery] = useState('');
  const isArabic = language === 'ar';
  const results = useMemo(
    () => links.filter(([, english, arabic]) => `${english} ${arabic}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div
      className={`global-search-overlay${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? 'بحث' : 'Search'}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="global-search-content" onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
        <Link className="global-header-logo" href="/" aria-label="OOXME home"><img src="/assets/logo/OX-001-LOGO-black.png" alt="OOXME" /></Link>
        <nav className="global-search-links">
          {results.map(([href, english, arabic]) => <Link key={href} href={href}>{isArabic ? arabic : english}</Link>)}
        </nav>
        <label className="global-search-input"><span className="sr-only">{isArabic ? 'بحث' : 'Search'}</span><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? 'ابحث في أوكسوم' : 'Search OOXME'} /></label>
      </div>
    </div>
  );
}
