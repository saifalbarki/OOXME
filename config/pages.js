export const pages = [
  'index', 'portfolio', 'services', 'consultation', 'booking-summary', 'booking-confirmed', 'payment', 'coming-soon',
  'plan-starter', 'plan-standard', 'plan-plus',
  'art-direction', 'brand-strategy', 'brands-we-designed', 'businesses-we-managed', 'unique-works', 'services-business-development', 'services-brand-strategy', 'services-creative-digital', 'define', 'deliver',
  'design', 'digital-design', 'discover', 'logos-we-designed', 'visual-identities', 'visual-identity',
  'project-albasri-commercial-group', 'project-alfayha-eyewear', 'project-sawa-university', 'project-viir',
  'service-advertising-campaigns', 'service-ai-integration', 'service-brand-identity', 'service-brand-management',
  'service-brand-strategy', 'service-business-consultation', 'service-business-development', 'service-content-creation',
  'service-digital-marketing', 'service-drone-production', 'service-graphic-design', 'service-interior-photography',
  'service-motion-graphics', 'service-photography', 'service-product-photography', 'service-seo',
  'service-social-media-management', 'service-ui-ux-design', 'service-videography', 'service-website-design-development',
];

export const pageScripts = Object.fromEntries(pages.map((page) => {
  if (page === 'index') return [page, ['home.js']];
  if (page === 'portfolio') return [page, ['portfolio.js']];
  if (page === 'services') return [page, ['services-page.js']];
  if (page === 'consultation') return [page, ['booking.js']];
  if (page === 'booking-summary') return [page, ['booking-summary.js']];
  if (page === 'payment') return [page, ['payment.js']];
  if (page === 'coming-soon') return [page, ['coming-soon.js']];
  if (page.startsWith('plan-')) return [page, ['plans.js', 'global-sidebar.js']];
  if (page.startsWith('service-') || page.startsWith('project-')) return [page, ['detail.js']];
  return [page, ['service-page.js']];
}));

export const toRoute = (page) => page === 'index' ? '/' : `/${page}`;
