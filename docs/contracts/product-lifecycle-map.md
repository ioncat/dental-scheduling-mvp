# Product Lifecycle Map

End-to-end operational flow — from first launch to daily usage and exception handling.

---

## Phases Overview

```
Phase 1          Phase 2              Phase 3               Phase 4
BOOTSTRAP  →  CONFIGURATION  →  DAILY OPERATIONS  →  EXCEPTION HANDLING
                                                          ↓
                                                    (back to Phase 3)
```

| Phase | Trigger | Duration | Goal |
|-------|---------|----------|------|
| 1. Bootstrap | Empty database | One-time | Practice + admin created |
| 2. Configuration | Admin logged in | Days | Team, availability, patients ready |
| 3. Daily Operations | Team configured | Ongoing | Schedule, complete, cancel appointments |
| 4. Exception Handling | Event-driven | As needed | Deactivation, reassignment, archiving |

---

## Phase 1: Bootstrap

```
System deployed (empty DB)
  │
  ├─ is_system_bootstrapped() → false → redirect to /setup
  │
  ├─ Admin enters: clinic name, full name, email
  │   └─ [Optional] Enable demo data
  │
  ├─ bootstrap_practice() RPC:
  │   ├─ Practice record created
  │   ├─ Staff record created (role=admin, status=pending)
  │   └─ Magic link sent via Supabase Auth
  │
  ├─ Admin clicks magic link
  │   └─ Trigger: link_staff_on_first_login()
  │       └─ staff.status: pending → active
  │
  └─ Redirect to /schedule ✓
```

**Entity transitions:**

| Entity | Before | After | Trigger |
|--------|--------|-------|---------|
| Practice | — | created | bootstrap_practice() |
| Staff (admin) | — | pending → active | Magic link + trigger |

**Exit → Phase 2:** Admin is active, practice exists.

---

## Phase 2: Configuration

Three parallel workflows, no strict order:

### A. Team Onboarding

```
Admin invites staff (/settings)
  │
  ├─ full_name + email + role (doctor | clinic_manager)
  ├─ Staff record: status = pending
  ├─ Supabase sends magic link
  │
  └─ Staff clicks link
      └─ link_staff_on_first_login(): pending → active
```

### B. Doctor Availability

```
Doctor logs in → /availability
  │
  ├─ Adds weekly slots: weekday + start_time + end_time
  │   (e.g., Mon 09:00–13:00, Mon 14:00–18:00)
  │
  └─ [Optional] Adds time-off: date range + type (vacation | sick | blocked)
```

### C. Patient Registry

```
Admin / Clinic Manager → /patients
  │
  └─ Creates patients: full_name + phone (required), email, notes
      └─ Patient.archived = false (active, can receive appointments)
```

**Exit → Phase 3:** ≥1 active doctor with availability + ≥1 patient.

---

## Phase 3: Daily Operations

### Doctor Starts the Day

```
Opens /schedule → sees daily grid with doctor columns
  │
  ├─ Reviews appointments (patient name, time, status)
  ├─ Handles visits throughout the day
  └─ Marks completed visits: scheduled → completed (terminal)
```

### Create Appointment (Calendly-style modal)

```
Admin/Manager clicks "New Appointment" (or empty time slot)
  │
  ├─ Column 1: Select patient → Select doctor
  ├─ Column 2: Monthly calendar → pick a day
  ├─ Column 3: Free slots (1hr, 30min step)
  │
  ├─ Slot computation:
  │   Available = Availability MINUS Appointments MINUS Time-Off
  │
  ├─ DB validation:
  │   ├─ R1: No overlap
  │   ├─ R2: Within availability
  │   ├─ R3: No time-off conflict
  │   └─ R10: Patient not archived
  │
  └─ Save → status = "scheduled"
```

### Appointment Status Flow

```
                       ┌── Complete ──→  COMPLETED (terminal)
                       │
  CREATE ──→ SCHEDULED ┤
                       │
                       └── Cancel ────→  CANCELLED (terminal)
                                ↑
                                │
  UNASSIGNED ── assign ──→ SCHEDULED
       ↑
       │
  (doctor deactivated)
```

| From | To | Who | Action |
|------|----|-----|--------|
| *(new)* | scheduled | admin, manager | Create with doctor |
| scheduled | completed | admin, manager, own doctor | Click "Complete" |
| scheduled | cancelled | admin, manager | Click "Cancel" + confirm |
| unassigned | scheduled | admin, manager | Assign doctor |
| unassigned | cancelled | admin, manager | Click "Cancel" + confirm |
| scheduled | unassigned | *system trigger* | Doctor deactivated |

### Permission Matrix

| Action | Admin | Manager | Doctor |
|--------|-------|---------|--------|
| View all appointments | ✓ | ✓ | own only |
| Create appointment | ✓ | ✓ | — |
| Complete appointment | ✓ | ✓ | own only |
| Cancel appointment | ✓ | ✓ | — |
| Assign doctor | ✓ | ✓ | — |

---

## Phase 4: Exception Handling

### Doctor Deactivation (core operational scenario)

```
Admin deactivates doctor (/settings)
  │
  ├─ staff.status: active → inactive
  │
  ├─ TRIGGER: trg_staff_inactive
  │   └─ All FUTURE appointments of this doctor:
  │       ├─ doctor_id → NULL
  │       ├─ status → "unassigned"
  │       └─ updated_at → now()
  │
  ├─ /schedule shows:
  │   ├─ Orange banner: "⚠ N unassigned appointment(s)"
  │   └─ Unassigned column with pulse animation
  │
  └─ Admin/Manager manually reassigns each appointment
      └─ When count = 0 → alert disappears → back to Phase 3
```

### Patient Archiving

```
Admin/Manager archives patient (/patients)
  │
  ├─ Precondition: NO future appointments
  │   ├─ If future exist → BLOCKED: "Cancel or reschedule first"
  │   └─ If none → patient.archived = true
  │
  ├─ Archived patient:
  │   ├─ Hidden from default lists
  │   ├─ Cannot receive new appointments (R10)
  │   └─ Historical data preserved (R14)
  │
  └─ Can be restored: archived → false → active again
```

### Staff Reactivation

```
Admin reactivates staff (/settings)
  │
  ├─ staff.status: inactive → active
  ├─ Staff can login again
  ├─ Appears in doctor selectors
  └─ Can receive new appointments
```

---

## Entity Lifecycles Summary

### Staff

```
PENDING ──(email confirmed)──→ ACTIVE ←──(reactivate)──→ INACTIVE
                                  └──(deactivate)──→ INACTIVE
```

### Patient

```
CREATED (active) ←──(restore)──→ ARCHIVED
                                    │
                       Cannot schedule, hidden from lists
```

### Appointment

```
SCHEDULED ──→ COMPLETED (terminal, immutable)
    │
    ├──→ CANCELLED (terminal)
    │
    └──→ UNASSIGNED ──(assign doctor)──→ SCHEDULED
```

---

## Bookable Slots Formula

```
Free Slots = Weekly Availability
           MINUS Existing Appointments (non-cancelled)
           MINUS Time-Off Periods
```

Applied per doctor, per day, at booking time.

---

## Business Rules by Phase

| Phase | Rules | Enforced by |
|-------|-------|-------------|
| 1. Bootstrap | R13 (UTC), R15 (practice scope) | DB schema |
| 2. Configuration | R11 (inactive can't login), R14 (no deletion) | Triggers + RLS |
| 3. Operations | R1 (no overlap), R2 (in availability), R3 (time-off blocks), R4 (status=scheduled), R5 (completed immutable), R6 (cancel frees slot), R10 (no archived patients) | Triggers |
| 4. Exceptions | R7 (deactivate → unassign), R8 (must assign before reschedule), R9 (no archive with future appts), R12 (last admin protected) | Triggers |

---

## Alerting

| Alert | Trigger | Audience | Clears when |
|-------|---------|----------|-------------|
| Unassigned appointments | appointment.status = unassigned | admin, manager | All reassigned |

Alerts are persistent, role-scoped, and derived from domain state — not manually dismissable.
