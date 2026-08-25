(() => {
  const numericPattern = /[\d\u0660-\u0669\u06F0-\u06F9]+(?:[.,:/\-\u066B\u066C][\d\u0660-\u0669\u06F0-\u06F9]+)*/gu;
  const numericOnlyPattern = /^[\s\d\u0660-\u0669\u06F0-\u06F9.,:/\-+()\u066B\u066C]+$/u;
  const ignoredSelector = 'script, style, svg, textarea, select, option, input, [contenteditable], [data-numeric-typography-ignore], .ooxme-numeric-content, .consultation-numeric-content';
  let scheduled = false;

  const isNumericOnly = value => Boolean(value?.trim()) && numericOnlyPattern.test(value.trim());
  const syncControl = control => {
    if (!control.matches?.('input, textarea, select, option')) return;
    const value = control.matches('select') ? control.selectedOptions?.[0]?.textContent || '' : control.value || control.textContent || '';
    control.classList.toggle('ooxme-numeric-control', isNumericOnly(value));
  };
  const syncControls = scope => scope.querySelectorAll?.('input, textarea, select, option').forEach(syncControl);
  const wrapTextNode = node => {
    const value = node.nodeValue || '';
    numericPattern.lastIndex = 0;
    if (!numericPattern.test(value)) return;
    numericPattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    value.replace(numericPattern, (match, offset) => {
      if (offset > cursor) fragment.append(value.slice(cursor, offset));
      const numeric = document.createElement('span');
      numeric.className = 'ooxme-numeric-content';
      numeric.textContent = match;
      fragment.append(numeric);
      cursor = offset + match.length;
      return match;
    });
    if (cursor < value.length) fragment.append(value.slice(cursor));
    node.replaceWith(fragment);
  };
  const apply = (scope = document.body) => {
    if (!scope) return;
    syncControls(scope);
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: node => {
        if (!node.nodeValue?.trim() || node.parentElement?.closest(ignoredSelector)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapTextNode);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  };

  document.addEventListener('DOMContentLoaded', schedule, { once: true });
  document.addEventListener('input', event => syncControl(event.target));
  document.addEventListener('change', event => syncControl(event.target));
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
