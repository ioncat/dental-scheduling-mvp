# Contract vs Epics Audit
(Product Spec Refactoring)

Source of Truth:
- contracts/domain-ui.md (Final Canonical)

Compared against:
- epics.md
- product-requirements.md
- user-flows.md
- scheduling-logic.md

---

## Summary

Current situation:

- Original epics describe a basic scheduling MVP.
- Final contract describes a significantly more mature operational system.

Result:

- ~60% of contract capabilities are NOT explicitly represented in epics.
- ~25% of existing epics contain simplified or outdated assumptions.
- ~15% of epics are now obsolete.

Contract is now strictly superior to epics.

Epics must be regenerated from contract, not patched.

---

## ✅ Covered by Existing Epics (high level only)

These concepts exist, but usually in simplified form:

- Basic appointment creation
- Daily schedule view
- Patient CRUD
- Availability definition
- Staff invitation (implicit)
- Authentication
- Practice-level scope

Coverage is shallow: epics describe happy-path only.

---

## ⚠ Divergences (Logic Conflicts)

### Appointment Lifecycle

Epics assume:

- scheduled → completed

Contract defines:

- scheduled → unassigned → completed | cancelled

Missing in epics:
- unassigned state
- reassignment flow
- operational alert

Severity: HIGH

---

### Staff Model

Epics imply:
- simple doctor users

Contract defines:
- Staff with roles
- clinic_manager
- inactive employment
- reassignment logic

Missing in epics:
- staff.status
- inactive behavior
- role-based permissions

Severity: HIGH

---

### Patient Archiving

Epics:
- patient delete/archive implied

Contract:
- explicit precondition
- manual cancellation required

Missing:
- blocking archive flow
- UX modal
- operational constraint

Severity: HIGH

---

### Availability vs Time Off

Epics:
- availability only

Contract:
- availability + time off exceptions

Missing:
- Time Off domain
- override logic

Severity: HIGH

---

### Notifications

Epics:
- generic notifications

Contract:
- inactive staff receive none
- archived patients receive none

Missing:
- notification suppression rules

Severity: MEDIUM

---

### Time Handling

Epics:
- no timezone model

Contract:
- UTC storage
- practice timezone display

Severity: MEDIUM

---

## ❌ Missing Stories (introduced by Contract)

These capabilities exist ONLY in contract:

### Staff

- Staff status lifecycle
- Inactive staff reassignment trigger
- Staff notification suppression

---

### Appointment

- Unassigned appointments
- Manual reassignment
- Blocking reschedule for unassigned

---

### Patient

- Archive preconditions
- Restore patient
- Notification blocking

---

### Scheduling

- Time Off / Exceptions
- Availability exclusion for inactive staff

---

### Operational

- Persistent alert for unassigned appointments
- Role-scoped alert visibility

---

## 🧹 Obsolete or Dangerous Epic Assumptions

These should be removed:

- Auto-delete patient
- Auto-cancel appointments on archive
- Single-doctor mental model
- No role separation
- Happy-path-only scheduling
- Availability without exceptions

---

## Recommendation

Do NOT attempt to patch existing epics.

Instead:

1. Treat `domain-ui.md` as canonical.
2. Regenerate epics as:

### New Epics:

- Staff Management
- Patient Lifecycle
- Appointment Lifecycle
- Scheduling Engine
- Operational Alerting
- Access Control

3. Generate user stories directly from contract sections.

This avoids accumulated conceptual debt.

---

## Architectural Conclusion

Original epics represent MVP v0.

Current contract represents MVP v2.

Trying to reconcile them manually would introduce inconsistencies.

Correct action:
Epics must be re-derived from contract.
