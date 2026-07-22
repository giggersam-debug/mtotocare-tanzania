-- Growth monitoring: weight/height/MUAC at each visit, with a simple
-- MUAC-based acute malnutrition screen (WHO/UNICEF thresholds).
-- pgcrypto already enabled by 001_children_registry.sql

CREATE TABLE growth_records (
  growth_record_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id             UUID NOT NULL REFERENCES children(child_id),
  visit_date           DATE NOT NULL,
  weight_kg            NUMERIC(5,2),
  height_cm            NUMERIC(5,1),
  muac_cm              NUMERIC(4,1),
  nutritional_status   VARCHAR(30),   -- normal | moderate_acute_malnutrition | severe_acute_malnutrition
  facility_id          UUID REFERENCES facilities(facility_id),
  recorded_by          UUID NOT NULL REFERENCES users(user_id),
  notes                VARCHAR(300),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_growth_records_child       ON growth_records (child_id);
CREATE INDEX idx_growth_records_visit_date  ON growth_records (visit_date);
