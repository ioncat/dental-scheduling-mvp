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