-- =============================================================
-- DEMO DATA SEED — call after bootstrap_practice()
-- =============================================================
-- Creates 6 doctors, 25 patients, ~350 appointments across 3 weeks,
-- availability, time-off. Designed to stress-test the calendar UI.
--
-- Load profile:
--   Previous week:  55-65% per doctor (completed)
--   Current  week:  55% (past=completed, future=scheduled)
--   Next     week:  25% (all scheduled)
--   3 unassigned appointments for alert demo
--   1 doctor with time-off next week (Wed-Fri)
-- =============================================================

create or replace function seed_demo_data(p_practice_id uuid)
returns void language plpgsql security definer set search_path = 'public'
as $$
declare
  v_docs uuid[];
  v_patients uuid[];
  v_mgr  uuid;
  v_tmp  uuid;
  v_mon  date;      -- Monday of current week
  v_day  date;
  v_d    int;        -- day offset from v_mon
  v_di   int;        -- doctor index (1..6)
  v_h    int;        -- appointment start hour (10..18)
  v_pi   int := 0;   -- patient cycling counter
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
  -- ========================================
  -- PRACTICE
  -- ========================================

  update practice set
    clinic_name    = 'D-Spot',
    slogan         = 'Satisfaction Guaranteed',
    show_on_main   = true,
    address        = '12 Shevchenka St, Kyiv, 01001',
    phone_number   = '+380441234567',
    contact_email  = 'info@dspot.example.com'
  where id = p_practice_id;

  -- ========================================
  -- STAFF: 6 doctors + 1 clinic_manager
  -- ========================================

  v_docs := array[]::uuid[];

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Olena Kovalenko', 'olena.kovalenko@example.com', '+380501234567', 'doctor', 'active')
  returning id into v_tmp;
  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Maksym Shevchenko', 'maksym.shevchenko@example.com', '+380672345678', 'doctor', 'active')
  returning id into v_tmp;
  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Andriy Lysenko', 'andriy.lysenko@example.com', '+380633456789', 'doctor', 'active')
  returning id into v_tmp;
  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Natalia Tkachuk', 'natalia.tkachuk@example.com', '+380504567890', 'doctor', 'active')
  returning id into v_tmp;
  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Viktor Moroz', 'viktor.moroz@example.com', '+380675678901', 'doctor', 'active')
  returning id into v_tmp;
  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Daryna Kravchenko', 'daryna.kravchenko@example.com', '+380936789012', 'doctor', 'active')
  returning id into v_tmp;
  v_docs := array_append(v_docs, v_tmp);

  insert into staff (practice_id, full_name, email, phone_number, role, status)
  values (p_practice_id, 'Iryna Bondarenko', 'iryna.bondarenko@example.com', '+380937890123', 'clinic_manager', 'active')
  returning id into v_mgr;

  -- ========================================
  -- AVAILABILITY
  -- All 6 doctors: Mon-Fri 10:00-19:00
  -- Doctors 1-3 also Sat 10:00-15:00
  -- ========================================

  for v_di in 1..6 loop
    for v_d in 1..5 loop   -- Mon(1)..Fri(5)
      insert into availability (staff_id, weekday, start_time, end_time)
      values (v_docs[v_di], v_d, '10:00', '19:00');
    end loop;
    if v_di <= 3 then
      insert into availability (staff_id, weekday, start_time, end_time)
      values (v_docs[v_di], 6, '10:00', '15:00');
    end if;
  end loop;

  -- ========================================
  -- PATIENTS: 25
  -- ========================================

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

  -- ========================================
  -- Monday of current week (ISO: Monday = 1)
  -- ========================================

  v_mon := current_date - ((extract(isodow from current_date)::int - 1) || ' days')::interval;

  -- ========================================
  -- PREVIOUS WEEK: Mon-Fri, 55-65% load
  -- Docs 1-3: target 5/9 slots (55%)
  -- Docs 4-6: target 6/9 slots (67%)
  -- All completed, ~5% cancelled
  -- ========================================

  for v_d in -7..-3 loop     -- Mon(-7) through Fri(-3) of last week
    v_day := v_mon + v_d;
    for v_di in 1..6 loop
      v_target := case when v_di <= 3 then 5 else 6 end;
      for v_h in 10..18 loop
        if ((v_di * 7 + (v_d + 20) * 3 + v_h * 13) % 9) < v_target then
          v_pi := v_pi + 1;
          v_status := case when v_pi % 19 = 0 then 'cancelled' else 'completed' end;
          insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
          values (
            p_practice_id,
            v_patients[(v_pi % 25) + 1],
            v_docs[v_di],
            v_day + make_time(v_h, 0, 0),
            v_day + make_time(v_h + 1, 0, 0),
            v_status,
            v_notes[(v_pi % 20) + 1]
          );
        end if;
      end loop;
    end loop;
  end loop;

  -- Previous Saturday (docs 1-3 only, ~40% of 5 slots)
  v_day := v_mon - 2;
  for v_di in 1..3 loop
    for v_h in 10..14 loop
      if ((v_di * 7 + v_h * 13) % 5) < 2 then
        v_pi := v_pi + 1;
        insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
        values (
          p_practice_id,
          v_patients[(v_pi % 25) + 1],
          v_docs[v_di],
          v_day + make_time(v_h, 0, 0),
          v_day + make_time(v_h + 1, 0, 0),
          'completed',
          v_notes[(v_pi % 20) + 1]
        );
      end if;
    end loop;
  end loop;

  -- ========================================
  -- CURRENT WEEK: Mon-Fri, 55% load (5/9 slots)
  -- Past appointments → completed
  -- Future appointments → scheduled
  -- ========================================

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
          values (
            p_practice_id,
            v_patients[(v_pi % 25) + 1],
            v_docs[v_di],
            v_day + make_time(v_h, 0, 0),
            v_day + make_time(v_h + 1, 0, 0),
            v_status,
            v_notes[(v_pi % 20) + 1]
          );
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
        values (
          p_practice_id,
          v_patients[(v_pi % 25) + 1],
          v_docs[v_di],
          v_day + make_time(v_h, 0, 0),
          v_day + make_time(v_h + 1, 0, 0),
          v_status,
          v_notes[(v_pi % 20) + 1]
        );
      end if;
    end loop;
  end loop;

  -- ========================================
  -- NEXT WEEK: Mon-Fri, 25% load (2/9 slots)
  -- All scheduled. Skip Doc6 Wed-Fri (time-off).
  -- ========================================

  for v_d in 7..11 loop
    v_day := v_mon + v_d;
    for v_di in 1..6 loop
      -- Doc6 has time-off Wed(9), Thu(10), Fri(11)
      if v_di = 6 and v_d >= 9 then
        continue;
      end if;
      for v_h in 10..18 loop
        if ((v_di * 3 + (v_d + 20) * 11 + v_h * 7) % 9) < 2 then
          v_pi := v_pi + 1;
          insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
          values (
            p_practice_id,
            v_patients[(v_pi % 25) + 1],
            v_docs[v_di],
            v_day + make_time(v_h, 0, 0),
            v_day + make_time(v_h + 1, 0, 0),
            'scheduled',
            v_notes[(v_pi % 20) + 1]
          );
        end if;
      end loop;
    end loop;
  end loop;

  -- ========================================
  -- UNASSIGNED APPOINTMENTS: 3
  -- (for alert banner demo)
  -- ========================================

  -- Next Mon at 12:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[23], null,
    (v_mon + 7) + time '12:00', (v_mon + 7) + time '13:00',
    'unassigned', 'Walk-in request — needs doctor');

  -- Next Tue at 15:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[24], null,
    (v_mon + 8) + time '15:00', (v_mon + 8) + time '16:00',
    'unassigned', 'Referred by another clinic');

  -- Next Wed at 11:00
  insert into appointment (practice_id, patient_id, doctor_id, start_time, end_time, status, notes)
  values (p_practice_id, v_patients[25], null,
    (v_mon + 9) + time '11:00', (v_mon + 9) + time '12:00',
    'unassigned', 'Emergency slot — assign ASAP');

  -- ========================================
  -- TIME OFF: Doc6 (Daryna Kravchenko)
  -- Next week Wed-Fri — vacation
  -- ========================================

  insert into time_off (staff_id, start_datetime, end_datetime, type)
  values (
    v_docs[6],
    (v_mon + 9)  + time '00:00',   -- next Wed 00:00
    (v_mon + 11) + time '23:59',   -- next Fri 23:59
    'vacation'
  );

end;
$$;

grant execute on function seed_demo_data(uuid) to anon;
