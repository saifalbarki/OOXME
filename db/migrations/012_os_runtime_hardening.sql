ALTER TABLE notifications ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS archived_by TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS archive_reason TEXT;
CREATE INDEX IF NOT EXISTS notifications_admin_updated_index ON notifications (updated_at DESC) WHERE status <> 'archived';

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS bookings_admin_schedule_index ON bookings (scheduled_start DESC, updated_at DESC);
