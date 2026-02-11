# Epic 3 — Availability Management

## Epic Goal

Enable doctors to explicitly control their availability by blocking time slots and marking non-working periods, preventing overbooking and scheduling conflicts.

---

## Business Value

- Gives doctors direct control over their working time
- Prevents accidental booking during breaks or off-days
- Reduces operational friction and manual corrections
- Improves reliability of the scheduling system

Availability management is essential for real-world clinic workflows and supports sustainable daily operations.

---

## In Scope

- Block time slots for a doctor
- Mark full days as unavailable
- View blocked time alongside appointments
- Prevent appointment creation in blocked slots

---

## Out of Scope

- Recurring availability rules (e.g. weekly schedules)
- Advanced working hours configuration
- Holiday calendars
- Temporary overrides

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

### US-3.1 — Block Time Slot

As a Doctor  
I want to block a specific time range  
So that appointments cannot be scheduled during that period.

#### Acceptance Criteria

Given I am logged in as a doctor  
When I select a time range and mark it as unavailable  
Then the selected slot becomes blocked  
And no appointments can be created in that time range

#### Edge Cases

- Blocked slot overlaps an existing appointment
- Blocked slot partially overlaps another blocked slot
- Invalid time range (end before start)

#### Out of Scope

- Naming blocked slots
- Categorizing blocked time

#### Notes for Engineering

- Blocking must prevent appointment creation at data level
- Partial overlaps must be handled explicitly

---

### US-3.2 — Block Full Day

As a Doctor  
I want to block an entire day  
So that no appointments can be scheduled on that day.

#### Acceptance Criteria

Given I am viewing my schedule  
When I block a full day  
Then the entire day is marked as unavailable  
And appointment creation is disabled for that day

#### Edge Cases

- Day already partially blocked
- Existing appointments on the selected day

#### Out of Scope

- Multi-day blocking
- Recurring day-off rules

#### Notes for Engineering

- System must handle conversion of existing appointments explicitly (reject or require manual resolution)

---

### US-3.3 — View Blocked Time in Schedule

As a Doctor  
I want to see blocked time clearly in my schedule  
So that I can distinguish unavailable periods from appointments.

#### Acceptance Criteria

Given I am viewing my schedule  
Then blocked time is visually distinct from appointments  
And blocked periods are visible in daily and weekly views

#### Edge Cases

- Very short blocked intervals
- Multiple blocked slots in one day

#### Out of Scope

- Custom colors for blocked time

#### Notes for Engineering

- Blocked slots must be treated as first-class schedule entities

---

## Definition of Done (Epic Level)

- Doctors can block time slots and full days
- Blocked time prevents appointment creation
- Blocked periods are clearly visible in schedule views
- Overlapping logic is enforced
- UX approved
- QA verifies core availability scenarios
- Product Owner signs off usability
