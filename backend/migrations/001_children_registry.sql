-- Child registration + QR issuance schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE guardians (
  guardian_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         VARCHAR(150) NOT NULL,
  relation          VARCHAR(30)  NOT NULL,          -- mother | father | guardian
  phone             VARCHAR(20)  NOT NULL UNIQUE,
  whatsapp_opt_in   BOOLEAN      NOT NULL DEFAULT false,
  national_id_ref   VARCHAR(30),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
  facility_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(150) NOT NULL,
  level        VARCHAR(30)  NOT NULL,                -- dispensary | health_centre | hospital
  region       VARCHAR(80)  NOT NULL,
  moh_code     VARCHAR(30)  UNIQUE NOT NULL
);

CREATE TABLE children (
  child_id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name                   VARCHAR(150) NOT NULL,
  date_of_birth                DATE NOT NULL,
  sex                          VARCHAR(10) NOT NULL CHECK (sex IN ('male','female')),
  birth_weight_kg              NUMERIC(4,2),
  birth_height_cm              NUMERIC(4,1),
  birth_facility_id            UUID REFERENCES facilities(facility_id),
  guardian_id                  UUID NOT NULL REFERENCES guardians(guardian_id),
  region                       VARCHAR(80),
  district                     VARCHAR(80),
  ward                         VARCHAR(80),
  village                      VARCHAR(80),
  qr_token                     VARCHAR(64) NOT NULL UNIQUE,
  national_health_number       VARCHAR(30) UNIQUE,
  birth_registration_number    VARCHAR(30),
  created_by                   UUID NOT NULL,        -- FK -> users.user_id (Auth module)
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_children_guardian ON children (guardian_id);
CREATE INDEX idx_children_region   ON children (region, district);
