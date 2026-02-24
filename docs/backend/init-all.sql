-- =============================================================
-- FULL DATABASE INIT — run this single file to set up everything
-- =============================================================
-- Combines: schema.sql + triggers.sql + rls.sql
-- Safe to run on a fresh Supabase project.
-- Paste into SQL Editor and execute once.
-- =============================================================

------------------------------------------------------------
-- PART 1: SCHEMA (tables, types, indexes)
------------------------------------------------------------

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ENUMS

create type staff_role as enum ('admin', 'doctor', 'clinic_manager');
create type staff_status as enum ('pending', 'active', 'inactive');
create type appointment_status as enum ('scheduled', 'unassigned', 'completed', 'cancelled');
create type messenger_type as enum ('viber', 'telegram', 'other');
create type time_off_type as enum ('vacation', 'sick', 'blocked');

-- PRACTICE

create table practice (
    id uuid primary key default uuid_generate_v4(),
    clinic_name text not null,
    address text,
    phone_number text,
    contact_email text,
    time_zone text not null,
    date_format text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- STAFF

create table staff (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references practice(id) on delete cascade,
    full_name text not null,
    email text not null,
    phone_number text,
    messenger text,
    messenger_type messenger_type,
    role staff_role not null,
    status staff_status not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint staff_email_unique unique (email),
    unique (practice_id, email)
);

-- PATIENT

create table patient (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references practice(id) on delete cascade,
    full_name text not null,
    phone text not null,
    email text,
    messenger text,
    messenger_type messenger_type,
    notes text,
    archived boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (practice_id, phone)
);

-- APPOINTMENT

create table appointment (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references practice(id) on delete cascade,
    patient_id uuid not null references patient(id),
    doctor_id uuid references staff(id),
    start_time timestamptz not null,
    end_time timestamptz not null,
    status appointment_status not null,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (end_time > start_time)
);

-- AVAILABILITY

create table availability (
    id uuid primary key default uuid_generate_v4(),
    staff_id uuid not null references staff(id) on delete cascade,
    weekday int not null check (weekday between 0 and 6),
    start_time time not null,
    end_time time not null,
    created_at timestamptz not null default now(),
    check (end_time > start_time)
);

-- TIME OFF

create table time_off (
    id uuid primary key default uuid_generate_v4(),
    staff_id uuid not null references staff(id) on delete cascade,
    start_datetime timestamptz not null,
    end_datetime timestamptz not null,
    type time_off_type not null,
    created_at timestamptz not null default now(),
    check (end_datetime > start_datetime)
);

-- INDEXES

create index idx_staff_practice on staff(practice_id);
create index idx_patient_practice on patient(practice_id);
create index idx_appointment_practice on appointment(practice_id);
create index idx_appointment_doctor_time on appointment(doctor_id, start_time);
create index idx_appointment_patient on appointment(patient_id);
create index idx_availability_staff on availability(staff_id);
create index idx_time_off_staff on time_off(staff_id);

------------------------------------------------------------
-- PART 2: FUNCTIONS & TRIGGERS
------------------------------------------------------------

-- 0. First Launch: bootstrap check + setup

create or replace function is_system_bootstrapped()
returns boolean
language sql stable security definer set search_path = 'public'
as $$ select exists (select 1 from staff) $$;

grant execute on function is_system_bootstrapped() to anon;
grant execute on function is_system_bootstrapped() to authenticated;

create or replace function bootstrap_practice(
  p_clinic_name text,
  p_admin_name text,
  p_admin_email text,
  p_time_zone text default 'UTC',
  p_date_format text default 'DD/MM/YYYY'
)
returns json language plpgsql security definer set search_path = 'public'
as $$
declare v_practice_id uuid;
begin
  if exists (select 1 from staff) then
    raise exception 'System is already bootstrapped';
  end if;
  insert into practice (clinic_name, time_zone, date_format)
  values (p_clinic_name, p_time_zone, p_date_format)
  returning id into v_practice_id;
  insert into staff (practice_id, full_name, email, role, status)
  values (v_practice_id, p_admin_name, lower(trim(p_admin_email)), 'admin', 'active');
  return json_build_object('practice_id', v_practice_id);
end;
$$;

grant execute on function bootstrap_practice(text, text, text, text, text) to anon;

-- 0a. RPC: is_staff_email

create or replace function is_staff_email(check_email text)
returns boolean
language sql stable security definer set search_path = 'public'
as $$
  select exists (
    select 1 from staff
    where email = lower(trim(check_email))
      and status in ('active', 'pending')
  )
$$;

grant execute on function is_staff_email(text) to anon;
grant execute on function is_staff_email(text) to authenticated;

-- 0b. Trigger: link staff on first auth sign-in

create or replace function link_staff_on_first_login()
returns trigger language plpgsql security definer set search_path = 'public'
as $$
begin
  update staff set id = new.id
  where email = lower(trim(new.email)) and id != new.id;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function link_staff_on_first_login();

-- 1. Doctor becomes inactive → future appointments unassigned

create or replace function unassign_future_appointments()
returns trigger as $$
begin
  if new.status = 'inactive' and old.status <> 'inactive' then
    update appointment
    set doctor_id = null, status = 'unassigned', updated_at = now()
    where doctor_id = new.id and start_time > now() and status = 'scheduled';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_staff_inactive
after update on staff for each row execute function unassign_future_appointments();

-- 2. Prevent reschedule of unassigned

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
for each row execute function block_reschedule_unassigned();

-- 3. Prevent appointment for archived patient

create or replace function prevent_archived_patient_booking()
returns trigger as $$
begin
  if exists (select 1 from patient where id = new.patient_id and archived = true) then
    raise exception 'Cannot create appointment for archived patient';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_block_archived_patient
before insert on appointment for each row execute function prevent_archived_patient_booking();

-- 4. Prevent overlapping appointments per doctor

create or replace function prevent_overlapping_appointments()
returns trigger as $$
begin
  if new.doctor_id is not null then
    if exists (
      select 1 from appointment a
      where a.doctor_id = new.doctor_id
        and a.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000')
        and a.status in ('scheduled')
        and tstzrange(a.start_time, a.end_time) && tstzrange(new.start_time, new.end_time)
    ) then
      raise exception 'Overlapping appointment detected';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_prevent_overlap
before insert or update on appointment for each row execute function prevent_overlapping_appointments();

-- 5. Prevent booking outside doctor availability

create or replace function prevent_booking_outside_availability()
returns trigger as $$
declare
  v_weekday int;
  v_start_time time;
  v_end_time time;
begin
  if new.doctor_id is null then return new; end if;
  v_weekday := extract(dow from new.start_time);
  v_start_time := new.start_time::time;
  v_end_time := new.end_time::time;
  if not exists (
    select 1 from availability a
    where a.staff_id = new.doctor_id and a.weekday = v_weekday
      and a.start_time <= v_start_time and a.end_time >= v_end_time
  ) then
    raise exception 'Appointment is outside doctor availability';
  end if;
  if exists (
    select 1 from time_off t
    where t.staff_id = new.doctor_id
      and tstzrange(t.start_datetime, t.end_datetime) && tstzrange(new.start_time, new.end_time)
  ) then
    raise exception 'Doctor is on time off during this period';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_check_availability
before insert or update on appointment for each row execute function prevent_booking_outside_availability();

-- 6. Enforce UTC timestamps

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
before insert or update on appointment for each row execute function enforce_utc();

------------------------------------------------------------
-- PART 3: ROW LEVEL SECURITY
------------------------------------------------------------

alter table practice enable row level security;
alter table staff enable row level security;
alter table patient enable row level security;
alter table appointment enable row level security;
alter table availability enable row level security;
alter table time_off enable row level security;

-- RLS helper functions (security definer, bypass RLS)

create or replace function auth_practice_id()
returns uuid language sql stable security definer set search_path = 'public'
as $$ select practice_id from staff where id = auth.uid() $$;

create or replace function auth_staff_role()
returns text language sql stable security definer set search_path = 'public'
as $$ select role::text from staff where id = auth.uid() $$;

create or replace function auth_is_active_staff()
returns boolean language sql stable security definer set search_path = 'public'
as $$ select exists (select 1 from staff where id = auth.uid() and status = 'active') $$;

-- PRACTICE
create policy practice_visible_to_members on practice for select
using (auth_is_active_staff() and id = auth_practice_id());

create policy practice_update_by_admin on practice for update
using (auth_is_active_staff() and id = auth_practice_id() and auth_staff_role() = 'admin')
with check (auth_is_active_staff() and id = auth_practice_id() and auth_staff_role() = 'admin');

-- STAFF
create policy staff_visible_within_practice on staff for select
using (auth_is_active_staff() and practice_id = auth_practice_id());

create policy admin_manage_staff on staff for all
using (auth_is_active_staff() and auth_staff_role() = 'admin')
with check (auth_is_active_staff() and auth_staff_role() = 'admin');

-- PATIENT
create policy patient_visible_within_practice on patient for select
using (auth_is_active_staff() and practice_id = auth_practice_id());

create policy patient_insert_by_admin_or_manager on patient for insert
with check (auth_is_active_staff() and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager'));

create policy patient_update_by_admin_or_manager on patient for update
using (auth_is_active_staff() and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager'))
with check (auth_is_active_staff() and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager'));

-- APPOINTMENT
create policy appointment_visibility on appointment for select
using (auth_is_active_staff() and practice_id = auth_practice_id()
  and (auth_staff_role() in ('admin', 'clinic_manager') or doctor_id = auth.uid()));

create policy appointment_insert_by_admin_or_manager on appointment for insert
with check (auth_is_active_staff() and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager'));

create policy appointment_update on appointment for update
using (auth_is_active_staff() and practice_id = auth_practice_id()
  and (auth_staff_role() in ('admin', 'clinic_manager') or doctor_id = auth.uid()))
with check (auth_is_active_staff() and practice_id = auth_practice_id()
  and (auth_staff_role() in ('admin', 'clinic_manager') or doctor_id = auth.uid()));

-- AVAILABILITY
create policy availability_visibility on availability for select
using (auth_is_active_staff() and (staff_id = auth.uid() or auth_staff_role() = 'admin'));

create policy availability_manage on availability for all
using (auth_is_active_staff() and (staff_id = auth.uid() or auth_staff_role() = 'admin'))
with check (auth_is_active_staff() and (staff_id = auth.uid() or auth_staff_role() = 'admin'));

-- TIME OFF
create policy time_off_visibility on time_off for select
using (auth_is_active_staff() and (staff_id = auth.uid() or auth_staff_role() = 'admin'));

create policy time_off_manage on time_off for all
using (auth_is_active_staff() and (staff_id = auth.uid() or auth_staff_role() = 'admin'))
with check (auth_is_active_staff() and (staff_id = auth.uid() or auth_staff_role() = 'admin'));

-- =============================================================
-- DONE! Open the app → /setup → create clinic → you're in.
-- =============================================================
