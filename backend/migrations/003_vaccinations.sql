-- Vaccination records — "nurse scans QR, records vaccination" flow
-- pgcrypto already enabled by 001_children_registry.sql

CREATE TABLE vaccinations (
  vaccination_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id         UUID NOT NULL REFERENCES children(child_id),
  vaccine_code     VARCHAR(40) NOT NULL,        -- e.g. BCG, PENTA1, MEASLES_RUBELLA1
  dose_number      SMALLINT,
  administered_at  DATE NOT NULL,
  facility_id      UUID REFERENCES facilities(facility_id),
  administered_by  UUID NOT NULL REFERENCES users(user_id),
  batch_number     VARCHAR(40),
  notes            VARCHAR(300),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vaccinations_child            ON vaccinations (child_id);
CREATE INDEX idx_vaccinations_administered_at  ON vaccinations (administered_at);
