-- Preserve project and file history when an OS-managed client account is deleted.
ALTER TABLE projects
  ALTER COLUMN client_id DROP NOT NULL;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'projects'::regclass
    AND contype = 'f'
    AND confrelid = 'client_profiles'::regclass
    AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'projects'::regclass AND attname = 'client_id')];

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE projects DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE projects
  ADD CONSTRAINT projects_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES client_profiles(id) ON DELETE SET NULL;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'files'::regclass
    AND contype = 'f'
    AND confrelid = 'client_profiles'::regclass
    AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'files'::regclass AND attname = 'client_id')];

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE files DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE files
  ADD CONSTRAINT files_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES client_profiles(id) ON DELETE SET NULL;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'files'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%project_id%'
    AND pg_get_constraintdef(oid) ILIKE '%client_id%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE files DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;
