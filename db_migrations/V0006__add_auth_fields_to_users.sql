ALTER TABLE t_p9483625_cyberpunk_social_net.users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS session_token TEXT;

CREATE INDEX IF NOT EXISTS idx_users_session_token
  ON t_p9483625_cyberpunk_social_net.users(session_token);

CREATE INDEX IF NOT EXISTS idx_users_handle
  ON t_p9483625_cyberpunk_social_net.users(handle);