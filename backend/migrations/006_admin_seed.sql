-- Demo administrator account so the Settings / facility admin page has
-- something to log in with. pgcrypto is already enabled (see 001).
--   username: admin.mtoto
--   password: Admin@2026
INSERT INTO users (username, password_hash, full_name, role, facility_id)
VALUES (
  'admin.mtoto',
  crypt('Admin@2026', gen_salt('bf')),
  'Grace Mushi',
  'administrator',
  '11111111-1111-1111-1111-111111111111'
)
ON CONFLICT (username) DO NOTHING;
