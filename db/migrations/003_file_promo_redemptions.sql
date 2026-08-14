ALTER TABLE offer_tokens
  ADD COLUMN IF NOT EXISTS promo_code_normalized TEXT;

CREATE TABLE IF NOT EXISTS file_promo_redemptions (
  id UUID PRIMARY KEY,
  promo_code_normalized TEXT NOT NULL,
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  customer_identity_hash CHAR(64) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'released', 'voided')),
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS file_promo_redemptions_usage_index
  ON file_promo_redemptions (promo_code_normalized, status, customer_identity_hash);
