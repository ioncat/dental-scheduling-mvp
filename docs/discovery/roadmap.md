# Product Roadmap

This roadmap describes the intended evolution of the Dental Scheduling product from MVP to a production-ready system.

It focuses on product capability growth rather than technical implementation details.

The roadmap prioritizes learning speed over feature completeness. The MVP is treated as an experiment, not a product launch.

---

## Guiding Principles

- Ship value early, validate continuously
- Treat MVP as an experiment, not a product launch
- Operational stability before growth
- Explicit workflows over automation magic
- Product clarity before feature expansion
- Real usage before optimization
- Decisions driven by real usage, not assumptions

---

## Phase 1 — Operational MVP

Goal: deliver a functional scheduling system aligned with real clinic workflows.

Scope:

- Staff lifecycle management (admin / doctor / clinic manager)
- Patient lifecycle (create / archive / restore)
- Appointment scheduling with reassignment
- Availability and time off
- Role-based access control
- Operational alerts for unresolved states
- Database-enforced product rules
- Demo data for evaluation

Outcome:

A working system capable of supporting day-to-day scheduling in a single clinic.

Success Signals:

- Doctors can log in and see personal daily schedules
- Appointments are managed end-to-end (create, reschedule, complete, cancel)
- Scheduling conflicts are prevented by the system (no overlaps, no booking outside availability)
- Unassigned appointments are surfaced via persistent alerts
- Staff deactivation triggers automatic reassignment flow
- Demo data validates full operational flow across all pages

Status: Complete (28/28 stories).

---

## Phase 2 — Pilot Validation

Goal: validate product hypothesis with real clinics.

Activities:

- Onboard 1–3 pilot clinics
- Observe real scheduling behavior
- Collect qualitative feedback
- Identify friction points and missing capabilities

Key Questions:

- Do doctors stop using Google Calendar?
- Is the system used daily?
- Does it reduce scheduling confusion?
- Which workflows cause the most friction?

Success Signals:

- A doctor creates 10+ appointments in the system
- Uses the system on 5+ working days
- Stops maintaining a parallel Google Calendar
- Qualitative feedback: "this is clearer than what we had before"

---

## Phase 3 — Usability & Workflow Refinement

Goal: improve efficiency of daily operations based on pilot feedback.

Planned capabilities:

- faster scheduling interactions
- improved visual schedule navigation (weekly view, drag-and-drop)
- bulk operations (appointments, availability)
- clearer operational alerts
- reduced friction in reassignment flows

Success Signals:

- Reduced time-to-complete for common tasks (create appointment, reschedule)
- Fewer user complaints about navigation
- Staff can complete a full working day using only the system

Focus:

Making the system comfortable for real-world usage by clinic staff.

---

## Phase 4 — Multi-Clinic Readiness

Goal: support multiple practices and shared staff.

Planned capabilities:

- multi-practice staff accounts
- cross-clinic visibility controls
- centralized administration
- refined permission model

Success Signals:

- A clinic group can manage 2+ locations from one dashboard
- Shared staff can view schedules across clinics
- Admin permissions scale without manual configuration

---

## Phase 5 — Patient Engagement (Future)

Goal: extend product beyond internal operations.

Planned capabilities:

- patient notifications
- appointment reminders
- patient self-service (optional)
- marketing communication channels

These features are intentionally deferred until core operations are validated with real clinics.

---

## Phase 6 — Post-Validation Decision

Based on real usage data and pilot feedback, the team decides:

- Iterate on UX based on feedback
- Add patient self-booking
- Introduce basic analytics
- Explore pricing and monetization
- Pivot based on learning

This phase exists to prevent premature scaling. Direction is determined by observed behavior, not assumptions.

---

## MVP Completion Criteria

The MVP is considered successful if:

- Doctors use the system as their primary scheduling tool
- Appointments are managed end-to-end without external tools
- Google Calendar is no longer required for daily scheduling
- Users report improved clarity and control over their workday

Failure to reach these signals triggers reassessment of product direction.

---
