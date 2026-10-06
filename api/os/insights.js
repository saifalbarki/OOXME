const { json, methodNotAllowed } = require('../_lib/http');
const { insightsData, summaryData, probeWebsite } = require('../_lib/insights');
const { requireAdmin } = require('../_lib/os-auth');
const { setRequestId } = require('../_lib/os-audit');

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  response.setHeader('Cache-Control', 'no-store');
  setRequestId(request, response);
  try {
    await requireAdmin(request);
    if (request.query?.mode === 'response') {
      const sample = await probeWebsite();
      return json(response, 200, {
        success: true,
        data: {
          isUp: sample.isUp,
          responseMs: sample.isUp ? sample.responseMs : null,
          statusCode: sample.statusCode
        }
      });
    }
    if (request.query?.mode === 'summary') return json(response, 200, { success: true, data: await summaryData() });
    return json(response, 200, { success: true, data: await insightsData() });
  } catch (error) {
    const status = Number(error.status) || 503;
    if (status >= 500) console.error('OS insights read failed', error.code || error.message);
    return json(response, status, { success: false, error: status >= 500 ? 'insights_unavailable' : error.message });
  }
};
