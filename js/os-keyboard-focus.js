(() => {
  if (document.documentElement.dataset.ooxmeKeyboardFocusBound) return;
  document.documentElement.dataset.ooxmeKeyboardFocusBound = 'true';

  const editableSelector = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]), textarea, select';
  const osEditableSelector = `${editableSelector}, [contenteditable]:not([contenteditable="false"])`;
  const viewport = window.visualViewport;
  const isTouchDevice = () => navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const isOsPage = document.body.classList.contains('os-page') && /^\/os\/?$/.test(location.pathname);
  const activeSelector = isOsPage ? osEditableSelector : editableSelector;
  let activeControl = null;
  let activeTarget = null;
  let activeOffset = 0;
  let baselineHeight = Math.max(window.innerHeight, viewport?.height || 0);
  let frame = 0;
  let scrollAnchor = null;
  let releaseTimer = 0;

  const clearTarget = target => {
    if (!target) return;
    target.classList.remove(isOsPage ? 'os-keyboard-offset-target' : 'ooxme-keyboard-offset-target');
    target.style.removeProperty(isOsPage ? '--os-keyboard-offset' : '--ooxme-keyboard-offset');
  };

  const reset = () => {
    cancelAnimationFrame(frame);
    clearTarget(activeTarget);
    activeTarget = null;
    activeOffset = 0;
  };

  const scrollContainersFor = control => {
    const containers = [];
    let parent = control?.parentElement;
    while (parent && parent !== document.body) {
      if (parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) containers.push(parent);
      parent = parent.parentElement;
    }
    return containers;
  };

  const captureScrollAnchor = control => {
    if (!isOsPage) return;
    clearTimeout(releaseTimer);
    if (scrollAnchor) return;
    scrollAnchor = {
      x: window.scrollX,
      y: window.scrollY,
      containers: scrollContainersFor(control).map(element => ({ element, left: element.scrollLeft, top: element.scrollTop }))
    };
  };

  const restoreScrollAnchor = () => {
    if (!scrollAnchor) return;
    if (window.scrollX !== scrollAnchor.x || window.scrollY !== scrollAnchor.y) window.scrollTo(scrollAnchor.x, scrollAnchor.y);
    scrollAnchor.containers.forEach(item => {
      if (!item.element.isConnected) return;
      if (item.element.scrollLeft !== item.left) item.element.scrollLeft = item.left;
      if (item.element.scrollTop !== item.top) item.element.scrollTop = item.top;
    });
  };

  const stabilizeScroll = () => {
    if (!isOsPage || !scrollAnchor) return;
    [0, 50, 150, 300, 500].forEach(delay => window.setTimeout(restoreScrollAnchor, delay));
  };

  const releaseScrollAnchor = () => {
    if (!isOsPage || !scrollAnchor) return;
    stabilizeScroll();
    clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      restoreScrollAnchor();
      scrollAnchor = null;
    }, 650);
  };

  const releaseIfKeyboardStaysClosed = () => {
    if (!isOsPage) return;
    clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      if (baselineHeight - viewportHeight() >= 80) return;
      restoreScrollAnchor();
      scrollAnchor = null;
    }, 700);
  };

  const prepareControl = control => {
    if (!isOsPage || !control) return;
    control.classList.add('os-ios-focus-size-guard');
    const size = Number.parseFloat(getComputedStyle(control).fontSize) || 0;
    control.dataset.osFocusedFontSize = String(size);
  };

  const targetFor = control => isOsPage
    ? control.closest('.os-screen')?.querySelector(':scope > .os-panel')
    : control.closest('form, [role="dialog"], .homepage-account-panel, .employee-dashboard-panel, .master-panel') || control.parentElement;
  const viewportHeight = () => viewport?.height || window.innerHeight;
  const viewportTop = () => viewport?.offsetTop || 0;
  const renderedOffset = target => {
    const transform = getComputedStyle(target).transform;
    if (!transform || transform === 'none') return 0;
    try { return new DOMMatrixReadOnly(transform).m42; } catch (_) { return 0; }
  };

  const reposition = () => {
    if (!isTouchDevice()) return;
    restoreScrollAnchor();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!activeControl?.isConnected || !activeControl.matches(activeSelector)) {
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
      const unshiftedBottom = controlRect.bottom - renderedOffset(activeTarget);
      const nextOffset = Math.min(0, keyboardTop - 12 - unshiftedBottom);
      activeOffset = nextOffset;
      activeTarget.style.setProperty(isOsPage ? '--os-keyboard-offset' : '--ooxme-keyboard-offset', `${nextOffset}px`);
      activeTarget.classList.add(isOsPage ? 'os-keyboard-offset-target' : 'ooxme-keyboard-offset-target');
    });
  };

  document.addEventListener('focusin', event => {
    const control = event.target.closest?.(activeSelector);
    if (isOsPage && !control?.closest('.os-screen')) return;
    if (!control) return;
    captureScrollAnchor(control);
    prepareControl(control);
    activeControl = control;
    baselineHeight = Math.max(baselineHeight, window.innerHeight, viewportHeight());
    stabilizeScroll();
    releaseIfKeyboardStaysClosed();
    reposition();
  });

  if (isOsPage) {
    const prepareFromPointer = event => {
      const control = event.target.closest?.(activeSelector);
      if (!control?.closest('.os-screen')) return;
      captureScrollAnchor(control);
      prepareControl(control);
    };
    document.addEventListener('pointerdown', prepareFromPointer, true);
    document.addEventListener('touchstart', prepareFromPointer, { capture: true, passive: true });
    document.addEventListener('scroll', restoreScrollAnchor, true);
  }

  document.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      const nextControl = document.activeElement?.closest?.(activeSelector);
      if (nextControl) {
        activeControl = nextControl;
        reposition();
        return;
      }
      activeControl = null;
      baselineHeight = Math.max(baselineHeight, window.innerHeight, viewportHeight());
      reset();
      releaseScrollAnchor();
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
