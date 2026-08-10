window.OOXMEMasterPanelDrag = {
  register({ experience, track, panels, getIndex, moveTo }) {
    if (!experience || !track || track.dataset.masterPanelDragBound) return;
    track.dataset.masterPanelDragBound = 'true';

    const interactiveSelector = [
      'button', 'a', 'input', 'select', 'textarea', 'label',
      '[data-project-gallery]', '[data-search-overlay]', '.search-overlay',
      '.booking-card', '.booking-fields', '.booking-selectors', '.calendar-card',
      '.booking-summary', '.payment-options'
    ].join(',');
    let drag = null;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const offsetFor = (index) => -index * window.innerHeight;

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
        track.style.transform = `translateY(${-target * 100}dvh)`;
      } else {
        moveTo(target);
      }
    };

    experience.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest(interactiveSelector)) return;
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
  }
};

window.addEventListener('DOMContentLoaded', () => {
  try {
    if (document.querySelector('[data-growth-track]')) {
      window.OOXMEMasterPanelDrag.register(Function('return { experience, track, panels, getIndex: () => current, moveTo }')());
    } else if (document.querySelector('[data-service-track]')) {
      window.OOXMEMasterPanelDrag.register(Function('return { experience, track, panels, getIndex: () => current, moveTo: move }')());
    }
  } catch (_) {}
});
