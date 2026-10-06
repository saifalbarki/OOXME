const routes = {
  '/api/booking/availability': require('./_lib/public-routes/available-slots'),
  '/api/booking/available-slots': require('./_lib/public-routes/available-slots'),
  '/api/products': require('./_lib/public-routes/products'),
  '/api/notifications/active': require('./_lib/public-routes/active-notifications'),
  '/api/runtime/bootstrap': require('./_lib/public-routes/bootstrap'),
  '/api/promo/validate': require('./_lib/public-routes/validate-promo')
};
const aliases = {
  availability: '/api/booking/availability',
  'available-slots': '/api/booking/available-slots',
  products: '/api/products',
  notifications: '/api/notifications/active',
  bootstrap: '/api/runtime/bootstrap',
  promo: '/api/promo/validate'
};

module.exports = async (request, response) => {
  const originalPath = request.headers?.['x-original-url'] || request.headers?.['x-vercel-original-url'];
  const path = String(originalPath || request.url || '').split('?')[0];
  const handler = routes[path] || routes[aliases[request.query?.route]];
  if (!handler) return response.status(404).json({ error: 'route_not_found' });
  return handler(request, response);
};
