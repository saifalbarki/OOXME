const crypto = require('crypto');
const { json, methodNotAllowed } = require('../_lib/http');
const { required } = require('../_lib/config');
const { processDueReminders } = require('../_lib/reminders');

const matchesSecret = (candidate, expected) => {
  const left = Buffer.from(String(candidate || ''));
  const right = Buffer.from(String(expected || ''));
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right);
};

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  response.setHeader('Cache-Control', 'no-store');
  let secret;
  try {
    secret = required('CRON_SECRET');
  } catch (_) {
    return json(response, 503, { error: 'cron_not_configured' });
  }
  if (secret.length < 16) return json(response, 503, { error: 'cron_not_configured' });
  const authorization = request.headers?.authorization || '';
  if (!/^Bearer\s+/i.test(authorization) || !matchesSecret(authorization.replace(/^Bearer\s+/i, ''), secret)) {
    return json(response, 401, { error: 'unauthorized' });
  }
  try {
    return json(response, 200, await processDueReminders());
  } catch (error) {
    console.error('consultation reminder processing failed', error.message);
    return json(response, 503, { error: 'reminder_processing_failed' });
  }
};
