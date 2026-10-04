DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_frequency_check') THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_frequency_check;
  END IF;
  ALTER TABLE notifications
    ADD CONSTRAINT notifications_frequency_check
    CHECK (frequency IN ('once', 'daily', 'weekly', 'session', 'recurring')) NOT VALID;
END $$;
