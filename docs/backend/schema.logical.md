# Logical Data Model — Dental Scheduling MVP

---

## practice

Represents single clinic (tenant).

- id (uuid, PK)
- clinic_name (text)
- address (text)
- phone_number (text)
- contact_email (text)
- time_zone (text)
- date_format (text)
- created_at (timestamp)
- updated_at (timestamp)

---

## staff

System users.

- id (uuid, PK)
- practice_id (uuid, FK → practice.id)
- full_name (text, not null)
- email (text, not null)
- phone_number (text)
- messenger (text)
- messenger_type (enum: viber | telegram | other)
- role (enum: admin | doctor | clinic_manager)
- status (enum: pending | active | inactive)
- created_at (timestamp)
- updated_at (timestamp)

Constraints:
- email unique per practice

---

## patient

Managed entity.

- id (uuid, PK)
- practice_id (uuid, FK → practice.id)
- full_name (text, not null)
- phone (text, not null)
- email (text)
- messenger (text)
- messenger_type (enum)
- notes (text)
- archived (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

Constraints:
- phone unique per practice

---

## appointment

Scheduled visits.

- id (uuid, PK)
- practice_id (uuid, FK → practice.id)
- patient_id (uuid, FK → patient.id)
- doctor_id (uuid, nullable FK → staff.id)
- start_time (timestamp, UTC)
- end_time (timestamp, UTC)
- status (enum: scheduled | unassigned | completed | cancelled)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)

Rules:
- doctor_id nullable only when status = unassigned

---

## availability

Weekly working template.

- id (uuid, PK)
- staff_id (uuid, FK → staff.id)
- weekday (int 0–6)
- start_time (time)
- end_time (time)
- created_at (timestamp)

---

## time_off

Date-based overrides.

- id (uuid, PK)
- staff_id (uuid, FK → staff.id)
- start_datetime (timestamp, UTC)
- end_datetime (timestamp, UTC)
- type (enum: vacation | sick | blocked)
- created_at (timestamp)

---

Relationships:

practice 1 → N staff  
practice 1 → N patient  
practice 1 → N appointment  

staff(role=doctor) 1 → N appointment  
staff 1 → N availability  
staff 1 → N time_off  

patient 1 → N appointment

---

Soft delete:

- staff via status
- patient via archived
- appointment via lifecycle

No physical deletes.

---

Time:

- all datetime stored UTC
- rendered in practice timezone

---

Operational rules:

- inactive staff excluded from scheduling
- archived patient excluded from scheduling
- unassigned appointments require manual reassignment