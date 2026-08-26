const { readJson } = require('../_lib/http');
const { configured, valid, credentialsValid, sessionCookie, clearCookie } = require('../_lib/os-auth');
const { login, dashboard } = require('../_lib/os-page');
const { allStatuses } = require('../_lib/os-status');
const accountAdmin = require('../_lib/account-admin');
const promoAdmin = require('../_lib/promo-admin');
const notificationAdmin = require('../_lib/notification-admin');

module.exports = async (request, response) => {
  const route = request.query?.route || 'dashboard';
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
    return response.redirect(303, '/os');
  }
  if (route === 'status') {
    if (request.method !== 'GET') return response.status(405).send('Method not allowed');
    if (!valid(request)) return response.status(401).json({ error: 'unauthorized' });
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(await allStatuses());
  }
  if (route === 'summary') {
    if (request.method !== 'GET') return response.status(405).send('Method not allowed');
    if (!valid(request)) return response.status(401).json({ error: 'unauthorized' });
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(await accountAdmin.summary());
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
  if (route === 'promotions') {
    if (!valid(request)) return response.status(401).json({ error: 'unauthorized' });
    response.setHeader('Cache-Control', 'no-store');
    try {
      if (request.method === 'GET') return response.status(200).json(await promoAdmin.list());
      if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
      const body = await readJson(request);
      const actions = { create: promoAdmin.create, update: promoAdmin.update, delete: promoAdmin.remove };
      if (!actions[body.action]) return response.status(400).json({ error: 'invalid_promotion_action' });
      const result = await actions[body.action](body);
      return response.status(200).json({ ok: true, ...(typeof result === 'string' ? { id: result } : result) });
    } catch (error) {
      if (error.code === '23505') return response.status(409).json({ error: 'promo_code_unavailable' });
      return response.status(error.code === 'promotion_not_found' ? 404 : 400).json({ error: error.code || 'promotion_action_failed' });
    }
  }
  if (route === 'notifications') {
    if (!valid(request)) return response.status(401).json({ error: 'unauthorized' });
    response.setHeader('Cache-Control', 'no-store');
    try {
      if (request.method === 'GET') return response.status(200).json(await notificationAdmin.list());
      if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
      const body = await readJson(request);
      const actions = { create: notificationAdmin.create, update: notificationAdmin.update, delete: notificationAdmin.remove };
      if (!actions[body.action]) return response.status(400).json({ error: 'invalid_notification_action' });
      const result = await actions[body.action](body);
      return response.status(200).json({ ok: true, ...(result ? { notification: result } : {}) });
    } catch (error) {
      return response.status(error.code === 'notification_not_found' ? 404 : 400).json({ error: error.code || 'notification_action_failed' });
    }
  }
  if (request.method !== 'GET') return response.status(405).send('Method not allowed');
  if (!valid(request)) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Vary', 'Cookie');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    return response.status(200).send(login());
  }
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Vary', 'Cookie');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  return response.status(200).send(dashboard());
};
