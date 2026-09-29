ALTER TABLE promotion_redemptions
  ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;

UPDATE promotion_redemptions
   SET reservation_expires_at = reserved_at + interval '15 minutes'
 WHERE status = 'pending' AND reservation_expires_at IS NULL;

ALTER TABLE promotions
  ADD CONSTRAINT promotions_discount_value_range_check
  CHECK (discount_type <> 'percentage' OR discount_value <= 100) NOT VALID;

INSERT INTO promotions (
  id, code_normalized, status, campaign_source, starts_at, ends_at,
  total_usage_limit, per_customer_limit, service_restrictions,
  duration_restrictions, discount_type, discount_value, currency
)
VALUES
  ('a01f7e1d-9ff4-43d9-bdd9-000000000001', 'FREE', 'active', 'promo_input', NULL, NULL,
   NULL, NULL, '["consultation"]'::jsonb, '[]'::jsonb, 'percentage', 100, NULL),
  ('a01f7e1d-9ff4-43d9-bdd9-000000000002', 'R100', 'active', 'promo_input', NULL, NULL,
   10, NULL, '["consultation"]'::jsonb, '[45]'::jsonb, 'percentage', 100, NULL)
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
  updated_at = now();

UPDATE bookings b
   SET promotion_id = p.id
  FROM promotions p
 WHERE b.promo_code_normalized = p.code_normalized
   AND b.promo_code_normalized IN ('FREE', 'R100')
   AND b.promotion_id IS NULL;

INSERT INTO promotion_redemptions (
  id, promotion_id, booking_id, customer_identity_hash, status,
  reserved_at, redeemed_at, released_at, created_at, reservation_expires_at
)
SELECT old.id, p.id, old.booking_id, old.customer_identity_hash,
       old.status, old.reserved_at, old.redeemed_at, old.released_at,
       old.reserved_at,
       CASE WHEN old.status = 'pending' THEN old.reserved_at + interval '10 minutes' ELSE NULL END
  FROM file_promo_redemptions old
  JOIN promotions p ON p.code_normalized = old.promo_code_normalized
ON CONFLICT (booking_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS promotion_redemptions_reservation_expiry_index
  ON promotion_redemptions (reservation_expires_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS promotion_redemptions_usage_count_index
  ON promotion_redemptions (promotion_id, status, customer_identity_hash);
