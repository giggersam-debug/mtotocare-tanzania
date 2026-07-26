-- Optional second parent (e.g. father alongside mother), captured during
-- registration. Nullable — most children will only ever have one guardian
-- on file, this just adds room for a second.
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS second_guardian_id UUID REFERENCES guardians(guardian_id);
