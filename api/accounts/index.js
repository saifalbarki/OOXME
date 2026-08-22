const { readJson } = require('../_lib/http');
const { authenticate, createSession, sessionCookie, sessionFromRequest } = require('../_lib/account-auth');
const { forAudience } = require('../_lib/notification-admin');

const login = async (request, response) => {
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' });
  const body = await readJson(request);
  const user = await authenticate(body.username, body.password);
  if (!user) return response.status(401).json({ error: 'invalid_credentials' });
  const session = await createSession(user.id);
  response.setHeader('Set-Cookie', sessionCookie(session.token));
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ accountType: user.accountType });
};

const currentSession = async (request, response) => {
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' });
  const user = await sessionFromRequest(request);
  if (!user) return response.status(401).json({ error: 'unauthorized' });
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ username: user.username, accountType: user.accountType });
};

const notifications = async (request, response) => {
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' });
  const user = await sessionFromRequest(request);
  if (!user) return response.status(401).json({ error: 'unauthorized' });
  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json(await forAudience(user.accountType));
};

module.exports = async (request, response) => {
  try {
    const route = request.query?.route || '';
    if (route === 'login') return await login(request, response);
    if (route === 'session') return await currentSession(request, response);
    if (route === 'notifications') return await notifications(request, response);
    return response.status(404).json({ error: 'not_found' });
  } catch (error) {
    console.error('account request failed', error.message);
    return response.status(503).json({ error: 'account_unavailable' });
  }
};
