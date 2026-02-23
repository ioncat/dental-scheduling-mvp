# Legacy → New Mapping
(Product Refactor Merge Guide)

Purpose:
Map old documentation artifacts to new canonical system.
Used to safely discard obsolete logic and preserve valid context.

Canonical Source of Truth:
- contracts/domain-ui.md
- schema.sql
- rls.sql
- triggers.sql
- new epics
- ui.pages.md

---

## Domain Model

| Legacy Concept                  | New Concept                  | Action  |
| ------------------------------- | ---------------------------- | ------- |
| User                            | Staff                        | REPLACE |
| Doctor as primary user          | Staff.role = doctor          | REPLACE |
| Invitation table                | Staff.status + Supabase Auth | DROP    |
| Patient name inside Appointment | Patient entity               | REPLACE |
| Soft delete = non-goal          | Soft delete everywhere       | REPLACE |
| Delete patient                  | Archive + restore            | REPLACE |
| Auto-cancel on archive          | Manual precondition          | REPLACE |
| Single doctor model             | Multi-staff practice         | REPLACE |
| No Time Off                     | Time Off domain              | ADD     |
| Happy-path scheduling           | Constraint-based scheduling  | REPLACE |
| No unassigned                   | Appointment.unassigned       | ADD     |

---

## Appointment Lifecycle

| Legacy | New | Action |
|-------|-----|--------|
| scheduled → completed | scheduled → unassigned → completed/cancelled | REPLACE |
| Implicit doctor ownership | Explicit assignment | REPLACE |
| No operational alerting | Unassigned alert | ADD |

---

## Staff

| Legacy | New | Action |
|--------|-----|--------|
| Simple users | Staff(status + role) | REPLACE |
| No employment lifecycle | active / inactive | ADD |
| No reassignment | Trigger-based unassign | ADD |

---

## Patient

| Legacy | New | Action |
|--------|-----|--------|
| CRUD only | Archive / Restore | REPLACE |
| Delete | Archive | DROP |
| No lifecycle | Blocking rules | ADD |

---

## Availability / Scheduling

| Legacy | New | Action |
|--------|-----|--------|
| Weekly availability only | Availability + Time Off | REPLACE |
| UI-only constraints | DB-enforced constraints | REPLACE |
| No overlap checks | Trigger-based prevention | ADD |

---

## Data Layer

| Legacy | New | Action |
|--------|-----|--------|
| database-erd.md | schema.logical.md | DROP |
| database-schema.md | schema.sql | DROP |
| No RLS | rls.sql | ADD |
| No triggers | triggers.sql | ADD |

---

## Backend

| Legacy              | New             | Action  |
| ------------------- | --------------- | ------- |
| Custom API layer    | Supabase direct | DROP    |
| Backend permissions | Postgres RLS    | REPLACE |

---

## Epics / Stories

| Legacy | New | Action |
|--------|-----|--------|
| Old epics | Epic 1–10 | DROP |
| Happy-path stories | Constraint-driven stories | REPLACE |

---

## UI

| Legacy | New | Action |
|--------|-----|--------|
| Old wireframes | ui.pages.md | DROP |
| Implicit flows | Explicit page spec | REPLACE |

---

## Time Handling

| Legacy | New | Action |
|--------|-----|--------|
| Undefined timezone | UTC + practice TZ | ADD |

---

## Notifications

| Legacy | New | Action |
|--------|-----|--------|
| Generic | Role/status scoped | REPLACE |

---

## What to KEEP from legacy

These may still be reused:

- Market context
- Naming ideas
- Business motivation
- High-level product goals

Everything else is obsolete.

---

## Final Rule

If legacy document contradicts domain-ui.md:

→ legacy loses.

No exceptions.

---

End.