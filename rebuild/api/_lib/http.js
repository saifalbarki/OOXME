const json = (response, status, body) => {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.send(JSON.stringify(body));
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

module.exports = { json, methodNotAllowed, readJson };
