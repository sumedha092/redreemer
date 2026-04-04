-- Redreemer Demo Seed Data
-- Run this AFTER schema.sql in your Supabase SQL editor

-- Demo caseworker
INSERT INTO caseworkers (id, auth0_id, name, organization, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'auth0|demo_caseworker',
  'Sarah Chen',
  'Chicago Housing Authority',
  'caseworker'
) ON CONFLICT (auth0_id) DO NOTHING;

-- Demo admin
INSERT INTO caseworkers (id, auth0_id, name, organization, role)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'auth0|demo_admin',
  'Admin User',
  'Redreemer HQ',
  'admin'
) ON CONFLICT (auth0_id) DO NOTHING;

-- Marcus — homeless, Step 4
INSERT INTO users (id, phone_number, name, user_type, city, current_step, last_active, caseworker_id)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '+15550000001',
  'Marcus',
  'homeless',
  'Chicago',
  4,
  NOW() - INTERVAL '1 day',
  'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (phone_number) DO NOTHING;

-- James — reentry, Step 3
INSERT INTO users (id, phone_number, name, user_type, city, current_step, last_active, caseworker_id)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  '+15550000002',
  'James',
  'reentry',
  'Atlanta',
  3,
  NOW() - INTERVAL '2 days',
  'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (phone_number) DO NOTHING;

-- Marcus step logs (completed steps 1-3)
INSERT INTO step_logs (user_id, step_number, completed_at, notes) VALUES
  ('b0000000-0000-0000-0000-000000000001', 1, NOW() - INTERVAL '21 days', 'Connected to Redreemer'),
  ('b0000000-0000-0000-0000-000000000001', 2, NOW() - INTERVAL '14 days', 'Got free state ID at Chicago DMV'),
  ('b0000000-0000-0000-0000-000000000001', 3, NOW() - INTERVAL '7 days', 'Using Pacific Garden Mission address for mail');

-- James step logs (completed steps 1-2)
INSERT INTO step_logs (user_id, step_number, completed_at, notes) VALUES
  ('b0000000-0000-0000-0000-000000000002', 1, NOW() - INTERVAL '10 days', 'Connected to Redreemer'),
  ('b0000000-0000-0000-0000-000000000002', 2, NOW() - INTERVAL '9 days', 'Completed first parole check-in at Atlanta Parole Office');

-- Marcus conversation history
INSERT INTO conversations (user_id, role, content, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'user', 'I need food tonight', NOW() - INTERVAL '3 days'),
  ('b0000000-0000-0000-0000-000000000001', 'assistant', 'Greater Chicago Food Depository is open until 7pm at 4100 W Ann Lurie Pl. They have hot meals tonight. Also, Pacific Garden Mission at 1458 S Canal St serves dinner at 5:30pm — no ID required. Bank On accounts have no minimum balance, so every dollar you save is safe.', NOW() - INTERVAL '3 days'),
  ('b0000000-0000-0000-0000-000000000001', 'user', 'How do I open a bank account without an address?', NOW() - INTERVAL '1 day'),
  ('b0000000-0000-0000-0000-000000000001', 'assistant', 'You can use your shelter address — Pacific Garden Mission allows this. Go to Chase Bank at 21 S Clark St with your state ID and shelter letter. Ask for a Bank On account. Takes 20 minutes, no credit check. Bank On accounts have no minimum balance and no ChexSystems check — opening one starts your credit journey.', NOW() - INTERVAL '1 day');

-- James conversation history
INSERT INTO conversations (user_id, role, content, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'user', 'I just got out. I don''t know where to go.', NOW() - INTERVAL '9 days'),
  ('b0000000-0000-0000-0000-000000000002', 'assistant', 'First thing: your parole check-in. Atlanta Parole Office is at 156 Pryor St SW, open 8am-5pm. Take the MARTA Gold Line to Five Points station, 3 minute walk. Bring your release papers. After that, Atlanta Mission at 250 Hilliard St NE has beds and meals tonight. SNAP benefits average $200/month — you qualify and can apply at dfcs.georgia.gov.', NOW() - INTERVAL '9 days'),
  ('b0000000-0000-0000-0000-000000000002', 'user', 'Where can I get my ID?', NOW() - INTERVAL '7 days'),
  ('b0000000-0000-0000-0000-000000000002', 'assistant', 'Georgia DDS office at 2206 Eastview Pkwy, Conyers — bring your release papers, they count as proof of identity. Free for people recently released. Hours: Mon-Fri 8am-4:30pm. An ID is your financial passport — without it, no bank will open an account for you.', NOW() - INTERVAL '7 days');

-- Marcus upcoming reminder
INSERT INTO reminders (user_id, reminder_text, send_at, sent) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Your Bank On account appointment is today at Chase Bank, 21 S Clark St at 10am. Bring your state ID and shelter letter from Pacific Garden Mission.', NOW() + INTERVAL '1 day', false);
