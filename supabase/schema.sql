-- Redreemer Database Schema
-- Run this in your Supabase SQL editor

-- Caseworkers table (must be created before users due to FK)
create table if not exists caseworkers (
  id uuid primary key default gen_random_uuid(),
  auth0_id text unique not null,
  name text,
  organization text,
  role text check (role in ('caseworker', 'admin')),
  created_at timestamp default now()
);

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone_number text unique not null,
  name text,
  user_type text check (user_type in ('homeless', 'reentry', 'both')),
  city text,
  current_step integer default 1,
  last_active timestamp,
  financial_health_score integer default 0,
  caseworker_id uuid references caseworkers(id),
  created_at timestamp default now()
);

-- Conversation memory
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text,
  created_at timestamp default now()
);

-- Step progress log
create table if not exists step_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  step_number integer,
  completed_at timestamp default now(),
  notes text
);

-- Reminders
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  reminder_text text,
  send_at timestamp,
  sent boolean default false
);

-- Enable Row Level Security
alter table users enable row level security;
alter table conversations enable row level security;
alter table step_logs enable row level security;
alter table reminders enable row level security;
alter table caseworkers enable row level security;

-- RLS: Caseworkers can only read their own clients
create policy "caseworker_read_own_clients"
  on users for select
  using (
    caseworker_id = (
      select id from caseworkers
      where auth0_id = auth.uid()::text
    )
  );

-- RLS: Admins can read all users
create policy "admin_read_all_users"
  on users for select
  using (
    exists (
      select 1 from caseworkers
      where auth0_id = auth.uid()::text
      and role = 'admin'
    )
  );

-- RLS: Caseworkers can update their own clients
create policy "caseworker_update_own_clients"
  on users for update
  using (
    caseworker_id = (
      select id from caseworkers
      where auth0_id = auth.uid()::text
    )
  );

-- RLS: Conversations scoped to caseworker's clients
create policy "caseworker_read_own_conversations"
  on conversations for select
  using (
    user_id in (
      select id from users
      where caseworker_id = (
        select id from caseworkers
        where auth0_id = auth.uid()::text
      )
    )
  );

-- RLS: Step logs scoped to caseworker's clients
create policy "caseworker_read_own_step_logs"
  on step_logs for select
  using (
    user_id in (
      select id from users
      where caseworker_id = (
        select id from caseworkers
        where auth0_id = auth.uid()::text
      )
    )
  );

-- RLS: Reminders scoped to caseworker's clients
create policy "caseworker_read_own_reminders"
  on reminders for select
  using (
    user_id in (
      select id from users
      where caseworker_id = (
        select id from caseworkers
        where auth0_id = auth.uid()::text
      )
    )
  );

-- RLS: Caseworkers can only read their own record
create policy "caseworker_read_own_record"
  on caseworkers for select
  using (auth0_id = auth.uid()::text);
