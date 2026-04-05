-- Migration: Add new columns for Phase 1 & 2 features
-- Run this in your Supabase SQL editor after schema.sql

-- Add preferred_language column
alter table users add column if not exists preferred_language text default 'en';

-- Add opted_out columns
alter table users add column if not exists opted_out boolean default false;
alter table users add column if not exists opted_out_at timestamp;

-- Add phone_hash for privacy
alter table users add column if not exists phone_hash text;

-- Add predatory_warnings counter (Feature 1)
alter table users add column if not exists predatory_warnings integer default 0;

-- Add user_meta JSONB for flexible per-user data (Features 5, 6, 7, 14, 15, 20)
-- Stores: money_personality_type, has_id, has_bank_account, chexsystems_flag,
--         has_birth_cert, has_ssn_card, has_state_id, simplified_mode,
--         preferred_language, savings_goal_name, savings_goal_amount,
--         savings_weekly_target, savings_current, quiz_completed_at
alter table users add column if not exists user_meta jsonb default '{}';

-- Add step_updated_at for risk score calculation (Feature 13)
alter table users add column if not exists step_updated_at timestamp;

-- Update step_updated_at whenever current_step changes (trigger)
create or replace function update_step_timestamp()
returns trigger as $$
begin
  if new.current_step <> old.current_step then
    new.step_updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_step_change on users;
create trigger on_step_change
  before update on users
  for each row execute function update_step_timestamp();

-- Crisis alerts table (if not exists)
create table if not exists crisis_alerts (
  id uuid primary key default gen_random_uuid(),
  phone text,
  message text,
  triggered_at timestamp default now(),
  resolved boolean default false,
  resolved_at timestamp,
  resolved_by text
);

-- Insurance progress table (if not exists)
create table if not exists insurance_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  module_number integer,
  engaged boolean default true,
  created_at timestamp default now()
);

-- Index for performance
create index if not exists idx_users_last_active on users(last_active);
create index if not exists idx_users_current_step on users(current_step);
create index if not exists idx_conversations_user_id on conversations(user_id, created_at desc);
