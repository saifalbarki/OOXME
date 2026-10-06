(() => {
  'use strict';

  const page = document.body;
  if (!page) return;

  const definitions = {
    '/': {
      'main-update-1': '[data-s-main-section-1-image-card][href="/update"]',
      'main-rpn': '[data-s-main-section-1-image-card][href="/space"]',
      'main-gallery': '[data-s-gallery-preview-action], .s-page__gallery-preview-cta[href="/gallery"]',
      'main-consultation': '[data-s-contact-consultation-cta]',
      'main-phone': '[data-s-contact="phone"]',
      'main-email': '[data-s-contact="email"]',
      'main-whatsapp': '[data-s-contact="whatsapp"]',
      'main-instagram': '[data-s-contact="instagram"]',
      'main-facebook': '[data-s-contact="facebook"]',
      'main-linkedin': '[data-s-contact="linkedin"]'
    },
    '/gallery': {
      'gallery-alfares': '[data-gallery-project="alfares"] [data-gallery-deck]',
      'gallery-alsibtain': '[data-gallery-project="alsebteen"] [data-gallery-deck]',
      'gallery-velvet-flora': '[data-gallery-project="velvet"] [data-gallery-deck]',
      'gallery-zone': '[data-gallery-project="zone"] [data-gallery-deck]',
      'gallery-sada-al-riwaq': '[data-gallery-project="sda-alrwaq"] [data-gallery-deck]'
    },
    '/bm': {
      'bm-view': '[data-brand-view]',
      'bm-prev': '[data-brand-prev]',
      'bm-next': '[data-brand-next]'
    },
    '/space': {
      'rpn-faq': '.space-faq__question',
      'rpn-email': '.space-application__button[href^="mailto:"]',
      'rpn-join': '.space-application__button--join'
    },
    '/consultation': {
      'consultation-send': '[data-s-consultation-composer] button[type="submit"]',
      'consultation-language': '[data-s-consultation-composer-language]',
      'consultation-apply': '[data-s-consultation-apply]',
      'consultation-zaincash': '[data-consultation-payment="ZainCash"]',
      'consultation-superqi': '[data-consultation-payment="Qi"]',
      'consultation-confirm': '[data-s-consultation-pay]'
    },
    '/store': {
      'store-prev': '[data-store-carousel-previous]',
      'store-next': '[data-store-carousel-next]'
    },
    '/update': {
      'update-prev': '[data-update-prev]',
      'update-next': '[data-update-next]'
    }
  };

  const route = location.pathname === '' ? '/' : location.pathname;
  const routeDefinitions = definitions[route] || {};
  const controlled = new Map();

  const apply = (actionKey, enabled) => {
    const selector = routeDefinitions[actionKey];
    if (!selector) return;
    let nodes = [];
    try { nodes = [...page.querySelectorAll(selector)]; } catch (_) { return; }
    nodes.forEach((node) => {
      node.classList.toggle('is-os-disabled', !enabled);
      node.dataset.osDisabled = enabled ? 'false' : 'true';
      node.setAttribute('aria-disabled', String(!enabled));
      if ('disabled' in node) node.disabled = !enabled;
      if (!enabled) node.tabIndex = -1;
      else if (node.dataset.osOriginalTabIndex !== undefined) node.tabIndex = Number(node.dataset.osOriginalTabIndex);
      if (!node.dataset.osOriginalTabIndex && node.tabIndex >= 0) node.dataset.osOriginalTabIndex = String(node.tabIndex);
    });
    controlled.set(actionKey, enabled);
  };

  document.addEventListener('click', (event) => {
    const target = event.target.closest?.('[data-os-disabled="true"]');
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  const loadPageControls = () => {
    const runtime = window.OOXMEPublicRuntime?.load?.();
    const data = runtime || fetch('/api/os/page-controls', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('page_controls_unavailable')))
      .then((payload) => payload.data || {});
    return data.then((payload) => {
      (payload.controls || []).forEach((control) => apply(control.actionKey, control.enabled !== false));
      page.dataset.osControlsReady = 'true';
    })
    .catch(() => { page.dataset.osControlsReady = 'false'; });
  };

  const scheduleAfterFirstPaint = (callback) => {
    const runWhenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(callback, { timeout: 1200 });
      } else {
        window.setTimeout(callback, 180);
      }
    };
    window.requestAnimationFrame(() => window.requestAnimationFrame(runWhenIdle));
  };

  scheduleAfterFirstPaint(() => { void loadPageControls(); });
})();
