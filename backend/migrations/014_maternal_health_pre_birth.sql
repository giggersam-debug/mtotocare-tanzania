-- Allow a maternal/pregnancy history record to exist before the child does
-- (registered during an antenatal visit, before delivery). child_id stays
-- UNIQUE (a child can only have one such record) but is no longer required
-- at creation time — it gets attached once the child is later registered.
ALTER TABLE maternal_health_records
  ALTER COLUMN child_id DROP NOT NULL;
