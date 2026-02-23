# Epic 5 — Search & Filtering

## Epic Goal

Enable clinic staff to quickly find appointments and navigate schedules using search and basic filters, reducing time spent locating patient visits.

---

## Business Value

- Speeds up daily clinic operations
- Reduces friction during phone calls and walk-ins
- Allows fast access to patient appointments
- Improves usability of dense schedules

Without search and filtering, the system becomes difficult to use once appointment volume grows.

---

## In Scope

- Free-text search by patient name
- Filtering by:
  - doctor
  - date
  - appointment status
- Combined use of search and filters

---

## Out of Scope

- Advanced multi-field queries
- Fuzzy matching
- Search by phone number or email
- Saved filters
- Global search across clinics

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

### US-5.1 — Search Appointments by Patient Name

As a Doctor or Clinic Manager  
I want to search appointments by patient name  
So that I can quickly locate specific visits.

#### Acceptance Criteria

Given I am logged in  
When I enter text into the search field  
Then appointments with matching patient names are displayed  
And results update as I type

#### Edge Cases

- No matching results
- Partial name matches
- Case-insensitive matching

#### Out of Scope

- Fuzzy or typo-tolerant search
- Search by phone or email

#### Notes for Engineering

- Search should be performed server-side
- Partial string matching is sufficient for MVP

---

### US-5.2 — Filter Appointments by Doctor

As a Clinic Manager  
I want to filter appointments by doctor  
So that I can view schedules for specific clinicians.

#### Acceptance Criteria

Given I am viewing the schedule  
When I select a doctor filter  
Then only appointments for the selected doctor are displayed

#### Edge Cases

- Doctor with no appointments
- Doctor removed from clinic

#### Out of Scope

- Multi-doctor selection

#### Notes for Engineering

- Doctor filter must work together with search and date filters

---

### US-5.3 — Filter Appointments by Date

As a Doctor or Clinic Manager  
I want to filter appointments by date  
So that I can focus on a specific day.

#### Acceptance Criteria

Given I am viewing the schedule  
When I select a date  
Then only appointments for that date are displayed

#### Edge Cases

- Date with no appointments
- Past and future dates

#### Out of Scope

- Date range selection

#### Notes for Engineering

- Default date is current day

---

### US-5.4 — Filter Appointments by Status

As a Doctor or Clinic Manager  
I want to filter appointments by status  
So that I can distinguish between scheduled, cancelled, and completed visits.

#### Acceptance Criteria

Given I am viewing appointments  
When I apply a status filter  
Then only appointments with the selected status are displayed

#### Edge Cases

- No appointments for selected status

#### Out of Scope

- Multi-status filtering

#### Notes for Engineering

- Status filter must be combinable with search and doctor filters

---

## Definition of Done (Epic Level)

- Search by patient name works
- Filters by doctor, date, and status work independently and together
- UX approved
- QA verifies core search and filter flows
- Product Owner signs off usability
