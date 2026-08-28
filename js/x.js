(() => {
  'use strict';

  const page = document.querySelector('.s-page');
  const composer = document.querySelector('[data-s-composer]');
  const input = document.querySelector('.s-page__composer-input');
  const status = document.querySelector('[data-s-composer-status]');
  const groups = Array.from(document.querySelectorAll('.s-page__group'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!page || !composer || !input || !status || groups.length !== 3) return;

  let statusTimer = 0;
  let snapTimer = 0;

  const updateAnchorGap = () => {
    const viewportHeight = Math.max(1, document.documentElement.clientHeight || window.innerHeight || 0);
    const composerBottom = composer.getBoundingClientRect().bottom;
    page.style.setProperty('--s-anchor-gap', `${Math.max(0, viewportHeight - composerBottom).toFixed(2)}px`);
  };

  const snapToNearestGroup = () => {
    const anchorGap = parseFloat(getComputedStyle(page).getPropertyValue('--s-anchor-gap')) || 0;
    const target = groups
      .map((group) => Math.max(0, group.offsetTop - anchorGap))
      .reduce((nearest, candidate) => Math.abs(candidate - window.scrollY) < Math.abs(nearest - window.scrollY) ? candidate : nearest);
    if (Math.abs(target - window.scrollY) < 1) return;
    window.scrollTo({ top: target, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };

  const scheduleSnap = () => {
    window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(snapToNearestGroup, 160);
  };

  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));
    const keyboardOverlap = Math.max(0, layoutHeight - window.visualViewport.height - window.visualViewport.offsetTop);
    page.style.setProperty('--s-keyboard-offset', `${keyboardOverlap.toFixed(2)}px`);
  };

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: .16, rootMargin: '0px 0px -8% 0px' })
    : null;

  document.querySelectorAll('[data-s-reveal]').forEach((element) => {
    if (reducedMotion.matches || !revealObserver) element.classList.add('is-visible');
    else revealObserver.observe(element);
  });

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    window.clearTimeout(statusTimer);
    status.textContent = 'Ready for the next step.';
    status.classList.add('is-visible');
    statusTimer = window.setTimeout(() => status.classList.remove('is-visible'), 2200);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateKeyboardOffset, { passive: true });
    window.visualViewport.addEventListener('scroll', updateKeyboardOffset, { passive: true });
  }

  window.addEventListener('scroll', scheduleSnap, { passive: true });
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', () => {
      window.clearTimeout(snapTimer);
      snapToNearestGroup();
    }, { passive: true });
  }

  window.addEventListener('resize', updateAnchorGap, { passive: true });
  window.addEventListener('orientationchange', updateAnchorGap, { passive: true });
  updateAnchorGap();
  updateKeyboardOffset();
})();
