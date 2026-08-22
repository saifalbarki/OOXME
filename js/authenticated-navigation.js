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
    const panelNavigationItem = index => ['home', 'users', 'discount'][index] || 'home';
    if (dashboard && !dashboard.dataset.osActivePanel) dashboard.dataset.osActivePanel = String(currentPanel());
    const updatePanelControls = target => {
      if (!dashboard) return;
      const panel = target ?? currentPanel();
      setActive(panelNavigationItem(panel));
      if (dashboard.dataset.osActivePanel === String(panel)) return;
      dashboard.dataset.osActivePanel = String(panel);
      dashboard.dispatchEvent(new CustomEvent('os-panel-activated', { detail: { panel } }));
    };
    const movePanel = (target, button) => {
      target = Math.max(0, Math.min(panels.length - 1, Number(target)));
      if (target === currentPanel()) return;
      setActive(button.dataset.authNavItem);
      resetInactivity();
      dashboard.scrollTo({ top: target * dashboard.clientHeight, behavior: 'smooth' });
      updatePanelControls(target);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => updatePanelControls(), 520);
    };
    if (dashboard) {
      let scrollTimer;
      updatePanelControls();
      dashboard.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(updatePanelControls, 140); }, { passive: true });
    }
    trigger.addEventListener('click', event => { event.stopPropagation(); navigation.classList.contains('is-menu-open') ? close() : open(); });
    menu.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      if (button.disabled) return;
      if (button.hasAttribute('data-auth-nav-noop')) return;
      if (button.dataset.authNavPanel) {
        movePanel(button.dataset.authNavPanel, button);
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
