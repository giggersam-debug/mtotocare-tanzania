-- Tracks when each staff account last successfully logged in, so Settings
-- can show "who's logging in" instead of just the static staff roster.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
