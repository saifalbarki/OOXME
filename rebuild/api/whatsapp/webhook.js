const crypto = require('crypto');
const { json, methodNotAllowed } = require('../_lib/http');
const { required, optional } = require('../_lib/config');

const validSignature = (request) => {
  const secret = optional('WHATSAPP_APP_SECRET');
  if (!secret) return true;
  const signature = request.headers['x-hub-signature-256'];
  if (!signature || !request.rawBody) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(request.rawBody).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
const rawBody = (request) => new Promise((resolve, reject) => {
  const chunks = [];
  request.on('data', (chunk) => chunks.push(chunk));
  request.on('end', () => resolve(Buffer.concat(chunks)));
  request.on('error', reject);
});
const handler = async (request, response) => {
  if (request.method === 'GET') {
    if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token'] === required('WHATSAPP_VERIFY_TOKEN')) return response.status(200).send(request.query['hub.challenge']);
    return response.status(403).send('Forbidden');
  }
  if (request.method !== 'POST') return methodNotAllowed(response, ['GET', 'POST']);
  request.rawBody = await rawBody(request);
  if (!validSignature(request)) return response.status(401).send('Invalid signature');
  const payload = JSON.parse(request.rawBody.toString('utf8') || '{}');
  const entries = payload.entry || [];
  // Intentionally minimal: extend this dispatcher with idempotent handlers for
  // messages, delivery receipts, and template status events as Meta adds them.
  for (const entry of entries) for (const change of entry.changes || []) console.info('WhatsApp event received', change.field || 'unknown');
  return json(response, 200, { received: true });
};
module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
