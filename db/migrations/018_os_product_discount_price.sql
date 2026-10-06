ALTER TABLE os_products
  ADD COLUMN IF NOT EXISTS price_after_discount_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS price_after_discount_label_en TEXT,
  ADD COLUMN IF NOT EXISTS price_after_discount_label_ar TEXT;
