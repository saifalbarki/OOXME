(() => {
  const status = document.querySelector('[data-coexistence-status]');
  const button = document.querySelector('[data-coexistence-start]');
  let configuration; let signupCode = ''; let signupResult = null; let submitted = false;
  const setStatus = (text, failed = false) => { status.textContent = text; status.dataset.status = failed ? 'error' : 'ready'; };
  const loadSdk = () => new Promise((resolve, reject) => {
    if (window.FB) return resolve();
    const script = document.createElement('script'); script.src = 'https://connect.facebook.net/en_US/sdk.js'; script.async = true;
    script.onload = resolve; script.onerror = () => reject(new Error('Meta SDK failed to load')); document.head.append(script);
  });
  const complete = async () => {
    if (submitted || !signupCode || !signupResult) return;
    submitted = true; button.disabled = true; setStatus('Finishing the secure Meta connection…');
    try {
      const response = await fetch('/api/whatsapp/coexistence/complete', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ code: signupCode, wabaId: signupResult.waba_id, phoneNumberId: signupResult.phone_number_id }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Connection could not be completed');
      setStatus(body.existingIntegrationMatches ? 'Connected. The existing Cloud API configuration matches this number.' : 'Connected. Update the server-side Phone Number ID and WABA ID before sending production messages.');
    } catch (_) { submitted = false; button.disabled = false; setStatus('Meta completed, but the server could not finalize the connection. Check the server configuration and try again.', true); }
  };
  window.addEventListener('message', (event) => {
    if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return;
    let data; try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch (_) { return; }
    if (data?.type !== 'WA_EMBEDDED_SIGNUP') return;
    if (['FINISH', 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'].includes(data.event) && data.data?.waba_id && data.data?.phone_number_id) { signupResult = data.data; complete(); }
    if (data.event === 'CANCEL') setStatus('The Meta onboarding flow was cancelled.', true);
    if (data.event === 'ERROR') setStatus('Meta could not start Coexistence onboarding. Check the app’s Embedded Signup configuration.', true);
  });
  button.addEventListener('click', async () => {
    try {
      button.disabled = true; setStatus('Opening Meta’s secure WhatsApp Business App connection flow…');
      configuration ||= await fetch('/api/whatsapp/coexistence/config', { headers: { Accept: 'application/json' } }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); return body; });
      await loadSdk(); window.FB.init({ appId: configuration.appId, cookie: true, xfbml: false, version: configuration.graphApiVersion });
      window.FB.login((result) => { button.disabled = false; signupCode = result?.authResponse?.code || ''; if (!signupCode) { setStatus('Meta did not return an onboarding code. Complete the Coexistence option in the popup and try again.', true); return; } setStatus('Meta authorization received. Waiting for the selected WhatsApp Business App number…'); complete(); }, { config_id: configuration.configId, response_type: 'code', override_default_response_type: true, extras: { featureType: 'whatsapp_business_app_onboarding', sessionInfoVersion: '3' } });
    } catch (_) { button.disabled = false; setStatus('This onboarding page is not configured yet.', true); }
  });
})();
