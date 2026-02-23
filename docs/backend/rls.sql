-- Enable RLS on all domain tables

alter table practice enable row level security;
alter table staff enable row level security;
alter table patient enable row level security;
alter table appointment enable row level security;
alter table availability enable row level security;
alter table time_off enable row level security;

-- Helper: current staff row
create or replace view current_staff as
select *
from staff
where id = auth.uid();

---------------------------------------------------------
-- PRACTICE
---------------------------------------------------------

create policy practice_visible_to_members
on practice
for select
using (
  exists (
    select 1 from staff s
    where s.practice_id = practice.id
      and s.id = auth.uid()
      and s.status = 'active'
  )
);

---------------------------------------------------------
-- STAFF
---------------------------------------------------------

-- Staff can see members of their own practice (admins only full list)

create policy staff_visible_within_practice
on staff
for select
using (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.practice_id = staff.practice_id
      and me.status = 'active'
  )
);

-- Only admin can modify staff

create policy admin_manage_staff
on staff
for all
using (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.role = 'admin'
      and me.status = 'active'
  )
)
with check (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.role = 'admin'
      and me.status = 'active'
  )
);

---------------------------------------------------------
-- PATIENT
---------------------------------------------------------

-- Visible inside practice to active staff

create policy patient_visible_within_practice
on patient
for select
using (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.practice_id = patient.practice_id
      and me.status = 'active'
  )
);

-- Insert/update patients by admin or clinic_manager

create policy patient_manage_by_admin_or_manager
on patient
for insert, update
with check (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.practice_id = patient.practice_id
      and me.role in ('admin','clinic_manager')
      and me.status = 'active'
  )
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
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.status = 'active'
      and me.practice_id = appointment.practice_id
      and (
        me.role in ('admin','clinic_manager')
        or appointment.doctor_id = me.id
      )
  )
);

-- Create / update appointments by admin or clinic_manager

create policy appointment_manage_by_admin_or_manager
on appointment
for insert, update
with check (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.practice_id = appointment.practice_id
      and me.role in ('admin','clinic_manager')
      and me.status = 'active'
  )
);

---------------------------------------------------------
-- AVAILABILITY
---------------------------------------------------------

-- Doctor manages own availability
-- Admin can manage all

create policy availability_visibility
on availability
for select
using (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.status = 'active'
      and (
        availability.staff_id = me.id
        or me.role = 'admin'
      )
  )
);

create policy availability_manage
on availability
for all
using (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.status = 'active'
      and (
        availability.staff_id = me.id
        or me.role = 'admin'
      )
  )
)
with check (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.status = 'active'
      and (
        availability.staff_id = me.id
        or me.role = 'admin'
      )
  )
);

---------------------------------------------------------
-- TIME OFF
---------------------------------------------------------

create policy time_off_visibility
on time_off
for select
using (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.status = 'active'
      and (
        time_off.staff_id = me.id
        or me.role = 'admin'
      )
  )
);

create policy time_off_manage
on time_off
for all
using (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.status = 'active'
      and (
        time_off.staff_id = me.id
        or me.role = 'admin'
      )
  )
)
with check (
  exists (
    select 1 from staff me
    where me.id = auth.uid()
      and me.status = 'active'
      and (
        time_off.staff_id = me.id
        or me.role = 'admin'
      )
  )
);