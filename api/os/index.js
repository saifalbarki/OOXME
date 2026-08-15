const { readJson } = require('../_lib/http');
const { configured, valid, credentialsValid, sessionCookie, clearCookie } = require('../_lib/os-auth');
const { login, dashboard } = require('../_lib/os-page');
const { website, vercel, github, gmail, calendar, drive, neon, openai, ycloud, whatsapp, facebook, instagram } = require('../_lib/os-status');

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
    const [websiteStatus, githubStatus, vercelStatus, gmailStatus, calendarStatus, driveStatus, neonStatus, openaiStatus, ycloudStatus, whatsappStatus, facebookStatus, instagramStatus] = await Promise.all([website(), github(), vercel(), gmail(), calendar(), drive(), neon(), openai(), ycloud(), whatsapp(), facebook(), instagram()]);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ website: websiteStatus, github: githubStatus, vercel: vercelStatus, gmail: gmailStatus, calendar: calendarStatus, drive: driveStatus, neon: neonStatus, gpt: openaiStatus, ycloud: ycloudStatus, whatsapp: whatsappStatus, facebook: facebookStatus, instagram: instagramStatus });
  }
  if (request.method !== 'GET') return response.status(405).send('Method not allowed');
  if (!valid(request)) return response.redirect(303, '/os/login');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  return response.status(200).send(dashboard());
};
