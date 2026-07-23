-- Seed major registered hospitals for Dar es Salaam and Dodoma regions.
-- moh_code values below are PLACEHOLDER codes (MOH-<region>-0xx) generated
-- for this system, since the official Ministry of Health Health Facility
-- Registry (hfrs.moh.go.tz) codes were not available at seed time. Update
-- these to the real MOH facility codes once obtained via /settings.
-- 'Amana Regional Referral Hospital' (MOH-DSM-001) was already seeded in
-- 002_users_and_seed.sql, so numbering continues from 002 here.

INSERT INTO facilities (name, level, region, moh_code) VALUES
  ('Muhimbili National Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-002'),
  ('Muhimbili National Hospital - Mloganzila', 'hospital', 'Dar es Salaam', 'MOH-DSM-003'),
  ('Temeke Regional Referral Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-004'),
  ('Mwananyamala Regional Referral Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-005'),
  ('Aga Khan Hospital, Dar es Salaam', 'hospital', 'Dar es Salaam', 'MOH-DSM-006'),
  ('Dodoma Regional Referral Hospital', 'hospital', 'Dodoma', 'MOH-DOD-001'),
  ('Benjamin Mkapa Hospital', 'hospital', 'Dodoma', 'MOH-DOD-002'),
  ('Dodoma Christian Medical Centre (DCMC)', 'hospital', 'Dodoma', 'MOH-DOD-003')
ON CONFLICT (moh_code) DO NOTHING;
