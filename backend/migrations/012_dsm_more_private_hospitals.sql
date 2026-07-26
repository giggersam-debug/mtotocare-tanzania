-- More private/faith-based hospitals in Dar es Salaam, per user request.
-- Aga Khan Hospital was already seeded in 009 (MOH-DSM-006) — not repeated.
-- moh_code values are PLACEHOLDER codes, same convention as 009/011.

INSERT INTO facilities (name, level, region, moh_code) VALUES
  ('Saifee Hospital, Tanzania', 'hospital', 'Dar es Salaam', 'MOH-DSM-012'),
  ('Burhani Charitable Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-013'),
  ('Hubert Kairuki Memorial Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-014'),
  ('Edward Michaud Memorial Hospital', 'hospital', 'Dar es Salaam', 'MOH-DSM-015')
ON CONFLICT (moh_code) DO NOTHING;
