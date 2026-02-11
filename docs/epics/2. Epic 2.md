# Epic 2 — Scheduling Core

## Epic Goal

Provide doctors with a clear, reliable, and easy-to-use scheduling experience that replaces Google Calendar as the primary tool for managing appointments.

---

## Business Value

- Eliminates scheduling chaos caused by shared generic calendars
- Gives doctors full visibility and control over their daily workload
- Reduces manual coordination and errors
- Serves as the primary driver for MVP adoption

---

## In Scope

- Daily and weekly calendar views
- Multi-doctor scheduling
- Appointment creation with default duration
- Visual distinction between appointment states
- Manual appointment lifecycle control

---

## Out of Scope

- External calendar synchronization
- Patient self-booking
- Notifications (SMS / email)
- Advanced analytics or reporting

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

### US-2.1 — View Personal Schedule

As a Doctor  
I want to see my personal daily and weekly schedule  
So that I can clearly understand my workload and upcoming appointments.

#### Acceptance Criteria

Given I am logged in as a doctor  
When I open the schedule page  
Then I see only my appointments and blocked time  
And appointments are ordered chronologically  
And different appointment states are visually distinguishable

#### Edge Cases

- No appointments for selected day  
- Entire day is blocked  
- Very dense schedule

#### Out of Scope

- Custom calendar layouts
- Printing schedules

#### Notes for Engineering

- Schedule retrieval must be scoped to authenticated doctor
- Default view should be current day
- Data must be sorted server-side

---

### US-2.2 — Create Appointment with Default Duration

As a Doctor  
I want to create an appointment with a default duration  
So that I can quickly schedule patient visits with minimal effort.

#### Acceptance Criteria

Given I am viewing the schedule  
When I create a new appointment  
Then the default duration is set to 1 hour  
And I can manually change the duration  
And the appointment status is set to "scheduled" upon creation

#### Edge Cases

- Appointment overlaps blocked time  
- Appointment overlaps another appointment  
- Duration exceeds clinic working hours

#### Out of Scope

- Appointment templates
- Recurring appointments

#### Notes for Engineering

- Overlapping appointments must be prevented at data level
- Default duration must be configurable at system level

---

### US-2.3 — Assign Appointment to Doctor

As a Clinic Manager  
I want to assign an appointment to a specific doctor  
So that appointments are distributed correctly across the clinic.

#### Acceptance Criteria

Given I am logged in as a clinic manager  
When I create or edit an appointment  
Then I can select any doctor in the clinic  
And the appointment appears in the selected doctor’s schedule

#### Edge Cases

- Selected doctor is unavailable
- Doctor removed from clinic

#### Out of Scope

- Auto-assignment logic

#### Notes for Engineering

- Doctor availability must be validated before saving

---

### US-2.4 — Visual Distinction of Schedule Items

As a Doctor  
I want to visually distinguish appointments, cancellations, completions, and blocked time  
So that I can instantly understand my schedule state.

#### Acceptance Criteria

Given I am viewing the schedule  
Then scheduled, cancelled, completed appointments and blocked time are visually distinct  
And a legend explaining the states is visible

#### Edge Cases

- Color accessibility (contrast)
- Multiple states on same day

#### Out of Scope

- Theme customization

#### Notes for Engineering

- State representation must be consistent across all views

---

## Definition of Done (Epic Level)

- Doctors can view schedules
- Appointments can be created and assigned
- Overlaps are prevented
- Appointment states are visible and consistent
- UX approved
- QA verifies core scheduling flows
- Product Owner signs off usability
