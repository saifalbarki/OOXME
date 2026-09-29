CREATE TABLE IF NOT EXISTS booking_reminders (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  due_at TIMESTAMPTZ NOT NULL,
  scheduled_start_snapshot TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'retry', 'sent', 'failed', 'cancelled', 'unknown')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL,
  lease_expires_at TIMESTAMPTZ,
  external_id TEXT NOT NULL UNIQUE,
  provider_message_id TEXT,
  last_error_code TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, channel)
);

CREATE INDEX IF NOT EXISTS booking_reminders_due_index
  ON booking_reminders (status, next_attempt_at, due_at)
  WHERE status IN ('queued', 'retry');

CREATE INDEX IF NOT EXISTS booking_reminders_lease_index
  ON booking_reminders (lease_expires_at)
  WHERE status = 'processing';
