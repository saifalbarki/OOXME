CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  publish_date TIMESTAMPTZ NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('clients', 'employees', 'everyone')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_delivery_index
  ON notifications (status, audience, publish_date DESC);
