CREATE TABLE IF NOT EXISTS os_page_controls (
  action_key TEXT PRIMARY KEY,
  page_key TEXT NOT NULL,
  route TEXT NOT NULL,
  label TEXT NOT NULL,
  selector TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS os_page_controls_page_index
  ON os_page_controls (page_key, updated_at DESC);

CREATE TABLE IF NOT EXISTS os_products (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category_en TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  price_amount NUMERIC(14, 2),
  price_currency CHAR(3) NOT NULL DEFAULT 'USD',
  price_label_en TEXT,
  price_label_ar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS os_products_active_order_index
  ON os_products (status, is_featured DESC, display_order, created_at);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_status_check') THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_status_check
      CHECK (status IN ('draft', 'published', 'inactive', 'archived')) NOT VALID;
  END IF;
EXCEPTION WHEN undefined_table THEN
  CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    title_ar TEXT,
    body_ar TEXT,
    publish_date TIMESTAMPTZ NOT NULL,
    audience TEXT NOT NULL DEFAULT 'everyone',
    status TEXT NOT NULL DEFAULT 'published',
    frequency TEXT NOT NULL DEFAULT 'once',
    appearance_limit INTEGER,
    targeting JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    archived_at TIMESTAMPTZ,
    archived_by UUID,
    archive_reason TEXT
  );
END $$;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body_ar TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'once';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS appearance_limit INTEGER;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS targeting JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_frequency_check') THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_frequency_check
      CHECK (frequency IN ('once', 'session', 'recurring')) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS notifications_public_window_index
  ON notifications (status, publish_date, valid_until, updated_at DESC);

INSERT INTO os_page_controls (action_key, page_key, route, label, selector)
VALUES
  ('main-update-1', 'Homepage', '/', 'Open Update', '[data-s-main-section-1-image-card][href="/update"]'),
  ('main-rpn', 'Homepage', '/', 'Open RPN', '[data-s-main-section-1-image-card][href="/space"]'),
  ('main-gallery', 'Homepage', '/', 'Open Gallery', '[data-s-gallery-preview-action], .s-page__gallery-preview-cta[href="/gallery"]'),
  ('main-consultation', 'Homepage', '/', 'Book a Consultation', '[data-s-contact-consultation-cta]'),
  ('main-phone', 'Homepage', '/', 'Phone', '[data-s-contact="phone"]'),
  ('main-email', 'Homepage', '/', 'Email', '[data-s-contact="email"]'),
  ('main-whatsapp', 'Homepage', '/', 'WhatsApp', '[data-s-contact="whatsapp"]'),
  ('main-instagram', 'Homepage', '/', 'Instagram', '[data-s-contact="instagram"]'),
  ('main-facebook', 'Homepage', '/', 'Facebook', '[data-s-contact="facebook"]'),
  ('main-linkedin', 'Homepage', '/', 'LinkedIn', '[data-s-contact="linkedin"]'),
  ('gallery-alfares', 'Gallery', '/gallery', 'Alfares project images', '[data-gallery-project="alfares"] [data-gallery-deck]'),
  ('gallery-alsibtain', 'Gallery', '/gallery', 'Al-Sibtain project images', '[data-gallery-project="alsebteen"] [data-gallery-deck]'),
  ('gallery-velvet-flora', 'Gallery', '/gallery', 'Velvet Flora project images', '[data-gallery-project="velvet"] [data-gallery-deck]'),
  ('gallery-zone', 'Gallery', '/gallery', 'Zone project images', '[data-gallery-project="zone"] [data-gallery-deck]'),
  ('gallery-sada-al-riwaq', 'Gallery', '/gallery', 'Sada Al Riwaq project images', '[data-gallery-project="sda-alrwaq"] [data-gallery-deck]'),
  ('bm-view', 'Brand Management', '/bm', 'View', '[data-brand-view]'),
  ('bm-prev', 'Brand Management', '/bm', 'Previous card', '[data-brand-prev]'),
  ('bm-next', 'Brand Management', '/bm', 'Forward card', '[data-brand-next]'),
  ('rpn-faq', 'RPN', '/space', 'FAQ questions', '.space-faq__question'),
  ('rpn-email', 'RPN', '/space', 'Send Email', '.space-application__button[href^="mailto:"]'),
  ('rpn-join', 'RPN', '/space', 'Join Now', '.space-application__button--join'),
  ('consultation-send', 'Consultation', '/consultation', 'Send consultation message', '[data-s-consultation-composer] button[type="submit"]'),
  ('consultation-language', 'Consultation', '/consultation', 'Switch language', '[data-s-consultation-composer-language]'),
  ('consultation-apply', 'Consultation', '/consultation', 'Apply', '[data-s-consultation-apply]'),
  ('consultation-zaincash', 'Consultation', '/consultation', 'Zain Cash', '[data-consultation-payment="ZainCash"]'),
  ('consultation-superqi', 'Consultation', '/consultation', 'SuperQi', '[data-consultation-payment="Qi"]'),
  ('consultation-confirm', 'Consultation', '/consultation', 'Confirm', '[data-s-consultation-pay]'),
  ('store-prev', 'Store', '/store', 'Previous product', '[data-store-carousel-previous]'),
  ('store-next', 'Store', '/store', 'Next product', '[data-store-carousel-next]'),
  ('update-prev', 'Update', '/update', 'Previous card', '[data-update-prev]'),
  ('update-next', 'Update', '/update', 'Next card', '[data-update-next]')
ON CONFLICT (action_key) DO UPDATE SET
  page_key = EXCLUDED.page_key,
  route = EXCLUDED.route,
  label = EXCLUDED.label,
  selector = EXCLUDED.selector,
  updated_at = now();

INSERT INTO os_products (
  id, slug, status, is_featured, display_order,
  name_en, name_ar, category_en, category_ar, description_en, description_ar,
  price_amount, price_currency, price_label_en, price_label_ar
)
VALUES
  ('a01f7e1d-9ff4-43d9-bdd9-100000000001', '1000-key', 'active', TRUE, 0,
   '1000 Key', '1000 مفتاح', 'Applied E-Book', 'كتاب الكتروني تطبيقي',
   'A book that brings together 1000 keys to the success of any project, divided within OOXME hidden files for managing commercial projects.',
   'كتاب يجمع 1000 مفتاح لنجاح اي مشروع مقسمة ضمن ملفات اوكسوم المخفية لإدارة المشاريع التجارية',
   29, 'USD', '$29', '$29'),
  ('a01f7e1d-9ff4-43d9-bdd9-100000000002', 'project-planner', 'active', FALSE, 1,
   'Project Planner', 'مخطط المشروع', 'Digital File', 'ملف رقمي',
   'A practical planning system for organizing projects, tasks, priorities, and execution.',
   'نظام عملي لتنظيم المشاريع والمهام والاولويات والتنفيذ.',
   19, 'USD', '$19', '$19'),
  ('a01f7e1d-9ff4-43d9-bdd9-100000000003', 'business-model-kit', 'active', FALSE, 2,
   'Business Model Kit', 'حزمة نموذج العمل', 'Business Toolkit', 'ادوات اعمال',
   'A structured toolkit for reviewing business models, offers, operations, and growth opportunities.',
   'حزمة منظمة لمراجعة نموذج العمل والعروض والعمليات وفرص النمو.',
   39, 'USD', '$39', '$39'),
  ('a01f7e1d-9ff4-43d9-bdd9-100000000004', 'content-system', 'active', FALSE, 3,
   'Content System', 'نظام المحتوى', 'Content Toolkit', 'ادوات محتوى',
   'A practical framework for planning, organizing, and maintaining consistent brand content.',
   'اطار عملي لتخطيط وتنظيم واستمرار محتوى العلامة التجارية.',
   24, 'USD', '$24', '$24'),
  ('a01f7e1d-9ff4-43d9-bdd9-100000000005', 'custom-brand-pack', 'active', FALSE, 4,
   'Custom Brand Pack', 'حزمة علامة مخصصة', 'Custom Product', 'منتج مخصص',
   'A tailored set of brand files prepared around your business needs and priorities.',
   'مجموعة ملفات علامة تجارية مخصصة حسب احتياجات واولويات عملك.',
   NULL, 'USD', 'Custom', 'مخصص')
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  category_en = EXCLUDED.category_en,
  category_ar = EXCLUDED.category_ar,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  price_amount = EXCLUDED.price_amount,
  price_currency = EXCLUDED.price_currency,
  price_label_en = EXCLUDED.price_label_en,
  price_label_ar = EXCLUDED.price_label_ar,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order,
  updated_at = now();
