(() => {
  const panel = document.querySelector('.employee-dashboard-panel');
  if (!panel) return;
  if (panel.dataset.accountProfilePollingBound) return;
  panel.dataset.accountProfilePollingBound = 'true';
  let lastSnapshot = '';
  let pollTimer = null;
  let loading = false;
  const load = async () => {
    if (loading) return;
    loading = true;
    const response = await fetch('/api/accounts/profile', { credentials: 'same-origin' });
    if (!response.ok) { loading = false; return; }
    const account = await response.json();
    const snapshot = JSON.stringify(account);
    if (snapshot === lastSnapshot) { loading = false; return; }
    lastSnapshot = snapshot;
    const client = account.account_type === 'client';
    const name = client ? account.client_display_name : account.employee_display_name;
    const role = client ? account.company_name : account.job_title;
    const details = panel.querySelector('.employee-dashboard-info-card');
    const labels = details?.querySelectorAll(':scope > strong,:scope > span');
    if (labels?.[0]) labels[0].textContent = name || '—';
    if (labels?.[1]) labels[1].textContent = role || '—';
    if (labels?.[2]) labels[2].textContent = account.display_code || '—';
    const inputs = details?.querySelectorAll('.employee-dashboard-edit-form input');
    if (inputs?.[0]) inputs[0].value = name || '';
    if (inputs?.[1]) inputs[1].value = account.username || '';
    const status = panel.querySelector('.employee-dashboard-status i');
    if (status) status.setAttribute('aria-label', `Status ${account.status || 'unknown'}`);
    loading = false;
  };
  const refresh = () => load().catch(() => { loading = false; });
  const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } };
  const startPolling = () => { stopPolling(); if (!document.hidden) { refresh(); pollTimer = setInterval(refresh, 15_000); } };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPolling(); else startPolling(); });
  startPolling();
})();
