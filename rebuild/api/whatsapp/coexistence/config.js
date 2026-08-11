const { json, methodNotAllowed } = require('../../_lib/http');
const { required, optional } = require('../../_lib/config');

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  try {
    return json(response, 200, {
      appId: required('WHATSAPP_APP_ID'),
      configId: required('WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID'),
      graphApiVersion: optional('WHATSAPP_GRAPH_API_VERSION', 'v22.0')
    });
  } catch (error) {
    console.error('coexistence configuration unavailable', error.message);
    return json(response, 503, { error: 'coexistence_not_configured' });
  }
};
