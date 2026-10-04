CREATE TABLE IF NOT EXISTS os_admin_idempotency (
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash CHAR(64) NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  response_status INTEGER,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  PRIMARY KEY (scope, idempotency_key)
);

CREATE INDEX IF NOT EXISTS os_admin_idempotency_expiry_index
  ON os_admin_idempotency (expires_at);
