const interactionTarget = 'button, a, input, select, textarea, label, [data-project-gallery], [data-studio-project-gallery], .booking-card, .booking-fields, .booking-customer-fields, .booking-selectors, .calendar-card, .booking-summary, .payment-options';
let activeInteraction = null;
let suppressedClickTarget = null;

const simplifyTextHierarchy = (scope = document) => {
  scope.querySelectorAll('.master-panel-content').forEach((content) => {
    const label = [...content.children].find((child) => child.classList.contains('master-panel-label'));
    if (!label) return;

    const title = label.nextElementSibling?.matches('h1')
      ? label.nextElementSibling
      : content.querySelector(':scope > h1');
    const description = title?.nextElementSibling?.matches('p:not(.master-panel-label)')
      ? title.nextElementSibling
      : null;
    if (!title || !description) return;

    // Preserve the former label anchor, without retaining the label in layout.
    content.classList.add('has-simplified-text-hierarchy');
    label.remove();
  });
};

simplifyTextHierarchy();
new MutationObserver(() => simplifyTextHierarchy()).observe(document.documentElement, {
  childList: true,
  subtree: true
});

document.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const target = event.target.closest(interactionTarget);
  if (!target) return;
  activeInteraction = {
    pointerId: event.pointerId,
    target,
    startX: event.clientX,
    startY: event.clientY,
    dragging: false
  };
  target.dataset.pointerPressed = 'true';
  target.setPointerCapture?.(event.pointerId);
}, true);

document.addEventListener('pointermove', (event) => {
  if (!activeInteraction || activeInteraction.pointerId !== event.pointerId) return;
  const moved = Math.hypot(event.clientX - activeInteraction.startX, event.clientY - activeInteraction.startY);
  if (moved <= 10 || activeInteraction.dragging) return;
  activeInteraction.dragging = true;
  suppressedClickTarget = activeInteraction.target;
  delete activeInteraction.target.dataset.pointerPressed;
}, true);

const clearInteraction = (event) => {
  if (!activeInteraction || activeInteraction.pointerId !== event.pointerId) return;
  delete activeInteraction.target.dataset.pointerPressed;
  if (activeInteraction.target.hasPointerCapture?.(event.pointerId)) activeInteraction.target.releasePointerCapture(event.pointerId);
  activeInteraction = null;
};
document.addEventListener('pointerup', clearInteraction, true);
document.addEventListener('pointercancel', clearInteraction, true);
document.addEventListener('click', (event) => {
  if (!suppressedClickTarget) return;
  const target = event.target;
  const shouldSuppress = target === suppressedClickTarget || suppressedClickTarget.contains(target);
  suppressedClickTarget = null;
  if (!shouldSuppress) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

window.OOXMEMasterPanelDrag = {
  register({ experience, track, panels, getIndex, moveTo, allowGestureNavigation = true, allowBottomControlNavigation = allowGestureNavigation }) {
    if (!experience || !track || track.dataset.masterPanelDragBound) return;
    track.dataset.masterPanelDragBound = 'true';

    // One visual fill lives inside the existing bottom line. Each panel owns
    // its own value, so incoming and outgoing panels stay synchronized during
    // the complete-panel transition without touching the control's hit area.
    const updateBottomProgress = ({ immediatePanel = null } = {}) => {
      panels.forEach((panel, panelIndex) => {
        const gallery = panel.querySelector('[data-project-gallery][data-total-images]');
        const totalImages = Number(gallery?.dataset.totalImages);
        const activeImageIndex = Number(gallery?.dataset.activeImageIndex);
        const autoplayProgress = Number(gallery?.dataset.autoplayProgress);
        const galleryProgress = Number.isFinite(autoplayProgress)
          ? autoplayProgress
          : (Number.isFinite(totalImages) && totalImages > 0 && Number.isFinite(activeImageIndex)
            ? (activeImageIndex + 1) / totalImages
            : null);
        const progress = Math.min(1, Math.max(0, galleryProgress ?? ((panelIndex + 1) / panels.length)));
        panel.querySelectorAll('.swipe-control-line').forEach((line) => {
          let fill = line.querySelector(':scope > .swipe-control-progress');
          if (!fill) {
            fill = document.createElement('span');
            fill.className = 'swipe-control-progress';
            fill.setAttribute('aria-hidden', 'true');
            line.append(fill);
          }
          const resetImmediately = panel === immediatePanel;
          if (resetImmediately) fill.classList.add('is-progress-reset');
          fill.style.width = `${progress * 100}%`;
          if (resetImmediately) {
            // Commit the reset state before restoring the normal width easing.
            void fill.offsetWidth;
            window.requestAnimationFrame(() => fill.classList.remove('is-progress-reset'));
          }
        });
      });
    };
    const progressObserver = new MutationObserver(() => window.requestAnimationFrame(updateBottomProgress));
    progressObserver.observe(track, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-active-image-index', 'data-total-images', 'data-autoplay-progress']
    });
    track.addEventListener('ooxme:gallery-progress', (event) => {
      const panel = event.target.closest('.master-panel-screen');
      updateBottomProgress({ immediatePanel: event.detail?.reset ? panel : null });
    });
    updateBottomProgress();

    const interactiveSelector = [
      '.master-panel-continue', 'input', 'select', 'textarea', '[contenteditable="true"]',
      '[data-project-gallery]', '[data-studio-project-gallery]', '[data-service-tile]', '[data-search-overlay]', '.search-overlay',
      '.site-image-preview', '.calendar-month-menu'
    ].join(',');
    let drag = null;
    let bottomGesture = null;
    let bottomReleaseTimer;
    let bottomFrame;
    let suppressBottomClick = false;
    let bottomLocked = false;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const offsetFor = (index) => -index * window.innerHeight;
    const bottomTapThreshold = 7;
    const bottomGestureThreshold = 12;
    const bottomActionThreshold = clamp(window.innerWidth * .095, 32, 44);
    const bottomFlickVelocity = .48;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wheelState = { locked: false, direction: 0, distance: 0, resetTimer: 0, unlockTimer: 0 };
    const resetWheelIntent = () => {
      wheelState.direction = 0;
      wheelState.distance = 0;
      window.clearTimeout(wheelState.resetTimer);
    };
    const wheelIsReserved = (event) => {
      const active = document.activeElement;
      if (active?.matches?.('input, textarea, select, [contenteditable="true"]')) return true;
      if (document.querySelector('[data-search-overlay].is-open, .search-overlay.is-open, .site-image-preview.is-open')) return true;
      return Boolean(event.target.closest('.calendar-month-menu:not([hidden])'));
    };
    const gesturesAreAllowed = () => typeof allowGestureNavigation === 'function'
      ? allowGestureNavigation(getIndex())
      : allowGestureNavigation;
    const bottomControlGesturesAreAllowed = () => typeof allowBottomControlNavigation === 'function'
      ? allowBottomControlNavigation(getIndex())
      : allowBottomControlNavigation;

    const setBottomVisual = (gesture, event) => {
      if (bottomFrame) window.cancelAnimationFrame(bottomFrame);
      bottomFrame = window.requestAnimationFrame(() => {
        const line = gesture.line;
        if (reducedMotion) {
          line.style.transform = 'translate3d(0, 0, 0)';
          return;
        }
        const dx = event.clientX - gesture.startX;
        const dy = event.clientY - gesture.startY;
        const dominantHorizontal = Math.abs(dx) > Math.abs(dy);
        const distance = dominantHorizontal ? Math.abs(dx) : Math.abs(dy);
        const resistance = 72;
        const ratio = 1 - Math.exp(-distance / resistance);
        let transform = 'translate3d(0, 0, 0) scale(1.08)';
        line.style.transformOrigin = 'center center';
        if (distance > bottomGestureThreshold && dominantHorizontal) {
          const scaleX = 1 + (.32 * ratio);
          const scaleY = 1 + (.04 * ratio);
          const translate = Math.min(5, distance * .05) * (dx > 0 ? 1 : -1);
          line.style.transformOrigin = dx > 0 ? 'left center' : 'right center';
          transform = `translate3d(${translate}px, 0, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
        } else if (distance > bottomGestureThreshold && dy < 0) {
          const scaleY = 1 + (.16 * ratio);
          const scaleX = 1 - (.045 * ratio);
          transform = `translate3d(0, ${-Math.min(5, distance * .06)}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
        } else if (distance > bottomGestureThreshold && dy > 0) {
          const scaleY = 1 + (.06 * ratio);
          transform = `translate3d(0, ${Math.min(2, distance * .025)}px, 0) scaleY(${scaleY})`;
        }
        line.style.transform = transform;
      });
    };

    const springBottomLine = (line) => {
      if (bottomFrame) window.cancelAnimationFrame(bottomFrame);
      line.style.transition = 'transform 220ms cubic-bezier(.22, 1.22, .36, 1)';
      line.style.transform = 'translate3d(0, 0, 0) scale(1)';
      window.setTimeout(() => {
        line.style.transition = '';
        line.style.transform = '';
        line.style.transformOrigin = '';
      }, 230);
    };

    const firstAvailableSubpage = () => {
      const panel = panels[getIndex()];
      if (!panel) return null;
      return [...panel.querySelectorAll('a[href]')].find((link) => {
        if (
          link.matches('.master-panel-continue, .plan-detail-cta, [aria-disabled="true"], [data-service-option], [data-consultation-option]') ||
          link.hasAttribute('disabled') ||
          link.target === '_blank'
        ) return false;
        const destination = new URL(link.href, window.location.href);
        return destination.origin === window.location.origin && destination.pathname !== window.location.pathname;
      }) || null;
    };

    const releaseBottomAction = (action) => {
      const activeIndex = getIndex();
      if (action === 'tap') {
        const managedAction = new CustomEvent('ooxme:bottom-action', { cancelable: true, detail: { action, activeIndex } });
        if (!experience.dispatchEvent(managedAction)) return;
        moveTo(activeIndex === panels.length - 1 ? 0 : activeIndex + 1);
      } else if (action === 'right' && window.history.length > 1) {
        window.history.back();
      } else if (action === 'left') {
        const destination = firstAvailableSubpage();
        if (destination) window.location.assign(destination.href);
      } else if (action === 'up' && activeIndex > 0) {
        moveTo(0);
      }
    };

    const bindBottomControl = (control) => {
      const line = control.querySelector('.swipe-control-line');
      if (!line) return;
      control.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || bottomLocked || !bottomControlGesturesAreAllowed()) return;
        bottomGesture = {
          pointerId: event.pointerId,
          control,
          line,
          startX: event.clientX,
          startY: event.clientY,
          lastX: event.clientX,
          lastY: event.clientY,
          lastTime: performance.now(),
          locked: false
        };
        control.setPointerCapture?.(event.pointerId);
        setBottomVisual(bottomGesture, event);
        event.stopImmediatePropagation();
      }, true);
      control.addEventListener('pointermove', (event) => {
        if (!bottomGesture || event.pointerId !== bottomGesture.pointerId) return;
        bottomGesture.lastX = event.clientX;
        bottomGesture.lastY = event.clientY;
        bottomGesture.lastTime = performance.now();
        setBottomVisual(bottomGesture, event);
        event.preventDefault();
        event.stopImmediatePropagation();
      }, { capture: true, passive: false });
      const release = (event, cancelled = false) => {
        if (!bottomGesture || event.pointerId !== bottomGesture.pointerId) return;
        const gesture = bottomGesture;
        const dx = event.clientX - gesture.startX;
        const dy = event.clientY - gesture.startY;
        const distance = Math.hypot(dx, dy);
        const elapsed = Math.max(1, performance.now() - gesture.lastTime);
        const velocity = Math.hypot(event.clientX - gesture.lastX, event.clientY - gesture.lastY) / elapsed;
        const horizontal = Math.abs(dx) > Math.abs(dy);
        let action = null;
        if (!cancelled && distance < bottomTapThreshold) action = 'tap';
        else if (!cancelled && distance >= bottomGestureThreshold) {
          const qualifies = (horizontal ? Math.abs(dx) : Math.abs(dy)) >= bottomActionThreshold || velocity >= bottomFlickVelocity;
          if (qualifies) {
            if (horizontal) action = dx > 0 ? 'right' : 'left';
            else if (dy < 0) action = 'up';
          }
        }
        suppressBottomClick = true;
        springBottomLine(gesture.line);
        bottomLocked = true;
        bottomGesture = null;
        if (gesture.control.hasPointerCapture?.(event.pointerId)) gesture.control.releasePointerCapture(event.pointerId);
        window.clearTimeout(bottomReleaseTimer);
        if (action) bottomReleaseTimer = window.setTimeout(() => releaseBottomAction(action), 70);
        window.setTimeout(() => { suppressBottomClick = false; bottomLocked = false; }, 260);
        event.preventDefault();
        event.stopImmediatePropagation();
      };
      control.addEventListener('pointerup', release, true);
      control.addEventListener('pointercancel', (event) => release(event, true), true);
      control.addEventListener('click', (event) => {
        if (!bottomControlGesturesAreAllowed()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (suppressBottomClick || bottomLocked) return;
        bottomLocked = true;
        springBottomLine(line);
        window.clearTimeout(bottomReleaseTimer);
        bottomReleaseTimer = window.setTimeout(() => releaseBottomAction('tap'), 70);
        window.setTimeout(() => { bottomLocked = false; }, 260);
      }, true);
      control.addEventListener('keydown', (event) => {
        if (!bottomControlGesturesAreAllowed()) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (bottomLocked) return;
        bottomLocked = true;
        springBottomLine(line);
        window.clearTimeout(bottomReleaseTimer);
        bottomReleaseTimer = window.setTimeout(() => releaseBottomAction('tap'), 70);
        window.setTimeout(() => { bottomLocked = false; }, 260);
      }, true);
    };
    experience.querySelectorAll('.master-panel-continue').forEach(bindBottomControl);

    const finish = (event, cancelled = false) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const travel = event.clientY - drag.startY;
      const elapsed = Math.max(1, performance.now() - drag.lastTime);
      const releaseVelocity = (event.clientY - drag.lastY) / elapsed;
      const velocity = Math.abs(releaseVelocity) > .01 ? releaseVelocity : drag.velocity;
      const direction = travel === 0 ? 0 : (travel < 0 ? 1 : -1);
      const intentionalDistance = Math.max(30, window.innerHeight * .08);
      const intentionalFlick = Math.abs(velocity) > .18;
      const target = clamp(
        !cancelled && direction && (Math.abs(travel) >= intentionalDistance || intentionalFlick)
          ? drag.index + direction
          : drag.index,
        0,
        panels.length - 1
      );

      track.classList.remove('is-dragging');
      track.style.transition = '';
      drag = null;
      if (target === getIndex()) {
        track.style.transform = `translateY(${offsetFor(target)}px)`;
      } else {
        moveTo(target);
      }
    };

    experience.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest(interactiveSelector)) return;
      if (!gesturesAreAllowed()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      const index = getIndex();
      drag = {
        pointerId: event.pointerId,
        index,
        startY: event.clientY,
        lastY: event.clientY,
        lastTime: performance.now(),
        position: offsetFor(index),
        velocity: 0
      };
      track.classList.add('is-dragging');
      track.style.transition = 'none';
      experience.setPointerCapture?.(event.pointerId);
      event.stopImmediatePropagation();
    }, true);

    experience.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      drag.position = clamp(
        offsetFor(drag.index) + event.clientY - drag.startY,
        offsetFor(panels.length - 1),
        0
      );
      const now = performance.now();
      drag.velocity = (event.clientY - drag.lastY) / Math.max(1, now - drag.lastTime);
      drag.lastY = event.clientY;
      drag.lastTime = now;
      track.style.transform = `translateY(${drag.position}px)`;
    }, { capture: true, passive: false });

    experience.addEventListener('pointerup', (event) => {
      if (drag?.pointerId === event.pointerId) {
        event.stopImmediatePropagation();
        finish(event);
      }
    }, true);
    experience.addEventListener('pointercancel', (event) => {
      if (drag?.pointerId === event.pointerId) {
        event.stopImmediatePropagation();
        finish(event, true);
      }
    }, true);

    /* Every page shares the same deliberate wheel / trackpad intent model.
       Wheel events remain available in normal panel space and are reserved only
       for actual text entry or an open, intentionally scrollable overlay. */
    experience.addEventListener('wheel', (event) => {
      if (event.ctrlKey || wheelIsReserved(event)) return;
      const delta = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1);
      if (Math.abs(delta) < 1) return;
      event.preventDefault();
      if (!gesturesAreAllowed()) {
        resetWheelIntent();
        return;
      }
      if (wheelState.locked) return;
      const direction = delta > 0 ? 1 : -1;
      if (direction !== wheelState.direction) {
        wheelState.direction = direction;
        wheelState.distance = 0;
      }
      wheelState.distance += Math.abs(delta);
      window.clearTimeout(wheelState.resetTimer);
      wheelState.resetTimer = window.setTimeout(resetWheelIntent, 160);
      if (wheelState.distance < 32) return;
      resetWheelIntent();
      const target = clamp(getIndex() + direction, 0, panels.length - 1);
      if (target === getIndex()) return;
      wheelState.locked = true;
      moveTo(target);
      window.clearTimeout(wheelState.unlockTimer);
      wheelState.unlockTimer = window.setTimeout(() => { wheelState.locked = false; }, 620);
    }, { passive: false });
  }
};

// Growth-plan CTAs issue a secure consultation offer before navigating to booking.
const GROWTH_PLAN_SUBSCRIPTIONS_ENABLED = true;
const blockGrowthPlanSubscription = (event) => {
  if (
    GROWTH_PLAN_SUBSCRIPTIONS_ENABLED ||
    !document.querySelector('[data-growth-track]') ||
    !event.target.closest('.plan-detail-cta')
  ) return;

  event.preventDefault();
  event.stopImmediatePropagation();
};
document.addEventListener('click', blockGrowthPlanSubscription, true);
document.addEventListener('auxclick', blockGrowthPlanSubscription, true);

window.addEventListener('DOMContentLoaded', () => {
  try {
    if (document.querySelector('[data-growth-track]')) {
      window.OOXMEMasterPanelDrag.register(Function('return { experience, track, panels, getIndex: () => current, moveTo }')());
    } else if (document.querySelector('[data-service-track]')) {
      window.OOXMEMasterPanelDrag.register(Function('return { experience, track, panels, getIndex: () => current, moveTo: move }')());
    }
  } catch (_) {}
});

const productionMetadata = {
  '/index.html': {
    en: ['OOXME | Brand Management & Business Development', 'OOXME provides brand management and business development for ambitious businesses.'],
    ar: ['اوكسوم | إدارة العلامة التجارية وتطوير الأعمال', 'اوكسوم تقدم إدارة العلامة التجارية وتطوير الأعمال للشركات الطموحة.']
  },
  '/project-gallery.html': { en: ['Portfolio | OOXME', 'Selected OOXME brand-management work.'], ar: ['الأعمال | اوكسوم', 'أعمال مختارة من اوكسوم.'] },
  '/brands-designed-gallery.html': { en: ['Portfolio | OOXME', 'Selected OOXME brand-design work.'], ar: ['الأعمال | اوكسوم', 'أعمال مختارة من اوكسوم.'] },
  '/unique-works-gallery.html': { en: ['Portfolio | OOXME', 'Selected unique OOXME work.'], ar: ['الأعمال | اوكسوم', 'أعمال مميزة من اوكسوم.'] },
  '/growth-plan.html': { en: ['Growth Plans | OOXME', 'OOXME growth plans for focused business support.'], ar: ['خطط النمو | اوكسوم', 'خطط نمو من اوكسوم لدعم الأعمال.'] },
  '/booking.html': { en: ['Consultation | OOXME', 'Book a consultation with OOXME.'], ar: ['استشارة | اوكسوم', 'احجز استشارة مع اوكسوم.'] }
};
const setMetadataTitle = (path, english, arabic) => {
  if (!productionMetadata[path]) return;
  productionMetadata[path].en[0] = english;
  productionMetadata[path].ar[0] = arabic;
};
setMetadataTitle('/index.html', 'OOXME', '\u0627\u0648\u0643\u0633\u0648\u0645');
setMetadataTitle('/project-gallery.html', 'OOXME — Brands We Manage', '\u0627\u0648\u0643\u0633\u0648\u0645 — \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u064a \u0646\u062f\u064a\u0631\u0647\u0627');
setMetadataTitle('/brands-designed-gallery.html', 'OOXME — Brands We Designed', '\u0627\u0648\u0643\u0633\u0648\u0645 — \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u062a\u064a \u0635\u0645\u0645\u0646\u0627\u0647\u0627');
setMetadataTitle('/unique-works-gallery.html', 'OOXME — Unique Works', '\u0627\u0648\u0643\u0633\u0648\u0645 — \u0623\u0639\u0645\u0627\u0644 \u0645\u0645\u064a\u0632\u0629');
setMetadataTitle('/growth-plan.html', 'OOXME — Growth Plans', '\u0627\u0648\u0643\u0633\u0648\u0645 — \u062e\u0637\u0637 \u0627\u0644\u0646\u0645\u0648');
setMetadataTitle('/booking.html', 'OOXME — Booking', '\u0627\u0648\u0643\u0633\u0648\u0645 — \u062d\u062c\u0632 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0629');
productionMetadata['/brand-management.html'] = { en: ['OOXME — Brand Management', 'OOXME brand-management services.'], ar: ['\u0627\u0648\u0643\u0633\u0648\u0645 — \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629', ''] };
productionMetadata['/coexistence.html'] = { en: ['OOXME — Connect WhatsApp Business App', 'Connect the OOXME WhatsApp Business App.'], ar: ['\u0627\u0648\u0643\u0633\u0648\u0645 — \u0631\u0628\u0637 \u062a\u0637\u0628\u064a\u0642 \u0648\u0627\u062a\u0633\u0627\u0628 \u0644\u0644\u0623\u0639\u0645\u0627\u0644', ''] };
const setHeadMeta = (selector, attribute, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attribute).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.append(element);
  }
  element.content = content;
};
const ensureHeadLink = (rel, href, type = '') => {
  if (document.head.querySelector(`link[rel="${rel}"]`)) return;
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (type) link.type = type;
  document.head.append(link);
};
const applyProductionMetadata = () => {
  const copy = productionMetadata[window.location.pathname] || (window.location.pathname === '/' ? productionMetadata['/index.html'] : null);
  if (!copy) return;
  const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const [title, description] = copy[language];
  const canonicalPath = window.location.pathname === '/index.html' ? '/' : window.location.pathname;
  document.title = title;
  setHeadMeta('meta[name="description"]', { name: 'description' }, description);
  setHeadMeta('meta[property="og:title"]', { property: 'og:title' }, title);
  setHeadMeta('meta[property="og:description"]', { property: 'og:description' }, description);
  setHeadMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, 'OOXME');
  setHeadMeta('meta[property="og:image"]', { property: 'og:image' }, 'https://ooxme.com/assets/logo/OX-001-LOGO-black.png');
  setHeadMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
  setHeadMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
  setHeadMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
  setHeadMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, 'https://ooxme.com/assets/logo/OX-001-LOGO-black.png');
  ensureHeadLink('icon', '/favicon.svg', 'image/svg+xml');
  ensureHeadLink('apple-touch-icon', '/favicon.svg');
  ensureHeadLink('manifest', '/site.webmanifest');
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = `https://ooxme.com${canonicalPath}`;
};
applyProductionMetadata();
new MutationObserver(applyProductionMetadata).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

/* Shared direct-image preview: taps open only when no gallery drag occurred. */
const ooxmeImagePreview = document.createElement('div');
ooxmeImagePreview.className = 'site-image-preview';
ooxmeImagePreview.hidden = true;
ooxmeImagePreview.innerHTML = '<div class="site-image-preview-frame"><img class="site-image-preview-image" alt="" /></div>';
document.body.append(ooxmeImagePreview);
let ooxmeImagePreviewTimer;
let ooxmeImagePress = null;
const getOoxmePreviewImage = (target) => {
  if (!(target instanceof Element)) return null;
  const image = target.closest('.project-gallery-slide, .payment-qr-placeholder > img');
  return image instanceof HTMLImageElement ? image : null;
};
const closeOoxmeImagePreview = () => {
  window.clearTimeout(ooxmeImagePreviewTimer);
  if (ooxmeImagePreview.hidden) return;
  ooxmeImagePreview.classList.remove('is-open');
  window.setTimeout(() => { ooxmeImagePreview.hidden = true; }, 260);
};
const openOoxmeImagePreview = (image) => {
  const previewImage = ooxmeImagePreview.querySelector('.site-image-preview-image');
  const isPaymentQr = image.matches('.payment-qr-placeholder > img');
  previewImage.src = image.currentSrc || image.src;
  previewImage.alt = image.alt || '';
  ooxmeImagePreview.classList.toggle('is-payment-qr', isPaymentQr);
  ooxmeImagePreview.hidden = false;
  window.requestAnimationFrame(() => ooxmeImagePreview.classList.add('is-open'));
  window.clearTimeout(ooxmeImagePreviewTimer);
  ooxmeImagePreviewTimer = window.setTimeout(closeOoxmeImagePreview, 5000);
};
ooxmeImagePreview.addEventListener('click', (event) => {
  event.preventDefault();
  closeOoxmeImagePreview();
});
document.addEventListener('pointerdown', (event) => {
  const image = getOoxmePreviewImage(event.target);
  if (!image) return;
  ooxmeImagePress = { image, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
}, true);
document.addEventListener('pointermove', (event) => {
  if (!ooxmeImagePress || event.pointerId !== ooxmeImagePress.pointerId) return;
  if (Math.hypot(event.clientX - ooxmeImagePress.x, event.clientY - ooxmeImagePress.y) > 8) ooxmeImagePress.moved = true;
}, true);
document.addEventListener('pointerup', (event) => {
  if (!ooxmeImagePress || event.pointerId !== ooxmeImagePress.pointerId) return;
  const pressedImage = ooxmeImagePress.image;
  window.setTimeout(() => {
    if (ooxmeImagePress?.image === pressedImage) ooxmeImagePress = null;
  }, 600);
}, true);
document.addEventListener('pointercancel', () => { ooxmeImagePress = null; }, true);
document.addEventListener('click', (event) => {
  const image = getOoxmePreviewImage(event.target);
  if (!image || !ooxmeImagePress || ooxmeImagePress.image !== image || ooxmeImagePress.moved) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openOoxmeImagePreview(image);
  ooxmeImagePress = null;
}, true);
window.OOXMEImagePreview = { open: openOoxmeImagePreview, close: closeOoxmeImagePreview };
