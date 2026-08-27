-- OOXME OS foundation: immutable display codes, typed contact fields, optimistic
-- concurrency columns, archival metadata, and additive task/promotion/notification fields.

CREATE TABLE IF NOT EXISTS os_display_code_sequences (
  entity_type TEXT NOT NULL CHECK (entity_type IN ('employee', 'client', 'task', 'discount')),
  period_utc CHAR(4) NOT NULL CHECK (period_utc ~ '^[0-9]{4}$'),
  last_value SMALLINT NOT NULL CHECK (last_value BETWEEN 0 AND 99),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, period_utc)
);

CREATE OR REPLACE FUNCTION os_next_display_code(p_entity_type TEXT, p_created_at TIMESTAMPTZ DEFAULT now())
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  code_prefix TEXT;
  code_period CHAR(4);
  sequence_value SMALLINT;
BEGIN
  code_prefix := CASE p_entity_type
    WHEN 'employee' THEN 'EX'
    WHEN 'client' THEN 'CX'
    WHEN 'task' THEN 'OT'
    WHEN 'discount' THEN 'OD'
    ELSE NULL
  END;
  IF code_prefix IS NULL THEN RAISE EXCEPTION 'Unsupported display-code entity type: %', p_entity_type USING ERRCODE = '22023'; END IF;
  code_period := to_char(COALESCE(p_created_at, now()) AT TIME ZONE 'UTC', 'YYMM');
  INSERT INTO os_display_code_sequences (entity_type, period_utc, last_value)
  VALUES (p_entity_type, code_period, 1)
  ON CONFLICT (entity_type, period_utc) DO UPDATE
    SET last_value = os_display_code_sequences.last_value + 1, updated_at = now()
  RETURNING last_value INTO sequence_value;
  IF sequence_value > 99 THEN RAISE EXCEPTION 'Display-code sequence exhausted for %/%', p_entity_type, code_period USING ERRCODE = '22023'; END IF;
  RETURN code_prefix || code_period || lpad(sequence_value::TEXT, 2, '0');
END;
$$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS display_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE users ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS archived_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS archive_reason TEXT;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS phone_e164 TEXT;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS phone_e164 TEXT;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_code TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 1 AND 525600);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived_by UUID;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archive_reason TEXT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

ALTER TABLE promotions ADD COLUMN IF NOT EXISTS discount_display_code TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS archived_by UUID;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS archive_reason TEXT;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS archived_by UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS archive_reason TEXT;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'archived'));
ALTER TABLE notifications ADD CONSTRAINT notifications_valid_until_after_publish CHECK (valid_until IS NULL OR valid_until > publish_date);

CREATE UNIQUE INDEX IF NOT EXISTS users_display_code_unique ON users (display_code) WHERE display_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS tasks_task_code_unique ON tasks (task_code) WHERE task_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS promotions_discount_display_code_unique ON promotions (discount_display_code) WHERE discount_display_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS files_task_index ON files (task_id, created_at DESC) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS notifications_effective_delivery_index ON notifications (status, audience, publish_date DESC, valid_until);

CREATE OR REPLACE FUNCTION os_assign_display_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'users' AND NEW.display_code IS NULL THEN
    NEW.display_code := os_next_display_code(NEW.account_type, NEW.created_at);
  ELSIF TG_TABLE_NAME = 'tasks' AND NEW.task_code IS NULL THEN
    NEW.task_code := os_next_display_code('task', NEW.created_at);
  ELSIF TG_TABLE_NAME = 'promotions' AND NEW.promotion_type = 'public_promo' AND NEW.discount_display_code IS NULL THEN
    NEW.discount_display_code := os_next_display_code('discount', NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION os_prevent_display_code_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'users' AND OLD.display_code IS NOT NULL AND NEW.display_code IS DISTINCT FROM OLD.display_code THEN RAISE EXCEPTION 'display_code is immutable' USING ERRCODE = '22023'; END IF;
  IF TG_TABLE_NAME = 'tasks' AND OLD.task_code IS NOT NULL AND NEW.task_code IS DISTINCT FROM OLD.task_code THEN RAISE EXCEPTION 'task_code is immutable' USING ERRCODE = '22023'; END IF;
  IF TG_TABLE_NAME = 'promotions' AND OLD.discount_display_code IS NOT NULL AND NEW.discount_display_code IS DISTINCT FROM OLD.discount_display_code THEN RAISE EXCEPTION 'discount_display_code is immutable' USING ERRCODE = '22023'; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS os_users_assign_display_code ON users;
CREATE TRIGGER os_users_assign_display_code BEFORE INSERT ON users FOR EACH ROW EXECUTE FUNCTION os_assign_display_code();
DROP TRIGGER IF EXISTS os_tasks_assign_display_code ON tasks;
CREATE TRIGGER os_tasks_assign_display_code BEFORE INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION os_assign_display_code();
DROP TRIGGER IF EXISTS os_promotions_assign_display_code ON promotions;
CREATE TRIGGER os_promotions_assign_display_code BEFORE INSERT ON promotions FOR EACH ROW EXECUTE FUNCTION os_assign_display_code();
DROP TRIGGER IF EXISTS os_users_display_code_immutable ON users;
CREATE TRIGGER os_users_display_code_immutable BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION os_prevent_display_code_change();
DROP TRIGGER IF EXISTS os_tasks_display_code_immutable ON tasks;
CREATE TRIGGER os_tasks_display_code_immutable BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION os_prevent_display_code_change();
DROP TRIGGER IF EXISTS os_promotions_display_code_immutable ON promotions;
CREATE TRIGGER os_promotions_display_code_immutable BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION os_prevent_display_code_change();

UPDATE users SET display_code = os_next_display_code(account_type, created_at) WHERE display_code IS NULL;
UPDATE tasks SET task_code = os_next_display_code('task', created_at) WHERE task_code IS NULL;
UPDATE promotions SET discount_display_code = os_next_display_code('discount', created_at) WHERE promotion_type = 'public_promo' AND discount_display_code IS NULL;

UPDATE employee_profiles p SET email = lower(u.username) FROM users u WHERE p.user_id = u.id AND p.email IS NULL AND u.account_type = 'employee' AND u.username ~* '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$';
UPDATE client_profiles p SET email = lower(u.username) FROM users u WHERE p.user_id = u.id AND p.email IS NULL AND u.account_type = 'client' AND u.username ~* '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$';
