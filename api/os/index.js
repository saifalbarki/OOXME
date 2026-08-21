const { readJson } = require('../_lib/http');
const { configured, valid, credentialsValid, sessionCookie, clearCookie } = require('../_lib/os-auth');
const { login, dashboard, accountManagement } = require('../_lib/os-page');
const { allStatuses } = require('../_lib/os-status');
const accountAdmin = require('../_lib/account-admin');

module.exports = async (request, response) => {
  const route = request.query?.route || 'dashboard';
  if (route === 'login-page') {
    if (request.method !== 'GET') return response.status(405).send('Method not allowed');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    return response.status(200).send(login());
  }
  if (route === 'login') {
    if (request.method !== 'POST') return response.status(405).send('Method not allowed');
    if (!configured()) return response.status(503).json({ error: 'os_unconfigured' });
    const body = await readJson(request);
    if (!credentialsValid(body.username, body.password)) return response.status(401).json({ error: 'invalid_credentials' });
    response.setHeader('Set-Cookie', sessionCookie());
    response.setHeader('Cache-Control', 'no-store');
    return response.status(204).end();
  }
  if (route === 'logout') {
    if (request.method !== 'POST') return response.status(405).send('Method not allowed');
    response.setHeader('Set-Cookie', clearCookie());
    response.setHeader('Cache-Control', 'no-store');
    return response.redirect(303, '/os/login');
  }
  if (route === 'status') {
    if (request.method !== 'GET') return response.status(405).send('Method not allowed');
    if (!valid(request)) return response.status(401).json({ error: 'unauthorized' });
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(await allStatuses());
  }
  if (route === 'accounts-page') {
    if (request.method !== 'GET') return response.status(405).send('Method not allowed');
    if (!valid(request)) return response.redirect(303, '/os/login');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    return response.status(200).send(accountManagement());
  }
  if (route === 'accounts') {
    if (!valid(request)) return response.status(401).json({ error: 'unauthorized' });
    response.setHeader('Cache-Control', 'no-store');
    try {
      if (request.method === 'GET') {
        const account = request.query?.id ? await accountAdmin.details(request.query.id) : await accountAdmin.list();
        return response.status(200).json(account || { error: 'account_not_found' });
      }
      if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
      const body = await readJson(request);
      const actions = { create: accountAdmin.create, update: accountAdmin.update, reset_password: accountAdmin.resetPassword, set_status: accountAdmin.setStatus, delete: accountAdmin.remove };
      if (!actions[body.action]) return response.status(400).json({ error: 'invalid_account_action' });
      const id = await actions[body.action](body);
      return response.status(200).json({ ok: true, ...(id ? { id } : {}) });
    } catch (error) {
      if (error.code === '23505') return response.status(409).json({ error: 'username_unavailable' });
      return response.status(error.code === 'account_not_found' ? 404 : 400).json({ error: error.code || 'account_action_failed' });
    }
  }
  if (request.method !== 'GET') return response.status(405).send('Method not allowed');
  if (!valid(request)) return response.redirect(303, '/os/login');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  return response.status(200).send(dashboard());
};
