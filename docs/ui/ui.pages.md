# UI Pages Specification — Dental Scheduling MVP

Design fidelity: B (clean product UI, functional, minimal polish)

---

## /login

Purpose:
Authenticate staff via magic link.

Blocks:
- Email input
- Submit button
- Loading / success / error states

Actions:
- Request magic link

Rules:
- Only staff with status=active can proceed
- After success redirect to /schedule

Data:
- Supabase Auth

---

## /schedule

Primary operational screen.

Purpose:
Daily scheduling + reassignment.

Blocks:
- Top bar (date selector, role-based actions)
- Unassigned alert banner (admin / clinic_manager only)
- Schedule grid (time x doctors)
- Appointment modal

Actions:
- Create appointment
- Open appointment
- Cancel appointment
- Complete appointment
- Assign doctor (unassigned)

Visibility:
- Doctor: only own column
- Clinic manager: all doctors
- Admin: all doctors

Special UI:
- Unassigned appointments visually highlighted
- Persistent alert if any unassigned exist

Data:
- appointment
- staff (role=doctor)
- patient

---

## /patients

Purpose:
Patient list + entry point.

Blocks:
- Search input
- Patients table/list
- Create patient button

Actions:
- Create patient
- Open patient details

Visibility:
- Archived patients hidden by default

Data:
- patient (practice scoped)

---

## /patients/:id

Purpose:
Patient profile + lifecycle.

Blocks:
- Patient info card
- Notes
- Appointment history
- Archive / Restore buttons

Actions:
- Edit patient
- Archive patient (blocked if future appointments exist)
- Restore patient

Rules:
- Archive disabled while future appointments exist

Data:
- patient
- appointment (by patient_id)

---

## /availability

Purpose:
Doctor working hours + time off.

Blocks:
- Doctor selector (admin)
- Weekly availability editor
- Time Off list

Actions:
- Add / update / delete availability
- Add / remove time off

Visibility:
- Doctor: only own data
- Admin: all doctors

Data:
- availability
- time_off
- staff(role=doctor)

---

## /settings (admin only)

Purpose:
Practice + staff management.

Tabs:
- Practice
- Staff

### Practice Tab

Blocks:
- Practice form

Actions:
- Update practice fields

Data:
- practice

---

### Staff Tab

Blocks:
- Staff table
- Invite modal

Actions:
- Invite staff
- Change role
- Deactivate staff

Rules:
- Cannot remove last admin

Data:
- staff

---

## /account

Purpose:
Read-only profile.

Blocks:
- Profile fields

Fields:
- full_name
- email
- phone
- role

Actions:
- none

Data:
- staff (current user)

---

## Global Layout

- Left navigation:
  - Schedule
  - Patients
  - Availability
  - Settings (admin only)
  - Account

- Top bar:
  - Current date
  - User name

---

## Navigation Rules

Unauthenticated → /login  
Authenticated → /schedule  

---

## UI Principles

- utilitarian layout
- no animations required
- modal-based editing
- table-driven views
- minimal color usage
- shadcn/ui components
- Tailwind spacing defaults

---

End.