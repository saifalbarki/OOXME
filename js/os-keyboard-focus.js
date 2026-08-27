(() => {
  if (document.documentElement.dataset.ooxmeKeyboardFocusBound) return;
  document.documentElement.dataset.ooxmeKeyboardFocusBound = 'true';

  const editableSelector = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]), textarea, select';
  const viewport = window.visualViewport;
  const isTouchDevice = () => navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  let activeControl = null;
  let activeTarget = null;
  let activeOffset = 0;
  let baselineHeight = Math.max(window.innerHeight, viewport?.height || 0);
  let frame = 0;

  const clearTarget = target => {
    if (!target) return;
    target.classList.remove('ooxme-keyboard-offset-target');
    target.style.removeProperty('--ooxme-keyboard-offset');
  };

  const reset = () => {
    cancelAnimationFrame(frame);
    clearTarget(activeTarget);
    activeTarget = null;
    activeOffset = 0;
  };

  const targetFor = control => control.closest('form, [role="dialog"], .homepage-account-panel, .employee-dashboard-panel, .master-panel') || control.parentElement;
  const viewportHeight = () => viewport?.height || window.innerHeight;
  const viewportTop = () => viewport?.offsetTop || 0;

  const reposition = () => {
    if (!isTouchDevice()) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!activeControl?.isConnected || !activeControl.matches(editableSelector)) {
        reset();
        return;
      }

      if (viewport && Math.abs(viewport.scale - 1) > .01) {
        reset();
        return;
      }

      const visibleHeight = viewportHeight();
      const keyboardReduction = baselineHeight - visibleHeight;
      if (keyboardReduction < 80) {
        reset();
        baselineHeight = Math.max(baselineHeight, window.innerHeight, visibleHeight);
        return;
      }

      const nextTarget = targetFor(activeControl);
      if (!nextTarget) return;
      if (activeTarget && activeTarget !== nextTarget) {
        clearTarget(activeTarget);
        activeOffset = 0;
      }
      activeTarget = nextTarget;

      const keyboardTop = viewportTop() + visibleHeight;
      const controlRect = activeControl.getBoundingClientRect();
      const unshiftedBottom = controlRect.bottom - activeOffset;
      const nextOffset = Math.min(0, keyboardTop - 12 - unshiftedBottom);
      activeOffset = nextOffset;
      activeTarget.style.setProperty('--ooxme-keyboard-offset', `${nextOffset}px`);
      activeTarget.classList.add('ooxme-keyboard-offset-target');
    });
  };

  document.addEventListener('focusin', event => {
    const control = event.target.closest?.(editableSelector);
    if (!control) return;
    activeControl = control;
    baselineHeight = Math.max(baselineHeight, window.innerHeight, viewportHeight());
    reposition();
  });

  document.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      const nextControl = document.activeElement?.closest?.(editableSelector);
      if (nextControl) {
        activeControl = nextControl;
        reposition();
        return;
      }
      activeControl = null;
      baselineHeight = Math.max(baselineHeight, window.innerHeight, viewportHeight());
      reset();
    });
  });

  viewport?.addEventListener('resize', reposition);
  viewport?.addEventListener('scroll', reposition);
  window.addEventListener('resize', reposition);
  window.addEventListener('orientationchange', () => {
    reset();
    window.setTimeout(() => {
      baselineHeight = Math.max(window.innerHeight, viewportHeight());
      reposition();
    }, 250);
  });
})();
