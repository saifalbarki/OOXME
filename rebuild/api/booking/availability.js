const { json, methodNotAllowed } = require('../_lib/http');
const { availabilityForMonth } = require('../_lib/calendar');
module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  const year = Number(request.query.year), month = Number(request.query.month);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return json(response, 400, { error: 'invalid_month' });
  try { return json(response, 200, await availabilityForMonth(year, month)); }
  catch (error) { console.error('booking availability failed', error.message); return json(response, 503, { error: 'availability_unavailable' }); }
};
