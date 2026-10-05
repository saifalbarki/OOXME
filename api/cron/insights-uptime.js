const crypto = require('crypto');
const { json, methodNotAllowed } = require('../_lib/http');
const { probeWebsite, recordUptimeSample, cleanupUptimeSamples } = require('../_lib/insights');

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  const expected = String(process.env.CRON_SECRET || '');
  const received = String(request.headers?.authorization || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(received); const b = Buffer.from(expected);
  if (!expected || !received || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return json(response, 401, { success: false, error: 'cron_unauthorized' });
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  try {
    const sample = await probeWebsite();
    await recordUptimeSample(sample);
    await cleanupUptimeSamples();
    return json(response, 200, { success: true, data: { recorded: true } });
  } catch (error) {
    console.error('OS uptime sample failed', error.code || error.message);
    return json(response, 503, { success: false, error: 'uptime_sample_unavailable' });
  }
};
