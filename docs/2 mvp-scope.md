# MVP Scope

This document defines what is intentionally included — and excluded — from the MVP.

The goal of this MVP is not feature completeness.  
The goal is to validate a coherent operational scheduling model for a single clinic.

---

## MVP Objective

Deliver a working internal scheduling system that supports real clinic workflows:

- staff management
- patient lifecycle
- appointment scheduling
- availability and time off
- operational reassignment
- role-based access

The MVP focuses on operational clarity, not growth features.

---

## In Scope

### Clinic Operations

- Single clinic setup
- Practice configuration
- Staff roles:
  - admin
  - doctor
  - clinic manager

---

### Staff Lifecycle

- invite staff
- activate / deactivate staff
- role assignment
- visibility based on role
- inactive staff excluded from operations and notifications

---

### Patient Lifecycle

- create patient
- edit patient data
- archive / restore patient
- prevent scheduling for archived patients

---

### Scheduling

- create appointments
- cancel appointments
- complete appointments
- explicit unassigned state
- manual reassignment
- daily schedule view

---

### Availability

- weekly availability per doctor
- time off periods (vacation / sick / blocked)
- availability enforced at booking time

---

### Operational Rules

- no double booking
- no scheduling outside availability
- UTC storage for all datetimes
- lifecycle-based soft delete
- reassignment on doctor deactivation
- database-enforced constraints

---

### Access Control

- role-based visibility
- practice-scoped data
- row-level security
- backend-enforced permissions

---

## Key User Flows

### Doctor starts the day

1. Opens /schedule
2. Sees daily grid with all appointments for the day
3. Reviews upcoming visits (patient name, time, status)
4. Handles appointments during the day
5. Marks completed visits manually

---

### Creating an appointment

1. Admin or clinic manager clicks "New Appointment" button
2. Selects patient from the patient registry
3. Selects doctor (required — system validates availability)
4. Sets start and end time
5. Adds notes (optional)
6. Save — appointment status becomes "scheduled"

---

### Completing an appointment

1. Doctor or admin opens a scheduled appointment
2. Clicks "Complete"
3. Status becomes "completed" (terminal — no further changes)

---

### Handling cancellation

1. Admin or clinic manager opens an appointment
2. Clicks "Cancel Appointment"
3. Confirms in the confirmation dialog
4. Status becomes "cancelled" (terminal), time slot is freed

---

### Reassigning an unassigned appointment

1. Admin or clinic manager sees orange alert banner on /schedule
2. Opens the unassigned appointment
3. Selects a doctor from the dropdown
4. Status changes from "unassigned" to "scheduled"
5. Alert disappears when all appointments are reassigned

---

### Doctor becomes unavailable

1. Admin deactivates a doctor (sick leave, termination)
2. All future appointments for that doctor automatically become unassigned
3. Alert banner appears on schedule page for admin / clinic manager
4. Admin manually reassigns each appointment to another doctor
5. Alert disappears when all appointments are reassigned

This flow is a core operational scenario, not an edge case.

---

## Explicitly Out of Scope

These are intentionally deferred:

### Patient-Facing Features

- patient self-booking
- patient portal
- online payments
- insurance handling

---

### External Integrations

- calendar sync
- third-party scheduling tools
- messaging platforms

---

### Growth Capabilities

- multi-clinic support
- shared staff across clinics
- analytics dashboards
- reporting
- marketing automation

---

### Advanced UX

- animations
- complex UI personalization
- accessibility optimization (beyond basics)

---

## Product Philosophy

The MVP prioritizes:

- operational correctness over convenience
- explicit workflows over automation
- clarity over feature breadth
- real usage over hypothetical scale

Edge cases are treated as core states, not exceptions.

---

## Definition of MVP Success

The MVP is considered successful when:

- a clinic can manage staff, patients, and appointments end-to-end
- scheduling conflicts are prevented by the system
- operational gaps are surfaced, not hidden
- domain rules are enforced by the backend
- the product can support real daily workflows

---
