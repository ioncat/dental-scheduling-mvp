# PDR-005 — Configurable Appointment Flow Direction

## Status
Deferred (design accepted, implementation postponed)

---

## Context

The appointment creation wizard (Story 5.7) currently uses a **doctor-centric** flow:
1. Select doctor → see availability → select time slot
2. Select patient → confirm

An alternative **patient-centric** flow reverses the order:
1. Select patient → see doctors with nearest available slots
2. Select doctor + time → confirm

Different clinics may prefer different approaches:
- **Doctor-centric** — natural when the patient calls and asks for a specific doctor
- **Patient-centric** — natural when the patient needs any available doctor ASAP

---

## Decision

Support both flows via a practice-level setting: `appointment_flow: 'doctor-first' | 'patient-first'`.

### Architecture

- **Setting location:** Practice Settings (or System Settings), stored in DB (`practices.ui_settings` JSONB, see Story 12.4)
- **UI impact:** `AppointmentModal.tsx` — conditional step order based on the setting
- **Data model:** No changes — `appointments` table already has both `doctor_id` and `patient_id` regardless of creation order
- **Suggested Slots logic:**
  - Doctor-first: "this doctor → nearest free slots" (current implementation)
  - Patient-first: "any doctor → nearest free slots across all doctors, grouped by doctor"

### Implementation scope

This is purely a UI-level change (step order in the wizard). The backend, data model, and validation remain identical.

---

## Why Deferred

- Current doctor-centric flow covers the primary use case (MVP)
- Patient-centric flow requires additional UX work (multi-doctor slot comparison)
- No user feedback yet on which flow is preferred in practice

---

## Revisit

- After user testing of the current flow
- When Story 12.4 (DB-persisted settings) is implemented
- Can be added as a new Story in Epic 5
