-- Expands the antenatal visit log from a bare notes field to the structured
-- vitals/checks a nurse actually records on the physical RCH antenatal
-- card at every visit.
ALTER TABLE antenatal_visits
  ADD COLUMN IF NOT EXISTS gestational_age_weeks INTEGER,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS bp_systolic INTEGER,
  ADD COLUMN IF NOT EXISTS bp_diastolic INTEGER,
  ADD COLUMN IF NOT EXISTS fundal_height_cm NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS fetal_heartbeat_present BOOLEAN,
  ADD COLUMN IF NOT EXISTS danger_signs TEXT,
  ADD COLUMN IF NOT EXISTS urine_protein VARCHAR(20),
  ADD COLUMN IF NOT EXISTS urine_glucose VARCHAR(20),
  ADD COLUMN IF NOT EXISTS hemoglobin_gdl NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS iron_folic_acid_given BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS iptp_sp_dose_given INTEGER,
  ADD COLUMN IF NOT EXISTS deworming_given BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS investigations_ordered TEXT;
