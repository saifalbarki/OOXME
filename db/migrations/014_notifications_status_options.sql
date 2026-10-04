DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'notifications'::regclass AND conname = 'notifications_status_check') THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_status_check;
  END IF;
  ALTER TABLE notifications ADD CONSTRAINT notifications_status_check
    CHECK (status IN ('draft', 'published', 'inactive', 'archived')) NOT VALID;
END $$;
