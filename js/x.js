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
  let interactionState = 'idle';
  let isTouching = false;
  let activeGroupIndex = -1;
  let lastScrollY = window.scrollY;
  let revealFrame = 0;
  const typingCharactersPerSecond = 28;

  const updateAnchorGap = () => {
    const x = parseFloat(getComputedStyle(page).getPropertyValue('--s-x')) || 36;
    page.style.setProperty('--s-anchor-gap', `${(x * 2).toFixed(2)}px`);
  };

  const snapToNearestGroup = () => {
    const anchorGap = parseFloat(getComputedStyle(page).getPropertyValue('--s-anchor-gap')) || 0;
    const target = groups
      .map((group) => Math.max(0, group.offsetTop - anchorGap))
      .reduce((nearest, candidate) => Math.abs(candidate - window.scrollY) < Math.abs(nearest - window.scrollY) ? candidate : nearest);
    if (Math.abs(target - window.scrollY) < 1) return false;
    window.scrollTo({ top: target, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    return true;
  };

  const cancelSettle = () => {
    window.clearTimeout(snapTimer);
    if (interactionState === 'settling') {
      window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    }
    interactionState = 'touching';
  };

  const scheduleSettle = () => {
    window.clearTimeout(snapTimer);
    if (isTouching) return;
    interactionState = 'momentum';
    snapTimer = window.setTimeout(() => {
      if (isTouching) return;
      interactionState = 'settling';
      if (!snapToNearestGroup() || reducedMotion.matches) interactionState = 'idle';
    }, 1000);
  };

  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));
    const keyboardOverlap = Math.max(0, layoutHeight - window.visualViewport.height - window.visualViewport.offsetTop);
    page.style.setProperty('--s-keyboard-offset', `${keyboardOverlap.toFixed(2)}px`);
  };

  const groupElements = groups.map((group) => Array.from(group.querySelectorAll('[data-s-reveal]')));
  groupElements.flat().forEach((element) => {
    const characters = Math.max(1, Array.from(element.textContent.trim()).length);
    element.style.setProperty('--s-typing-steps', String(characters));
    element.style.setProperty('--s-typing-duration', `${(characters / typingCharactersPerSecond).toFixed(2)}s`);
  });

  const setGroupState = (index, state) => {
    groupElements[index].forEach((element) => {
      element.classList.remove('is-typing', 'is-visible', 'is-fading');
      if (state === 'typing') element.classList.add(reducedMotion.matches ? 'is-visible' : 'is-typing');
      if (state === 'visible') element.classList.add('is-visible');
      if (state === 'fading') element.classList.add('is-fading');
    });
  };

  const updateRevealGroups = () => {
    revealFrame = 0;
    const scrollY = window.scrollY;
    const scrollDirection = scrollY - lastScrollY;
    lastScrollY = scrollY;
    const x = parseFloat(getComputedStyle(page).getPropertyValue('--s-x')) || 36;
    const triggerLine = composer.getBoundingClientRect().top - x;
    const visibleGroups = groups.map((group, index) => ({ index, rect: group.getBoundingClientRect() }))
      .filter(({ rect }) => rect.bottom > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight));
    if (!visibleGroups.length) return;
    const crossed = visibleGroups.filter(({ rect }) => rect.top <= triggerLine && rect.bottom > triggerLine);
    const target = (crossed.length
      ? (scrollDirection < 0 ? crossed[0] : crossed[crossed.length - 1])
      : visibleGroups.reduce((nearest, candidate) =>
      Math.abs(candidate.rect.top - triggerLine) < Math.abs(nearest.rect.top - triggerLine) ? candidate : nearest
    )).index;
    if (target === activeGroupIndex) return;
    if (activeGroupIndex >= 0) setGroupState(activeGroupIndex, 'fading');
    activeGroupIndex = target;
    setGroupState(target, 'typing');
  };

  const scheduleRevealGroups = () => {
    if (!revealFrame) revealFrame = window.requestAnimationFrame(updateRevealGroups);
  };

  groupElements.flat().forEach((element) => element.classList.remove('is-visible'));

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

  window.addEventListener('scroll', () => {
    if (interactionState !== 'settling') scheduleSettle();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    if (window.scrollY !== lastScrollY) scheduleRevealGroups();
  }, { passive: true });
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', () => {
      if (interactionState === 'settling') interactionState = 'idle';
      else scheduleSettle();
    }, { passive: true });
  }

  const beginTouch = () => {
    isTouching = true;
    cancelSettle();
  };

  const endTouch = () => {
    isTouching = false;
    scheduleSettle();
  };

  window.addEventListener('pointerdown', beginTouch, { passive: true, capture: true });
  window.addEventListener('pointerup', endTouch, { passive: true, capture: true });
  window.addEventListener('pointercancel', endTouch, { passive: true, capture: true });
  window.addEventListener('touchstart', beginTouch, { passive: true, capture: true });
  window.addEventListener('touchend', endTouch, { passive: true, capture: true });
  window.addEventListener('touchcancel', endTouch, { passive: true, capture: true });
  window.addEventListener('wheel', () => {
    if (interactionState === 'settling') cancelSettle();
    scheduleSettle();
  }, { passive: true });

  window.addEventListener('resize', updateAnchorGap, { passive: true });
  window.addEventListener('orientationchange', updateAnchorGap, { passive: true });
  updateAnchorGap();
  updateRevealGroups();
  updateKeyboardOffset();
})();
