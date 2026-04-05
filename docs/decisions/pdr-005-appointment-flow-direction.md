# PDR-005 — Configurable Appointment Flow Direction

## Status
Implemented (v1 — user-toggle in modal)

---

## Context

The appointment creation wizard (Story 5.7) originally used a **doctor-centric** flow:
1. Select doctor → see availability → select time slot
2. Select patient → confirm

An alternative **patient-centric** flow reverses the order:
1. Select patient → select doctor → see availability → select time slot
2. Confirm (patient already selected)

Different situations may call for different approaches:
- **Doctor-first** — natural when the patient asks for a specific doctor
- **Patient-first** — natural when the receptionist starts from the patient record

---

## Decision

Support both flows via a toggle inside `AppointmentModal` (Step 1 header).

### Implementation (v1 — completed)

- **Toggle location:** Top of Step 1 in `AppointmentModal.tsx` — two pill buttons: "Doctor first" / "Patient first"
- **Doctor-first flow:** Doctor → Suggested Slots → Day → Time → [Next] → Patient + Notes → Create
- **Patient-first flow:** Patient → Doctor → Suggested Slots → Day → Time → [Next] → Notes → Create
- **Auto-detect:** When opened from schedule grid click (pre-filled `doctorId`), toggle is hidden and doctor-first is used automatically
- **Data model:** No changes — `appointments` table already has both `doctor_id` and `patient_id` regardless of creation order

### Future (v2)

- Practice-level default setting: `appointment_flow: 'doctor-first' | 'patient-first'` stored in `practices.ui_settings` JSONB (Story 12.4)
- Patient-first could show multi-doctor slot comparison (any doctor → nearest free slots grouped by doctor)

---

## Revisit

- v2 default setting: when Story 12.4 (DB-persisted settings) is implemented
- Multi-doctor comparison: after user feedback on v1 usage patterns
