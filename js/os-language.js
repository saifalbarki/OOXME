(() => {
  const copy = {
    en: { title: 'OOXME OS', home: 'Home', privateSystem: 'PRIVATE SYSTEM', loginDescription: 'Sign in to access operational status.', username: 'Username', password: 'Password', login: 'Login', current: 'Current', present: 'Present', generalStatus: 'General Status', edit: 'Edit', signIn: 'Sign in', loginError: 'Unable to sign in.', logOut: 'Log out', status: 'STATUS', website: 'Website', github: 'GitHub', vercel: 'Vercel', neon: 'Neon', gpt: 'GPT', calendar: 'Calendar', gmail: 'Gmail', drive: 'Drive', ycloud: 'YCloud', whatsapp: 'WhatsApp', facebook: 'Facebook', instagram: 'Instagram', loading: 'Loading…', unavailable: 'Unavailable', statusCheckFailed: 'Status check failed', accountManagement: 'Account Management', osDashboard: 'OS Dashboard', employees: 'Employees', clients: 'Clients', employee: 'Employee', client: 'Client', discountCodes: 'Discount Codes', notifications: 'Notifications', createAccount: 'Create account', newAccount: 'New account', addNew: 'Add new', editExisting: 'Edit existing', cancel: 'Cancel', confirm: 'Confirm', selectAccount: 'Select account', editAccount: 'Edit account', saveChanges: 'Save changes', accountType: 'Account type', displayName: 'Display name', jobTitle: 'Job title', companyName: 'Company name', newPasswordOptional: 'New password (optional)', activate: 'Activate', deactivate: 'Deactivate', deleteAccount: 'Delete account', deleteConfirm: 'Deletion is permanent and cannot be undone.', noAccounts: 'No accounts yet.', active: 'Active', inactive: 'Inactive', suspended: 'Suspended', accountLoadFailed: 'Unable to load accounts.', invalid_account_input: 'Enter all required account details.', invalid_password: 'Password must contain at least 8 characters.', username_unavailable: 'This username is already in use.', account_action_failed: 'Account action failed.' }
  };
  const apply = () => {
    const page = copy.en;
    const root = document.documentElement;
    root.lang = 'en';
    root.dir = 'ltr';
    document.title = page.title;
    document.querySelectorAll('[data-os-text]').forEach(element => { const value = page[element.dataset.osText]; if (value) element.textContent = value; });
    document.querySelectorAll('[data-os-placeholder]').forEach(element => { const value = page[element.dataset.osPlaceholder]; if (value) element.placeholder = value; });
    document.querySelectorAll('[data-os-aria]').forEach(element => { element.setAttribute('aria-label', page[element.dataset.osAria] || ''); });
    document.querySelectorAll('[data-os-initial-status]').forEach(element => { element.textContent = page[element.dataset.osInitialStatus]; });
    window.renderOsStatuses?.();
  };
  const status = value => value || copy.en.unavailable;
  window.OOXMEOS = { apply, copy, status, language: 'en' };
  document.addEventListener('DOMContentLoaded', apply, { once: true });
})();
