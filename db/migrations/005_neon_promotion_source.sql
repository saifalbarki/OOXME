ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS promotion_type TEXT NOT NULL DEFAULT 'public_promo' CHECK (promotion_type IN ('public_promo', 'private_offer')),
  ADD COLUMN IF NOT EXISTS source_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS booking_defaults JSONB,
  ADD COLUMN IF NOT EXISTS notification_mode TEXT NOT NULL DEFAULT 'final',
  ADD COLUMN IF NOT EXISTS token_ttl_minutes INTEGER CHECK (token_ttl_minutes IS NULL OR token_ttl_minutes > 0);

ALTER TABLE offer_tokens
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id);

INSERT INTO promotions (
  id, code_normalized, status, campaign_source, starts_at, ends_at,
  total_usage_limit, per_customer_limit, service_restrictions, duration_restrictions,
  discount_type, discount_value, currency, promotion_type, source_restrictions,
  booking_defaults, notification_mode, token_ttl_minutes
) VALUES
  ('8eb07b36-7f8c-4f5a-8e7c-8b84e5d01201', 'TEST', 'active', NULL, NULL, '2027-08-12T23:59:59.999Z', 100, NULL, '["consultation"]'::jsonb, '[]'::jsonb, 'percentage', 100, NULL, 'public_promo', '["promo_input"]'::jsonb, '{"topic":"Other","sector":"Other"}'::jsonb, 'test', NULL),
  ('8eb07b36-7f8c-4f5a-8e7c-8b84e5d01202', 'R100', 'active', NULL, NULL, NULL, 10, NULL, '["consultation"]'::jsonb, '[45]'::jsonb, 'percentage', 100, NULL, 'public_promo', '["promo_input"]'::jsonb, NULL, 'final', NULL),
  ('8eb07b36-7f8c-4f5a-8e7c-8b84e5d01203', 'FREE', 'active', 'plans-free-consultation', NULL, NULL, 10, NULL, '["consultation"]'::jsonb, '[45]'::jsonb, 'percentage', 100, NULL, 'private_offer', '["plan_cta"]'::jsonb, NULL, 'final', 15)
ON CONFLICT (code_normalized) DO UPDATE SET
  status = EXCLUDED.status,
  campaign_source = EXCLUDED.campaign_source,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  total_usage_limit = EXCLUDED.total_usage_limit,
  per_customer_limit = EXCLUDED.per_customer_limit,
  service_restrictions = EXCLUDED.service_restrictions,
  duration_restrictions = EXCLUDED.duration_restrictions,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  currency = EXCLUDED.currency,
  promotion_type = EXCLUDED.promotion_type,
  source_restrictions = EXCLUDED.source_restrictions,
  booking_defaults = EXCLUDED.booking_defaults,
  notification_mode = EXCLUDED.notification_mode,
  token_ttl_minutes = EXCLUDED.token_ttl_minutes,
  updated_at = now();

UPDATE offer_tokens AS token
SET promotion_id = promotion.id
FROM promotions AS promotion
WHERE token.promotion_id IS NULL
  AND token.promo_code_normalized = promotion.code_normalized;

INSERT INTO promotion_redemptions (
  id, promotion_id, booking_id, customer_identity_hash, status, reserved_at, redeemed_at, released_at, created_at
)
SELECT
  legacy.id,
  promotion.id,
  legacy.booking_id,
  legacy.customer_identity_hash,
  legacy.status,
  legacy.reserved_at,
  legacy.redeemed_at,
  legacy.released_at,
  COALESCE(legacy.reserved_at, now())
FROM file_promo_redemptions AS legacy
JOIN promotions AS promotion ON promotion.code_normalized = legacy.promo_code_normalized
ON CONFLICT (booking_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS promotions_code_lookup_index
  ON promotions (code_normalized, status, starts_at, ends_at);

CREATE INDEX IF NOT EXISTS offer_tokens_promotion_lookup_index
  ON offer_tokens (promotion_id, status, expires_at);
