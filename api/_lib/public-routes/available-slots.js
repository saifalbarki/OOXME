const { json, methodNotAllowed, serverTiming } = require('../http');
const { bookingConfig } = require('../config');
const { availabilityForDate, availabilityForMonth, availabilityForWindow } = require('../calendar');

const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  response.setHeader('Cache-Control', 'no-store');
  const timing = serverTiming(response);
  const config = bookingConfig();
  const duration = Number(request.query.duration || 45);
  const limit = Math.min(4, Math.max(1, Number(request.query.limit) || 4));
  if (!config.consultationMinutes.includes(duration)) {
    timing.finish();
    return json(response, 400, { error: 'invalid_duration' });
  }
  try {
    if (validDate(request.query.date)) {
      const result = await availabilityForDate(request.query.date, duration, limit, timing);
      timing.finish();
      return json(response, 200, result);
    }
    const year = Number(request.query.year);
    const month = Number(request.query.month);
    if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
      const result = await availabilityForMonth(year, month, duration, timing);
      timing.finish();
      return json(response, 200, result);
    }
    const result = await availabilityForWindow(request.query.from, duration, limit, 62, timing);
    timing.finish();
    return json(response, 200, result);
  } catch (error) {
    console.error('booking availability failed', error.message);
    const status = error.code === 'invalid_availability' ? 400 : 503;
    timing.finish();
    return json(response, status, { error: error.code || 'availability_unavailable' });
  }
};
