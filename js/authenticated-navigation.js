(() => {
  const dashboard = document.querySelector('.os-dashboard-experience');
  const panels = dashboard ? [...dashboard.querySelectorAll('.os-screen')] : [];
  const controls = [...document.querySelectorAll('[data-os-vertical-navigation]')];

  if (dashboard && panels.length && controls.length && !dashboard.dataset.osVerticalNavigationBound) {
    dashboard.dataset.osVerticalNavigationBound = 'true';
    let activePanel = 0;
    let requestedPanel = null;
    let activeDirection = 'next';
    let settleTimer = 0;
    const clampPanel = value => Math.max(0, Math.min(panels.length - 1, Number(value) || 0));
    const nearestPanel = () => clampPanel(Math.round(dashboard.scrollTop / Math.max(1, dashboard.clientHeight)));
    const updateControls = () => {
      activeDirection = activePanel === 0 ? 'next' : activePanel === panels.length - 1 ? 'previous' : activeDirection;
      controls.forEach(control => {
        control.dataset.activePanel = String(activePanel);
        control.dataset.activeDirection = activeDirection;
        control.querySelector('[data-os-panel-direction="previous"]').disabled = activePanel === 0;
        control.querySelector('[data-os-panel-direction="next"]').disabled = activePanel === panels.length - 1;
      });
    };
    const activate = panel => {
      panel = clampPanel(panel);
      requestedPanel = null;
      if (panel === activePanel && dashboard.dataset.osActivePanel === String(panel)) return updateControls();
      activePanel = panel;
      dashboard.dataset.osActivePanel = String(panel);
      updateControls();
      dashboard.dispatchEvent(new CustomEvent('os-panel-activated', { detail: { panel } }));
    };
    const settle = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => activate(nearestPanel()), 150);
    };
    const movePanel = (target, direction = activeDirection) => {
      target = clampPanel(target);
      if (target === activePanel && requestedPanel === null) return;
      activeDirection = direction;
      requestedPanel = target;
      dashboard.scrollTo({ top: target * dashboard.clientHeight, behavior: 'smooth' });
      settle();
    };
    controls.forEach(control => control.addEventListener('click', event => {
      const button = event.target.closest('[data-os-panel-direction]');
      if (!button || button.disabled || requestedPanel !== null) return;
      const direction = button.dataset.osPanelDirection;
      movePanel(activePanel + (direction === 'next' ? 1 : -1), direction);
    }));
    document.querySelectorAll('[data-os-home]').forEach(home => home.addEventListener('click', event => {
      event.preventDefault();
      if (activePanel !== 0 || requestedPanel !== null) return movePanel(0, 'previous');
      const logout = document.createElement('form');
      logout.method = 'post';
      logout.action = '/api/os/logout';
      document.body.append(logout);
      logout.submit();
    }));
    dashboard.addEventListener('scroll', settle, { passive: true });
    dashboard.addEventListener('scrollend', () => activate(nearestPanel()));
    dashboard.dataset.osActivePanel = '0';
    updateControls();
  }

  document.querySelectorAll('[data-authenticated-navigation]:not([data-os-panel-navigation])').forEach(navigation => {
    const trigger = navigation.querySelector('[data-auth-nav-trigger]');
    const menu = navigation.querySelector('[data-auth-nav-menu]');
    if (!trigger || !menu) return;
    let timer;
    const setActive = active => {
      menu.dataset.active = active;
      menu.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.authNavItem === active)));
    };
    const close = () => {
      const wasOpen = navigation.classList.contains('is-menu-open');
      navigation.classList.remove('is-menu-open');
      navigation.classList.toggle('is-menu-closing', wasOpen);
      trigger.setAttribute('aria-expanded', 'false');
      clearTimeout(timer);
      timer = setTimeout(() => navigation.classList.remove('is-menu-closing'), 340);
    };
    const resetInactivity = () => {
      clearTimeout(timer);
      if (navigation.classList.contains('is-menu-open')) timer = setTimeout(close, 5000);
    };
    const open = () => {
      clearTimeout(timer);
      navigation.classList.remove('is-menu-closing');
      navigation.classList.add('is-menu-open');
      trigger.setAttribute('aria-expanded', 'true');
      resetInactivity();
    };
    trigger.addEventListener('click', event => {
      event.stopPropagation();
      navigation.classList.contains('is-menu-open') ? close() : open();
    });
    menu.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      if (button.disabled || button.hasAttribute('data-brand-management-services-toggle') || button.hasAttribute('data-auth-nav-noop')) return;
      setActive(button.dataset.authNavItem);
      resetInactivity();
      if (button.hasAttribute('data-auth-nav-logout')) {
        const logout = document.createElement('form');
        logout.method = 'post';
        logout.action = '/api/os/logout';
        document.body.append(logout);
        return logout.submit();
      }
      if (button.hasAttribute('data-auth-nav-exit')) return location.assign('/api/os/logout');
      button.dataset.authNavDestination ? location.assign(button.dataset.authNavDestination) : close();
    }));
    document.addEventListener('pointerdown', event => {
      if (navigation.classList.contains('is-menu-open') && !event.target.closest('[data-authenticated-navigation]')) close();
    });
    document.addEventListener('pointermove', resetInactivity, { passive: true });
    document.addEventListener('keydown', resetInactivity);
    document.addEventListener('wheel', resetInactivity, { passive: true });
  });

})();
