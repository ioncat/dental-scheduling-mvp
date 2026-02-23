# MVP Scope — Dental Appointment Scheduling Platform

## 1. MVP Core Capabilities

### For Doctor / Clinic Manager

The system must allow doctors (and clinic managers) to:

1. View personal and clinic-wide schedules (daily / weekly)
2. Work with multiple doctors within the same clinic
3. Create appointments with:
	  - patient name (free text)
	  - appointment type (e.g. consultation, treatment)
	  - duration
	  - assigned doctor
4. Modify existing appointments
5. Cancel appointments manually
6. Mark appointments as completed manually
7. Block unavailable time slots (e.g. breaks, off-days)
8. Clearly distinguish between:
	  - scheduled appointments
	  - cancelled appointments
	  - completed appointments
	  - blocked time
9. Perform quick search by patient name (free text)
10. Filter appointments by:
	  - doctor
	  - date
	  - status
11. View basic appointment history (list-based)

---

## 2. Supported Roles (MVP)

### Doctor (Primary User)

- Owns personal schedule
- Creates, edits, completes, and cancels appointments
- Can block personal availability
- May also act as Clinic Manager in small clinics

### Clinic Manager / Receptionist

- Views schedules of all doctors in the clinic
- Creates, edits, completes, and cancels appointments for any doctor
- Manages availability across the clinic

### Patient

- No direct system access in MVP
- Appointments are created and managed by clinic staff

---

## 3. Key User Flows (High-Level)

### Doctor starts the day

1. Opens personal schedule
2. Reviews today’s appointments
3. Sees blocked time vs scheduled visits
4. Handles appointments during the day
5. Marks completed visits manually

---

### Creating an appointment

1. Select doctor
2. Select date & time
3. Enter patient name
4. Choose appointment type
5. Set duration (default 1 hour)
6. Save → appointment becomes "scheduled"

Note: Default duration reduces user effort and reflects typical dental treatment length.

---

### Cancelling an appointment

1. Open appointment
2. Click cancel
3. Confirm cancellation
4. Status becomes "cancelled"

---

### Blocking availability

1. Select time range
2. Mark as unavailable
3. Slot becomes blocked

---

## 4. Explicit Out of Scope (MVP)

The MVP explicitly excludes:

- Online patient self-booking
- Payments, billing, or invoices
- Insurance workflows
- Medical records
- Advanced reporting or analytics dashboards
- External calendar synchronization (Google / Apple)
- SMS / email notifications
- Role customization or complex permission matrices
- Multi-location clinic hierarchies (single clinic with multiple doctors only)

---

## 5. Assumptions & Constraints

- Small clinics often rely on doctors to perform administrative tasks
- Clinics currently use Google Calendar as their primary scheduling tool
- Appointment data is valuable but MVP focuses on scheduling clarity, not analytics
- UX must be usable without training
- MVP prioritizes speed of learning over architectural scalability
