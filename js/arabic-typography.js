(() => {
  const root = document.documentElement;
  const controls = 'input, textarea, select, option';
  const text = 'a, button, p, h1, h2, h3, h4, h5, h6, span, strong, small, time, label, li, td, th';
  const saved = new WeakMap();
  let resizeTimer;

  const hasOwnText = element => [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  const isTextLeaf = element => hasOwnText(element) && ![...element.children].some(child => child.matches?.(text) && hasOwnText(child));
  const targets = scope => [...scope.querySelectorAll(controls + ', ' + text)].filter(element => (
    !element.matches('[data-ooxme-ios-zoom-safe]') && (element.matches(controls) || isTextLeaf(element))
  ));

  const restore = element => {
    const previous = saved.get(element);
    if (!previous) return;
    if (previous.value) element.style.setProperty('font-size', previous.value, previous.priority);
    else element.style.removeProperty('font-size');
    saved.delete(element);
  };

  const apply = (scope = document) => {
    const arabic = root.dir === 'rtl';
    const scale = Number.parseFloat(getComputedStyle(root).getPropertyValue('--ooxme-language-font-scale')) || 1;
    targets(scope).forEach(element => {
      restore(element);
      if (!arabic) return;
      const size = Number.parseFloat(getComputedStyle(element).fontSize);
      if (!Number.isFinite(size)) return;
      saved.set(element, { value: element.style.getPropertyValue('font-size'), priority: element.style.getPropertyPriority('font-size') });
      element.style.setProperty('font-size', (Math.round(size * scale * 1000) / 1000) + 'px', 'important');
    });
  };

  const schedule = () => window.requestAnimationFrame(() => apply());
  document.addEventListener('DOMContentLoaded', schedule, { once: true });
  new MutationObserver(records => {
    if (records.some(record => record.type === 'attributes' || record.addedNodes.length)) schedule();
  }).observe(root, { attributes: true, attributeFilter: ['dir', 'lang'], childList: true, subtree: true });
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(schedule, 120);
  });
})();
