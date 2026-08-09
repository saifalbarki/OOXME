export const portfolioPanelSections = ['portfolio', 'plans', 'services', 'consultation', 'contact'];

export const mainSections = [
  { href: '/', en: 'Intro', ar: 'المقدمة' },
  { href: '/portfolio', en: 'Portfolio', ar: 'المعرض' },
  { href: '/portfolio?section=plans', en: 'Growth Plans', ar: 'باقات النمو' },
  { href: '/portfolio?section=services', en: 'Services', ar: 'الخدمات' },
  { href: '/portfolio?section=consultation', en: 'Consultation', ar: 'استشارة' },
  { href: '/portfolio?section=contact', en: 'Contact', ar: 'تواصل' },
];

export const searchNavigation = [
  ...mainSections,
  { href: '/businesses-we-managed', en: 'Brands We Manage', ar: 'علامات نديرها' },
  { href: '/brands-we-designed', en: 'Brands We Designed', ar: 'علامات صممناها' },
  { href: '/unique-works', en: 'Unique Works', ar: 'أعمال مميزة' },
  { href: '/project-albasri-commercial-group', en: 'Albasri', ar: 'البصري' },
  { href: '/project-albasri-commercial-group#hfadhi-project', en: 'Alhafadhi', ar: 'الحفظي' },
  { href: '/project-albasri-commercial-group#lccd-project', en: 'LCCD', ar: 'إل سي سي دي' },
  { href: '/project-alfayha-eyewear', en: 'Alfayhaa', ar: 'الفيحاء' },
  { href: '/project-viir', en: 'VIIR', ar: 'فيير' },
  { href: '/project-alfayha-eyewear#fatimah-project', en: 'Fatimah Floss', ar: 'فاطمة فلوس' },
  { href: '/project-sawa-university', en: 'Sawa', ar: 'سوا' },
  { href: '/project-alfayha-eyewear#arjwan-project', en: 'Alarjwan', ar: 'الأرجوان' },
  { href: '/project-sawa-university#hi-project', en: 'HI', ar: 'هاي' },
  { href: '/services-business-development', en: 'Business Development Services', ar: 'خدمات تطوير الأعمال' },
  { href: '/services-brand-strategy', en: 'Brand Strategy Services', ar: 'خدمات استراتيجية العلامة' },
  { href: '/services-creative-digital', en: 'Creative & Digital Services', ar: 'الخدمات الإبداعية والرقمية' },
];

export const obsoleteRouteRedirects = {
  'visual-identities': '/unique-works',
  'logos-we-designed': '/unique-works',
};
