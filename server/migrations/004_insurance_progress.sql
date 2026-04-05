CREATE TABLE IF NOT EXISTS insurance_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  module_number integer,
  completed_at timestamptz DEFAULT now(),
  engaged boolean DEFAULT false
);
