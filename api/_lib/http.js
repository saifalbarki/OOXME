const { performance } = require('perf_hooks');

const json = (response, status, body) => {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.send(JSON.stringify(body));
};

const serverTiming = (response) => {
  const startedAt = performance.now();
  const metrics = [];
  const add = (name, duration) => {
    const safeName = String(name || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 32);
    if (safeName && Number.isFinite(duration)) metrics.push(`${safeName};dur=${Math.max(0, duration).toFixed(1)}`);
  };
  const measure = async (name, work) => {
    const metricStartedAt = performance.now();
    try { return await work(); }
    finally { add(name, performance.now() - metricStartedAt); }
  };
  const finish = () => {
    add('app', performance.now() - startedAt);
    if (metrics.length && !response.headersSent) response.setHeader('Server-Timing', metrics.join(', '));
  };
  return { add, measure, finish };
};

const methodNotAllowed = (response, allowed) => {
  response.setHeader('Allow', allowed.join(', '));
  return json(response, 405, { error: 'method_not_allowed' });
};

const readJson = async (request) => {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body === 'string' && request.body) return JSON.parse(request.body);
  return {};
};

module.exports = { json, methodNotAllowed, readJson, serverTiming };
