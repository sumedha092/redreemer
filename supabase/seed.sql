-- Redreemer Demo Seed Data
-- Run this AFTER schema.sql and migrations/002_add_new_columns.sql in your Supabase SQL editor

-- Demo caseworker
INSERT INTO caseworkers (id, auth0_id, name, organization, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'auth0|demo_caseworker',
  'Sarah Chen',
  'Phoenix Housing Authority',
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

-- Marcus — homeless, Step 4, Phoenix
INSERT INTO users (id, phone_number, name, user_type, city, current_step, last_active, financial_health_score, preferred_language, predatory_warnings, user_meta, caseworker_id)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '+15550000001',
  'Marcus',
  'homeless',
  'Phoenix',
  4,
  NOW() - INTERVAL '2 hours',
  52,
  'en',
  1,
  '{"money_personality_type": "survivor", "quiz_completed_at": "2026-03-01T10:00:00Z"}',
  'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (phone_number) DO NOTHING;

-- James — reentry, Step 3, Phoenix
INSERT INTO users (id, phone_number, name, user_type, city, current_step, last_active, financial_health_score, preferred_language, predatory_warnings, user_meta, caseworker_id)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  '+15550000002',
  'James',
  'reentry',
  'Phoenix',
  3,
  NOW() - INTERVAL '1 day',
  38,
  'en',
  0,
  '{"money_personality_type": "planner"}',
  'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (phone_number) DO NOTHING;

-- Darnell — both, Step 2, Phoenix (at-risk — 6 days silent)
INSERT INTO users (id, phone_number, name, user_type, city, current_step, last_active, financial_health_score, preferred_language, predatory_warnings, user_meta, caseworker_id)
VALUES (
  'b0000000-0000-0000-0000-000000000003',
  '+15550000003',
  'Darnell',
  'both',
  'Phoenix',
  2,
  NOW() - INTERVAL '6 days',
  21,
  'en',
  2,
  '{}',
  'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (phone_number) DO NOTHING;

-- Marcus step logs (completed steps 1-3)
INSERT INTO step_logs (user_id, step_number, completed_at, notes) VALUES
  ('b0000000-0000-0000-0000-000000000001', 1, NOW() - INTERVAL '21 days', 'Connected to Redreemer'),
  ('b0000000-0000-0000-0000-000000000001', 2, NOW() - INTERVAL '14 days', 'Got free state ID at Phoenix MVD'),
  ('b0000000-0000-0000-0000-000000000001', 3, NOW() - INTERVAL '7 days', 'Using Human Services Campus address for mail')
ON CONFLICT DO NOTHING;

-- James step logs (completed steps 1-2)
INSERT INTO step_logs (user_id, step_number, completed_at, notes) VALUES
  ('b0000000-0000-0000-0000-000000000002', 1, NOW() - INTERVAL '10 days', 'Connected to Redreemer'),
  ('b0000000-0000-0000-0000-000000000002', 2, NOW() - INTERVAL '9 days', 'Completed first parole check-in at Phoenix Parole Office')
ON CONFLICT DO NOTHING;

-- Darnell step logs (completed step 1)
INSERT INTO step_logs (user_id, step_number, completed_at, notes) VALUES
  ('b0000000-0000-0000-0000-000000000003', 1, NOW() - INTERVAL '14 days', 'Connected to Redreemer')
ON CONFLICT DO NOTHING;

-- Marcus conversations
INSERT INTO conversations (user_id, role, content, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'user', 'help', NOW() - INTERVAL '21 days'),
  ('b0000000-0000-0000-0000-000000000001', 'assistant', 'Hey. I''m Redreemer. I''m here to help you get back on your feet. Do you have a safe place to sleep tonight?', NOW() - INTERVAL '21 days' + INTERVAL '30 seconds'),
  ('b0000000-0000-0000-0000-000000000001', 'user', 'no im on the street in phoenix az', NOW() - INTERVAL '21 days' + INTERVAL '2 minutes'),
  ('b0000000-0000-0000-0000-000000000001', 'assistant', 'Got you. Two shelters open right now: Human Services Campus, 204 S 12th Ave (602) 256-6945. St. Vincent de Paul, 420 W Watkins St (602) 261-6850. Can you get to either of these?', NOW() - INTERVAL '21 days' + INTERVAL '3 minutes'),
  ('b0000000-0000-0000-0000-000000000001', 'user', 'someone offered me a payday loan for 300 dollars', NOW() - INTERVAL '7 days'),
  ('b0000000-0000-0000-0000-000000000001', 'assistant', 'Heads up — that sounds like a predatory lender. They charge 300-500% interest and trap people in debt cycles. Safer options: Bank On certified accounts (no fees), OneUnited Bank, or call 211 for emergency cash assistance. You deserve better than a payday trap.', NOW() - INTERVAL '7 days' + INTERVAL '30 seconds'),
  ('b0000000-0000-0000-0000-000000000001', 'user', 'i got my id today', NOW() - INTERVAL '2 hours'),
  ('b0000000-0000-0000-0000-000000000001', 'assistant', 'That''s huge. Your ID unlocks everything — banking, housing, benefits. You''re on Step 4 now. Next: open a Bank On account. No minimum balance, no overdraft fees. Bring your ID to any Chase branch.', NOW() - INTERVAL '2 hours' + INTERVAL '30 seconds')
ON CONFLICT DO NOTHING;

-- James conversations
INSERT INTO conversations (user_id, role, content, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'user', 'just got out yesterday', NOW() - INTERVAL '10 days'),
  ('b0000000-0000-0000-0000-000000000002', 'assistant', 'Welcome. The first 90 days are critical. Do you have your parole check-in address?', NOW() - INTERVAL '10 days' + INTERVAL '30 seconds'),
  ('b0000000-0000-0000-0000-000000000002', 'user', 'i need a job but i have a record', NOW() - INTERVAL '1 day'),
  ('b0000000-0000-0000-0000-000000000002', 'assistant', 'These employers hire people with records: 1. Chicanos Por La Causa (602) 257-0700 — ask for workforce development. 2. Arizona@Work (602) 506-3880 — free resume + interview prep. 3. Goodwill of Central AZ (602) 371-6960. You don''t have to mention your record upfront.', NOW() - INTERVAL '1 day' + INTERVAL '30 seconds')
ON CONFLICT DO NOTHING;

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
