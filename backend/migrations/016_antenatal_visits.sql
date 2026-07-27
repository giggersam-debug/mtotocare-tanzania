-- Full antenatal-visit log (one row per ANC visit — date, facility, staff,
-- notes, and next-visit-due date), plus a general free-text clinical-notes
-- field on the pregnancy record itself for things like lab/test orders that
-- don't belong to a single dated visit.
ALTER TABLE maternal_health_records
  ADD COLUMN IF NOT EXISTS clinical_notes TEXT;

CREATE TABLE IF NOT EXISTS antenatal_visits (
  antenatal_visit_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maternal_health_record_id  UUID NOT NULL REFERENCES maternal_health_records(maternal_health_record_id),
  visit_date                 DATE NOT NULL,
  next_visit_date            DATE,
  facility_id                UUID REFERENCES facilities(facility_id),
  recorded_by                UUID REFERENCES users(user_id),
  notes                      TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_antenatal_visits_record ON antenatal_visits(maternal_health_record_id);
