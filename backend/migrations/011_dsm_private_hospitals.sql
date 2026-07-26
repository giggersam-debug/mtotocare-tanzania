-- Seed major private hospitals for Dar es Salaam (public/regional referral
-- hospitals were seeded in 009). moh_code values are PLACEHOLDER codes
-- (MOH-DSM-0xx), same convention as 009 — update once real MOH Health
-- Facility Registry codes are available. Aga Khan Hospital was already
-- seeded in 009 (MOH-DSM-006), so numbering continues from there.

INSERT INTO facilities (name, level, region, moh_code) VALUES
  ('Shree Hindu Mandal Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-007'),
  ('TMJ Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-008'),
  ('Sali International Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-009'),
  ('Regency Medical Centre', 'hospital', 'Dar es Salaam', 'MOH-DSM-010'),
  ('CCBRT Maternity & Newborn Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-011')
ON CONFLICT (moh_code) DO NOTHING;
