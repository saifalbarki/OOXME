(() => {
  const dashboard = document.querySelector('.os-dashboard-experience');
  if (!dashboard || dashboard.dataset.osLiveDataBound) return;
  dashboard.dataset.osLiveDataBound = 'true';
  const state = { accounts: [], tasks: [], promotions: [], notifications: [] };
  const api = async (path, options) => {
    const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } });
    if (!response.ok) throw new Error(`api_${response.status}`);
    return response.status === 204 ? null : response.json();
  };
  const text = (node, value) => { if (node) node.textContent = value || '—'; };
  const date = value => value ? new Date(value).toLocaleDateString() : '—';
  const activeAccounts = type => state.accounts.filter(account => account.account_type === type && account.status === 'active');
  const first = list => list[0] || null;
  const option = (select, value, label) => select?.append(new Option(label, value));
  const sync = select => window.OOXMEOSSelector?.sync(select);
  const fill = (select, items, label) => {
    if (!select) return;
    const chosen = select.value;
    select.replaceChildren(new Option(select.dataset.osPlaceholder || select.getAttribute('aria-label') || 'Select', ''));
    items.forEach(item => option(select, item.id, label(item)));
    select.value = items.some(item => item.id === chosen) ? chosen : '';
    sync(select);
  };
  const summaryFields = (panel, rows, primary, details) => {
    const card = panel?.querySelector('.os-panel-two-employee-card');
    const row = rows?.[0];
    if (!card || !row) return;
    const state = card.querySelector('[data-os-row-state]');
    if (!state) return;
    text(state.querySelector('strong'), primary(row));
    state.querySelectorAll('.os-panel-two-employee-details span').forEach((node, index) => text(node, details(row)[index]));
  };
  const panel = number => dashboard.querySelector(`.os-panel-${number} .os-panel`);
  const ensureAccountPassword = (form, label = 'Password') => {
    if (!form || form.querySelector('input[name="password"]')) return;
    const input = document.createElement('input'); input.name = 'password'; input.type = 'password'; input.autocomplete = 'new-password'; input.placeholder = label; input.setAttribute('aria-label', label); form.append(input);
  };
  const accountLabel = account => `${account.account_type === 'employee' ? account.employee_display_name : account.client_display_name} · ${account.display_code}`;
  const taskLabel = task => `${task.title} · ${task.task_code}`;
  const promotionLabel = promotion => `${promotion.name || promotion.code_normalized} · ${promotion.discount_display_code}`;
  const notificationLabel = notification => notification.title;
  const addSelect = (form, name, aria, items, label) => {
    if (!form) return null;
    let select = form.querySelector(`select[name="${name}"]`);
    if (!select) { select = document.createElement('select'); select.name = name; select.setAttribute('aria-label', aria); form.prepend(select); }
    fill(select, items, label); return select;
  };
  const load = async () => {
    const [accounts, tasks, promotions, notifications] = await Promise.all([
      api('/api/os/accounts'), api('/api/os/tasks'), api('/api/os/promotions'), api('/api/os/notifications')
    ]);
    state.accounts = accounts; state.tasks = tasks; state.promotions = promotions; state.notifications = notifications;
    render();
  };
  const render = () => {
    const employee = first(activeAccounts('employee'));
    const client = first(activeAccounts('client'));
    const task = first(state.tasks);
    const promotion = first(state.promotions);
    const notification = first(state.notifications);
    const employeePanel = panel('two');
    const clientPanel = panel('three');
    const taskPanel = panel('four');
    const discountPanel = panel('five');
    const notificationPanel = panel('six');
    summaryFields(employeePanel, employee ? [employee] : [], item => item.employee_display_name, item => [item.job_title, item.display_code, item.employee_email || item.username]);
    summaryFields(clientPanel, client ? [client] : [], item => item.client_display_name, item => [item.company_name, item.display_code, item.client_email || item.username]);
    summaryFields(taskPanel, task ? [task] : [], item => item.title, item => [item.company_name || item.client_name, item.task_code, `${date(item.starts_at)} · ${item.duration_minutes || '—'} min`]);
    const taskFiles = taskPanel?.querySelector('[data-os-row-state="files"]');
    if (taskFiles && task) { text(taskFiles.querySelector('strong'), task.title); text(taskFiles.querySelector('.os-card-count-indicator'), '—'); text(taskFiles.querySelector('.os-card-description'), task.description); }
    summaryFields(discountPanel, promotion ? [promotion] : [], item => `${item.name || item.code_normalized} · ${item.code_normalized}`, item => [`${item.discount_value}%`, item.discount_display_code, '—']);
    const discountDetails = discountPanel?.querySelector('[data-os-row-state="details"]');
    if (discountDetails && promotion) { text(discountDetails.querySelector('strong'), promotion.name || promotion.code_normalized); text(discountDetails.querySelector('.os-card-count-indicator'), promotion.total_usage_limit == null ? '—' : String(promotion.total_usage_limit)); text(discountDetails.querySelector('.os-card-description'), promotion.description); }
    summaryFields(notificationPanel, notification ? [notification] : [], item => item.title, item => [item.audience, date(item.publish_date), date(item.valid_until)]);
    const notificationDetails = notificationPanel?.querySelector('[data-os-row-state="description"]');
    if (notificationDetails && notification) { text(notificationDetails.querySelector('strong'), notification.title); text(notificationDetails.querySelector('.os-card-description'), notification.body); }
    const projects = state.tasks.map(item => ({ id: item.project_id, name: item.project_name })).filter((item, index, list) => item.id && list.findIndex(other => other.id === item.id) === index);
    [employeePanel, clientPanel, taskPanel, discountPanel, notificationPanel].forEach(current => current?.querySelectorAll('select').forEach(select => {
      if (select.name === 'employee') fill(select, activeAccounts('employee'), accountLabel);
      if (select.name === 'client' || select.hasAttribute('data-os-panel-three-client-select')) fill(select, activeAccounts('client'), accountLabel);
      if (select.name === 'task') fill(select, state.tasks, taskLabel);
      if (select.name === 'discount') fill(select, state.promotions, promotionLabel);
      if (select.name === 'notification') fill(select, state.notifications, notificationLabel);
      if (select.name === 'projectId') fill(select, projects, item => item.name);
      if (select.name === 'employeeId') fill(select, activeAccounts('employee').filter(item => item.employee_profile_id), item => accountLabel(item));
    }));
    dashboard.querySelectorAll('[data-os-summary="active_employees"],[data-os-summary="employees"]').forEach(field => text(field, activeAccounts('employee').length));
    dashboard.querySelectorAll('[data-os-summary="active_clients"],[data-os-summary="clients"]').forEach(field => text(field, activeAccounts('client').length));
    dashboard.querySelectorAll('[data-os-summary="active_discount_codes"],[data-os-summary="discount_codes"]').forEach(field => text(field, state.promotions.length));
  };
  const close = target => { const overlay = target.closest('.os-panel-two-add-overlay,.os-panel-two-edit-overlay,.os-panel-two-delete-overlay'); if (overlay) overlay.hidden = true; };
  const selected = (container, name, collection) => collection.find(item => item.id === container.querySelector(`select[name="${name}"]`)?.value) || null;
  const body = form => Object.fromEntries(new FormData(form).entries());
  const open = (current, type) => { const overlay = current.querySelector(`.os-panel-two-${type}-overlay`); if (overlay) overlay.hidden = false; };
  const bindPanel = (number, config) => {
    const current = panel(number); if (!current) return;
    const addForm = current.querySelector('.os-panel-two-add-overlay form');
    const editForm = current.querySelector('.os-panel-two-edit-overlay form');
    if (config.kind === 'account') {
      ensureAccountPassword(addForm);
      const select = editForm && addSelect(editForm, config.selector, `Select ${config.type}`, activeAccounts(config.type), accountLabel);
      select?.addEventListener('change', () => {
        const account = activeAccounts(config.type).find(item => item.id === select.value);
        if (!account) return;
        const field = name => editForm.querySelector(`[name="${name}"]`);
        if (field('name')) field('name').value = config.type === 'employee' ? account.employee_display_name || '' : account.client_display_name || '';
        if (field('email')) field('email').value = account.username || '';
        if (field('jobTitle')) field('jobTitle').value = account.job_title || '';
        if (field('company')) field('company').value = account.company_name || '';
      });
    }
    if (config.kind === 'task') { [addForm, editForm].forEach(form => { addSelect(form, 'projectId', 'Select project', state.tasks.map(item => ({ id: item.project_id, name: item.project_name })).filter((item, index, list) => list.findIndex(other => other.id === item.id) === index), item => item.name); addSelect(form, 'employeeId', 'Select employee', activeAccounts('employee').filter(item => item.employee_profile_id).map(item => ({ id: item.employee_profile_id, name: item.employee_display_name })), item => item.name); }); }
    current.addEventListener('click', async event => {
      const control = event.target.closest('[data-os-panel-two-delete],[data-os-panel-two-edit],[data-os-panel-three-delete],[data-os-panel-three-edit],[data-os-panel-four-delete],[data-os-panel-four-edit],[data-os-panel-five-delete],[data-os-panel-five-edit],[data-os-panel-six-delete],[data-os-panel-six-edit],.os-panel-two-add-button');
      if (control) { const names = [...control.attributes].map(attribute => attribute.name); event.preventDefault(); event.stopImmediatePropagation(); open(current, control.classList.contains('os-panel-two-add-button') ? 'add' : names.some(name => name.includes('delete')) ? 'delete' : 'edit'); }
      const confirm = event.target.closest('[data-os-panel-two-add-confirm],[data-os-panel-two-edit-confirm],[data-os-panel-two-delete-confirm],[data-os-panel-three-add-confirm],[data-os-panel-three-edit-confirm],[data-os-panel-three-delete-confirm],[data-os-panel-four-add-confirm],[data-os-panel-four-edit-confirm],[data-os-panel-four-delete-confirm],[data-os-panel-five-add-confirm],[data-os-panel-five-edit-confirm],[data-os-panel-five-delete-confirm],[data-os-panel-six-add-confirm],[data-os-panel-six-edit-confirm],[data-os-panel-six-delete-confirm]');
      if (!confirm) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const mode = confirm.closest('.os-panel-two-add-overlay') ? 'create' : confirm.closest('.os-panel-two-edit-overlay') ? 'update' : 'delete';
      try { await config.mutate(mode, current, addForm, editForm); close(confirm); await load(); } catch (_) { confirm.disabled = false; }
    }, true);
  };
  const accountMutation = type => async (mode, current, addForm, editForm) => {
    const form = mode === 'create' ? addForm : editForm;
    const values = body(form);
    const selectedId = mode === 'delete'
      ? (type === 'client' ? current.querySelector('[data-os-panel-three-client-select]')?.value : current.querySelector('.os-panel-two-delete-overlay select')?.value)
      : form.querySelector(`select[name="${type}"]`)?.value;
    const target = activeAccounts(type).find(item => item.id === selectedId);
    const deleteTarget = target;
    if (mode === 'delete') return api('/api/os/accounts', { method: 'POST', body: JSON.stringify({ action: 'delete', id: deleteTarget?.id }) });
    const payload = { action: mode, accountType: type, username: values.email, password: values.password, displayName: values.name, jobTitle: values.jobTitle, companyName: values.company };
    if (mode === 'update') { payload.id = target?.id; payload.expectedVersion = target?.version; delete payload.accountType; delete payload.password; }
    return api('/api/os/accounts', { method: 'POST', body: JSON.stringify(payload) });
  };
  const taskMutation = async (mode, current, addForm, editForm) => {
    const form = mode === 'create' ? addForm : editForm; const values = body(form); const target = state.tasks.find(item => item.id === (mode === 'delete' ? current.querySelector('.os-panel-two-delete-overlay select[name="task"]')?.value : form.querySelector('select[name="task"]')?.value));
    if (mode === 'delete') return api('/api/os/tasks', { method: 'POST', body: JSON.stringify({ action: 'delete', id: target?.id }) });
    return api('/api/os/tasks', { method: 'POST', body: JSON.stringify({ action: mode, id: target?.id, expectedVersion: target?.version, title: values.taskName, description: values.taskDescription, projectId: values.projectId, employeeId: values.employeeId, startsAt: values.startDate || new Date().toISOString(), durationMinutes: values.duration || 60, status: 'in_progress' }) });
  };
  const promotionMutation = async (mode, current, addForm, editForm) => {
    const form = mode === 'create' ? addForm : editForm; const values = body(form); const target = state.promotions.find(item => item.id === (mode === 'delete' ? current.querySelector('.os-panel-two-delete-overlay select[name="discount"]')?.value : form.querySelector('select[name="discount"]')?.value));
    if (mode === 'delete') return api('/api/os/promotions', { method: 'POST', body: JSON.stringify({ action: 'delete', id: target?.id }) });
    return api('/api/os/promotions', { method: 'POST', body: JSON.stringify({ action: mode, id: target?.id, expectedVersion: target?.version, code: values.discountCode, name: values.discountName, description: values.discountDescription, discount: values.discountPercentage, duration: 60, allowedUses: values.numberOfValidUses }) });
  };
  const notificationMutation = async (mode, current, addForm, editForm) => {
    const form = mode === 'create' ? addForm : editForm; const values = body(form); const target = state.notifications.find(item => item.id === (mode === 'delete' ? current.querySelector('.os-panel-two-delete-overlay select[name="notification"]')?.value : form.querySelector('select[name="notification"]')?.value));
    if (mode === 'delete') return api('/api/os/notifications', { method: 'POST', body: JSON.stringify({ action: 'delete', id: target?.id }) });
    return api('/api/os/notifications', { method: 'POST', body: JSON.stringify({ action: mode, id: target?.id, expectedVersion: target?.version, title: values.notificationTitle || values.notificationName || values.title, body: values.notificationDescription || values.body, publishDate: values.publishDate || new Date().toISOString(), validUntil: values.validity || values.validUntil, audience: values.audience === 'all' ? 'everyone' : (values.audience || 'everyone'), status: 'published' }) });
  };
  bindPanel('two', { kind: 'account', type: 'employee', selector: 'employee', mutate: accountMutation('employee') });
  bindPanel('three', { kind: 'account', type: 'client', selector: 'client', mutate: accountMutation('client') });
  bindPanel('four', { kind: 'task', mutate: taskMutation });
  bindPanel('five', { kind: 'promotion', mutate: promotionMutation });
  bindPanel('six', { kind: 'notification', mutate: notificationMutation });
  load().catch(() => {});
})();
