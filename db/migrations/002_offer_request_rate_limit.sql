ALTER TABLE offer_tokens
  ADD COLUMN IF NOT EXISTS request_fingerprint_hash CHAR(64);

CREATE INDEX IF NOT EXISTS offer_tokens_issue_rate_index
  ON offer_tokens (campaign_source, request_fingerprint_hash, created_at DESC);
