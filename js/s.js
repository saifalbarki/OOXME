(() => {
  'use strict';

  const page = document.querySelector('.s-page');
  const background = document.querySelector('.s-page__background-image');
  const content = document.querySelector('.s-page__content');
  const composer = document.querySelector('[data-s-composer]');
  const input = document.querySelector('.s-page__composer-input');
  const status = document.querySelector('[data-s-composer-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!page || !background || !content || !composer || !input || !status) return;

  const naturalWidth = Number(background.getAttribute('width')) || 3884;
  const naturalHeight = Number(background.getAttribute('height')) || 5532;
  let geometry = { initialY: 0, travel: 0, scrollable: 0 };
  let targetProgress = 0;
  let currentProgress = 0;
  let frame = 0;
  let statusTimer = 0;

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);
  const viewportHeight = () => Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));

  const updateTargetProgress = () => {
    targetProgress = geometry.scrollable > 0
      ? clamp(window.scrollY / geometry.scrollable, 0, 1)
      : 0;
  };

  const measure = () => {
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const height = viewportHeight();
    const widthScale = viewportWidth / naturalWidth;
    const desiredTravel = clamp(height * (viewportWidth < 700 ? 1.05 : .78), 520, 1800);
    const minimumHeightScale = (height + desiredTravel) / naturalHeight;
    const scale = Math.max(widthScale, minimumHeightScale);
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;
    const availableTravel = Math.max(0, renderedHeight - height);
    const initialInset = Math.min(availableTravel * .14, height * .22);
    const endReserve = Math.min(availableTravel * .025, 32);
    const initialY = -initialInset;
    const finalY = -(availableTravel - endReserve);
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    page.style.setProperty('--s-background-width', `${renderedWidth.toFixed(2)}px`);
    geometry = {
      initialY,
      travel: finalY - initialY,
      scrollable: Math.max(0, documentHeight - height)
    };
    updateTargetProgress();
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  const render = () => {
    frame = 0;
    const smoothing = .1;
    currentProgress = reducedMotion.matches
      ? targetProgress
      : currentProgress + ((targetProgress - currentProgress) * smoothing);
    const y = geometry.initialY + (currentProgress * geometry.travel);
    page.style.setProperty('--s-background-y', `${y.toFixed(2)}px`);
    if (!reducedMotion.matches && Math.abs(targetProgress - currentProgress) > .0005) {
      frame = window.requestAnimationFrame(render);
    }
  };

  const requestRender = () => {
    updateTargetProgress();
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = viewportHeight();
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

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('orientationchange', measure, { passive: true });
  background.addEventListener('load', measure, { once: true });
  document.fonts?.ready.then(measure);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(content);
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateKeyboardOffset, { passive: true });
    window.visualViewport.addEventListener('scroll', updateKeyboardOffset, { passive: true });
  }

  reducedMotion.addEventListener?.('change', () => {
    updateTargetProgress();
    if (!frame) frame = window.requestAnimationFrame(render);
  });
  measure();
  updateKeyboardOffset();
})();
