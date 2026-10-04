ALTER TABLE notifications ALTER COLUMN audience SET DEFAULT 'everyone';
ALTER TABLE notifications ALTER COLUMN status SET DEFAULT 'published';
ALTER TABLE notifications ALTER COLUMN body_ar DROP NOT NULL;
