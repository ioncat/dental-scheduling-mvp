-- =============================================================
-- US-1.0: System Bootstrap & Staff Access Control
-- =============================================================
-- Run this in Supabase SQL Editor.
-- Idempotent: safe to run multiple times.
-- =============================================================

begin;

-- =============================================================
-- 1. UNIQUE CONSTRAINT on staff.email
-- =============================================================

-- Prevent duplicate emails in staff table
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'staff_email_unique'
  ) then
    alter table staff add constraint staff_email_unique unique (email);
  end if;
end $$;

-- =============================================================
-- 2. PUBLIC RPC: is_staff_email()
-- =============================================================
-- Called by the login form BEFORE sending magic link.
-- Returns true only if the email exists in staff with
-- status 'active' or 'pending'.
-- Security definer = bypasses RLS.
-- Callable by anon role (user is not yet authenticated).

create or replace function is_staff_email(check_email text)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select exists (
    select 1 from staff
    where email = lower(trim(check_email))
      and status in ('active', 'pending')
  )
$$;

-- Grant access to anon (unauthenticated) and authenticated roles
grant execute on function is_staff_email(text) to anon;
grant execute on function is_staff_email(text) to authenticated;

-- =============================================================
-- 3. TRIGGER: link staff on first login
-- =============================================================
-- When a user signs in for the first time (INSERT into auth.users),
-- find the matching staff record by email and update staff.id
-- to the new auth.uid().
--
-- This allows admins to create staff records with placeholder UUIDs,
-- and the real auth UUID is linked automatically on first sign-in.

create or replace function link_staff_on_first_login()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  update staff
  set id = new.id
  where email = lower(trim(new.email))
    and id != new.id;
  return new;
end;
$$;

-- Drop and recreate trigger (idempotent)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function link_staff_on_first_login();

-- =============================================================
-- 4. SEED: first admin account
-- =============================================================
-- ⚠️  EDIT the email below before running!
-- This creates the practice and the first admin.
-- Skip if you already have data.

-- Uncomment and edit to run:

-- insert into practice (id, clinic_name, time_zone, date_format)
-- values (
--   'a0000000-0000-0000-0000-000000000001',
--   'My Dental Clinic',
--   'Europe/Kyiv',
--   'DD.MM.YYYY'
-- )
-- on conflict (id) do nothing;
--
-- insert into staff (id, practice_id, full_name, email, role, status)
-- values (
--   gen_random_uuid(),
--   'a0000000-0000-0000-0000-000000000001',
--   'System Administrator',
--   'admin@your-clinic.com',          -- ← CHANGE THIS
--   'admin',
--   'active'
-- )
-- on conflict on constraint staff_email_unique do nothing;

commit;

-- =============================================================
-- DONE!
-- After running this script:
-- 1. Uncomment the seed section and set admin email, run once
-- 2. Deploy updated login.tsx (checks is_staff_email before OTP)
-- 3. Admin signs in → trigger links auth.uid → full access
-- 4. Admin goes to Settings → Staff → adds other members
-- =============================================================
