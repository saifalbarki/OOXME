    (() => {
      const root = document.documentElement;
      const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      const syncStandaloneBottomInset = () => {
        if (!isStandaloneApp) return;
        const viewport = window.visualViewport;
        const activeField = document.activeElement;
        // Fixed-position elements use the layout viewport. The root element can
        // be sized by 100dvh in standalone mode, so clientHeight is not a stable
        // substitute for the fixed-position containing block. Keep both sides
        // of this calculation in the same viewport coordinate system.
        const layoutHeight = window.innerHeight || document.documentElement.clientHeight || root.getBoundingClientRect().height;
        const visibleBottom = viewport ? Math.min(layoutHeight, viewport.offsetTop + viewport.height) : layoutHeight;
        const keyboardOpen = Boolean(viewport && activeField?.matches?.('input, textarea, select, [contenteditable="true"]') && viewport.height < layoutHeight - 120);
        const inset = keyboardOpen ? 0 : Math.max(0, layoutHeight - visibleBottom);
        root.style.setProperty('--os-visual-bottom-inset', `${inset}px`);
      };
        syncStandaloneBottomInset();
        window.addEventListener('resize', syncStandaloneBottomInset, { passive: true });
        document.addEventListener('focusin', syncStandaloneBottomInset, { passive: true });
        document.addEventListener('focusout', () => window.setTimeout(syncStandaloneBottomInset, 0), { passive: true });
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', syncStandaloneBottomInset, { passive: true });
          window.visualViewport.addEventListener('scroll', syncStandaloneBottomInset, { passive: true });
        }
      const hugeIconAssetRoot = 'assets/icons/hugeicons/';
      const setHugeIcon = (element, file) => {
        element.replaceChildren();
        const icon = document.createElement('span');
        icon.className = 'os-hugeicon';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.webkitMaskImage = `url("${hugeIconAssetRoot}${file}")`;
        icon.style.maskImage = `url("${hugeIconAssetRoot}${file}")`;
        element.append(icon);
      };
      const serverAuthState = root.dataset.osAuthState === 'authenticated';
      const themeColor = document.querySelector('[data-os-theme-color]');
      const statusBarStyle = document.querySelector('[data-os-status-bar-style]');
      const authGate = document.querySelector('[data-os-auth-gate]');
      const authForm = document.querySelector('[data-os-auth-form]');
      const authInput = authForm.querySelector('input[name="password"]');
      const authError = document.querySelector('[data-os-auth-error]');
      const authUserField = document.createElement('div');
      authUserField.className = 'os-auth-field';
      const authUser = document.createElement('input');
      authUser.type = 'text'; authUser.name = 'user'; authUser.autocomplete = 'username'; authUser.placeholder = 'User'; authUser.setAttribute('aria-label', 'User');
      authUserField.append(authUser);
      authInput.before(authUserField);
      const authPassword = document.createElement('div');
      authPassword.className = 'os-auth-field os-auth-password';
      authInput.before(authPassword);
      authPassword.append(authInput);
      const authEye = document.createElement('button');
      authEye.type = 'button'; authEye.className = 'os-auth-eye'; authEye.setAttribute('aria-label', 'Show password');
      setHugeIcon(authEye, 'view-off-slash.svg');
      authPassword.append(authEye);
      const authComposition = document.createElement('div');
      authComposition.className = 'os-auth-composition';
      const authSeparator = document.createElement('div');
      authSeparator.className = 'os-auth-separator'; authSeparator.setAttribute('aria-hidden', 'true');
      authSeparator.innerHTML = '<span class="os-auth-panel-line"></span>';
      authComposition.append(authSeparator, authForm);
      authGate.append(authComposition);
      const renderPasswordIcon = () => { const visible = authInput.type === 'text'; authEye.dataset.visible = String(visible); setHugeIcon(authEye, visible ? 'view.svg' : 'view-off-slash.svg'); };
      renderPasswordIcon();
      authEye.addEventListener('click', () => { authInput.type = authInput.type === 'text' ? 'password' : 'text'; renderPasswordIcon(); authEye.setAttribute('aria-label', authInput.type === 'text' ? (root.lang === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (root.lang === 'ar' ? 'إظهار كلمة المرور' : 'Show password')); authInput.focus(); });
      const authErrorMessages = {
        invalid: { en: 'Invalid password', ar: 'كلمة المرور غير صحيحة' },
        locked: { en: 'Try again later', ar: 'حاول مرة أخرى لاحقًا' }
      };
      const clearAuthError = () => {
        delete authInput.dataset.authError;
        authError.textContent = '';
        authInput.placeholder = root.lang === 'ar' ? 'كلمة المرور' : 'Password';
      };
      const showAuthError = (kind) => {
        const message = authErrorMessages[kind] || authErrorMessages.invalid;
        const text = message[root.lang === 'ar' ? 'ar' : 'en'];
        authInput.dataset.authError = kind;
        authInput.placeholder = text;
        authError.textContent = text;
      };
      authUser.addEventListener('input', clearAuthError);
      authInput.addEventListener('input', clearAuthError);
      let csrfToken = root.dataset.csrfToken || '';
      const setAuthenticated = (authenticated) => {
        document.body.classList.toggle('os-authenticated', authenticated);
        root.dataset.osAuthState = authenticated ? 'authenticated' : 'pending';
        root.dataset.osAuthReady = 'true';
        authGate.hidden = authenticated;
      };
      const osFetch = async (url, options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', headers.get('Accept') || 'application/json');
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(String(options.method || 'GET').toUpperCase()) && csrfToken) headers.set('X-CSRF-Token', csrfToken);
        const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });
        if (response.status === 401) { csrfToken = ''; setAuthenticated(false); }
        return response;
      };
      const initializeAuth = async () => {
        if (serverAuthState) { setAuthenticated(true); return true; }
        try {
          const response = await fetch('/api/os/auth', { headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' });
          const body = await response.json();
          if (body.data?.authenticated) { csrfToken = body.data.csrfToken || ''; setAuthenticated(true); return true; }
          setAuthenticated(false);
          return false;
        } catch (_) {
          setAuthenticated(false);
          return false;
        }
      };
      const adminForm = document.querySelector('[data-os-admin-form]');
      const adminStatus = document.querySelector('[data-os-admin-status]');
      const adminFields = Object.fromEntries([...adminForm.querySelectorAll('[data-admin-field]')].map((field) => [field.dataset.adminField, field]));
      authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearAuthError();
        const submit = authForm.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
          const response = await fetch('/api/os/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ action: 'login', user: authUser.value, password: authInput.value })
          });
          const body = await response.json();
          if (!response.ok) throw new Error(body.error || 'authentication_failed');
          authInput.value = '';
          csrfToken = body.data?.csrfToken || '';
          setAuthenticated(true);
        } catch (error) {
          showAuthError(error.message === 'login_temporarily_locked' ? 'locked' : 'invalid');
        } finally {
          submit.disabled = false;
        }
      });
      adminForm.querySelectorAll('[data-admin-password-toggle]').forEach((toggle) => {
        const field = adminFields[toggle.dataset.adminPasswordToggle];
        const render = () => {
          const visible = field.type === 'text';
          toggle.dataset.visible = String(visible);
          setHugeIcon(toggle, visible ? 'view.svg' : 'view-off-slash.svg');
          toggle.setAttribute('aria-label', visible ? (root.lang === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (root.lang === 'ar' ? 'إظهار كلمة المرور' : 'Show password'));
        };
        render();
        toggle.addEventListener('click', () => { field.type = field.type === 'text' ? 'password' : 'text'; render(); field.focus(); });
      });
      adminForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        adminStatus.textContent = '';
        delete adminStatus.dataset.state;
        if (String(adminFields.newPassword.value) !== String(adminFields.confirmPassword.value) || String(adminFields.newPassword.value).length < 12) {
          adminStatus.dataset.state = 'error';
          adminStatus.textContent = root.lang === 'ar' ? 'حدث خطأ' : 'An error occurred';
          return;
        }
        const submit = adminForm.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
          const response = await osFetch('/api/os/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'change_credentials', user: adminFields.user.value, currentPassword: adminFields.currentPassword.value, newPassword: adminFields.newPassword.value, confirmPassword: adminFields.confirmPassword.value }) });
          if (!response.ok) throw new Error('credential_change_failed');
          adminStatus.dataset.state = 'success';
          adminStatus.textContent = root.lang === 'ar' ? 'تم التغيير بنجاح' : 'Changed successfully';
          adminForm.reset();
          csrfToken = '';
          window.setTimeout(() => { adminStatus.textContent = ''; delete adminStatus.dataset.state; setAuthenticated(false); setPanelOpen(false); setMenuOpen(false); }, 900);
        } catch (_) {
          adminStatus.dataset.state = 'error';
          adminStatus.textContent = root.lang === 'ar' ? 'حدث خطأ' : 'An error occurred';
        } finally {
          submit.disabled = false;
        }
      });
      void initializeAuth();
      const addButton = document.querySelector('[data-os-add]');
      const sideMenu = document.querySelector('[data-os-side-menu], #os-side-menu');
      const menuTrigger = document.querySelector('.os-menu-trigger-icon');
      if (menuTrigger) {
        menuTrigger.style.webkitMaskImage = `url("${hugeIconAssetRoot}menu-09.svg")`;
        menuTrigger.style.maskImage = `url("${hugeIconAssetRoot}menu-09.svg")`;
      }
      const menuIconAssets = Object.freeze({
        Summary: { name: 'Dashboard Browsing', file: 'dashboard-browsing.svg' },
        Insights: { name: 'Analytics 01', file: 'analytics-01.svg' },
        Notifications: { name: 'Notification 01', file: 'notification-01.svg' },
        'Promo Codes': { name: 'Badge Percent', file: 'badge-percent.svg' },
        Consultations: { name: 'Property New', file: 'property-new.svg' },
        Products: { name: 'Shopping Bag 03', file: 'shopping-bag-03.svg' },
        Buttons: { name: 'Stop Circle', file: 'stop-circle.svg' },
        Admin: { name: 'Shield 01', file: 'shield-01.svg' },
        Language: { name: 'Language Circle', file: 'language-circle.svg' },
        Appearance: { name: 'Dark Mode', file: 'dark-mode.svg' },
        'Log Out': { name: 'Logout 01', file: 'logout-01.svg' }
      });
      const decorateMenuIcons = () => {
        sideMenu.querySelectorAll('[data-os-menu-copy-en]').forEach((item) => {
          if (item.querySelector('.os-menu-icon')) return;
          const iconAsset = menuIconAssets[item.dataset.osMenuCopyEn];
          if (!iconAsset) return;
          const label = document.createElement('span');
          label.className = 'os-menu-label';
          label.textContent = item.textContent.trim();
          const icon = document.createElement('span');
          icon.classList.add('os-menu-icon');
          icon.setAttribute('aria-hidden', 'true');
          icon.dataset.hugeiconsName = iconAsset.name;
          icon.style.webkitMaskImage = `url("${hugeIconAssetRoot}${iconAsset.file}")`;
          icon.style.maskImage = `url("${hugeIconAssetRoot}${iconAsset.file}")`;
          item.replaceChildren(icon, label);
        });
      };
      const panel = document.querySelector('[data-os-copy-en]');
      const panelHandle = document.querySelector('.os-panel-handle');
      const insights = document.querySelector('.os-insights');
      const notifications = document.querySelector('.os-notifications');
      const notificationAdd = document.createElement('div');
      notificationAdd.className = 'os-notification-add';
      notificationAdd.hidden = true;
      panel.append(notificationAdd);
      const promoCodes = document.createElement('div');
      promoCodes.className = 'os-promo-codes';
      promoCodes.hidden = true;
      panel.append(promoCodes);
      const products = document.createElement('div');
      products.className = 'os-products'; products.hidden = true; panel.append(products);
      const consultations = document.createElement('div');
      consultations.className = 'os-consultations'; consultations.hidden = true; panel.append(consultations);
      const buttons = document.createElement('div');
      buttons.className = 'os-buttons-shell'; buttons.hidden = true; document.body.append(buttons);
      const adminShell = document.querySelector('[data-os-admin]');
      const panelCopy = document.querySelector('.os-panel-copy');
      const uptimeLabel = document.querySelector('[data-os-metric-en="Uptime"]');
      if (uptimeLabel && !uptimeLabel.parentElement.querySelector('[data-os-metric-value="uptime"]')) {
        const uptimeValue = document.createElement('dd');
        uptimeValue.className = 'os-insights-metric-value';
        uptimeValue.dataset.osMetricValue = 'uptime';
        uptimeValue.textContent = 'Unknown';
        uptimeLabel.parentElement.append(uptimeValue);
      }
      const versionLabel = document.querySelector('[data-os-metric-en="Version"]');
      if (versionLabel && !versionLabel.parentElement.querySelector('[data-os-metric-value="version"]')) {
        const versionValue = document.createElement('dd');
        versionValue.className = 'os-insights-metric-value';
        versionValue.dataset.osMetricValue = 'version';
        versionValue.textContent = 'Unknown';
        versionLabel.parentElement.append(versionValue);
      }
      panel.dataset.osView = 'summary';
      const insightsMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Insights');
      if (insightsMenuItem) insightsMenuItem.dataset.osMenuAction = 'insights';
      const notificationsMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Notifications');
      if (notificationsMenuItem) notificationsMenuItem.dataset.osMenuAction = 'notifications';
      const promoCodesMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Promo Codes');
      if (promoCodesMenuItem) promoCodesMenuItem.dataset.osMenuAction = 'promo-codes';
      const productsMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Products');
      if (productsMenuItem) productsMenuItem.dataset.osMenuAction = 'products';
      const consultationsMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Consultations');
      if (consultationsMenuItem) consultationsMenuItem.dataset.osMenuAction = 'consultations';
      const buttonsMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Buttons');
      if (buttonsMenuItem) buttonsMenuItem.dataset.osMenuAction = 'buttons';
      const adminMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Admin');
      if (adminMenuItem) adminMenuItem.dataset.osMenuAction = 'admin';
      const logoutMenuItem = [...sideMenu.querySelectorAll('[data-os-menu-copy-en]')].find((item) => item.dataset.osMenuCopyEn === 'Log Out');
      if (logoutMenuItem) logoutMenuItem.dataset.osMenuAction = 'logout';
      sideMenu.insertAdjacentHTML('afterbegin', '<button type="button" data-os-menu-copy-en="Summary" data-os-menu-copy-ar="الملخص" data-os-menu-action="summary">Summary</button>');
      decorateMenuIcons();
      panel.insertAdjacentHTML('beforeend', '<div class="os-summary-content"><span class="os-summary-percentage" data-os-summary-response data-available="false" aria-label="Response unavailable"><svg class="os-summary-response-svg" viewBox="0 0 300 180" aria-hidden="true"><defs><linearGradient id="os-summary-response-gradient" x1="0" y1="180" x2="300" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="var(--os-response-start)"/><stop offset="48%" stop-color="var(--os-response-mid)"/><stop offset="100%" stop-color="var(--os-response-end)"/></linearGradient></defs><text class="os-summary-response-text" x="150" y="112"><tspan data-os-summary-response-number>—</tspan><tspan class="os-summary-response-unit" data-os-summary-unit-en="ms" data-os-summary-unit-ar="ملي ثانية" aria-hidden="true"> ms</tspan></text></svg></span><div class="os-summary-indicators" aria-hidden="true"><div class="os-summary-indicator"><span data-os-summary-en="Consultations Today" data-os-summary-ar="استشارات اليوم">Consultations Today</span><span class="os-summary-indicator-value">0</span></div><div class="os-summary-indicator"><span data-os-summary-en="Products / Orders" data-os-summary-ar="المنتجات / الطلبات">Products / Orders</span><span class="os-summary-indicator-value">0</span></div><div class="os-summary-indicator"><span data-os-summary-en="Promo Code Uses" data-os-summary-ar="استخدامات الرموز الترويجية">Promo Code Uses</span><span class="os-summary-indicator-value">0</span></div></div></div>');
      const summaryIndicators = panel.querySelector('.os-summary-indicators');
      if (summaryIndicators) {
        summaryIndicators.replaceChildren(...[
          ['Visitors', 'الزوار', 'visitors'],
          ['Online', 'اونلاين', 'online'],
          ['Site Status', 'حالة الموقع', 'site-status']
        ].map(([english, arabic, key]) => {
          const row = document.createElement('div');
          row.className = 'os-summary-indicator';
          const label = document.createElement('span');
          label.dataset.osSummaryEn = english;
          label.dataset.osSummaryAr = arabic;
          label.textContent = english;
          const value = document.createElement('span');
          value.className = 'os-summary-indicator-value';
          value.dataset.osSummaryValue = key;
          value.textContent = 'Unavailable';
          row.append(label, value);
          return row;
        }));
      }
      const summaryContent = document.querySelector('.os-summary-content');
      const summaryResponseValue = document.querySelector('[data-os-summary-response]');
      const summaryResponseNumber = document.querySelector('[data-os-summary-response-number]');
      const summaryResponseUnit = document.querySelector('.os-summary-response-unit');
      const panelViews = { summary: summaryContent, insights, notifications, 'promo-codes': promoCodes, products, consultations, buttons, 'notification-add': notificationAdd };
      const panelViewNodes = (selector) => Object.values(panelViews).flatMap((view) => [...view.querySelectorAll(selector)]);
      let panelView = 'summary';
      let latestInsightsData = null;
      let latestSummaryData = null;
      let summaryLoadRun = 0;
      let summaryController = null;
      let notificationsData = [];
      let promoCodesData = [];
      let insightsLoadRun = 0;
      let insightsController = null;
      let notificationsLoadRun = 0;
      let notificationsController = null;
      let promoCodesLoadRun = 0;
      let promoCodesController = null;
      let productsData = [];
      let productEditor = null;
      let productImageDraft = '';
      let productCarouselScrollLeft = 0;
      let consultationsData = [];
      let consultationsExpandedId = null;
      let buttonsData = [];
      let notificationEditor = null;
      let promoEditor = null;
      let notificationExpandedId = null;
      let promoCodeExpandedId = null;
      const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
      const plusIcon = () => '<span class="os-plus" aria-hidden="true"></span>';
      const localDateTime = (value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return { date: '', time: '' };
        const pad = (number) => String(number).padStart(2, '0');
        return { date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, time: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
      };
      const notificationLabel = (notification, field) => notification[field]?.[root.lang === 'ar' ? 'ar' : 'en'] || notification[field]?.en || '';
      const renderNotificationForm = (notification) => {
        const current = notification || { title: { en: '', ar: '' }, text: { en: '', ar: '' }, publishAt: new Date().toISOString(), status: 'active', frequency: 'once' };
        const schedule = localDateTime(current.publishAt);
        return `<form class="os-notification-form" data-notification-form>
          <div class="os-notification-form-grid"><label><input name="titleEn" data-field-language="en" lang="en" dir="ltr" autocomplete="off" required aria-label="English Title" placeholder="English Title" value="${escapeHtml(current.title.en)}"></label><label><input name="titleAr" data-field-language="ar" lang="ar" dir="rtl" autocomplete="off" aria-label="Arabic Title" placeholder="العنوان" value="${escapeHtml(current.title.ar)}"></label></div>
          <div class="os-notification-form-grid"><label><textarea name="textEn" data-field-language="en" lang="en" dir="ltr" autocomplete="off" required aria-label="English Text" placeholder="English Text">${escapeHtml(current.text.en)}</textarea></label><label><textarea name="textAr" data-field-language="ar" lang="ar" dir="rtl" autocomplete="off" aria-label="Arabic Text" placeholder="النص">${escapeHtml(current.text.ar)}</textarea></label></div>
          <div class="os-notification-form-grid"><label><input type="date" name="publishDate" required aria-label="Publish Date" placeholder="Publish Date" value="${schedule.date}"></label><label><input type="time" name="publishTime" required aria-label="Publish Time" placeholder="Publish Time" value="${schedule.time}"></label></div>
          <div class="os-notification-form-grid"><label><select name="frequency" aria-label="Repeat / frequency"><option value="once" ${current.frequency === 'once' ? 'selected' : ''}>Once</option><option value="daily" ${current.frequency === 'daily' ? 'selected' : ''}>Daily</option><option value="weekly" ${current.frequency === 'weekly' ? 'selected' : ''}>Weekly</option></select></label><label><select name="status" aria-label="Status"><option value="active" ${current.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${current.status === 'inactive' ? 'selected' : ''}>Inactive</option></select></label></div>
          <div class="os-notification-form-actions"><button class="os-notification-main-action" type="button" data-notification-action="cancel">Cancel</button><button class="os-notification-main-action" type="submit">Save</button></div>
        </form>`;
      };
      const renderPromoForm = (promo) => {
        const current = promo || { code: '', status: 'active', discountType: 'percentage', discountValue: '', currency: 'USD', startsAt: '', endsAt: '', totalUsageLimit: null, perCustomerLimit: null, serviceRestrictions: [], durationRestrictions: [], campaignSource: '' };
        const percentage = current.discountType ? current.discountType === 'percentage' : String(current.discount || '').endsWith('%');
        const value = current.discountValue ?? String(current.discount || '').replace(/%$/, '').trim().split(' ')[0];
        const dateValue = (input) => input ? String(input).slice(0, 10) : '';
        const serviceRestrictions = Array.isArray(current.serviceRestrictions) ? current.serviceRestrictions.join(', ') : '';
        const durationRestrictions = Array.isArray(current.durationRestrictions) ? current.durationRestrictions.join(', ') : '';
        return `<form class="os-notification-form" data-promo-form>
          <div class="os-notification-form-grid"><label><input name="code" required aria-label="Promo Code" placeholder="Promo Code" value="${escapeHtml(current.code)}"></label><label><input name="discountValue" type="number" min="0" step="0.01" required aria-label="Discount Value" placeholder="Discount Value" value="${escapeHtml(value)}"></label></div>
          <div class="os-notification-form-grid"><label><select name="discountType" aria-label="Discount Type"><option value="percentage" ${percentage ? 'selected' : ''}>Percentage</option><option value="fixed" ${percentage ? '' : 'selected'}>Fixed</option></select></label><label><input name="currency" maxlength="3" aria-label="Currency" placeholder="Currency" value="${escapeHtml(current.currency || 'USD')}"></label></div>
          <div class="os-notification-form-grid"><label><input name="startsAt" type="date" aria-label="Starts Date" placeholder="Starts Date" value="${dateValue(current.startsAt)}"></label><label><input name="endsAt" type="date" aria-label="Ends Date" placeholder="Ends Date" value="${dateValue(current.endsAt)}"></label></div>
          <div class="os-notification-form-grid"><label><input name="totalUsageLimit" type="number" min="0" step="1" aria-label="Total Usage Limit" placeholder="Total Usage Limit" value="${current.totalUsageLimit == null ? '' : escapeHtml(current.totalUsageLimit)}"></label><label><input name="perCustomerLimit" type="number" min="0" step="1" aria-label="Per Customer Limit" placeholder="Per Customer Limit" value="${current.perCustomerLimit == null ? '' : escapeHtml(current.perCustomerLimit)}"></label></div>
          <div class="os-notification-form-grid"><label><input name="serviceRestrictions" aria-label="Applies To" placeholder="Applies To" value="${escapeHtml(serviceRestrictions)}"></label><label><input name="durationRestrictions" aria-label="Durations in Minutes" placeholder="Durations in Minutes" value="${escapeHtml(durationRestrictions)}"></label></div>
          <div class="os-notification-form-grid"><label><select name="status" aria-label="Status"><option value="active" ${current.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${current.status !== 'active' ? 'selected' : ''}>Inactive</option></select></label><span aria-hidden="true"></span></div>
          <div class="os-notification-form-actions"><button class="os-notification-main-action" type="button" data-promo-action="cancel">Cancel</button><button class="os-notification-main-action" type="submit">Save</button></div>
        </form>`;
      };
      const renderManagementEmptyState = (copy) => `<div class="os-management-empty-state">${escapeHtml(copy)}</div>`;
      const renderNotifications = () => {
        const isArabic = root.lang === 'ar';
        const list = notificationsData.map((notification) => {
          const selected = notificationExpandedId === notification.id;
          const title = escapeHtml(notificationLabel(notification, 'title') || '');
          return `<li class="os-notification-row${selected ? ' is-selected' : ''}" data-notification-id="${escapeHtml(notification.id)}"><div class="os-notification-title-row"><span class="os-notification-title">${title}</span><span class="os-notification-status-dot" data-status="${notification.status}" aria-label="${notification.status}"></span></div>${selected ? `<div class="os-notification-detail"><div class="os-management-action-row"><button class="os-notification-main-action" type="button" data-notification-action="edit">${isArabic ? 'تحرير' : 'Edit'}</button><button class="os-notification-main-action" type="button" data-notification-action="toggle">${notification.status === 'active' ? (isArabic ? 'تعطيل' : 'Disable') : (isArabic ? 'تفعيل' : 'Enable')}</button><button class="os-notification-main-action" type="button" data-notification-action="delete">${isArabic ? 'حذف' : 'Delete'}</button></div></div>` : ''}</li>`;
        }).join('');
        const isEditing = Boolean(notificationEditor?.form);
        const editingNotification = notificationEditor?.id ? notificationsData.find((item) => item.id === notificationEditor.id) : null;
        notifications.innerHTML = isEditing
          ? renderNotificationForm(editingNotification)
          : `<div class="os-notification-content"><ul class="os-notification-list">${list}</ul>${!notificationsData.length ? renderManagementEmptyState(isArabic ? 'لا توجد إشعارات محفوظة' : 'No saved notifications') : ''}</div><button class="os-notification-main-action os-notification-main-action--floating" type="button" data-notification-action="new">${plusIcon()}${isArabic ? 'إشعار جديد' : 'Add Notification'}</button>`;
      };
      const renderNotificationAdd = () => {
        notificationAdd.innerHTML = renderNotificationForm(null);
      };
      const renderPromoCodes = () => {
        const isArabic = root.lang === 'ar';
        const labels = isArabic
          ? { available: 'المتاح', usage: 'الاستخدام', discount: 'الخصم', applies: 'ينطبق على', delete: 'حذف', empty: 'لا توجد أكواد خصم محفوظة' }
          : { available: 'Available', usage: 'Usage', discount: 'Discount', applies: 'Applies to', delete: 'Delete', empty: 'No saved promo codes' };
        const rows = promoCodesData.map((promo) => {
          const selected = promoCodeExpandedId === promo.id;
          const available = promo.availableCount == null ? (isArabic ? 'غير محدود' : 'Unlimited') : String(promo.availableCount);
          const usage = String(promo.usageCount ?? 0);
          const applies = promo.appliesTo === 'all consultations' && isArabic ? 'جميع الاستشارات' : promo.appliesTo;
          return `<li class="os-promo-row${selected ? ' is-selected' : ''}" data-promo-code-id="${escapeHtml(promo.id)}"><div class="os-promo-title-row"><span class="os-promo-code">${escapeHtml(promo.code)}</span><span class="os-promo-status-dot" data-status="${escapeHtml(promo.status)}" aria-label="${escapeHtml(promo.status)}"></span></div>${selected ? `<div class="os-promo-detail"><div class="os-promo-detail-grid"><span class="os-promo-detail-item"><span class="os-promo-detail-label">${labels.available}</span><span class="os-promo-detail-value">${escapeHtml(available)}</span></span><span class="os-promo-detail-item"><span class="os-promo-detail-label">${labels.usage}</span><span class="os-promo-detail-value">${escapeHtml(usage)}</span></span><span class="os-promo-detail-item"><span class="os-promo-detail-label">${labels.discount}</span><span class="os-promo-detail-value">${escapeHtml(promo.discount)}</span></span><span class="os-promo-detail-item"><span class="os-promo-detail-label">${labels.applies}</span><span class="os-promo-detail-value">${escapeHtml(applies)}</span></span></div><div class="os-management-action-row"><button class="os-notification-main-action" type="button" data-promo-action="edit">Edit</button><button class="os-notification-main-action" type="button" data-promo-action="toggle">${promo.status === 'active' ? 'Disable' : 'Enable'}</button><button class="os-notification-main-action os-promo-delete" type="button" data-promo-action="delete">${labels.delete}</button></div></div>` : ''}</li>`;
        }).join('');
        promoCodes.innerHTML = promoEditor ? renderPromoForm(promoCodesData.find((item) => item.id === promoEditor.id)) : `<ul class="os-promo-list">${rows}</ul>${!promoCodesData.length ? renderManagementEmptyState(labels.empty) : ''}<button class="os-notification-main-action os-notification-main-action--floating" type="button" data-management-action="promo-new">${plusIcon()}${isArabic ? 'إضافة رمز خصم' : 'Add Promo Code'}</button>`;
      };
      const loadPromoCodes = async () => {
        const run = ++promoCodesLoadRun;
        if (promoCodesController) promoCodesController.abort();
        const controller = new AbortController();
        promoCodesController = controller;
        try {
          const response = await osFetch('/api/os/promo-codes', { cache: 'no-store', signal: controller.signal });
          if (!response.ok) throw new Error('promo_codes_unavailable');
          const data = (await response.json()).data?.promoCodes || [];
          if (run !== promoCodesLoadRun || panelView !== 'promo-codes') return;
          promoCodesData = data;
        } catch (_) {
          if (run !== promoCodesLoadRun || controller.signal.aborted || panelView !== 'promo-codes') return;
          promoCodesData = [];
        } finally {
          if (promoCodesController === controller) promoCodesController = null;
        }
        if (run === promoCodesLoadRun && panelView === 'promo-codes') renderPromoCodes();
      };
      const productText = (item, field, ar) => item?.[field]?.[ar ? 'ar' : 'en'] || item?.[field]?.en || '';
      const productImage = (item, ar, upload = false) => item?.imageData
        ? `<img class="os-product-image" src="${escapeHtml(item.imageData)}" alt="${escapeHtml(productText(item, 'name', ar))}">${upload ? `<button class="os-product-upload" type="button" data-product-action="choose-image" aria-label="${ar ? 'تغيير الصورة' : 'Change image'}"></button>` : ''}`
        : upload
          ? `<button class="os-product-upload" type="button" data-product-action="choose-image" aria-label="${ar ? 'إضافة صورة' : 'Add image'}"><span class="os-product-image-placeholder"><strong aria-hidden="true"><span class="os-plus" aria-hidden="true"></span></strong></span></button>`
          : '<span class="os-product-image-empty" aria-hidden="true"></span>';
      const renderProductForm = (item) => {
        const ar = root.lang === 'ar';
        const current = item || { name: { en: '', ar: '' }, category: { en: '', ar: '' }, description: { en: '', ar: '' }, price: { amount: '', currency: 'USD', label: { en: '', ar: '' } }, status: 'active', slug: '', imageData: '' };
        const afterDiscount = current.price.afterDiscount || { amount: '', label: { en: '', ar: '' } };
        return `<form class="os-product-form" data-product-form>
          <div class="os-product-image-wrap"><input class="os-product-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden>${productImage(current, ar, true)}</div>
          <div class="os-product-form-grid"><label><input name="slug" required autocomplete="off" placeholder="${ar ? 'الرابط المختصر' : 'Slug'}" aria-label="${ar ? 'الرابط المختصر' : 'Slug'}" value="${escapeHtml(current.slug)}"></label><label><select name="status" aria-label="${ar ? 'الحالة' : 'Status'}"><option value="active" ${current.status === 'active' ? 'selected' : ''}>${ar ? 'نشط' : 'Active'}</option><option value="inactive" ${current.status === 'inactive' ? 'selected' : ''}>${ar ? 'غير نشط' : 'Inactive'}</option></select></label></div>
          <div class="os-product-form-grid"><label><input name="nameEn" data-field-language="en" lang="en" dir="ltr" required autocomplete="off" placeholder="English Name" aria-label="English Name" value="${escapeHtml(current.name.en)}"></label><label><input name="nameAr" data-field-language="ar" lang="ar" dir="rtl" required autocomplete="off" placeholder="الاسم بالعربية" aria-label="الاسم بالعربية" value="${escapeHtml(current.name.ar)}"></label></div>
          <div class="os-product-form-grid"><label><input name="categoryEn" data-field-language="en" lang="en" dir="ltr" required autocomplete="off" placeholder="English Category" aria-label="English Category" value="${escapeHtml(current.category.en)}"></label><label><input name="categoryAr" data-field-language="ar" lang="ar" dir="rtl" required autocomplete="off" placeholder="الفئة بالعربية" aria-label="الفئة بالعربية" value="${escapeHtml(current.category.ar)}"></label></div>
          <div class="os-product-form-grid"><label><textarea name="descriptionEn" data-field-language="en" lang="en" dir="ltr" required placeholder="English Description" aria-label="English Description">${escapeHtml(current.description.en)}</textarea></label><label><textarea name="descriptionAr" data-field-language="ar" lang="ar" dir="rtl" required placeholder="الوصف بالعربية" aria-label="الوصف بالعربية">${escapeHtml(current.description.ar)}</textarea></label></div>
          <div class="os-product-form-grid"><label><input name="priceAmount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="${ar ? 'السعر الفعلي' : 'Actual Price'}" aria-label="${ar ? 'السعر الفعلي' : 'Actual Price'}" value="${current.price.amount == null ? '' : escapeHtml(current.price.amount)}"></label><label><input class="os-product-price-discount" name="priceAfterDiscountAmount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="${ar ? 'السعر بعد الخصم' : 'Price After Discount'}" aria-label="${ar ? 'السعر بعد الخصم' : 'Price After Discount'}" value="${afterDiscount.amount == null ? '' : escapeHtml(afterDiscount.amount)}"></label></div>
          <div class="os-product-form-actions"><button class="os-notification-main-action" type="button" data-product-action="cancel">${ar ? 'إلغاء' : 'Cancel'}</button><button class="os-notification-main-action" type="submit">${ar ? 'حفظ' : 'Save'}</button></div>
        </form>`;
      };
      const renderProductSlide = (item, ar) => `<article class="os-product-slide" data-product-id="${escapeHtml(item.id)}"><div class="os-product-image-wrap">${productImage(item, ar)}</div><div class="os-product-details"><div class="os-product-detail"><span class="os-product-detail-value">${escapeHtml(productText(item, 'name', ar) || item.slug)}</span></div><div class="os-product-detail"><span class="os-product-detail-value">${escapeHtml(productText(item, 'category', ar))}</span></div><div class="os-product-detail"><span class="os-product-detail-value">${escapeHtml(productText(item, 'description', ar))}</span></div><div class="os-product-detail"><span class="os-product-detail-value">${escapeHtml(item.price?.label?.[ar ? 'ar' : 'en'] || item.status)}</span></div><div class="os-product-detail"><span class="os-product-detail-value os-product-price-discount">${escapeHtml((item.price?.afterDiscount?.label?.[ar ? 'ar' : 'en'] || item.price?.afterDiscount?.amount) ?? '—')}</span></div></div><div class="os-product-actions"><button class="os-notification-main-action" type="button" data-product-action="edit">${ar ? 'تعديل' : 'Edit'}</button><button class="os-notification-main-action" type="button" data-product-action="toggle-status">${item.status === 'active' ? (ar ? 'تعطيل' : 'Disable') : (ar ? 'تفعيل' : 'Enable')}</button></div></article>`;
      const renderProducts = () => {
        const ar = root.lang === 'ar';
        const current = productEditor?.id ? productsData.find((item) => item.id === productEditor.id) : null;
        const addSlide = productEditor ? `<article class="os-product-slide">${renderProductForm(productEditor.mode === 'new' ? { ...(current || { name: { en: '', ar: '' }, category: { en: '', ar: '' }, description: { en: '', ar: '' }, price: { amount: '', currency: 'USD', label: { en: '', ar: '' }, afterDiscount: null }, status: 'active', slug: '' }), imageData: productImageDraft } : { ...current, imageData: productImageDraft })}</article>` : `<article class="os-product-slide"><div class="os-product-image-wrap"><button class="os-product-upload" type="button" data-product-action="choose-image" aria-label="${ar ? 'إضافة صورة' : 'Add image'}"><span class="os-product-image-placeholder"><strong aria-hidden="true"><span class="os-plus" aria-hidden="true"></span></strong></span></button></div><button class="os-notification-main-action os-notification-main-action--floating" type="button" data-product-action="new">${plusIcon()}${ar ? 'إضافة' : 'Add Product'}</button></article>`;
        const slides = productEditor ? addSlide : `${addSlide}${productsData.map((item) => renderProductSlide(item, ar)).join('')}`;
        products.innerHTML = `<div class="os-products-track" data-product-track>${slides}</div><input class="os-product-image-input" data-product-image-input type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden>`;
        const track = products.querySelector('[data-product-track]');
        if (track) {
          track.addEventListener('scroll', () => { productCarouselScrollLeft = track.scrollLeft; }, { passive: true });
          if (!productEditor && productCarouselScrollLeft > 0) window.requestAnimationFrame(() => { track.scrollLeft = productCarouselScrollLeft; });
        }
      };
      const loadProducts = async () => { try { const response = await osFetch('/api/os/products', { cache: 'no-store' }); if (!response.ok) throw new Error(); productsData = (await response.json()).data?.products || []; } catch (_) { productsData = []; } renderProducts(); };
      const renderConsultations = () => {
        const ar = root.lang === 'ar';
        const labels = ar
          ? { new: 'جديد', done: 'منجز', approve: 'موافقة', reject: 'رفض', delete: 'حذف', empty: 'لا توجد استشارات', reference: 'المرجع', date: 'التاريخ', time: 'الوقت', duration: 'المدة', service: 'الخدمة', topic: 'الموضوع', sector: 'القطاع', price: 'السعر الأصلي', promo: 'رمز الخصم', discount: 'الخصم', finalAmount: 'المبلغ النهائي', currency: 'العملة', email: 'البريد', phone: 'الهاتف', notes: 'ملاحظات', payment: 'طريقة الدفع', timezone: 'المنطقة الزمنية', bookingLanguage: 'لغة الحجز', calendar: 'معرّف التقويم', created: 'تاريخ الإنشاء', updated: 'آخر تحديث', confirmed: 'تاريخ التأكيد' }
          : { new: 'New', done: 'Done', approve: 'Approve', reject: 'Reject', delete: 'Delete', empty: 'No consultations', reference: 'Reference', date: 'Date', time: 'Time', duration: 'Duration', service: 'Service', topic: 'Topic', sector: 'Sector', price: 'Original price', promo: 'Promo code', discount: 'Discount', finalAmount: 'Final amount', currency: 'Currency', email: 'Email', phone: 'Phone', notes: 'Notes', payment: 'Payment method', timezone: 'Timezone', bookingLanguage: 'Booking language', calendar: 'Calendar event', created: 'Created', updated: 'Updated', confirmed: 'Confirmed' };
        const hasValue = (value) => value !== null && value !== undefined && value !== '';
        const escapeValue = (value) => escapeHtml(value);
        const formatDate = (value) => {
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(ar ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' });
        };
        const formatTime = (value) => {
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString(ar ? 'ar' : 'en', { hour: 'numeric', minute: '2-digit' });
        };
        const formatDateTime = (value) => {
          const date = formatDate(value); const time = formatTime(value);
          return date && time ? `${date} · ${time}` : date || time;
        };
        const formatMoney = (value, currency) => hasValue(value) && Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)} ${currency || ''}`.trim() : '';
        const detail = (label, value) => hasValue(value) ? `<span class="os-consultation-detail-item"><span class="os-consultation-detail-label">${label}</span><span class="os-consultation-detail-value">${escapeValue(value)}</span></span>` : '';
        const rows = consultationsData.map((item) => {
          const expanded = consultationsExpandedId === item.id;
          const isDone = ['confirmed', 'cancelled', 'failed'].includes(item.status);
          const state = isDone ? 'done' : 'new';
          const status = isDone ? labels.done : labels.new;
          const details = [
            detail(labels.reference, item.reference),
            detail(labels.date, formatDate(item.scheduledStart)),
            detail(labels.time, item.scheduledStart ? `${formatTime(item.scheduledStart)}${item.scheduledEnd ? ` – ${formatTime(item.scheduledEnd)}` : ''}` : ''),
            detail(labels.duration, hasValue(item.durationMinutes) ? `${item.durationMinutes} min` : ''),
            detail(labels.service, item.service),
            detail(labels.topic, item.topic),
            detail(labels.sector, item.sector),
            detail(labels.price, formatMoney(item.baseAmount, item.currency)),
            detail(labels.promo, item.promoCode),
            detail(labels.discount, formatMoney(item.discountAmount, item.currency)),
            detail(labels.finalAmount, formatMoney(item.finalAmount, item.currency)),
            detail(labels.currency, item.currency),
            detail(labels.email, item.customer?.email),
            detail(labels.phone, item.customer?.phone),
            detail(labels.payment, item.paymentProvider),
            detail(labels.notes, item.notes),
            detail(labels.timezone, item.timezone),
            detail(labels.bookingLanguage, item.bookingLanguage),
            detail(labels.calendar, item.calendarEventId),
            detail(labels.created, formatDateTime(item.createdAt)),
            detail(labels.updated, formatDateTime(item.updatedAt)),
            detail(labels.confirmed, formatDateTime(item.confirmedAt))
          ].join('');
          return `<li class="os-consultation-row${expanded ? ' is-selected' : ''}" data-consultation-id="${escapeHtml(item.id)}"><div class="os-consultation-title-row" role="button" tabindex="0" aria-expanded="${expanded}"><span class="os-consultation-heading"><span class="os-consultation-name">${escapeValue(item.customer?.name || item.reference)}</span></span><span class="os-consultation-status" data-state="${state}">${status}</span></div>${expanded ? `<div class="os-consultation-detail"><div class="os-consultation-details">${details}</div><div class="os-consultation-actions"><button class="os-notification-main-action" type="button" data-consultation-action="approve">${labels.approve}</button><button class="os-notification-main-action" type="button" data-consultation-action="reject">${labels.reject}</button><button class="os-notification-main-action" type="button" data-consultation-action="delete">${labels.delete}</button></div></div>` : ''}</li>`;
        }).join('');
        consultations.innerHTML = `<ul class="os-consultation-list">${rows || `<li class="os-management-empty-state os-management-empty-state--consultations">${labels.empty}</li>`}</ul>`;
      };
      const loadConsultations = async () => { try { const response = await osFetch('/api/os/consultations', { cache: 'no-store' }); if (!response.ok) throw new Error(); consultationsData = (await response.json()).data?.consultations || []; } catch (_) { consultationsData = []; } renderConsultations(); };
      const controlPageName = (page, language = root.lang) => {
        const names = language === 'ar'
          ? { Homepage: 'الرئيسية', Gallery: 'المعرض', 'Brand Management': 'العلامة', RPN: 'RPN', Consultation: 'الاستشارة', Store: 'المتجر', Update: 'التحديث' }
          : { Homepage: 'Home', Gallery: 'Gallery', 'Brand Management': 'Brand', RPN: 'RPN', Consultation: 'Consultation', Store: 'Store', Update: 'Update' };
        return names[page] || String(page || (root.lang === 'ar' ? 'صفحة' : 'Page')).split(/\s+/)[0];
      };
      const controlSectionName = (item) => {
        const key = String(item.actionKey || '').toLowerCase();
        if (key === 'main-update-1') return root.lang === 'ar' ? 'الأول' : 'First';
        if (key === 'main-rpn') return root.lang === 'ar' ? 'الثاني' : 'Second';
        if (key === 'main-gallery') return root.lang === 'ar' ? 'المعرض' : 'Gallery';
        if (key.startsWith('main-')) return root.lang === 'ar' ? 'التواصل' : 'Contact';
        if (key.startsWith('gallery-')) return root.lang === 'ar' ? 'المشاريع' : 'Projects';
        if (key === 'bm-view') return root.lang === 'ar' ? 'الرئيسي' : 'Main';
        if (key.startsWith('bm-')) return root.lang === 'ar' ? 'التنقل' : 'Navigation';
        if (key === 'rpn-faq') return 'FAQ';
        if (key.startsWith('rpn-')) return root.lang === 'ar' ? 'التقديم' : 'Application';
        if (key.startsWith('consultation-')) return root.lang === 'ar' ? 'النموذج' : 'Form';
        if (key.startsWith('store-') || key.startsWith('update-')) return root.lang === 'ar' ? 'التنقل' : 'Navigation';
        return root.lang === 'ar' ? 'الرئيسي' : 'Main';
      };
      const controlPurpose = (item) => {
        const key = String(item.actionKey || '').toLowerCase();
        if (root.lang !== 'ar') return String(item.label || '').trim() || 'Button';
        const labels = {
          'main-update-1': 'فتح التحديث', 'main-rpn': 'فتح RPN', 'main-gallery': 'فتح المعرض', 'main-consultation': 'حجز استشارة',
          'main-phone': 'هاتف', 'main-email': 'بريد إلكتروني', 'main-whatsapp': 'واتساب', 'main-instagram': 'إنستغرام', 'main-facebook': 'فيسبوك', 'main-linkedin': 'لينكدإن',
          'bm-view': 'عرض', 'bm-prev': 'السابق', 'bm-next': 'التالي', 'rpn-faq': 'أسئلة شائعة', 'rpn-email': 'إرسال بريد', 'rpn-join': 'انضمام',
          'gallery-alfares': 'صور مشروع ألفارس', 'gallery-alsibtain': 'صور مشروع السبطين', 'gallery-velvet-flora': 'صور فيلفت فلورا', 'gallery-zone': 'صور مشروع زون', 'gallery-sada-al-riwaq': 'صور صدى الرواق',
          'consultation-send': 'إرسال رسالة', 'consultation-language': 'تبديل اللغة', 'consultation-apply': 'تقديم', 'consultation-zaincash': 'زين كاش', 'consultation-superqi': 'سوبر كي', 'consultation-confirm': 'تأكيد',
          'store-prev': 'المنتج السابق', 'store-next': 'المنتج التالي', 'update-prev': 'البطاقة السابقة', 'update-next': 'البطاقة التالية'
        };
        return labels[key] || String(item.label || '').trim() || 'زر';
      };
      let buttonsPageFrame = 0;
      const updateButtonsPageState = () => {
        if (buttonsPageFrame) return;
        buttonsPageFrame = window.requestAnimationFrame(() => {
          buttonsPageFrame = 0;
          const track = buttons.querySelector('.os-buttons-track');
          const slides = [...buttons.querySelectorAll('.os-buttons-slide')];
          if (!track || !slides.length) return;
          const center = track.getBoundingClientRect().left + (track.clientWidth / 2);
          let closest = slides[0];
          let closestDistance = Infinity;
          slides.forEach((slide) => {
            const rect = slide.getBoundingClientRect();
            const distance = Math.abs((rect.left + (rect.width / 2)) - center);
            if (distance < closestDistance) { closest = slide; closestDistance = distance; }
          });
          slides.forEach((slide) => slide.setAttribute('aria-current', slide === closest ? 'true' : 'false'));
        });
      };
      const renderButtons = () => {
        const noControls = root.lang === 'ar' ? 'لا توجد أزرار قابلة للإدارة' : 'No managed buttons';
        const groups = new Map();
        buttonsData.forEach((item, index) => {
          const pageKey = String(item.page || '').trim() || '__unassigned__';
          const group = groups.get(pageKey) || { pageKey, firstIndex: index, items: [] };
          group.items.push(item);
          groups.set(pageKey, group);
        });
        const orderedGroups = [...groups.values()]
          .sort((a, b) => {
            const aHomepage = a.pageKey.toLowerCase() === 'homepage';
            const bHomepage = b.pageKey.toLowerCase() === 'homepage';
            if (aHomepage !== bHomepage) return aHomepage ? -1 : 1;
            return (a.items.length - b.items.length) || (a.firstIndex - b.firstIndex);
          });
        const slides = orderedGroups.map((group) => {
          const pageNameEn = controlPageName(group.pageKey, 'en');
          const pageNameAr = controlPageName(group.pageKey, 'ar');
          const rows = group.items.map((item) => { const purpose = controlPurpose(item); const textDirection = root.lang === 'ar' ? 'rtl' : 'ltr'; return `<li class="os-control-row"><span class="os-control-zone os-control-zone--name"><span class="os-control-name" dir="auto">${escapeHtml(controlPageName(item.page))} — ${escapeHtml(controlSectionName(item))}</span></span><a class="os-control-zone os-control-zone--route os-control-route" href="${escapeHtml(item.route || '#')}" dir="${textDirection}" aria-label="${escapeHtml(purpose)}"><span class="os-control-section" dir="${textDirection}">${escapeHtml(purpose)}</span></a><span class="os-control-zone os-control-zone--toggle"><button class="os-control-toggle" type="button" data-control-key="${escapeHtml(item.actionKey)}" data-control-version="${item.version || 1}" aria-pressed="${item.enabled}" aria-label="${escapeHtml((item.enabled ? (root.lang === 'ar' ? 'تعطيل ' : 'Disable ') : (root.lang === 'ar' ? 'تفعيل ' : 'Enable ')) + purpose)}"></button></span></li>`; }).join('');
          return `<section class="os-buttons-slide" data-page-key="${escapeHtml(group.pageKey)}" aria-label="${escapeHtml(root.lang === 'ar' ? pageNameAr : pageNameEn)}"><ul class="os-control-list">${rows}</ul></section>`;
        }).join('') || `<section class="os-buttons-slide" aria-label="${escapeHtml(noControls)}"><ul class="os-control-list os-control-list--empty"><li class="os-management-empty-state os-management-empty-state--buttons">${noControls}</li></ul></section>`;
        buttons.innerHTML = `<span class="os-buttons-divider" aria-hidden="true"></span><div class="os-buttons-track">${slides}</div>`;
        buttons.querySelector('.os-buttons-track')?.addEventListener('scroll', updateButtonsPageState, { passive: true });
        updateButtonsPageState();
      };
      const loadButtons = async () => { try { const response = await osFetch('/api/os/page-controls', { cache: 'no-store' }); if (!response.ok) throw new Error(); buttonsData = (await response.json()).data?.controls || []; } catch (_) { buttonsData = []; } renderButtons(); };
      const syncBilingualDirection = (field) => {
        if (!field.matches('[data-field-language]')) return;
        const hasArabic = /[\u0600-\u06ff]/.test(field.value);
        const language = hasArabic ? 'ar' : field.dataset.fieldLanguage;
        field.dataset.fieldLanguage = language;
        field.lang = language;
        field.dir = language === 'ar' ? 'rtl' : 'ltr';
      };
      let keyboardShift = 0;
      let lastVisualViewportHeight = window.visualViewport?.height || window.innerHeight;
      const clearKeyboardShift = () => {
        keyboardShift = 0;
        root.style.removeProperty('--os-keyboard-shift');
      };
      const keepNotificationInputVisible = (event) => {
        const field = event?.target?.closest?.('input, textarea, select, [contenteditable="true"]') || document.activeElement;
        if (!field || !field.matches?.('input, textarea, select, [contenteditable="true"]')) return;
        window.setTimeout(() => {
          const viewport = window.visualViewport;
          if (!viewport || document.activeElement !== field) return;
          const top = viewport.offsetTop;
          const bottom = viewport.height + viewport.offsetTop;
          const rect = field.getBoundingClientRect();
          const requiredShift = Math.max(0, rect.bottom - (bottom - 18));
          if (!requiredShift) return;
          const maximumShift = Math.max(0, rect.top - (top + 18));
          const nextShift = Math.min(keyboardShift + requiredShift, maximumShift);
          if (nextShift <= keyboardShift) return;
          keyboardShift = nextShift;
          root.style.setProperty('--os-keyboard-shift', `${-keyboardShift}px`);
        }, 80);
      };
      const handleVisualViewportResize = () => {
        const viewport = window.visualViewport;
        if (!viewport) return;
        const heightGrew = viewport.height > lastVisualViewportHeight + 2;
        lastVisualViewportHeight = viewport.height;
        if (heightGrew) { clearKeyboardShift(); setFocusZoomLock(false); }
        window.requestAnimationFrame(() => keepNotificationInputVisible());
      };
      const handleFormFocusOut = () => {
        window.setTimeout(() => {
          if (!document.activeElement?.matches?.('input, textarea, select, [contenteditable="true"]')) clearKeyboardShift();
        }, 120);
      };
      const fieldSelector = 'input, textarea, select, [contenteditable="true"]';
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const viewportMetaContent = viewportMeta?.getAttribute('content') || '';
      const isTouchViewport = () => matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
      const setFocusZoomLock = (locked) => {
        if (!viewportMeta || !isTouchViewport()) return;
        viewportMeta.setAttribute('content', locked ? `${viewportMetaContent}, maximum-scale=1` : viewportMetaContent);
      };
      const handleFieldFocusIn = (event) => {
        if (!event.target.matches?.(fieldSelector)) return;
        setFocusZoomLock(true);
        window.setTimeout(() => keepNotificationInputVisible({ target: event.target }), 80);
      };
      const handleFieldFocusOut = () => {
        handleFormFocusOut();
        window.setTimeout(() => { if (!document.activeElement?.matches?.(fieldSelector)) setFocusZoomLock(false); }, 120);
      };
      const loadNotifications = async () => {
        const run = ++notificationsLoadRun;
        if (notificationsController) notificationsController.abort();
        const controller = new AbortController();
        notificationsController = controller;
        try {
          const response = await osFetch('/api/os/notifications', { cache: 'no-store', signal: controller.signal });
          if (!response.ok) throw new Error('notifications_unavailable');
          const data = (await response.json()).data?.notifications || [];
          if (run !== notificationsLoadRun || panelView !== 'notifications') return;
          notificationsData = data;
        } catch (_) {
          if (run !== notificationsLoadRun || controller.signal.aborted || panelView !== 'notifications') return;
          notificationsData = [];
        } finally {
          if (notificationsController === controller) notificationsController = null;
        }
        if (run === notificationsLoadRun && panelView === 'notifications') renderNotifications();
      };
      const saveNotification = async (form, action, id) => {
        const wasAdding = notificationEditor?.mode === 'new';
        const data = new FormData(form);
        const publishAt = `${data.get('publishDate')}T${data.get('publishTime')}`;
        const currentNotification = id ? notificationsData.find((item) => item.id === id) : null;
        const response = await osFetch('/api/os/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ action, id, version: currentNotification?.version, idempotencyKey: action === 'create' ? notificationEditor?.idempotencyKey : undefined, titleEn: data.get('titleEn'), titleAr: data.get('titleAr'), textEn: data.get('textEn'), textAr: data.get('textAr'), publishAt, frequency: data.get('frequency'), status: data.get('status') }) });
        if (!response.ok) throw new Error('notification_save_failed');
        notificationEditor = null;
        if (wasAdding) { notificationExpandedId = null; setPanelView('notifications'); }
        await loadNotifications();
      };
      const formatRelativeTime = (value, isArabic) => {
        const timestamp = Date.parse(value || '');
        if (!Number.isFinite(timestamp)) return isArabic ? 'غير متاح' : 'Unavailable';
        const elapsed = timestamp - Date.now();
        const absolute = Math.abs(elapsed);
        const units = [[31536000000, 'year'], [2592000000, 'month'], [604800000, 'week'], [86400000, 'day'], [3600000, 'hour'], [60000, 'minute'], [1000, 'second']];
        const [size, unit] = units.find(([milliseconds]) => absolute >= milliseconds) || [1000, 'second'];
        const amount = Math.round(elapsed / size);
        if (typeof Intl.RelativeTimeFormat === 'function') return new Intl.RelativeTimeFormat(isArabic ? 'ar' : 'en', { numeric: 'auto' }).format(amount, unit);
        return isArabic ? `${Math.abs(amount)} ${unit}` : `${Math.abs(amount)}${unit[0]} ago`;
      };
      const setInsightsStatus = (data) => {
        latestInsightsData = data;
        const isArabic = root.lang === 'ar';
        const services = data?.services || {};
        insights.querySelectorAll('[data-os-service-en]').forEach((name) => {
          const provider = services[name.dataset.osServiceEn] || { status: 'unknown' };
          const dot = name.parentElement.querySelector('.os-insights-status');
          dot.dataset.status = ['operational', 'attention', 'unavailable', 'unknown'].includes(provider.status) ? provider.status : 'unknown';
          dot.setAttribute('aria-label', `${name.dataset.osServiceEn}: ${provider.status}`);
        });
        const statuses = Object.values(services).map((provider) => provider.status);
        const databaseOperational = data?.database?.status === 'operational';
        const systemDescription = insights.querySelector('[data-os-system-description-en]');
        if (!systemDescription) return;
        if (statuses.length && statuses.every((status) => status === 'operational')) {
          systemDescription.textContent = isArabic ? 'تعمل جميع الخدمات المتصلة بصورة طبيعية.' : 'All connected services are operating normally.';
        } else if (statuses.some((status) => status === 'unknown' || status === 'unavailable')) {
          systemDescription.textContent = isArabic ? 'بعض تكاملات الخدمات غير متاحة.' : 'Some service integrations are unavailable.';
        } else {
          systemDescription.textContent = databaseOperational
            ? (isArabic ? 'قاعدة بيانات PostgreSQL متصلة، وحالة الخدمات غير متاحة.' : 'PostgreSQL is connected; service status is unavailable.')
            : (isArabic ? 'لا تتوفر بيانات مباشرة للخدمات المتصلة.' : 'Live service status is not connected.');
        }
        const websiteDescription = insights.querySelector('[data-os-website-description-en]');
        if (!websiteDescription) return;
        const response = data?.website?.response;
        websiteDescription.textContent = response && Number(data?.website?.responseStatus) >= 200 && Number(data?.website?.responseStatus) < 400
          ? (isArabic ? 'يعمل الموقع بصورة طبيعية، وتم قياس الاستجابة مباشرة.' : 'Website is operating normally; response was measured live.')
          : (isArabic ? 'بيانات الموقع المباشرة غير متصلة.' : 'Live website telemetry is not connected.');
        const values = data?.website || {};
        const uptimeValue = values.uptimeState === 'monitoring'
          ? (isArabic ? `قيد المراقبة · ${values.uptimeSamples || 0}/${values.uptimeRequiredSamples || 12} عينات` : `Monitoring · ${values.uptimeSamples || 0}/${values.uptimeRequiredSamples || 12} samples`)
          : values.uptime || (Number.isFinite(Number(values.uptimeSamples)) ? (isArabic ? `غير متاح · ${values.uptimeSamples}/288 عينات` : `Unavailable · ${values.uptimeSamples}/288 samples`) : null);
        const valueMap = { 'last-update': formatRelativeTime(values.lastUpdate, isArabic), uptime: uptimeValue, response: values.response, version: values.version ? String(values.version).slice(0, 7) : null };
        insights.querySelectorAll('[data-os-metric-value]').forEach((item) => {
          const value = valueMap[item.dataset.osMetricValue];
          item.textContent = value || (isArabic ? 'غير متاح' : 'Unavailable');
        });
      };
      const setSummaryMetrics = (data) => {
        latestSummaryData = data || null;
        const isArabic = root.lang === 'ar';
        const unavailable = isArabic ? 'غير متاح' : 'Unavailable';
        const hasNumber = (value) => value !== null && value !== undefined && Number.isFinite(Number(value));
        const statusLabels = isArabic
          ? { active: 'نشط', down: 'متوقف', degraded: 'متدهور' }
          : { active: 'Active', down: 'Down', degraded: 'Degraded' };
        const values = {
          visitors: hasNumber(data?.visitors) ? String(Math.max(0, Number(data.visitors))) : unavailable,
          online: hasNumber(data?.online) ? String(Math.max(0, Number(data.online))) : unavailable,
          'site-status': statusLabels[data?.siteStatus] || unavailable
        };
        summaryContent.querySelectorAll('[data-os-summary-value]').forEach((item) => {
          item.textContent = values[item.dataset.osSummaryValue] || unavailable;
        });
      };
      const loadSummaryMetrics = async () => {
        const run = ++summaryLoadRun;
        if (summaryController) summaryController.abort();
        const controller = new AbortController();
        summaryController = controller;
        try {
          const response = await osFetch('/api/os/insights?mode=summary', { cache: 'no-store', signal: controller.signal });
          if (!response.ok) throw new Error('summary_unavailable');
          const data = (await response.json()).data;
          if (run !== summaryLoadRun || panelView !== 'summary') return;
          setSummaryMetrics(data);
        } catch (_) {
          if (run !== summaryLoadRun || controller.signal.aborted || panelView !== 'summary') return;
          setSummaryMetrics(null);
        } finally {
          if (summaryController === controller) summaryController = null;
        }
      };
      const loadInsights = async () => {
        const run = ++insightsLoadRun;
        if (insightsController) insightsController.abort();
        const controller = new AbortController();
        insightsController = controller;
        try {
          const response = await osFetch('/api/os/insights', { cache: 'no-store', signal: controller.signal });
          if (!response.ok) throw new Error('insights_unavailable');
          const data = (await response.json()).data;
          if (run !== insightsLoadRun || panelView !== 'insights') return;
          setInsightsStatus(data);
        } catch (_) {
          if (run !== insightsLoadRun || controller.signal.aborted || panelView !== 'insights') return;
          setInsightsStatus({ services: {}, website: {} });
        } finally {
          if (insightsController === controller) insightsController = null;
        }
      };
      const summaryResponseInterval = 2500;
      let summaryResponseTimer = 0;
      let summaryResponseController = null;
      let summaryResponseRun = 0;
      const setSummaryResponse = (responseMs) => {
        const value = Number(responseMs);
        if (!Number.isFinite(value) || value < 0) {
          if (summaryResponseValue.dataset.available !== 'true') {
            summaryResponseNumber.textContent = '—';
            summaryResponseValue.setAttribute('aria-label', root.lang === 'ar' ? 'الاستجابة غير متاحة' : 'Response unavailable');
          }
          return;
        }
        const rounded = Math.round(value);
        summaryResponseNumber.textContent = String(rounded);
        summaryResponseValue.dataset.available = 'true';
        summaryResponseValue.setAttribute('aria-label', `${rounded} ${root.lang === 'ar' ? 'ملي ثانية' : 'ms'}`);
      };
      const stopSummaryResponsePolling = () => {
        summaryResponseRun += 1;
        if (summaryResponseTimer) window.clearTimeout(summaryResponseTimer);
        summaryResponseTimer = 0;
        if (summaryResponseController) summaryResponseController.abort();
        summaryResponseController = null;
      };
      const requestSummaryResponse = async () => {
        if (panelView !== 'summary' || !panel.classList.contains('is-expanded') || summaryResponseController) return;
        const run = summaryResponseRun;
        const controller = new AbortController();
        summaryResponseController = controller;
        try {
          const response = await osFetch('/api/os/insights?mode=response', { cache: 'no-store', signal: controller.signal });
          if (response.ok) {
            const body = await response.json();
            if (body.data?.isUp && Number.isFinite(Number(body.data.responseMs))) setSummaryResponse(body.data.responseMs);
            else setSummaryResponse(null);
          }
        } catch (_) {
          if (!controller.signal.aborted) setSummaryResponse(null);
        } finally {
          if (summaryResponseController === controller) summaryResponseController = null;
          if (run === summaryResponseRun && panelView === 'summary' && panel.classList.contains('is-expanded') && !summaryResponseController) {
            summaryResponseTimer = window.setTimeout(requestSummaryResponse, summaryResponseInterval);
          }
        }
      };
      const startSummaryResponsePolling = () => {
        stopSummaryResponsePolling();
        void requestSummaryResponse();
      };
      const setPanelView = (view) => {
        const isAdmin = view === 'admin';
        panelView = isAdmin || ['insights', 'notifications', 'promo-codes', 'products', 'consultations', 'buttons', 'notification-add'].includes(view) ? view : 'summary';
        adminShell.hidden = !isAdmin;
        adminShell.classList.toggle('is-menu-obscured', sideMenu.classList.contains('is-open'));
        if (panelView !== 'summary') {
          stopSummaryResponsePolling();
          summaryLoadRun += 1;
          summaryController?.abort();
        }
        if (panelView !== 'insights') { insightsLoadRun += 1; insightsController?.abort(); }
        if (panelView !== 'notifications') { notificationsLoadRun += 1; notificationsController?.abort(); }
        if (panelView !== 'promo-codes') { promoCodesLoadRun += 1; promoCodesController?.abort(); }
        Object.entries(panelViews).forEach(([name, content]) => {
          const active = name === panelView;
          content.hidden = !active;
          content.setAttribute('aria-hidden', String(!active || (!panel.classList.contains('is-expanded') && name !== 'buttons')));
        });
        panel.dataset.osView = panelView;
        panel.dataset.osCopyEn = ({ summary: 'Today Summary', insights: 'Insights', notifications: 'Notifications', 'promo-codes': 'Promo Code', products: 'Products', consultations: 'Consultations', buttons: 'Buttons', 'notification-add': 'Add Notification', admin: 'Admin' })[panelView];
        panel.dataset.osCopyAr = ({ summary: 'ملخص اليوم', insights: 'التحليلات', notifications: 'الإشعارات', 'promo-codes': 'رمز الخصم', products: 'المنتجات', consultations: 'الاستشارات', buttons: 'الأزرار', 'notification-add': 'إضافة إشعار', admin: 'الإدارة' })[panelView];
        panelCopy.textContent = root.lang === 'ar' ? panel.dataset.osCopyAr : panel.dataset.osCopyEn;
        setLanguage(root.lang);
        if (panelView === 'summary') void loadSummaryMetrics();
        if (panelView === 'insights') void loadInsights();
        if (panelView === 'notifications') void loadNotifications();
        if (panelView === 'promo-codes') void loadPromoCodes();
        if (panelView === 'products') void loadProducts();
        if (panelView === 'consultations') void loadConsultations();
        if (panelView === 'buttons') void loadButtons();
        if (panelView === 'notification-add') renderNotificationAdd();
      };
      const setLanguage = (language) => {
        const isArabic = language === 'ar';
        root.lang = isArabic ? 'ar' : 'en';
        root.dir = isArabic ? 'rtl' : 'ltr';
        document.body.dir = root.dir;
        summaryResponseUnit.textContent = isArabic ? ' ملي ثانية' : ' ms';
        authUser.placeholder = isArabic ? 'المستخدم' : 'User';
        authUser.setAttribute('aria-label', isArabic ? 'المستخدم' : 'User');
        authInput.placeholder = authInput.dataset.authError
          ? authErrorMessages[authInput.dataset.authError]?.[isArabic ? 'ar' : 'en'] || (isArabic ? 'كلمة المرور' : 'Password')
          : (isArabic ? 'كلمة المرور' : 'Password');
        authInput.setAttribute('aria-label', isArabic ? 'كلمة المرور' : 'Admin password');
        authForm.querySelector('button[type="submit"]').textContent = isArabic ? 'تسجيل الدخول' : 'Log In';
        authEye.setAttribute('aria-label', authInput.type === 'text' ? (isArabic ? 'إخفاء كلمة المرور' : 'Hide password') : (isArabic ? 'إظهار كلمة المرور' : 'Show password'));
        const adminLabels = isArabic
          ? { user: 'مستخدم جديد', currentPassword: 'كلمة المرور الحالية', newPassword: 'كلمة المرور الجديدة', confirmPassword: 'تأكيد كلمة المرور الجديدة', submit: 'تغيير بيانات الدخول', success: 'تم التغيير بنجاح', error: 'حدث خطأ' }
          : { user: 'New User', currentPassword: 'Current Password', newPassword: 'New Password', confirmPassword: 'Confirm New Password', submit: 'Change Credentials', success: 'Changed successfully', error: 'An error occurred' };
        Object.entries(adminFields).forEach(([name, field]) => { field.placeholder = adminLabels[name]; field.setAttribute('aria-label', adminLabels[name]); });
        adminForm.querySelector('button[type="submit"]').textContent = adminLabels.submit;
        if (adminStatus.dataset.state) adminStatus.textContent = adminStatus.dataset.state === 'success' ? adminLabels.success : adminLabels.error;
        panelCopy.textContent = panelView === 'summary'
          ? (isArabic ? 'ملخص اليوم' : 'Today Summary')
          : panelView === 'insights'
            ? (isArabic ? 'التحليلات' : 'Insights')
          : panelView === 'promo-codes'
            ? (isArabic ? 'رمز الخصم' : 'Promo Code')
            : panelView === 'products'
              ? (isArabic ? 'المنتجات' : 'Products')
              : panelView === 'consultations'
                ? (isArabic ? 'الاستشارات' : 'Consultations')
              : panelView === 'buttons'
                ? (isArabic ? 'الأزرار' : 'Buttons')
          : panelView === 'notification-add'
              ? (isArabic ? 'إضافة إشعار' : 'Add Notification')
              : panelView === 'admin'
                ? (isArabic ? 'الإدارة' : 'Admin')
              : (isArabic ? 'الإشعارات' : 'Notifications');
        document.querySelectorAll('[data-os-menu-copy-en]').forEach((item) => { (item.querySelector('.os-menu-label') || item).textContent = isArabic ? item.dataset.osMenuCopyAr : item.dataset.osMenuCopyEn; });
        panelViewNodes('[data-os-insights-en], [data-os-service-en], [data-os-metric-en], [data-os-summary-en]').forEach((item) => {
          const prefix = item.dataset.osSummaryEn !== undefined
            ? 'osSummary'
            : item.dataset.osInsightsEn !== undefined
              ? 'osInsights'
              : item.dataset.osServiceEn !== undefined ? 'osService' : 'osMetric';
          item.textContent = isArabic ? item.dataset[`${prefix}Ar`] : item.dataset[`${prefix}En`];
        });
        panelViewNodes('[data-os-system-description-en], [data-os-website-description-en]').forEach((item) => {
          item.textContent = isArabic ? item.dataset.osWebsiteDescriptionAr || item.dataset.osSystemDescriptionAr : item.dataset.osWebsiteDescriptionEn || item.dataset.osSystemDescriptionEn;
        });
        panelViewNodes('[data-os-metric-value]').forEach((item) => { item.textContent = isArabic ? 'غير متاح' : 'Unknown'; });
        if (latestSummaryData) setSummaryMetrics(latestSummaryData);
        if (latestInsightsData && panelView === 'insights') setInsightsStatus(latestInsightsData);
        if (panelView === 'notifications') renderNotifications();
        if (panelView === 'promo-codes') renderPromoCodes();
        if (panelView === 'products') renderProducts();
        if (panelView === 'consultations') renderConsultations();
        if (panelView === 'buttons') renderButtons();
        if (panelView === 'notification-add') renderNotificationAdd();
        try { localStorage.setItem('ooxme-os-language', isArabic ? 'ar' : 'en'); } catch (_) {}
      };
      const setTheme = (theme) => {
        const isDark = theme === 'dark';
        root.dataset.theme = isDark ? 'dark' : 'light';
        themeColor?.setAttribute('content', isDark ? '#000000' : '#ffffff');
        statusBarStyle?.setAttribute('content', isDark ? 'black-translucent' : 'default');
        try { localStorage.setItem('ooxme-os-theme', isDark ? 'dark' : 'light'); } catch (_) {}
      };
      sideMenu.addEventListener('click', (event) => {
        const actionItem = event.target.closest('[data-os-menu-action]');
        if (!actionItem) return;
        if (actionItem.dataset.osMenuAction === 'language') setLanguage(root.lang === 'ar' ? 'en' : 'ar');
        if (actionItem.dataset.osMenuAction === 'appearance') setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
        if (actionItem.dataset.osMenuAction === 'summary') { setPanelView('summary'); setPanelOpen(false); setMenuOpen(false); }
        if (actionItem.dataset.osMenuAction === 'insights') { setPanelView('insights'); setPanelOpen(true); setMenuOpen(false); }
        if (actionItem.dataset.osMenuAction === 'notifications') { setPanelView('notifications'); setPanelOpen(true); setMenuOpen(false); }
        if (actionItem.dataset.osMenuAction === 'promo-codes') { setPanelView('promo-codes'); setPanelOpen(true); setMenuOpen(false); }
        if (actionItem.dataset.osMenuAction === 'products') { setPanelView('products'); setPanelOpen(true); setMenuOpen(false); }
        if (actionItem.dataset.osMenuAction === 'consultations') { setPanelView('consultations'); setPanelOpen(true); setMenuOpen(false); }
        if (actionItem.dataset.osMenuAction === 'buttons') { setPanelView('buttons'); setPanelOpen(false); setMenuOpen(false); }
         if (actionItem.dataset.osMenuAction === 'admin') { setPanelView('admin'); setPanelOpen(false); setMenuOpen(false); }
        if (actionItem.dataset.osMenuAction === 'logout') void (async () => { try { await osFetch('/api/os/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }); } finally { csrfToken = ''; setAuthenticated(false); setPanelOpen(false); setMenuOpen(false); } })();
      });
      buttons.addEventListener('click', async (event) => { const control = event.target.closest('[data-control-key]'); if (!control) return; const next = control.getAttribute('aria-pressed') !== 'true'; const response = await osFetch('/api/os/page-controls', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actionKey: control.dataset.controlKey, version: Number(control.dataset.controlVersion), enabled: next }) }); if (response.ok) await loadButtons(); });
      products.addEventListener('click', async (event) => {
        const control = event.target.closest('[data-product-action]');
        const action = control?.dataset.productAction;
        if (!action) return;
        const row = event.target.closest('[data-product-id]');
        if (action === 'new') { productEditor = { mode: 'new', id: null, idempotencyKey: window.crypto?.randomUUID?.() || String(Date.now()) }; productImageDraft = ''; productCarouselScrollLeft = 0; renderProducts(); return; }
        if (action === 'cancel') { const wasEditingExisting = productEditor?.mode === 'edit' && productEditor.id; productEditor = null; productImageDraft = ''; if (!wasEditingExisting) productCarouselScrollLeft = 0; renderProducts(); return; }
        if (action === 'choose-image') { products.querySelector('[data-product-image-input]')?.click(); return; }
        if (!row) return;
        if (action === 'edit') { productCarouselScrollLeft = products.querySelector('[data-product-track]')?.scrollLeft || productCarouselScrollLeft; productEditor = { mode: 'edit', id: row.dataset.productId }; productImageDraft = productsData.find((item) => item.id === row.dataset.productId)?.imageData || ''; renderProducts(); return; }
        if (action === 'toggle-status') {
          const item = productsData.find((entry) => entry.id === row.dataset.productId);
          if (!item) return;
          const response = await osFetch('/api/os/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id: item.id, version: item.version, slug: item.slug, nameEn: item.name.en, nameAr: item.name.ar, categoryEn: item.category.en, categoryAr: item.category.ar, descriptionEn: item.description.en, descriptionAr: item.description.ar, priceAmount: item.price.amount, priceCurrency: item.price.currency, priceLabelEn: item.price.label.en, priceLabelAr: item.price.label.ar, priceAfterDiscountAmount: item.price.afterDiscount?.amount, priceAfterDiscountLabelEn: item.price.afterDiscount?.label?.en, priceAfterDiscountLabelAr: item.price.afterDiscount?.label?.ar, imageData: item.imageData, status: item.status === 'active' ? 'inactive' : 'active' }) });
          if (response.ok) await loadProducts();
        }
      });
      products.addEventListener('change', (event) => {
        const input = event.target.closest('[data-product-image-input]');
        const file = input?.files?.[0];
        if (!file || !/^image\/(?:png|jpe?g|webp|avif)$/i.test(file.type) || file.size > 1_500_000) return;
        const reader = new FileReader();
        reader.addEventListener('load', () => { productImageDraft = String(reader.result || ''); renderProducts(); });
        reader.readAsDataURL(file);
      });
      products.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-product-form]');
        if (!form) return;
        event.preventDefault();
        const data = new FormData(form);
        const current = productEditor?.id ? productsData.find((item) => item.id === productEditor.id) : null;
        const response = await osFetch('/api/os/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: productEditor?.mode === 'edit' ? 'update' : 'create', id: productEditor?.id, version: current?.version, idempotencyKey: productEditor?.idempotencyKey, slug: data.get('slug'), nameEn: data.get('nameEn'), nameAr: data.get('nameAr'), categoryEn: data.get('categoryEn'), categoryAr: data.get('categoryAr'), descriptionEn: data.get('descriptionEn'), descriptionAr: data.get('descriptionAr'), priceAmount: data.get('priceAmount'), priceCurrency: 'USD', priceLabelEn: data.get('priceAmount') ? `$${data.get('priceAmount')}` : 'Custom', priceLabelAr: data.get('priceAmount') ? `$${data.get('priceAmount')}` : 'مخصص', priceAfterDiscountAmount: data.get('priceAfterDiscountAmount'), priceAfterDiscountLabelEn: data.get('priceAfterDiscountAmount') ? `$${data.get('priceAfterDiscountAmount')}` : null, priceAfterDiscountLabelAr: data.get('priceAfterDiscountAmount') ? `$${data.get('priceAfterDiscountAmount')}` : null, imageData: productImageDraft, status: data.get('status') }) });
        if (response.ok) { productEditor = null; productImageDraft = ''; await loadProducts(); }
      });
      consultations.addEventListener('click', async (event) => {
        const row = event.target.closest('[data-consultation-id]');
        if (!row) return;
        const item = consultationsData.find((entry) => entry.id === row.dataset.consultationId);
        if (!item) return;
        const action = event.target.closest('[data-consultation-action]')?.dataset.consultationAction;
        if (!action && !event.target.closest('button, a, input, textarea, select')) {
          consultationsExpandedId = consultationsExpandedId === item.id ? null : item.id;
          renderConsultations();
          return;
        }
        if (!action) return;
        if (action === 'delete' && !window.confirm(root.lang === 'ar' ? 'حذف هذه الاستشارة؟' : 'Delete this consultation?')) return;
        const response = await osFetch('/api/os/consultations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id: item.id, version: item.version }) });
        if (response.ok) { consultationsExpandedId = null; await loadConsultations(); } else renderConsultations();
      });
      consultations.addEventListener('keydown', (event) => {
        if (!['Enter', ' '].includes(event.key) || !event.target.matches('.os-consultation-title-row')) return;
        event.preventDefault();
        event.target.closest('[data-consultation-id]')?.querySelector('.os-consultation-title-row')?.click();
      });
      const setPanelOpen = (open) => {
        if (open) setMenuOpen(false);
        if (!open || panelView !== 'summary') stopSummaryResponsePolling();
        panel.classList.toggle('is-expanded', open);
        panel.style.height = '';
        Object.entries(panelViews).forEach(([name, content]) => {
          content.setAttribute('aria-hidden', String(name !== panelView || (!open && name !== 'buttons')));
        });
        panelHandle.setAttribute('aria-label', panelView === 'buttons' ? panelCopy.textContent : (open ? 'Collapse panel' : 'Expand panel'));
        if (open && panelView === 'summary') startSummaryResponsePolling();
      };
      const setMenuOpen = (open) => {
        panel.classList.toggle('is-menu-obscured', open);
        adminShell.classList.toggle('is-menu-obscured', open);
        sideMenu.classList.toggle('is-open', open);
        sideMenu.setAttribute('aria-hidden', String(!open));
        addButton.setAttribute('aria-expanded', String(open));
        addButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      const closeAll = () => { setMenuOpen(false); setPanelOpen(false); };
      addButton.addEventListener('click', (event) => { event.stopPropagation(); setMenuOpen(!sideMenu.classList.contains('is-open')); });
      const updatePanelToggle = () => {
        if (panelView === 'buttons') return;
        setPanelOpen(!panel.classList.contains('is-expanded'));
      };
      panelHandle.addEventListener('click', (event) => { event.stopPropagation(); updatePanelToggle(); });
      panel.addEventListener('click', (event) => {
        if (!panel.classList.contains('is-expanded') || panelView === 'buttons') return;
        const interactive = event.target.closest?.('button, input, textarea, select, a, [role="button"], [data-control-key], [data-product-action], [data-product-id], [data-notification-id], [data-promo-code-id], [data-consultation-id], .os-buttons-track, .os-product-image-wrap');
        if (!interactive) setPanelOpen(false);
      });
      notifications.addEventListener('click', async (event) => {
        const action = event.target.closest('[data-notification-action]')?.dataset.notificationAction;
        const row = event.target.closest('[data-notification-id]');
        if (!action && row && !event.target.closest('button, input, textarea, select')) {
          const id = row.dataset.notificationId;
          notificationExpandedId = notificationExpandedId === id ? null : id;
          renderNotifications();
          return;
        }
        if (!action) return;
        if (action === 'new') { notificationExpandedId = null; notificationEditor = { mode: 'new', form: true, idempotencyKey: window.crypto?.randomUUID?.() || String(Date.now()) }; setPanelView('notification-add'); return; }
        if (action === 'cancel') { notificationExpandedId = null; notificationEditor = null; setPanelView('notifications'); return; }
        if (action === 'edit' && row) { notificationEditor = { mode: 'edit', id: row.dataset.notificationId, form: true }; renderNotifications(); return; }
        if (action === 'delete' && row) {
          if (!window.confirm(root.lang === 'ar' ? 'حذف هذا الإشعار؟' : 'Delete this notification?')) return;
          const notification = notificationsData.find((item) => item.id === row.dataset.notificationId);
          const response = await osFetch('/api/os/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: row.dataset.notificationId, version: notification?.version }) });
          if (!response.ok) return;
          notificationExpandedId = null;
          notificationEditor = null;
          await loadNotifications();
          return;
        }
        if (action === 'toggle' && row) {
          const notification = notificationsData.find((item) => item.id === row.dataset.notificationId);
          if (!notification) return;
          const schedule = localDateTime(notification.publishAt);
          const response = await osFetch('/api/os/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id: notification.id, version: notification.version, titleEn: notification.title.en, titleAr: notification.title.ar, textEn: notification.text.en, textAr: notification.text.ar, publishAt: `${schedule.date}T${schedule.time}`, frequency: notification.frequency, status: notification.status === 'active' ? 'inactive' : 'active' }) });
          if (!response.ok) return;
          notificationEditor = { mode: 'edit', id: notification.id, form: false };
          await loadNotifications();
        }
      });
      promoCodes.addEventListener('click', async (event) => {
        const action = event.target.closest('[data-promo-action]')?.dataset.promoAction;
        const managementAction = event.target.closest('[data-management-action]')?.dataset.managementAction;
        if (managementAction === 'promo-new') { promoEditor = { mode: 'new', id: null, idempotencyKey: window.crypto?.randomUUID?.() || String(Date.now()) }; renderPromoCodes(); return; }
        const row = event.target.closest('[data-promo-code-id]');
        if (!row && event.target.closest('[data-promo-action="cancel"]')) { promoEditor = null; renderPromoCodes(); return; }
        if (!row) return;
        const id = row.dataset.promoCodeId;
        if (!action) {
          promoCodeExpandedId = promoCodeExpandedId === id ? null : id;
          renderPromoCodes();
          return;
        }
        if (action === 'edit') { promoEditor = { mode: 'edit', id }; renderPromoCodes(); return; }
        if (action === 'toggle') { const response = await osFetch('/api/os/promo-codes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle', id }) }); if (response.ok) await loadPromoCodes(); return; }
        if (action !== 'delete') return;
        if (!window.confirm(root.lang === 'ar' ? 'حذف رمز الخصم هذا؟' : 'Delete this promo code?')) return;
        const response = await osFetch('/api/os/promo-codes', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
        if (!response.ok) return;
        promoCodeExpandedId = null;
        await loadPromoCodes();
      });
      promoCodes.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-promo-form]'); if (!form) return; event.preventDefault();
        const data = new FormData(form); const current = promoEditor?.id ? promoCodesData.find((item) => item.id === promoEditor.id) : null;
        const toIso = (value) => value ? new Date(`${value}T00:00:00`).toISOString() : null;
        const csv = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
        const response = await osFetch('/api/os/promo-codes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: promoEditor?.mode === 'edit' ? 'update' : 'create', id: promoEditor?.id, version: current?.version, idempotencyKey: promoEditor?.idempotencyKey, code: data.get('code'), discountValue: data.get('discountValue'), discountType: data.get('discountType'), currency: data.get('currency'), startsAt: toIso(data.get('startsAt')), endsAt: toIso(data.get('endsAt')), totalUsageLimit: data.get('totalUsageLimit') || null, perCustomerLimit: data.get('perCustomerLimit') || null, status: data.get('status'), serviceRestrictions: csv(data.get('serviceRestrictions')), durationRestrictions: csv(data.get('durationRestrictions')).map(Number).filter(Number.isInteger) }) });
        if (!response.ok) return; promoEditor = null; await loadPromoCodes();
      });
      notifications.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-notification-form]');
        if (!form) return;
        event.preventDefault();
        try { await saveNotification(form, notificationEditor?.mode === 'edit' ? 'update' : 'create', notificationEditor?.id); } catch (_) { /* Keep the editor open on validation/API failure. */ }
      });
      notificationAdd.addEventListener('click', (event) => {
        if (event.target.closest('[data-notification-action="cancel"]')) {
          notificationEditor = null;
          setPanelView('notifications');
        }
      });
      notificationAdd.addEventListener('submit', async (event) => {
        const form = event.target.closest('[data-notification-form]');
        if (!form) return;
        event.preventDefault();
        try { await saveNotification(form, 'create'); } catch (_) { /* Keep the editor open on validation/API failure. */ }
      });
      notifications.addEventListener('input', (event) => syncBilingualDirection(event.target));
      document.addEventListener('focusin', handleFieldFocusIn);
      document.addEventListener('focusout', handleFieldFocusOut);
      notificationAdd.addEventListener('input', (event) => syncBilingualDirection(event.target));
      if (window.visualViewport) window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      if (window.visualViewport) window.visualViewport.addEventListener('scroll', () => keepNotificationInputVisible());
      document.addEventListener('click', (event) => {
        const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
        const insidePanel = path.includes(panel) || event.target.closest?.('.os-panel');
        if (!insidePanel && !event.target.closest('.os-side-menu, [data-os-add], [data-os-oxo-toggle]')) closeAll();
      });
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAll(); });
      setPanelView('summary');
      setPanelOpen(false);
      let savedLanguage = 'en';
      let savedTheme = '';
      try {
        savedLanguage = localStorage.getItem('ooxme-os-language') === 'ar' ? 'ar' : 'en';
        const storedTheme = localStorage.getItem('ooxme-os-theme');
        savedTheme = storedTheme === 'dark' || storedTheme === 'light'
          ? storedTheme
          : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      } catch (_) {}
      if (!savedTheme) savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setLanguage(savedLanguage);
      setTheme(savedTheme);
    })();
