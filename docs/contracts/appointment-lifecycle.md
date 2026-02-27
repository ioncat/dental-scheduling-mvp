# Appointment Lifecycle

End-to-end status flow for appointments — from creation to terminal state.

---

## Statuses

| Status | Meaning | Terminal? |
|--------|---------|-----------|
| `scheduled` | Active appointment with assigned doctor | No |
| `unassigned` | Needs a doctor (auto or manual) | No |
| `completed` | Visit finished, marked by staff | Yes |
| `cancelled` | Cancelled by admin/manager | Yes |

---

## Status Transitions

```
                         ┌────── Complete ─────→  COMPLETED
                         │
  CREATE ──→ SCHEDULED ──┤
                         │
                         └────── Cancel ──────→  CANCELLED
                                   ↑
                                   │
  UNASSIGNED ──assign doctor──→ SCHEDULED
       ↑
       │
  (auto-trigger: doctor deactivated)
```

---

## Transition Rules

| From | To | Trigger | Who can do it | DB enforcement |
|------|----|---------|---------------|----------------|
| *(new)* | `scheduled` | Create appointment with doctor | admin, clinic_manager | R1, R2, R3, R10 |
| `scheduled` | `completed` | Click "Complete" | admin, clinic_manager, own doctor | R5 (immutable after) |
| `scheduled` | `cancelled` | Click "Cancel" + confirm | admin, clinic_manager | R6 (frees slot) |
| `unassigned` | `scheduled` | Assign doctor via dropdown | admin, clinic_manager | R8 |
| `unassigned` | `cancelled` | Click "Cancel" + confirm | admin, clinic_manager | R6 |
| `scheduled` | `unassigned` | Doctor deactivated (auto) | system trigger | R7 |
| `completed` | *(any)* | **Blocked** | — | R5 |
| `cancelled` | *(any)* | **Blocked** | — | Terminal state |

---

## Business Rules Referenced

| Rule | Description | Enforced by |
|------|-------------|-------------|
| R1 | No overlapping appointments for same doctor | `trg_prevent_overlap` |
| R2 | Cannot book outside doctor availability | `trg_check_availability` |
| R3 | Time off blocks booking | `trg_check_availability` |
| R5 | Completed appointments are immutable | UI (no action buttons) |
| R6 | Cancelled appointments free the time slot | Implicit (status change) |
| R7 | Doctor deactivated → future appointments unassigned | `trg_staff_inactive` |
| R8 | Unassigned must be assigned before rescheduling | `trg_block_unassigned_reschedule` |
| R10 | Archived patients cannot receive appointments | `trg_block_archived_patient` |
| R13 | All datetimes stored in UTC | `trg_enforce_utc` |

---

## Creation Flow

```
Admin/Manager clicks "New Appointment"
  │
  ├─ Select patient (required)
  ├─ Select doctor (required)
  ├─ Set start & end time
  ├─ Add notes (optional)
  │
  ├─ Validation:
  │   ├─ Doctor has availability for that weekday/time? (R2)
  │   ├─ Doctor not on time off? (R3)
  │   ├─ No overlap with existing appointments? (R1)
  │   └─ Patient not archived? (R10)
  │
  └─ Save → status = "scheduled"
```

---

## Unassigned Flow (Auto-Trigger)

```
Admin deactivates a doctor
  │
  └─ Trigger: trg_staff_inactive
      │
      └─ For each future appointment of that doctor:
          ├─ doctor_id → NULL
          ├─ status → "unassigned"
          └─ updated_at → now()

Schedule page:
  ├─ Orange alert banner: "N unassigned appointment(s)"
  ├─ Unassigned column appears (first, with pulse animation)
  │
  └─ Admin clicks appointment → selects doctor → status → "scheduled"
      └─ Alert disappears when count reaches 0
```

---

## Completion Flow

```
Doctor/Admin opens a scheduled appointment
  │
  └─ Clicks "Complete"
      │
      ├─ status → "completed"
      └─ Card becomes green, faded (opacity-75)

No further actions possible (terminal state).
```

---

## Cancellation Flow

```
Admin/Manager opens an appointment (scheduled or unassigned)
  │
  └─ Clicks "Cancel Appointment"
      │
      ├─ Confirmation dialog appears
      ├─ User confirms
      │
      ├─ status → "cancelled"
      └─ Card becomes gray, strikethrough (opacity-50)

No further actions possible (terminal state).
```

---

## Visual Indicators

| Status | Badge color | Left border | Card background | Effect |
|--------|------------|------------|----------------|--------|
| scheduled | blue | blue-500 | blue-50 | — |
| unassigned | orange/red | orange-500 | orange-50 | pulse animation |
| completed | green | green-500 | green-50 | opacity-75 |
| cancelled | gray | gray-400 | gray-50 | opacity-50, strikethrough |

---

## Permission Matrix

| Action | admin | clinic_manager | doctor |
|--------|-------|---------------|--------|
| View all appointments | yes | yes | own only |
| Create appointment | yes | yes | no |
| Complete appointment | yes | yes | own only |
| Cancel appointment | yes | yes | no |
| Assign doctor | yes | yes | no |
| See unassigned alert | yes | yes | no |
