const { json, methodNotAllowed } = require('../_lib/http');
const { probeWebsite } = require('../_lib/insights');
const { requireAdmin } = require('../_lib/os-auth');
const { setRequestId } = require('../_lib/os-audit');

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  response.setHeader('Cache-Control', 'no-store');
  setRequestId(request, response);
  try {
    await requireAdmin(request);
    const sample = await probeWebsite();
    return json(response, 200, {
      success: true,
      data: {
        isUp: sample.isUp,
        responseMs: sample.isUp ? sample.responseMs : null,
        statusCode: sample.statusCode
      }
    });
  } catch (error) {
    const status = Number(error.status) || 503;
    if (status >= 500) console.error('OS response probe failed', error.code || error.message);
    return json(response, status, { success: false, error: status >= 500 ? 'response_probe_unavailable' : error.message });
  }
};
