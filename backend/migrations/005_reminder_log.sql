-- Tracks reminders already sent to guardians so the daily job never
-- re-sends the same vaccine reminder on the same channel twice.
CREATE TABLE reminder_log (
  reminder_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(child_id),
  vaccine_code  VARCHAR(40) NOT NULL,
  channel       VARCHAR(10) NOT NULL,   -- sms | whatsapp
  status        VARCHAR(20) NOT NULL,   -- sent | failed
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, vaccine_code, channel)
);

CREATE INDEX idx_reminder_log_child ON reminder_log (child_id);
