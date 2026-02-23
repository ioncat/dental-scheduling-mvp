-- =============================================================
-- Row Level Security policies
-- =============================================================
-- Uses SECURITY DEFINER helper functions to avoid infinite
-- recursion when policies on "staff" need to read "staff".
-- =============================================================

-- Enable RLS on all domain tables

alter table practice enable row level security;
alter table staff enable row level security;
alter table patient enable row level security;
alter table appointment enable row level security;
alter table availability enable row level security;
alter table time_off enable row level security;

-- =============================================================
-- HELPER FUNCTIONS (security definer = bypass RLS)
-- =============================================================

-- Returns the practice_id of the current authenticated user
create or replace function auth_practice_id()
returns uuid
language sql
stable
security definer
set search_path = 'public'
as $$
  select practice_id from staff where id = auth.uid()
$$;

-- Returns the role of the current authenticated user
create or replace function auth_staff_role()
returns text
language sql
stable
security definer
set search_path = 'public'
as $$
  select role::text from staff where id = auth.uid()
$$;

-- Returns true if the current user is active staff
create or replace function auth_is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select exists (
    select 1 from staff
    where id = auth.uid()
      and status = 'active'
  )
$$;

---------------------------------------------------------
-- PRACTICE
---------------------------------------------------------

create policy practice_visible_to_members
on practice
for select
using (
  auth_is_active_staff()
  and id = auth_practice_id()
);

---------------------------------------------------------
-- STAFF
---------------------------------------------------------

-- All active staff can see members of their own practice
create policy staff_visible_within_practice
on staff
for select
using (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
);

-- Only admin can insert/update/delete staff
create policy admin_manage_staff
on staff
for all
using (
  auth_is_active_staff()
  and auth_staff_role() = 'admin'
)
with check (
  auth_is_active_staff()
  and auth_staff_role() = 'admin'
);

---------------------------------------------------------
-- PATIENT
---------------------------------------------------------

-- Active staff can see patients in their practice
create policy patient_visible_within_practice
on patient
for select
using (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
);

-- Admin or clinic_manager can create patients
create policy patient_insert_by_admin_or_manager
on patient
for insert
with check (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager')
);

-- Admin or clinic_manager can update patients
create policy patient_update_by_admin_or_manager
on patient
for update
using (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager')
)
with check (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager')
);

---------------------------------------------------------
-- APPOINTMENT
---------------------------------------------------------

-- Doctors see their own appointments
-- Admin / clinic_manager see all in practice
create policy appointment_visibility
on appointment
for select
using (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
  and (
    auth_staff_role() in ('admin', 'clinic_manager')
    or doctor_id = auth.uid()
  )
);

-- Admin or clinic_manager can create appointments
create policy appointment_insert_by_admin_or_manager
on appointment
for insert
with check (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
  and auth_staff_role() in ('admin', 'clinic_manager')
);

-- Admin/manager can update any; doctors can update their own
create policy appointment_update
on appointment
for update
using (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
  and (
    auth_staff_role() in ('admin', 'clinic_manager')
    or doctor_id = auth.uid()
  )
)
with check (
  auth_is_active_staff()
  and practice_id = auth_practice_id()
  and (
    auth_staff_role() in ('admin', 'clinic_manager')
    or doctor_id = auth.uid()
  )
);

---------------------------------------------------------
-- AVAILABILITY
---------------------------------------------------------

-- Doctor sees own, admin sees all
create policy availability_visibility
on availability
for select
using (
  auth_is_active_staff()
  and (
    staff_id = auth.uid()
    or auth_staff_role() = 'admin'
  )
);

-- Doctor manages own, admin manages all
create policy availability_manage
on availability
for all
using (
  auth_is_active_staff()
  and (
    staff_id = auth.uid()
    or auth_staff_role() = 'admin'
  )
)
with check (
  auth_is_active_staff()
  and (
    staff_id = auth.uid()
    or auth_staff_role() = 'admin'
  )
);

---------------------------------------------------------
-- TIME OFF
---------------------------------------------------------

create policy time_off_visibility
on time_off
for select
using (
  auth_is_active_staff()
  and (
    staff_id = auth.uid()
    or auth_staff_role() = 'admin'
  )
);

create policy time_off_manage
on time_off
for all
using (
  auth_is_active_staff()
  and (
    staff_id = auth.uid()
    or auth_staff_role() = 'admin'
  )
)
with check (
  auth_is_active_staff()
  and (
    staff_id = auth.uid()
    or auth_staff_role() = 'admin'
  )
);
