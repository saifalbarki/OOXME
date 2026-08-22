(() => {
  document.querySelectorAll('[data-authenticated-navigation]').forEach(navigation => {
    const trigger = navigation.querySelector('[data-auth-nav-trigger]');
    const menu = navigation.querySelector('[data-auth-nav-menu]');
    if (!trigger || !menu) return;
    let timer;
    let settleTimer;
    const setActive = active => {
      menu.dataset.active = active;
      menu.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.authNavItem === active)));
    };
    const resetInactivity = () => { clearTimeout(timer); if (navigation.classList.contains('is-menu-open')) timer = setTimeout(close, 5000); };
    const close = () => { const wasOpen = navigation.classList.contains('is-menu-open'); navigation.classList.remove('is-menu-open'); navigation.classList.toggle('is-menu-closing', wasOpen); trigger.setAttribute('aria-expanded', 'false'); clearTimeout(timer); timer = setTimeout(() => navigation.classList.remove('is-menu-closing'), 340); };
    const open = () => { clearTimeout(timer); navigation.classList.remove('is-menu-closing'); navigation.classList.add('is-menu-open'); trigger.setAttribute('aria-expanded', 'true'); resetInactivity(); };
    const dashboard = navigation.hasAttribute('data-os-panel-navigation') ? document.querySelector('.os-dashboard-experience') : null;
    const panels = dashboard ? [...dashboard.querySelectorAll('.os-screen')] : [];
    const currentPanel = () => dashboard ? Math.round(dashboard.scrollTop / dashboard.clientHeight) : 0;
    const updatePanelControls = (index = currentPanel()) => {
      if (!dashboard) return;
      menu.querySelector('[data-auth-nav-panel="previous"]').disabled = index <= 0;
      menu.querySelector('[data-auth-nav-panel="next"]').disabled = index >= panels.length - 1;
    };
    const movePanel = (direction, button) => {
      const target = Math.max(0, Math.min(panels.length - 1, currentPanel() + direction));
      if (target === currentPanel()) return;
      setActive(button.dataset.authNavItem);
      resetInactivity();
      dashboard.scrollTo({ top: target * dashboard.clientHeight, behavior: 'smooth' });
      updatePanelControls(target);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => { setActive('home'); updatePanelControls(); }, 520);
    };
    if (dashboard) {
      let scrollTimer;
      updatePanelControls();
      dashboard.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(() => { updatePanelControls(); setActive('home'); }, 140); }, { passive: true });
    }
    trigger.addEventListener('click', event => { event.stopPropagation(); navigation.classList.contains('is-menu-open') ? close() : open(); });
    menu.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      if (button.disabled) return;
      if (button.dataset.authNavPanel) {
        movePanel(button.dataset.authNavPanel === 'previous' ? -1 : 1, button);
        return;
      }
      setActive(button.dataset.authNavItem);
      resetInactivity();
      if (button.hasAttribute('data-auth-nav-logout')) {
        const logout = document.createElement('form');
        logout.method = 'post';
        logout.action = '/api/os/logout';
        document.body.append(logout);
        logout.submit();
        return;
      }
      if (button.hasAttribute('data-auth-nav-exit')) {
        location.assign('/api/os/logout?returnTo=/');
        return;
      }
      button.dataset.authNavDestination ? location.assign(button.dataset.authNavDestination) : close();
    }));
    document.addEventListener('pointerdown', event => { if (!navigation.classList.contains('is-menu-open')) return; resetInactivity(); if (!event.target.closest('[data-authenticated-navigation]')) close(); });
    document.addEventListener('pointermove', resetInactivity, { passive: true });
    document.addEventListener('keydown', resetInactivity);
    document.addEventListener('wheel', resetInactivity, { passive: true });
  });
})();
