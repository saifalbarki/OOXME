'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import GlobalPanelHeader from './GlobalPanelHeader';
import { collectionPages } from '../config/collection-pages';

function Arrow() {
  return <svg className="collection-card-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 7 7-7 7" /></svg>;
}

export default function CollectionPage({ pageId }) {
  const [language, setLanguage] = useState('en');
  const page = collectionPages[pageId];

  useEffect(() => {
    const syncLanguage = () => setLanguage(document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    syncLanguage();
    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  const text = page[language];
  return (
    <main className="collection-page" data-collection-page={pageId}>
      <GlobalPanelHeader />
      <section className="collection-panel">
        <div className="collection-content">
          <p className="collection-label">{text.label}</p>
          <h1>{text.title}</h1>
          <p className="collection-description">{text.description}</p>
          <div className={`collection-grid${pageId === 'services' ? ' collection-grid-services' : ''}`}>
            {page.cards.map(([href, english, arabic, image]) => (
              <Link key={`${href}-${english}`} className="collection-card" href={`/${href}`}>
                {image && <img src={image} alt="" />}
                <span className="collection-card-copy"><strong>{language === 'ar' ? arabic : english}</strong><Arrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
