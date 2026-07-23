-- Official government/MOH-issued personnel number for each staff account,
-- entered by the facility administrator at account creation (sourced from
-- the national HR system — this app does not generate or validate it).
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_number VARCHAR(40);
