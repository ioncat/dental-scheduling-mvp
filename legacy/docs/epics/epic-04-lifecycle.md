# Epic 4 — Appointment Lifecycle

## Epic Goal

Enable clinics to manage the full lifecycle of appointments — from creation to completion or cancellation — providing operational clarity and basic historical tracking.

---

## Business Value

- Supports real-world appointment workflows
- Allows clinics to explicitly mark visits as completed or cancelled
- Enables basic historical visibility of past appointments
- Creates the foundation for future analytics (no-shows, utilization, etc.)

Without lifecycle management, the system remains a passive calendar instead of an operational tool.

---

## In Scope

- Appointment statuses:
  - scheduled (on creation)
  - cancelled (manual)
  - completed (manual)
- Manual cancellation of appointments
- Manual completion of appointments
- Basic appointment history view
- Status visibility across all schedule views

---

## Out of Scope

- Automatic completion based on time
- No-show detection
- Cancellation reasons
- Status change audit trail
- Reporting dashboards

---

## Delivery RACI

| Role | R | A | C | I |
|------|---|---|---|---|
| Product Owner |   | ✔ |   |   |
| Backend Developer | ✔ |   |   |   |
| Frontend Developer | ✔ |   |   |   |
| QA Engineer |   |   | ✔ |   |
| UX Designer |   |   | ✔ |   |
| Tech Lead |   |   | ✔ |   |

---

## User Stories

---

### US-4.1 — Cancel Appointment

As a Doctor or Clinic Manager  
I want to cancel an appointment  
So that I can reflect changes in patient visits.

#### Acceptance Criteria

Given I am logged in as a doctor or clinic manager  
When I cancel an appointment  
Then the appointment status becomes "cancelled"  
And the appointment remains visible in history  
And the time slot becomes available again

#### Edge Cases

- Cancelling an already cancelled appointment
- Cancelling a completed appointment
- Cancelling an appointment in the past

#### Out of Scope

- Cancellation reasons
- Notifications to patients

#### Notes for Engineering

- Cancellation must be idempotent
- Slot availability must be recalculated immediately

---

### US-4.2 — Complete Appointment

As a Doctor or Clinic Manager  
I want to manually mark an appointment as completed  
So that I can accurately track finished visits.

#### Acceptance Criteria

Given I am viewing a scheduled appointment  
When I mark it as completed  
Then the appointment status becomes "completed"  
And it is no longer editable

#### Edge Cases

- Completing a cancelled appointment
- Completing an appointment in the future
- Completing an already completed appointment

#### Out of Scope

- Automatic completion
- Partial completion

#### Notes for Engineering

- Completed appointments must be immutable
- Status transitions must be validated server-side

---

### US-4.3 — View Appointment History

As a Doctor or Clinic Manager  
I want to view past appointments  
So that I can reference previous visits.

#### Acceptance Criteria

Given I am logged in  
When I open appointment history  
Then I see completed and cancelled appointments  
And appointments are ordered by date descending

#### Edge Cases

- No historical appointments
- Large number of past appointments

#### Out of Scope

- Filtering by patient or status
- Exporting history

#### Notes for Engineering

- History should be paginated
- Default range should be last 30 days

---

### US-4.4 — Display Appointment Status

As a Doctor  
I want to see appointment statuses clearly in my schedule  
So that I understand the state of each visit.

#### Acceptance Criteria

Given I am viewing my schedule  
Then scheduled, cancelled, and completed appointments are visually distinct  
And status is visible in both daily and weekly views

#### Edge Cases

- Multiple statuses on same day
- Accessibility contrast requirements

#### Out of Scope

- Custom status colors

#### Notes for Engineering

- Status rendering must be consistent across all views

---

## Definition of Done (Epic Level)

- Appointments support scheduled, cancelled, and completed states
- Status changes are persisted and reflected immediately
- Completed appointments are immutable
- History view works for doctors and clinic managers
- UX approved
- QA verifies lifecycle flows
- Product Owner signs off operational usability
