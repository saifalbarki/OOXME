CREATE TABLE IF NOT EXISTS os_uptime_samples (
  checked_at TIMESTAMPTZ PRIMARY KEY,
  is_up BOOLEAN NOT NULL,
  response_ms INTEGER,
  status_code INTEGER
);

CREATE INDEX IF NOT EXISTS os_uptime_samples_checked_at_index
  ON os_uptime_samples (checked_at DESC);
