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

-- gen_random_uuid() is built into PostgreSQL 13+ / Supabase — no extension needed

-- ENUMS

create type staff_role as enum ('admin', 'doctor', 'clinic_manager');
create type staff_status as enum ('pending', 'active', 'inactive');
create type appointment_status as enum ('scheduled', 'unassigned', 'completed', 'cancelled');
create type messenger_type as enum ('viber', 'telegram', 'other');
create type time_off_type as enum ('vacation', 'sick', 'blocked');

-- PRACTICE

create table practice (
    id uuid primary key default gen_random_uuid(),
    clinic_name text not null,
    slogan text,
    show_on_main boolean not null default false,
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
    id uuid primary key default gen_random_uuid(),
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
    id uuid primary key default gen_random_uuid(),
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
    id uuid primary key default gen_random_uuid(),
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
    id uuid primary key default gen_random_uuid(),
    staff_id uuid not null references staff(id) on delete cascade,
    weekday int not null check (weekday between 0 and 6),
    start_time time not null,
    end_time time not null,
    created_at timestamptz not null default now(),
    check (end_time > start_time)
);

-- TIME OFF

create table time_off (
    id uuid primary key default gen_random_uuid(),
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

-- TABLE GRANTS (required after DROP SCHEMA public CASCADE — Supabase
-- default privileges are lost when the schema is recreated)

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Ensure future tables/sequences also get grants automatically
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

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
declare
  v_practice_id uuid;
  v_staff_id uuid;
begin
  if exists (select 1 from staff) then
    raise exception 'System is already bootstrapped';
  end if;

  -- If auth user already exists (e.g. after DB reset), reuse their ID
  -- so that staff.id = auth.uid() and RLS works immediately
  select id into v_staff_id from auth.users where email = lower(trim(p_admin_email));

  insert into practice (clinic_name, time_zone, date_format)
  values (p_clinic_name, p_time_zone, p_date_format)
  returning id into v_practice_id;

  insert into staff (id, practice_id, full_name, email, role, status)
  values (coalesce(v_staff_id, gen_random_uuid()), v_practice_id, p_admin_name, lower(trim(p_admin_email)), 'admin', 'active');

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

------------------------------------------------------------
-- PART 4: DEMO DATA SEED FUNCTION
-- 6 doctors, 25 patients, ~350 appointments across 3 weeks
------------------------------------------------------------

create or replace function seed_demo_data(p_practice_id uuid)
returns void language plpgsql security definer set search_path = 'public'
as $$
declare
  v_docs uuid[];
  v_patients uuid[];
  v_mgr  uuid;
  v_tmp  uuid;
  v_mon  date;
  v_day  date;
  v_d    int;
  v_di   int;
  v_h    int;
  v_pi   int := 0;
  v_status text;
  v_target int;
  v_notes text[] := array[
    'Routine cleaning', 'Filling replacement', 'Root canal treatment',
    'Crown preparation', 'Veneer consultation', 'Tooth extraction',
    'X-ray and review', 'Teeth whitening', 'Braces adjustment',
    'Initial consultation', 'Implant check-up', 'Bridge work',
    'Periodontal treatment', 'Wisdom tooth exam', 'Dental sealant',
    'Fluoride treatment', 'Gum disease treatment', 'Night guard fitting',
    'Cavity filling', 'Follow-up visit'
  ];
begin
  -- Practice
  update practice set
    clinic_name = 'D-Spot', slogan = 'Satisfaction Guaranteed', show_on_main = true,
    address = '12 Shevchenka St, Kyiv, 01001',
    phone_number = '+380441234567', contact_email = 'info@dspot.example.com'
  where id = p_practice_id;

  -- Staff: 6 doctors + 1 clinic_manager
  v_docs := array[]::uuid[];

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Olena Kovalenko', 'olena.kovalenko@example.com', '+380501234567', 'doctor', 'active')
  returning id into v_tmp;  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Maksym Shevchenko', 'maksym.shevchenko@example.com', '+380672345678', 'doctor', 'active')
  returning id into v_tmp;  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Andriy Lysenko', 'andriy.lysenko@example.com', '+380633456789', 'doctor', 'active')
  returning id into v_tmp;  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Natalia Tkachuk', 'natalia.tkachuk@example.com', '+380504567890', 'doctor', 'active')
  returning id into v_tmp;  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Viktor Moroz', 'viktor.moroz@example.com', '+380675678901', 'doctor', 'active')
  returning id into v_tmp;  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Daryna Kravchenko', 'daryna.kravchenko@example.com', '+380936789012', 'doctor', 'active')
  returning id into v_tmp;  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Iryna Bondarenko', 'iryna.bondarenko@example.com', '+380937890123', 'clinic_manager', 'active')
  returning id into v_mgr;

  -- Availability: all 6 doctors Mon-Fri 10:00-19:00; docs 1-3 also Sat 10:00-15:00
  for v_di in 1..6 loop
    for v_d in 1..5 loop
      insert into availability (staff_id, weekday, start_time, end_time)
      values (v_docs[v_di], v_d, '10:00', '19:00');
    end loop;
    if v_di <= 3 then
      insert into availability (staff_id, weekday, start_time, end_time)
      values (v_docs[v_di], 6, '10:00', '15:00');
    end if;
  end loop;

  -- Patients: 25
  with ins as (
    insert into patient (practice_id, full_name, phone, email, messenger, messenger_type, notes) values
    (p_practice_id, 'James Smith',        '+14155550101', 'james.smith@email.com',      null,             null,        'Regular checkups'),
    (p_practice_id, 'Maria Garcia',       '+34600550102', 'maria.garcia@email.com',     null,             null,        null),
    (p_practice_id, 'Yuki Tanaka',        '+81901550103', 'yuki.tanaka@email.com',      null,             null,        null),
    (p_practice_id, 'Ahmed Hassan',       '+20100550104', null,                          '@ahmed_h',       'telegram',  'Prefers morning'),
    (p_practice_id, 'Sophie Dubois',      '+33600550105', 'sophie.dubois@email.com',    null,             null,        null),
    (p_practice_id, 'Chen Wei',           '+86138550106', null,                          '+86138550106',   'viber',     null),
    (p_practice_id, 'Priya Patel',        '+91981550107', 'priya.patel@email.com',      null,             null,        'Allergic to latex'),
    (p_practice_id, 'Lars Andersen',      '+4520550108',  null,                          null,             null,        null),
    (p_practice_id, 'Fatima Al-Rashid',   '+97150550109', 'fatima.ar@email.com',        null,             null,        null),
    (p_practice_id, 'Carlos Mendoza',     '+52155550110', null,                          '@carlos_m',      'telegram',  'Braces follow-up'),
    (p_practice_id, 'Emma Johnson',       '+44770550111', 'emma.j@email.com',           null,             null,        null),
    (p_practice_id, 'Kofi Asante',        '+23320550112', null,                          null,             null,        null),
    (p_practice_id, 'Liam O''Brien',      '+35385550113', 'liam.obrien@email.com',      null,             null,        null),
    (p_practice_id, 'Aiko Suzuki',        '+81801550114', 'aiko.suzuki@email.com',      null,             null,        null),
    (p_practice_id, 'Marco Rossi',        '+39331550115', 'marco.rossi@email.com',      null,             null,        null),
    (p_practice_id, 'Elena Volkova',      '+74951550116', null,                          '@elena_v',       'telegram',  null),
    (p_practice_id, 'Raj Sharma',         '+91991550117', 'raj.sharma@email.com',       null,             null,        null),
    (p_practice_id, 'Isabella Costa',     '+55119550118', 'isabella.costa@email.com',   null,             null,        'Sensitive gums'),
    (p_practice_id, 'Olga Petrova',       '+38044550119', null,                          '+38044550119',   'viber',     null),
    (p_practice_id, 'David Kim',          '+82101550120', 'david.kim@email.com',        null,             null,        null),
    (p_practice_id, 'Amara Okafor',       '+23480550121', null,                          null,             null,        null),
    (p_practice_id, 'Lucas Mueller',      '+49151550122', 'lucas.mueller@email.com',    null,             null,        null),
    (p_practice_id, 'Hana Yilmaz',       '+90532550123', 'hana.yilmaz@email.com',      null,             null,        null),
    (p_practice_id, 'Pavel Novak',        '+42060550124', null,                          '@pavel_n',       'telegram',  null),
    (p_practice_id, 'Zara Khan',          '+92300550125', 'zara.khan@email.com',        null,             null,        null)
    returning id
  )
  select array_agg(id) into v_patients from ins;

  -- Monday of current week (ISO: Monday=1)
  v_mon := current_date - ((extract(isodow from current_date)::int - 1) || ' days')::interval;

  -- === PREVIOUS WEEK: Mon-Fri, 55-65% load, completed ===
  -- Docs 1-3: 5/9 slots (55%), Docs 4-6: 6/9 slots (67%), ~5% cancelled
  for v_d in -7..-3 loop
    v_day := v_mon + v_d;
    for v_di in 1..6 loop
      v_target := case when v_di <= 3 then 5 else 6 end;
      for v_h in 10..18 loop
        if ((v_di * 7 + (v_d + 20) * 3 + v_h * 13) % 9) < v_target then
          v_pi := v_pi + 1;
          v_status := case when v_pi % 19 = 0 then 'cancelled' else 'completed' end;
          insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
          values (p_practice_id, v_patients[(v_pi % 25) + 1], v_docs[v_di],
            v_day + make_time(v_h, 0, 0), v_day + make_time(v_h + 1, 0, 0),
            v_status, v_notes[(v_pi % 20) + 1]);
        end if;
      end loop;
    end loop;
  end loop;

  -- Previous Saturday (docs 1-3, ~40%)
  v_day := v_mon - 2;
  for v_di in 1..3 loop
    for v_h in 10..14 loop
      if ((v_di * 7 + v_h * 13) % 5) < 2 then
        v_pi := v_pi + 1;
        insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
        values (p_practice_id, v_patients[(v_pi % 25) + 1], v_docs[v_di],
          v_day + make_time(v_h, 0, 0), v_day + make_time(v_h + 1, 0, 0),
          'completed', v_notes[(v_pi % 20) + 1]);
      end if;
    end loop;
  end loop;

  -- === CURRENT WEEK: Mon-Fri, 55% load (5/9) ===
  -- Past → completed, Future → scheduled
  for v_d in 0..4 loop
    v_day := v_mon + v_d;
    for v_di in 1..6 loop
      for v_h in 10..18 loop
        if ((v_di * 11 + v_d * 7 + v_h * 3) % 9) < 5 then
          v_pi := v_pi + 1;
          if (v_day + make_time(v_h + 1, 0, 0)) < now() then
            v_status := 'completed';
          else
            v_status := 'scheduled';
          end if;
          insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
          values (p_practice_id, v_patients[(v_pi % 25) + 1], v_docs[v_di],
            v_day + make_time(v_h, 0, 0), v_day + make_time(v_h + 1, 0, 0),
            v_status, v_notes[(v_pi % 20) + 1]);
        end if;
      end loop;
    end loop;
  end loop;

  -- Current Saturday (docs 1-3)
  v_day := v_mon + 5;
  for v_di in 1..3 loop
    for v_h in 10..14 loop
      if ((v_di * 11 + 5 * 7 + v_h * 3) % 5) < 2 then
        v_pi := v_pi + 1;
        if (v_day + make_time(v_h + 1, 0, 0)) < now() then
          v_status := 'completed';
        else
          v_status := 'scheduled';
        end if;
        insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
        values (p_practice_id, v_patients[(v_pi % 25) + 1], v_docs[v_di],
          v_day + make_time(v_h, 0, 0), v_day + make_time(v_h + 1, 0, 0),
          v_status, v_notes[(v_pi % 20) + 1]);
      end if;
    end loop;
  end loop;

  -- === NEXT WEEK: Mon-Fri, 25% load (2/9), all scheduled ===
  -- Skip Doc6 on Wed(9), Thu(10), Fri(11) — time-off
  for v_d in 7..11 loop
    v_day := v_mon + v_d;
    for v_di in 1..6 loop
      if v_di = 6 and v_d >= 9 then continue; end if;
      for v_h in 10..18 loop
        if ((v_di * 3 + (v_d + 20) * 11 + v_h * 7) % 9) < 2 then
          v_pi := v_pi + 1;
          insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
          values (p_practice_id, v_patients[(v_pi % 25) + 1], v_docs[v_di],
            v_day + make_time(v_h, 0, 0), v_day + make_time(v_h + 1, 0, 0),
            'scheduled', v_notes[(v_pi % 20) + 1]);
        end if;
      end loop;
    end loop;
  end loop;

  -- === UNASSIGNED: 3 appointments (alert banner demo) ===
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values
    (p_practice_id, v_patients[23], null, (v_mon+7)+time '12:00', (v_mon+7)+time '13:00', 'unassigned', 'Walk-in request — needs doctor'),
    (p_practice_id, v_patients[24], null, (v_mon+8)+time '15:00', (v_mon+8)+time '16:00', 'unassigned', 'Referred by another clinic'),
    (p_practice_id, v_patients[25], null, (v_mon+9)+time '11:00', (v_mon+9)+time '12:00', 'unassigned', 'Emergency slot — assign ASAP');

  -- === TIME OFF: Doc6 (Daryna Kravchenko) next Wed-Fri ===
  insert into time_off (staff_id, start_datetime, end_datetime, type)
  values (v_docs[6], (v_mon+9)+time '00:00', (v_mon+11)+time '23:59', 'vacation');
end;
$$;

grant execute on function seed_demo_data(uuid) to anon;

-- =============================================================
-- DONE! Open the app → /setup → create clinic → you're in.
-- =============================================================
