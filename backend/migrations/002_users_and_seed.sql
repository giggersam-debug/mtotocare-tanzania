-- Facility staff accounts (Auth module) + demo seed data
-- pgcrypto is already enabled by 001_children_registry.sql

CREATE TABLE users (
  user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          VARCHAR(30) NOT NULL CHECK (role IN ('nurse','doctor','nutritionist','pharmacist','ministry','administrator')),
  facility_id   UUID REFERENCES facilities(facility_id),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- children.created_by was left unconstrained in 001 because the users table
-- didn't exist yet. Tie it down now that it does.
ALTER TABLE children
  ADD CONSTRAINT fk_children_created_by FOREIGN KEY (created_by) REFERENCES users(user_id);

-- Demo facility
INSERT INTO facilities (facility_id, name, level, region, moh_code)
VALUES ('11111111-1111-1111-1111-111111111111', 'Amana Regional Referral Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-001')
ON CONFLICT (moh_code) DO NOTHING;

-- Demo nurse login used by the frontend's /login page:
--   username: nurse.amina
--   password: Nurse@2026
-- pgcrypto's crypt()/gen_salt('bf') produces a standard $2a$ bcrypt hash,
-- which AuthService verifies with bcryptjs.compare() — no format mismatch.
INSERT INTO users (username, password_hash, full_name, role, facility_id)
VALUES (
  'nurse.amina',
  crypt('Nurse@2026', gen_salt('bf')),
  'Amina Kileo',
  'nurse',
  '11111111-1111-1111-1111-111111111111'
)
ON CONFLICT (username) DO NOTHING;
