-- Staff accounts need a contact phone number so vaccination/growth records
-- can show who (and how to reach them) recorded a visit, alongside the
-- facility name (already available via users.facility_id / the record's
-- own facility_id column).
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
