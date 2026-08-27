(() => {
  const dashboard = document.querySelector('.os-dashboard-experience');
  if (!dashboard || dashboard.dataset.osKeyboardFocusBound) return;
  dashboard.dataset.osKeyboardFocusBound = 'true';

  const editableSelector = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]), textarea, select';
  const viewport = window.visualViewport;
  let activeControl = null;
  let activeTarget = null;
  let activeOffset = 0;
  let baselineHeight = Math.max(window.innerHeight, viewport?.height || 0);
  let frame = 0;

  const clearTarget = target => {
    if (!target) return;
    target.classList.remove('os-keyboard-offset-target');
    target.style.removeProperty('--os-keyboard-offset');
  };

  const reset = () => {
    cancelAnimationFrame(frame);
    clearTarget(activeTarget);
    activeTarget = null;
    activeOffset = 0;
  };

  const targetFor = control => control.closest('[role="dialog"], form, .os-panel');
  const viewportHeight = () => viewport?.height || window.innerHeight;
  const viewportTop = () => viewport?.offsetTop || 0;

  const reposition = () => {
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

      const x = Number.parseFloat(getComputedStyle(dashboard).getPropertyValue('--x')) || 12;
      const keyboardTop = viewportTop() + visibleHeight;
      const controlRect = activeControl.getBoundingClientRect();
      const unshiftedBottom = controlRect.bottom - activeOffset;
      const nextOffset = Math.min(0, keyboardTop - x - unshiftedBottom);
      activeOffset = nextOffset;
      activeTarget.style.setProperty('--os-keyboard-offset', `${nextOffset}px`);
      activeTarget.classList.add('os-keyboard-offset-target');
    });
  };

  dashboard.addEventListener('focusin', event => {
    const control = event.target.closest?.(editableSelector);
    if (!control) return;
    activeControl = control;
    baselineHeight = Math.max(baselineHeight, window.innerHeight, viewportHeight());
    reposition();
  });

  dashboard.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      const nextControl = document.activeElement?.closest?.(editableSelector);
      if (nextControl && dashboard.contains(nextControl)) {
        activeControl = nextControl;
        reposition();
        return;
      }
      activeControl = null;
      baselineHeight = Math.max(window.innerHeight, viewportHeight());
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
