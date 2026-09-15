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
