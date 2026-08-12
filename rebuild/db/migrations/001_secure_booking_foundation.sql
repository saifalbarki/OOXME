CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY,
  code_normalized TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  campaign_source TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  total_usage_limit INTEGER CHECK (total_usage_limit IS NULL OR total_usage_limit >= 0),
  per_customer_limit INTEGER CHECK (per_customer_limit IS NULL OR per_customer_limit >= 0),
  service_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(14, 2) NOT NULL CHECK (discount_value >= 0),
  currency CHAR(3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY,
  public_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'confirmed', 'cancelled', 'failed')),
  service_code TEXT NOT NULL DEFAULT 'consultation',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email_normalized TEXT NOT NULL,
  customer_phone_normalized TEXT NOT NULL,
  customer_identity_hash CHAR(64) NOT NULL,
  topic TEXT NOT NULL,
  sector TEXT NOT NULL,
  additional_information TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Baghdad',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  base_amount NUMERIC(14, 2) NOT NULL CHECK (base_amount >= 0),
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  final_amount NUMERIC(14, 2) NOT NULL CHECK (final_amount >= 0),
  currency CHAR(3) NOT NULL,
  payment_provider TEXT,
  promotion_id UUID REFERENCES promotions(id),
  promo_code_normalized TEXT,
  calendar_event_id TEXT UNIQUE,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (scheduled_end > scheduled_start),
  CHECK (final_amount = GREATEST(0, base_amount - discount_amount))
);

CREATE TABLE IF NOT EXISTS offer_tokens (
  id UUID PRIMARY KEY,
  token_hash CHAR(64) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'held', 'consumed', 'expired', 'revoked')),
  campaign_source TEXT NOT NULL,
  service_code TEXT NOT NULL DEFAULT 'consultation',
  granted_duration_minutes INTEGER NOT NULL CHECK (granted_duration_minutes > 0),
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(14, 2) NOT NULL DEFAULT 100 CHECK (discount_value >= 0),
  currency CHAR(3),
  issued_session_hash CHAR(64),
  customer_identity_hash CHAR(64),
  expires_at TIMESTAMPTZ NOT NULL,
  held_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  consumed_booking_id UUID UNIQUE REFERENCES bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS offer_token_id UUID UNIQUE REFERENCES offer_tokens(id);

CREATE TABLE IF NOT EXISTS promotion_redemptions (
  id UUID PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES promotions(id),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  customer_identity_hash CHAR(64) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'released', 'voided')),
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_holds (
  id UUID PRIMARY KEY,
  booking_id UUID UNIQUE REFERENCES bookings(id),
  service_code TEXT NOT NULL DEFAULT 'consultation',
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'confirmed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  CHECK (slot_end > slot_start),
  CHECK (expires_at > created_at),
  EXCLUDE USING gist (
    service_code WITH =,
    tstzrange(slot_start, slot_end, '[)') WITH &&
  ) WHERE (status = 'active')
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY,
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash CHAR(64) NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  booking_id UUID REFERENCES bookings(id),
  response_status INTEGER,
  response_body JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (scope, idempotency_key),
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS bookings_schedule_index ON bookings (service_code, scheduled_start, scheduled_end) WHERE status IN ('held', 'confirmed');
CREATE INDEX IF NOT EXISTS bookings_customer_identity_index ON bookings (customer_identity_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS promotions_eligibility_index ON promotions (status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS promotion_redemptions_promotion_index ON promotion_redemptions (promotion_id, status, customer_identity_hash);
CREATE INDEX IF NOT EXISTS offer_tokens_lookup_index ON offer_tokens (token_hash, status, expires_at);
CREATE INDEX IF NOT EXISTS booking_holds_expiry_index ON booking_holds (status, expires_at);
CREATE INDEX IF NOT EXISTS idempotency_keys_expiry_index ON idempotency_keys (scope, expires_at);
