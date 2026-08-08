'use client';

import { useEffect } from 'react';
import { pageScripts } from '../config/pages';

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const selector = `script[data-ooxme-legacy-script="${source}"]`;
    const existing = document.querySelector(selector);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error(`Unable to load ${source}`)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = `/scripts/${source}`;
    script.async = false;
    script.dataset.ooxmeLegacyScript = source;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Unable to load ${source}`)), { once: true });
    document.body.append(script);
  });
}

export default function LegacyPage({ pageId, initialPage }) {

  useEffect(() => {
    const previousClass = document.body.className;
    const previousAttributes = [...document.body.attributes]
      .filter((attribute) => attribute.name.startsWith('data-'))
      .map((attribute) => [attribute.name, attribute.value]);

    document.body.className = initialPage.bodyClass;
    [...document.body.attributes]
      .filter((attribute) => attribute.name.startsWith('data-'))
      .forEach((attribute) => document.body.removeAttribute(attribute.name));
    Object.entries(initialPage.bodyData).forEach(([name, value]) => document.body.setAttribute(name, value));

    return () => {
      document.body.className = previousClass;
      [...document.body.attributes]
        .filter((attribute) => attribute.name.startsWith('data-'))
        .forEach((attribute) => document.body.removeAttribute(attribute.name));
      previousAttributes.forEach(([name, value]) => document.body.setAttribute(name, value));
    };
  }, [pageId, initialPage]);

  useEffect(() => {
    if (!initialPage.markup) return undefined;
    let active = true;
    (async () => {
      try {
        for (const source of pageScripts[pageId] || []) {
          if (!active) return;
          await loadScript(source);
        }
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      active = false;
    };
  }, [initialPage.markup, pageId]);

  return (
    <>
      {initialPage.pageStyle && <style dangerouslySetInnerHTML={{ __html: initialPage.pageStyle }} />}
      <div data-ooxme-page={pageId} dangerouslySetInnerHTML={{ __html: initialPage.markup }} />
    </>
  );
}
