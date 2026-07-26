-- Maternal & pregnancy history, linked to both the guardian (mother) and the
-- resulting child. One row per pregnancy/child. Deliberately separate from
-- the `children` table (which already has birth_weight_kg/birth_height_cm)
-- since this data is more sensitive (HIV status, genetic/family history)
-- and needs tighter access control than the general child record.
CREATE TABLE maternal_health_records (
  maternal_health_record_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id                   UUID NOT NULL UNIQUE REFERENCES children(child_id),
  guardian_id                UUID NOT NULL REFERENCES guardians(guardian_id),

  -- Obstetric history
  gravida                    INTEGER,
  para                       INTEGER,
  estimated_due_date         DATE,
  anc_visits                 INTEGER,
  gestational_age_weeks      INTEGER,

  -- Pregnancy conditions
  gestational_diabetes       BOOLEAN NOT NULL DEFAULT false,
  hypertension               BOOLEAN NOT NULL DEFAULT false,
  anemia                     BOOLEAN NOT NULL DEFAULT false,
  malaria_in_pregnancy       BOOLEAN NOT NULL DEFAULT false,
  hiv_status                 VARCHAR(20) NOT NULL DEFAULT 'unknown', -- positive | negative | unknown
  art_adherence               VARCHAR(20),                            -- good | fair | poor | n/a

  -- Delivery outcome
  delivery_mode               VARCHAR(20),                            -- vaginal | cesarean | assisted
  apgar_score                 INTEGER,
  delivery_complications      TEXT,

  -- Genetic / hereditary risk flags (free text — checklist can be layered on later)
  genetic_family_history       TEXT,

  -- Consent gate: this data must not be recorded/shown without the mother's consent
  consent_given                BOOLEAN NOT NULL DEFAULT false,

  recorded_by                 UUID REFERENCES users(user_id),
  facility_id                 UUID REFERENCES facilities(facility_id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);
