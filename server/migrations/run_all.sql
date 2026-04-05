-- Redreemer: Run all migrations (safe to run multiple times)

-- Feature 1: Crisis alerts
CREATE TABLE IF NOT EXISTS crisis_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  message_content text,
  triggered_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by text
);

-- Feature 2: Opt-out columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS opted_out boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS opted_out_at timestamptz;

-- Feature 4: Language preference
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';

-- Feature 5: Insurance progress
CREATE TABLE IF NOT EXISTS insurance_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  module_number integer,
  completed_at timestamptz DEFAULT now(),
  engaged boolean DEFAULT false
);

-- Feature 11: Phone hash
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_hash text;
