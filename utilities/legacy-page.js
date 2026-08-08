import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pages, toRoute } from '../config/pages.js';

function attributes(source = '') {
  return Object.fromEntries([...source.matchAll(/([\w-]+)(?:\s*=\s*["']([^"']*)["'])?/g)]
    .map(([, name, value = '']) => [name, value]));
}

function rewriteMarkup(markup) {
  let result = markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  result = result.replace(/\b(src|href)=(['"])assets\//gi, '$1=$2/assets/');
  result = result.replace(/url\((['"]?)assets\//gi, 'url($1/assets/');
  for (const page of pages) {
    const expression = new RegExp(`href=(['"])${page}\\.html\\1`, 'gi');
    result = result.replace(expression, `href="${toRoute(page)}"`);
  }
  return result;
}

export function getLegacyPage(pageId) {
  const source = readFileSync(path.join(process.cwd(), 'public', 'legacy', `${pageId}.html`), 'utf8');
  const bodyMatch = source.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) throw new Error(`Legacy page ${pageId} has no body element.`);
  const inlineStyles = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(([, style]) => style.replaceAll('../assets/', '/assets/'))
    .join('\n');
  const bodyAttributes = attributes(bodyMatch[1]);
  return {
    markup: rewriteMarkup(bodyMatch[2]),
    pageStyle: inlineStyles,
    bodyClass: bodyAttributes.class || '',
    bodyData: Object.fromEntries(Object.entries(bodyAttributes).filter(([name]) => name.startsWith('data-'))),
  };
}
