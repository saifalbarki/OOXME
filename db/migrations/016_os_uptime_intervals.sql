ALTER TABLE os_uptime_samples
  ADD COLUMN IF NOT EXISTS interval_start TIMESTAMPTZ;

UPDATE os_uptime_samples
   SET interval_start = to_timestamp(floor(extract(epoch FROM checked_at) / 300) * 300)
 WHERE interval_start IS NULL;

DELETE FROM os_uptime_samples older
 USING os_uptime_samples newer
 WHERE older.interval_start = newer.interval_start
   AND (older.checked_at < newer.checked_at
        OR (older.checked_at = newer.checked_at AND older.ctid < newer.ctid));

ALTER TABLE os_uptime_samples
  ALTER COLUMN interval_start SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS os_uptime_samples_interval_start_index
  ON os_uptime_samples (interval_start);
