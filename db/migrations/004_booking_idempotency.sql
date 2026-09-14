CREATE UNIQUE INDEX IF NOT EXISTS bookings_idempotency_key_unique ON bookings (idempotency_key);
