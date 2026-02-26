-- =============================================================
-- DEMO DATA SEED — call after bootstrap_practice()
-- =============================================================
-- Creates sample staff, patients, appointments, availability,
-- and time-off for evaluating the UI with realistic data.
-- =============================================================

create or replace function seed_demo_data(p_practice_id uuid)
returns void language plpgsql security definer set search_path = 'public'
as $$
declare
  v_doc1 uuid;
  v_doc2 uuid;
  v_mgr  uuid;
  v_patients uuid[];
  v_mon date;
  v_i int;
begin
  -- ========================================
  -- PRACTICE (fill in address, phone, email)
  -- ========================================

  update practice set
    clinic_name = 'D-Spot',
    slogan = 'Satisfaction Guaranteed',
    show_on_main = true,
    address = '12 Shevchenka St, Kyiv, 01001',
    phone_number = '+380441234567',
    contact_email = 'info@dspot.example.com'
  where id = p_practice_id;

  -- ========================================
  -- STAFF (2 doctors + 1 clinic_manager)
  -- Ukrainian names in Latin script
  -- ========================================

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Olena Kovalenko', 'olena.kovalenko@example.com', '+380501234567', 'doctor', 'active')
  returning id into v_doc1;

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Maksym Shevchenko', 'maksym.shevchenko@example.com', '+380672345678', 'doctor', 'active')
  returning id into v_doc2;

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Iryna Bondarenko', 'iryna.bondarenko@example.com', '+380933456789', 'clinic_manager', 'active')
  returning id into v_mgr;

  -- ========================================
  -- AVAILABILITY
  -- Both doctors: Mon-Fri 10:00-19:00, Sat 10:00-15:00
  -- weekday: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  -- ========================================

  for v_i in 1..5 loop
    insert into availability (staff_id, weekday, start_time, end_time)
    values (v_doc1, v_i, '10:00', '19:00');
    insert into availability (staff_id, weekday, start_time, end_time)
    values (v_doc2, v_i, '10:00', '19:00');
  end loop;

  -- Saturday
  insert into availability (staff_id, weekday, start_time, end_time)
  values (v_doc1, 6, '10:00', '15:00');
  insert into availability (staff_id, weekday, start_time, end_time)
  values (v_doc2, 6, '10:00', '15:00');

  -- ========================================
  -- PATIENTS (12, international names)
  -- ========================================

  v_patients := array[]::uuid[];

  -- 1
  with ins as (
    insert into patient (practice_id, full_name, phone, email, notes)
    values (p_practice_id, 'James Smith', '+14155550101', 'james.smith@email.com', 'Regular checkups')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 2
  with ins as (
    insert into patient (practice_id, full_name, phone, email)
    values (p_practice_id, 'Maria Garcia', '+34600550102', 'maria.garcia@email.com')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 3
  with ins as (
    insert into patient (practice_id, full_name, phone, email)
    values (p_practice_id, 'Yuki Tanaka', '+81901550103', 'yuki.tanaka@email.com')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 4
  with ins as (
    insert into patient (practice_id, full_name, phone, messenger, messenger_type, notes)
    values (p_practice_id, 'Ahmed Hassan', '+20100550104', '@ahmed_h', 'telegram', 'Prefers morning appointments')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 5
  with ins as (
    insert into patient (practice_id, full_name, phone, email)
    values (p_practice_id, 'Sophie Dubois', '+33600550105', 'sophie.dubois@email.com')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 6
  with ins as (
    insert into patient (practice_id, full_name, phone, messenger, messenger_type)
    values (p_practice_id, 'Chen Wei', '+86138550106', '+86138550106', 'viber')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 7
  with ins as (
    insert into patient (practice_id, full_name, phone, email, notes)
    values (p_practice_id, 'Priya Patel', '+91981550107', 'priya.patel@email.com', 'Allergic to latex')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 8
  with ins as (
    insert into patient (practice_id, full_name, phone)
    values (p_practice_id, 'Lars Andersen', '+4520550108')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 9
  with ins as (
    insert into patient (practice_id, full_name, phone, email)
    values (p_practice_id, 'Fatima Al-Rashid', '+97150550109', 'fatima.ar@email.com')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 10
  with ins as (
    insert into patient (practice_id, full_name, phone, messenger, messenger_type, notes)
    values (p_practice_id, 'Carlos Mendoza', '+52155550110', '@carlos_m', 'telegram', 'Braces follow-up')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 11
  with ins as (
    insert into patient (practice_id, full_name, phone, email)
    values (p_practice_id, 'Emma Johnson', '+44770550111', 'emma.j@email.com')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- 12
  with ins as (
    insert into patient (practice_id, full_name, phone)
    values (p_practice_id, 'Kofi Asante', '+23320550112')
    returning id
  ) select array_append(v_patients, id) into v_patients from ins;

  -- ========================================
  -- APPOINTMENTS
  -- Relative to current_date. We find Monday of current week,
  -- then place appointments across last week and this/next week.
  -- All times UTC, within availability windows (10:00-19:00 Mon-Fri, 10:00-15:00 Sat).
  -- ========================================

  -- Monday of current week (ISO: Monday = 1)
  v_mon := current_date - ((extract(isodow from current_date)::int - 1) || ' days')::interval;

  -- === LAST WEEK (completed & cancelled) ===

  -- Last Mon: Doc1, 10:00-11:00, completed
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[1], v_doc1,
    (v_mon - 7) + '10:00'::time, (v_mon - 7) + '11:00'::time,
    'completed', 'Routine cleaning');

  -- Last Mon: Doc1, 11:00-12:00, completed
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[2], v_doc1,
    (v_mon - 7) + '11:00'::time, (v_mon - 7) + '12:00'::time,
    'completed', 'Filling replacement');

  -- Last Mon: Doc2, 10:00-10:30, completed
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[3], v_doc2,
    (v_mon - 7) + '10:00'::time, (v_mon - 7) + '10:30'::time,
    'completed', 'Consultation');

  -- Last Tue: Doc1, 14:00-15:00, completed
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[4], v_doc1,
    (v_mon - 6) + '14:00'::time, (v_mon - 6) + '15:00'::time,
    'completed', 'X-ray review');

  -- Last Tue: Doc2, 11:00-12:00, cancelled
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[5], v_doc2,
    (v_mon - 6) + '11:00'::time, (v_mon - 6) + '12:00'::time,
    'cancelled', 'Patient cancelled');

  -- Last Wed: Doc2, 13:00-14:00, completed
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[6], v_doc2,
    (v_mon - 5) + '13:00'::time, (v_mon - 5) + '14:00'::time,
    'completed', 'Crown preparation');

  -- Last Thu: Doc1, 10:00-11:00, completed
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[7], v_doc1,
    (v_mon - 4) + '10:00'::time, (v_mon - 4) + '11:00'::time,
    'completed', 'Root canal follow-up');

  -- Last Fri: Doc1, 16:00-17:00, cancelled
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[8], v_doc1,
    (v_mon - 3) + '16:00'::time, (v_mon - 3) + '17:00'::time,
    'cancelled', 'Rescheduled to next week');

  -- === THIS WEEK (scheduled — future) ===

  -- This Mon: Doc1, 10:00-11:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[9], v_doc1,
    v_mon + '10:00'::time, v_mon + '11:00'::time,
    'scheduled', 'Initial consultation');

  -- This Mon: Doc1, 11:30-12:30
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[1], v_doc1,
    v_mon + '11:30'::time, v_mon + '12:30'::time,
    'scheduled', 'Teeth whitening');

  -- This Mon: Doc2, 10:00-11:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[10], v_doc2,
    v_mon + '10:00'::time, v_mon + '11:00'::time,
    'scheduled', 'Braces adjustment');

  -- This Tue: Doc1, 14:00-15:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[3], v_doc1,
    (v_mon + 1) + '14:00'::time, (v_mon + 1) + '15:00'::time,
    'scheduled', 'Veneer fitting');

  -- This Tue: Doc2, 12:00-13:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[11], v_doc2,
    (v_mon + 1) + '12:00'::time, (v_mon + 1) + '13:00'::time,
    'scheduled', 'Dental implant consultation');

  -- This Wed: Doc1, 10:00-10:30
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[4], v_doc1,
    (v_mon + 2) + '10:00'::time, (v_mon + 2) + '10:30'::time,
    'scheduled', 'Quick check-up');

  -- This Wed: Doc2, 15:00-16:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[12], v_doc2,
    (v_mon + 2) + '15:00'::time, (v_mon + 2) + '16:00'::time,
    'scheduled', 'Periodontal treatment');

  -- This Thu: Doc1, 11:00-12:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[5], v_doc1,
    (v_mon + 3) + '11:00'::time, (v_mon + 3) + '12:00'::time,
    'scheduled', 'Extraction');

  -- This Thu: Doc2, 10:00-11:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[2], v_doc2,
    (v_mon + 3) + '10:00'::time, (v_mon + 3) + '11:00'::time,
    'scheduled', 'Bridge work');

  -- This Fri: Doc1, 16:00-17:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[8], v_doc1,
    (v_mon + 4) + '16:00'::time, (v_mon + 4) + '17:00'::time,
    'scheduled', 'Rescheduled from last week');

  -- This Sat: Doc1, 10:00-11:00 (Saturday hours 10-15)
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[6], v_doc1,
    (v_mon + 5) + '10:00'::time, (v_mon + 5) + '11:00'::time,
    'scheduled', 'Weekend emergency slot');

  -- === UNASSIGNED (no doctor, future) ===

  -- This Wed: unassigned, 17:00-18:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[7], null,
    (v_mon + 2) + '17:00'::time, (v_mon + 2) + '18:00'::time,
    'unassigned', 'Needs doctor assignment');

  -- This Fri: unassigned, 13:00-14:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[9], null,
    (v_mon + 4) + '13:00'::time, (v_mon + 4) + '14:00'::time,
    'unassigned', 'Walk-in request');

  -- ========================================
  -- TIME OFF
  -- Dr. Shevchenko: next week Wednesday, full day (vacation)
  -- ========================================

  insert into time_off (staff_id, start_datetime, end_datetime, type)
  values (v_doc2, (v_mon + 9) + '00:00'::time, (v_mon + 9) + '23:59'::time, 'vacation');

end;
$$;

grant execute on function seed_demo_data(uuid) to anon;
