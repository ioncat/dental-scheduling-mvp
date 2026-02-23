---------------------------------------------------------
-- 0a. RPC: is_staff_email (public, callable by anon)
---------------------------------------------------------
-- Called by the login form BEFORE sending magic link.
-- Returns true only if the email belongs to active/pending staff.

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

grant execute on function is_staff_email(text) to anon;
grant execute on function is_staff_email(text) to authenticated;

---------------------------------------------------------
-- 0b. Trigger: link staff record on first auth sign-in
---------------------------------------------------------
-- When a new user is created in auth.users (first magic link),
-- match by email and update staff.id → auth.uid().

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function link_staff_on_first_login();

---------------------------------------------------------
-- 1. Doctor becomes inactive → future appointments unassigned
---------------------------------------------------------

create or replace function unassign_future_appointments()
returns trigger as $$
begin
  if new.status = 'inactive' and old.status <> 'inactive' then
    update appointment
    set doctor_id = null,
        status = 'unassigned',
        updated_at = now()
    where doctor_id = new.id
      and start_time > now()
      and status = 'scheduled';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_staff_inactive
after update on staff
for each row
execute function unassign_future_appointments();

---------------------------------------------------------
-- 2. Prevent reschedule of unassigned appointments
---------------------------------------------------------

create or replace function block_reschedule_unassigned()
returns trigger as $$
begin
  if old.status = 'unassigned' then
    raise exception 'Unassigned appointments must be assigned before rescheduling';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_block_unassigned_reschedule
before update of start_time, end_time on appointment
for each row
execute function block_reschedule_unassigned();

---------------------------------------------------------
-- 3. Prevent appointment for archived patient
---------------------------------------------------------

create or replace function prevent_archived_patient_booking()
returns trigger as $$
begin
  if exists (
    select 1 from patient
    where id = new.patient_id
      and archived = true
  ) then
    raise exception 'Cannot create appointment for archived patient';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_block_archived_patient
before insert on appointment
for each row
execute function prevent_archived_patient_booking();

---------------------------------------------------------
-- 4. Prevent overlapping appointments per doctor
---------------------------------------------------------

create or replace function prevent_overlapping_appointments()
returns trigger as $$
begin
  if new.doctor_id is not null then
    if exists (
      select 1 from appointment a
      where a.doctor_id = new.doctor_id
        and a.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000')
        and a.status in ('scheduled')
        and tstzrange(a.start_time, a.end_time)
            && tstzrange(new.start_time, new.end_time)
    ) then
      raise exception 'Overlapping appointment detected';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_prevent_overlap
before insert or update on appointment
for each row
execute function prevent_overlapping_appointments();

---------------------------------------------------------
-- 5. Enforce UTC timestamps (guardrail)
---------------------------------------------------------

create or replace function enforce_utc()
returns trigger as $$
begin
  if extract(timezone from new.start_time) <> 0
     or extract(timezone from new.end_time) <> 0 then
    raise exception 'Appointment timestamps must be UTC';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_enforce_utc
before insert or update on appointment
for each row
execute function enforce_utc();