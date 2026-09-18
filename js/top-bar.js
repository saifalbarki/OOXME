(() => {
  const composer = document.querySelector('[data-s-composer]');
  const addButton = composer?.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  if (!composer || !addButton || !submitButton) return;

  const pulse = () => {
    composer.classList.remove('is-pulsing');
    requestAnimationFrame(() => composer.classList.add('is-pulsing'));
  };

  composer.addEventListener('animationend', (event) => {
    if (event.animationName === 's-page-composer-pulse') composer.classList.remove('is-pulsing');
  });
  [addButton, submitButton].forEach((control) => {
    control.addEventListener('pointerdown', pulse, { passive: true });
  });
  composer.addEventListener('pointerdown', (event) => {
    if (event.target === composer) pulse();
  }, { passive: true });
  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.assign('/');
  });

  const menu = composer.querySelector('[data-s-composer-menu]');
  const menuItems = menu ? [...menu.querySelectorAll('.s-page__composer-menu-item')] : [];
  const menuLabels = {
    en: {
      brand: 'The Brand Management',
      gallery: 'The Gallery',
      store: 'The Store',
      consultation: 'The Consultation',
      contact: 'Contact'
    },
    ar: {
      brand: 'إدارة العلامة التجارية',
      gallery: 'المعرض',
      store: 'المتجر',
      consultation: 'الاستشارة',
      contact: 'تواصل'
    }
  };
  const keyForLabel = (label) => {
    const value = label.trim();
    if (value === 'The Brand Management' || value === 'إدارة العلامة التجارية') return 'brand';
    if (value === 'The Gallery' || value === 'المعرض') return 'gallery';
    if (value === 'The Store' || value === 'المتجر') return 'store';
    if (value === 'The Consultation' || value === 'الاستشارة') return 'consultation';
    if (value === 'Contact' || value === 'تواصل') return 'contact';
    return '';
  };
  const normalizeMenu = () => {
    if (!menuItems.length) return;
    menuItems.forEach((item) => {
      const label = item.querySelector('.s-page__composer-menu-label');
      if (!label) return;
      const key = item.dataset.sMenuKey || keyForLabel(label.textContent);
      if (!key) return;
      item.dataset.sMenuKey = key;
      if (key === 'consultation') {
        item.dataset.sMenuTarget = 'consultation';
        item.removeAttribute('aria-disabled');
        item.querySelector('svg')?.remove();
      }
      if (key === 'store') item.dataset.sMenuTarget = 'store';
    });
    const order = ['brand', 'gallery', 'store', 'consultation', 'contact'];
    [...menuItems]
      .sort((a, b) => order.indexOf(a.dataset.sMenuKey) - order.indexOf(b.dataset.sMenuKey))
      .forEach((item) => menu.appendChild(item));
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    menuItems.forEach((item) => {
      const label = item.querySelector('.s-page__composer-menu-label');
      const key = item.dataset.sMenuKey;
      if (label && menuLabels[language][key]) label.textContent = menuLabels[language][key];
    });
  };
  normalizeMenu();
  window.setTimeout(normalizeMenu, 0);
  window.setTimeout(normalizeMenu, 100);
  window.addEventListener('load', normalizeMenu, { once: true });
  window.addEventListener('ooxme-language-change', () => window.setTimeout(normalizeMenu, 0));
  composer.querySelector('[data-s-utility="language"]')?.addEventListener('click', () => window.setTimeout(normalizeMenu, 50), { passive: true });
  menuItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      const target = item.dataset.sMenuTarget;
      if (target !== 'consultation' && target !== 'store') return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(target === 'consultation' ? '/consultation' : '/store');
    });
  });
})();

// Main's OXO face controller is shared by every non-Main active page.
(() => {
  if (document.body.classList.contains('s-page--main')) return;
  const addButton = document.querySelector('[data-s-composer] .s-page__add');
  const face = addButton?.querySelector('[data-s-x-face]');
  const shell = face?.querySelector('.s-page__x-face-shell');
  const eyes = face?.querySelector('.s-page__x-face-eyes');
  const eyeMotion = face?.querySelector('.s-page__x-face-eye-motion');
  if (!addButton || !face || !shell || !eyes || !eyeMotion) return;

  const gazeLimit = 1.1;
  const dragThreshold = 6;
  let pointer = null;
  let dragging = false;
  let tapping = false;
  let settling = false;
  let tapTimer = 0;
  let settleTimer = 0;
  let animationFrame = 0;
  let previousTime = 0;
  let targetGaze = { x: 0, y: 0 };
  let currentGaze = { x: 0, y: 0 };

  const clearTimer = (timer) => {
    if (timer) window.clearTimeout(timer);
    return 0;
  };
  const setGaze = (x, y, normalize = true) => {
    const magnitude = Math.hypot(x, y);
    const scale = normalize && magnitude > 0 ? gazeLimit / Math.max(gazeLimit, magnitude) : 1;
    targetGaze = {
      x: Math.max(-gazeLimit, Math.min(gazeLimit, x * scale)),
      y: Math.max(-gazeLimit, Math.min(gazeLimit, y * scale))
    };
  };
  const getState = () => dragging ? 'drag' : tapping ? 'tap' : settling ? 'settle' : 'idle';
  const render = () => { face.dataset.faceState = getState(); };
  const tick = (time) => {
    const delta = Math.min(48, Math.max(1, time - (previousTime || time)));
    previousTime = time;
    const state = getState();
    const gazeEasing = 1 - Math.exp(-delta / (state === 'drag' ? 38 : 72));
    const gazeTarget = state === 'tap' || state === 'drag' ? targetGaze : { x: 0, y: 0 };
    currentGaze.x += (gazeTarget.x - currentGaze.x) * gazeEasing;
    currentGaze.y += (gazeTarget.y - currentGaze.y) * gazeEasing;
    const blinkPhase = (((time / 1000) + .7) % 2) / 2;
    const blink = state === 'idle' ? 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .014, 2))) : 1;
    shell.setAttribute('transform', 'translate(0 0)');
    eyes.setAttribute('transform', `translate(${currentGaze.x.toFixed(3)} ${currentGaze.y.toFixed(3)})`);
    eyeMotion.setAttribute('transform', state === 'idle'
      ? `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)`
      : 'translate(0 0)');
    render();
    animationFrame = window.requestAnimationFrame(tick);
  };
  const centerGaze = () => setGaze(0, 0, false);
  const gazeAtPoint = (clientX, clientY) => {
    const rect = addButton.getBoundingClientRect();
    setGaze(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
  };
  const begin = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (pointer) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    dragging = false;
  };
  const move = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!dragging && Math.hypot(dx, dy) < dragThreshold) return;
    if (!dragging) {
      dragging = true;
      tapping = false;
      settling = false;
      tapTimer = clearTimer(tapTimer);
      settleTimer = clearTimer(settleTimer);
    }
    setGaze(dx, dy);
    render();
  };
  const end = (event, cancelled = false) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const wasDragging = dragging;
    pointer = null;
    dragging = false;
    if (wasDragging) {
      tapping = false;
      settling = true;
      centerGaze();
      render();
      settleTimer = clearTimer(settleTimer);
      settleTimer = window.setTimeout(() => { settling = false; render(); }, 480);
      return;
    }
    if (cancelled) {
      centerGaze();
      render();
      return;
    }
    tapping = true;
    settling = false;
    gazeAtPoint(event.clientX, event.clientY);
    render();
    tapTimer = clearTimer(tapTimer);
    tapTimer = window.setTimeout(() => { tapping = false; centerGaze(); render(); }, 380);
  };
  document.addEventListener('pointerdown', begin, { capture: true, passive: true });
  document.addEventListener('pointermove', move, { capture: true, passive: true });
  ['pointerup', 'pointercancel'].forEach((name) => document.addEventListener(name, (event) => end(event, name === 'pointercancel'), { capture: true, passive: true }));
  render();
  animationFrame = window.requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    tapTimer = clearTimer(tapTimer);
    settleTimer = clearTimer(settleTimer);
  }, { once: true });
})();
