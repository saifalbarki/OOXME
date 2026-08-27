(() => {
  const dashboard = document.querySelector('.os-dashboard-experience');
  if (!dashboard || dashboard.dataset.osEntityInteractionsBound) return;
  dashboard.dataset.osEntityInteractionsBound = 'true';
  const screens = [...dashboard.querySelectorAll('.os-screen')];
  const defaults = ['employee', 'client', 'task', 'discount', 'notification'];
  const alternates = ['task', 'task', 'files', 'details', 'description'];
  const enhanceSelects = root => {
    if (!window.OOXMEOSSelector) return;
    if (root.matches?.('select')) window.OOXMEOSSelector.enhance(root);
    root.querySelectorAll?.('select').forEach(select => window.OOXMEOSSelector.enhance(select));
  };
  const entities = screens.slice(1).map((screen, index) => ({
    panel: screen.querySelector('.os-panel'),
    card: screen.querySelector('.os-panel-two-employee-card'),
    defaultState: defaults[index],
    alternateState: alternates[index]
  })).filter(entity => entity.panel && entity.card);
  const setRailActive = (entity, action = 'edit') => {
    const rail = entity.panel.querySelector('.os-panel-two-left-navigation');
    if (!rail) return;
    rail.dataset.activeAction = action;
    rail.querySelectorAll('button[data-action]').forEach(button => button.classList.toggle('is-active', button.dataset.action === action));
  };
  const resetEntity = entity => {
    entity.card.dataset.contentState = entity.defaultState;
    setRailActive(entity);
  };
  const syncOverlayState = entity => {
    const open = [...entity.panel.querySelectorAll('.os-panel-two-add-overlay,.os-panel-two-edit-overlay,.os-panel-two-delete-overlay')].some(overlay => !overlay.hidden);
    entity.panel.toggleAttribute('data-os-overlay-open', open);
  };
  entities.forEach(entity => {
    resetEntity(entity);
    syncOverlayState(entity);
    const observer = new MutationObserver(() => syncOverlayState(entity));
    entity.panel.querySelectorAll('.os-panel-two-add-overlay,.os-panel-two-edit-overlay,.os-panel-two-delete-overlay').forEach(overlay => observer.observe(overlay, { attributes: true, attributeFilter: ['hidden'] }));
    entity.panel.addEventListener('click', event => {
      const action = event.target.closest('.os-panel-two-left-navigation button[data-action]')?.dataset.action;
      if (action === 'edit' || action === 'delete') setRailActive(entity, action);
    });
    let gesture = null;
    entity.card.addEventListener('pointerdown', event => {
      if (!event.isPrimary) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
      try { entity.card.setPointerCapture(event.pointerId); } catch (_) {}
    });
    entity.card.addEventListener('pointerup', event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      gesture = null;
      try { entity.card.releasePointerCapture(event.pointerId); } catch (_) {}
      if (Math.abs(dx) <= 24 || Math.abs(dx) <= Math.abs(dy)) return;
      if (dx < 0 && entity.card.dataset.contentState === entity.defaultState) entity.card.dataset.contentState = entity.alternateState;
      if (dx > 0 && entity.card.dataset.contentState === entity.alternateState) entity.card.dataset.contentState = entity.defaultState;
    });
    entity.card.addEventListener('pointercancel', event => {
      gesture = null;
      try { entity.card.releasePointerCapture(event.pointerId); } catch (_) {}
    });
  });
  dashboard.addEventListener('os-panel-activated', event => {
    const active = Number(event.detail?.panel);
    entities.forEach((entity, index) => {
      if (active !== index + 1) entity.card.dataset.contentState = entity.defaultState;
      if (active === index + 1) setRailActive(entity);
    });
    enhanceSelects(dashboard);
  });
  enhanceSelects(dashboard);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === 1) enhanceSelects(node);
  }))).observe(dashboard, { childList: true, subtree: true });
})();
