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

const productionMetadata = {
  '/index.html': {
    en: ['OOXME | Brand Management & Business Development', 'OOXME provides brand management and business development for ambitious businesses.'],
    ar: ['اوكسوم | إدارة العلامة التجارية وتطوير الأعمال', 'اوكسوم تقدم إدارة العلامة التجارية وتطوير الأعمال للشركات الطموحة.']
  },
  '/project-gallery.html': { en: ['Portfolio | OOXME', 'Selected OOXME brand-management work.'], ar: ['الأعمال | اوكسوم', 'أعمال مختارة من اوكسوم.'] },
  '/brands-designed-gallery.html': { en: ['Portfolio | OOXME', 'Selected OOXME brand-design work.'], ar: ['الأعمال | اوكسوم', 'أعمال مختارة من اوكسوم.'] },
  '/unique-works-gallery.html': { en: ['Portfolio | OOXME', 'Selected unique OOXME work.'], ar: ['الأعمال | اوكسوم', 'أعمال مميزة من اوكسوم.'] },
  '/growth-plan.html': { en: ['Growth Plans | OOXME', 'OOXME growth plans for focused business support.'], ar: ['خطط النمو | اوكسوم', 'خطط نمو من اوكسوم لدعم الأعمال.'] },
  '/service-page.html': { en: ['Brand Management | OOXME', 'OOXME brand-management services.'], ar: ['إدارة العلامة التجارية | اوكسوم', 'خدمات إدارة العلامة التجارية من اوكسوم.'] },
  '/booking.html': { en: ['Consultation | OOXME', 'Book a consultation with OOXME.'], ar: ['استشارة | اوكسوم', 'احجز استشارة مع اوكسوم.'] }
};
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
  const copy = productionMetadata[window.location.pathname];
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
