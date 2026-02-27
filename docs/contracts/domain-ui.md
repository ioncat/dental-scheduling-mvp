# Dental Scheduling MVP — Domain → UI Contracts (Final Canonical)

---

## Roles (System Users)

All authenticated users belong to Staff.

Roles:
- admin (full access)
- doctor
- clinic_manager

Patients are NOT system users.

---

## Global App Structure

Authenticated application.

Top-level areas:

- Schedule
- Patients
- Availability
- Settings
- Account

Practice (clinic) is resolved implicitly via staff membership.

---

## Business Rules

Core scheduling and operational rules. All enforced at database level via triggers and RLS policies.

| # | Rule | Category |
|---|---|---|
| R1 | Appointments cannot overlap for the same doctor | Scheduling |
| R2 | Appointments cannot be created outside doctor's availability | Scheduling |
| R3 | Time off overrides availability and blocks booking | Scheduling |
| R4 | Appointment status is "scheduled" on creation | Lifecycle |
| R5 | Completed appointments are immutable | Lifecycle |
| R6 | Cancelled appointments free the time slot | Lifecycle |
| R7 | When a doctor is deactivated, all future appointments become unassigned | Operations |
| R8 | Unassigned appointments must be reassigned manually before rescheduling | Operations |
| R9 | Patients cannot be archived while future appointments exist | Patient |
| R10 | Archived patients cannot receive new appointments | Patient |
| R11 | Inactive staff cannot receive new appointments or log in | Staff |
| R12 | The last admin cannot be deactivated | Staff |
| R13 | All datetimes stored in UTC, displayed in practice timezone | System |
| R14 | No entity with history is physically deleted (lifecycle-based soft delete) | System |
| R15 | All data is practice-scoped via row-level security | System |

---

## Domain: Practice

Visible in Settings (admin only).

Fields:
- clinic_name
- slogan
- show_on_main (boolean — display clinic name + slogan in header)
- address
- phone_number
- contact_email
- time_zone
- date_format

Actions:
- update practice settings (single form)

---

## Domain: Staff (system users)

Fields:
- full_name (mandatory)
- phone_number
- email
- messenger
- messenger_type (viber | telegram | other)
- role (admin | doctor | clinic_manager)
- status (pending | active | inactive)

Views (admin only):
- staff list

Actions (admin only):
- invite staff member
- change role
- deactivate staff

Invite flow:
1. Admin enters: full_name + email + role
2. Staff record created with status=pending
3. Supabase sends magic link
4. User completes signup
5. status → active

Relations:
- staff (role=doctor) has many appointments
- staff has availability
- staff has time off

Inactive staff rules:
- represents terminated employment
- cannot login
- hidden from selectors
- cannot receive new appointments
- cannot receive notifications
- all future appointments become unassigned
- availability and time off ignored in scheduling

Staff is never physically deleted.

---

## Domain: Patient

Fields:
- full_name (mandatory)
- phone (mandatory)
- email
- messenger
- messenger_type (viber | telegram | other)
- notes
- archived (boolean)

Pages:
- Patient List
- Patient Details

Actions:
- create patient
- edit patient
- archive patient
- restore patient

Relations:
- patient has many appointments

Archiving rules:
- patient cannot be archived while future appointments exist
- user must manually cancel or reschedule all future appointments before archiving
- archived patients hidden from default lists
- archived patients cannot receive new appointments
- archived patients cannot receive operational notifications
- archived patients can be restored

Patients are shared across practice.
Patients are never physically deleted.

---

## Domain: Appointment

Lifecycle:
- scheduled
- unassigned
- completed
- cancelled

Fields:
- patient_id
- doctor_id (staff_id with role=doctor, nullable)
- start_time
- end_time
- status
- notes

Primary View:
- Schedule (daily view)

Modal:
- Appointment details

Actions:
- create
- reschedule
- cancel
- mark completed
- assign doctor (for unassigned)

Rules:
- appointment must fit inside availability
- appointment must not overlap another appointment
- unassigned appointments must be assigned before rescheduling

Special case:
- when doctor becomes inactive:
    - all future appointments:
        - status → unassigned
        - doctor_id → null

Appointments are never deleted.

Time handling rule:
- All appointment datetimes are stored in UTC and displayed in practice timezone.

---

## Domain: Doctor Availability (weekly template)

Fields:
- staff_id
- weekday
- start_time
- end_time

Actions:
- add slot
- update slot
- remove slot

Rules:
- overlapping availability slots not allowed
- applies only to active staff

Purpose:
Defines recurring working hours.

---

## Domain: Time Off / Exceptions

Fields:
- staff_id
- start_datetime
- end_datetime
- type (vacation | sick | blocked)

Primary View:
- list of date ranges

Purpose:
Overrides availability for specific dates.

Scheduling formula:

Availability  
MINUS  
Time Off  
=  
Bookable Slots

Applies only to active staff.

---

## Pages

/setup
- First-launch bootstrap (create practice + admin)
- Optional demo data population

/login
- Magic link authentication
- Google OAuth (optional, requires Supabase config)

/schedule
- Daily view with doctor columns (one column per active doctor)
- Date navigation: previous / next day, direct date input, Today button
- "New Appointment" button (admin / clinic_manager only)
- Unassigned appointments column (first column, orange pulse animation)
- Admin / clinic_manager see alert banner:

⚠ N unassigned appointment(s) — assign a doctor to resolve.

- Click appointment card → open details modal (view/complete/cancel/assign)

/patients  
/patients/:id  

/availability
- select doctor
- weekly availability editor
- time off management (list)

/settings (admin only)
- practice settings
- staff management

/account
- read-only profile:
  - full_name
  - email
  - phone
  - role

Authentication handled by Supabase Auth (Magic Link + Google OAuth).

---

## Navigation Rules

Unauthenticated → /login  
Authenticated → /schedule  

Doctors:
- see only their own availability and appointments

Admins:
- see all doctors
- manage staff and practice

Clinic managers:
- manage schedule and patients
- no staff or practice access

---

## Deletion & Archiving Policy (Soft Delete)

Physical deletion is NOT allowed for entities with history.

### Staff
- status controls access
- inactive staff preserved for historical integrity

### Patient
- archived controls visibility and scheduling
- historical appointments preserved

### Appointment
- lifecycle-based state transitions only
- historical data always preserved

Availability and Time Off records may be removed,
but appointments derived from them remain.

---

## Operational Alerting

System must surface blocking operational states.

Alerts are visible on Schedule page and top navigation.

---

### Alert: Unassigned Appointments

Trigger:
- appointment.status = unassigned

Audience:
- admin
- clinic_manager

Presentation:
- persistent alert banner
- badge with count
- highlighted appointment blocks

Required action:
- assign doctor

Alert cleared when:
- all unassigned appointments are reassigned

---

Alerting principles:

- alerts block normal scheduling flow
- alerts are persistent until resolved
- alerts are role-scoped
- alerts are derived from domain state (not manually dismissed)

---

## System Constraints

- Appointment creation blocked outside availability.
- Time off blocks booking.
- Inactive doctors trigger reassignment flow.
- Unassigned appointments must be reassigned manually.
- Doctors cannot see other doctors’ appointments unless admin/clinic_manager.
- Patients belong to practice, not to individual doctors.
