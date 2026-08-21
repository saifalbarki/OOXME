(() => {
  document.querySelectorAll('[data-authenticated-navigation]').forEach(navigation => {
    const trigger = navigation.querySelector('[data-auth-nav-trigger]');
    const menu = navigation.querySelector('[data-auth-nav-menu]');
    if (!trigger || !menu) return;
    let timer;
    const close = () => { const wasOpen = navigation.classList.contains('is-menu-open'); navigation.classList.remove('is-menu-open'); navigation.classList.toggle('is-menu-closing', wasOpen); trigger.setAttribute('aria-expanded', 'false'); clearTimeout(timer); timer = setTimeout(() => navigation.classList.remove('is-menu-closing'), 340); };
    const open = () => { clearTimeout(timer); navigation.classList.remove('is-menu-closing'); navigation.classList.add('is-menu-open'); trigger.setAttribute('aria-expanded', 'true'); timer = setTimeout(close, 5000); };
    trigger.addEventListener('click', event => { event.stopPropagation(); navigation.classList.contains('is-menu-open') ? close() : open(); });
    menu.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { menu.dataset.active = button.dataset.authNavItem; menu.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button))); button.dataset.authNavDestination ? location.assign(button.dataset.authNavDestination) : close(); }));
    document.addEventListener('pointerdown', event => { if (navigation.classList.contains('is-menu-open') && !event.target.closest('[data-authenticated-navigation]')) close(); });
  });
})();
