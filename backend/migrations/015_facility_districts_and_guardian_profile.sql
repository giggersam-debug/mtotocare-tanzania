-- 1) Link facilities to a district so the birth-facility picker can be
--    filtered by region -> district instead of showing one flat list.
--    District values researched against each facility's known real-world
--    location (official hospital sites / Ministry of Health facility
--    registry / hospital directories) — same "best effort, update later via
--    /settings" convention as the moh_code placeholders in 009/011/012.
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS district VARCHAR(80);

UPDATE facilities SET district = 'Ilala' WHERE moh_code = 'MOH-DSM-001';       -- Amana Regional Referral Hospital
UPDATE facilities SET district = 'Ilala' WHERE moh_code = 'MOH-DSM-002';       -- Muhimbili National Hospital
UPDATE facilities SET district = 'Ubungo' WHERE moh_code = 'MOH-DSM-003';      -- Muhimbili National Hospital - Mloganzila
UPDATE facilities SET district = 'Temeke' WHERE moh_code = 'MOH-DSM-004';      -- Temeke Regional Referral Hospital
UPDATE facilities SET district = 'Kinondoni' WHERE moh_code = 'MOH-DSM-005';   -- Mwananyamala Regional Referral Hospital
UPDATE facilities SET district = 'Ilala' WHERE moh_code = 'MOH-DSM-006';       -- Aga Khan Hospital, Dar es Salaam
UPDATE facilities SET district = 'Ilala' WHERE moh_code = 'MOH-DSM-007';       -- Shree Hindu Mandal Hospital
UPDATE facilities SET district = 'Kinondoni' WHERE moh_code = 'MOH-DSM-008';   -- TMJ Hospital
UPDATE facilities SET district = 'Kinondoni' WHERE moh_code = 'MOH-DSM-009';   -- Sali International Hospital
UPDATE facilities SET district = 'Ilala' WHERE moh_code = 'MOH-DSM-010';       -- Regency Medical Centre
UPDATE facilities SET district = 'Kinondoni' WHERE moh_code = 'MOH-DSM-011';   -- CCBRT Maternity & Newborn Hospital
UPDATE facilities SET district = 'Kinondoni' WHERE moh_code = 'MOH-DSM-012';   -- Saifee Hospital, Tanzania
UPDATE facilities SET district = 'Ilala' WHERE moh_code = 'MOH-DSM-013';       -- Burhani Charitable Hospital
UPDATE facilities SET district = 'Kinondoni' WHERE moh_code = 'MOH-DSM-014';   -- Hubert Kairuki Memorial Hospital
UPDATE facilities SET district = 'Kinondoni' WHERE moh_code = 'MOH-DSM-015';   -- Edward Michaud Memorial Hospital
UPDATE facilities SET district = 'Dodoma City' WHERE moh_code = 'MOH-DOD-001'; -- Dodoma Regional Referral Hospital
UPDATE facilities SET district = 'Dodoma City' WHERE moh_code = 'MOH-DOD-002'; -- Benjamin Mkapa Hospital
UPDATE facilities SET district = 'Dodoma City' WHERE moh_code = 'MOH-DOD-003'; -- Dodoma Christian Medical Centre (DCMC)

-- 2) Expand what's captured about a mother/father at registration: nature
-- of work and place of residence. Nullable at the DB level so existing
-- guardian rows aren't broken — the application layer (DTOs) requires these
-- going forward for new mother/father registrations.
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS residence VARCHAR(200);
