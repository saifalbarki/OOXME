ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS booking_language TEXT NOT NULL DEFAULT 'en';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'bookings_booking_language_check'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_booking_language_check
      CHECK (booking_language IN ('en', 'ar'));
  END IF;
END $$;
