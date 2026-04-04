# Epic 5 — Scheduling Engine

## Story 5.1 — View Daily Schedule

### User Story
As Staff  
I want to view daily schedule  
So that I can manage appointments.

### Acceptance Criteria
Given I open Schedule  
When day selected  
Then all doctors appointments shown  

### Edge Cases
- No appointments
- Unassigned appointments present

---

## Story 5.2 — Navigate Schedule by Day (Done)

### User Story
As Staff
I want to navigate between days using prev/next buttons
So that I can view any day's appointments.

### Acceptance Criteria
Given I am on the schedule page
When I click prev/next day buttons
Then the schedule displays appointments for the selected date

### Notes for Engineering
- Daily column view: one column per active doctor with appointments
- Doctor role sees only their own column
- Admin/clinic_manager sees all doctor columns
- Weekly view deferred — daily view covers MVP needs; revisit after demo data evaluation

---

## Story 5.3 — Create Appointment

### User Story
As Staff  
I want to create appointment  
So that patient visit is scheduled.

### Acceptance Criteria
Given slot inside availability  
When I create appointment  
Then appointment saved with status scheduled  

### Edge Cases
- Outside availability
- Overlapping appointment

### Notes for Engineering
- Enforce constraints server-side

---

## Story 5.4 — Cancel Appointment

### User Story
As Staff  
I want to cancel appointment  
So that visit is removed.

### Acceptance Criteria
Given future appointment  
When I cancel  
Then status becomes cancelled  

---

## Story 5.5 — Complete Appointment

### User Story
As Staff  
I want to mark appointment completed  
So that visit is finalized.

### Acceptance Criteria
Given appointment today or past  
When marked completed  
Then status becomes completed  

---

## Story 5.6 — Assign Doctor to Unassigned Appointment

### User Story
As Admin or Clinic Manager  
I want to assign doctor to unassigned appointment  
So that patient can be seen.

### Acceptance Criteria
Given appointment unassigned  
When doctor selected  
Then doctor_id set  
And status becomes scheduled  

### Edge Cases
- Doctor inactive
- Doctor unavailable

---

## Story 5.7 — Smart Appointment Creation Flow (Done)

### User Story
As Staff
I want to create an appointment through a guided single-card flow (time → details → confirm)
So that booking is fast, intuitive, and reduces errors.

### Acceptance Criteria
Given I click "New Appointment"
When the booking card opens
Then I see a unified flow:
1. Select doctor (if admin/clinic_manager)
2. Select day via horizontal date pills (Mon–Sun)
3. Select available time slot from chips (e.g. "09:00", "09:30", "10:00")
4. Fill patient details (name, phone, purpose)
5. Confirm — appointment created

Given I select a doctor and day
When time slots load
Then only available (non-conflicting) slots are shown as selectable chips

Given I select a time slot chip
When I proceed to patient details
Then the selected doctor, date, and time are displayed as a summary above the form

### Edge Cases
- No available slots for selected day — show message "No available slots" with suggestion to try next day
- All doctors busy — show first available date per doctor
- Patient already has appointment at selected time — warn about conflict

### Out of Scope
- Patient self-booking (this is staff-facing)
- Multi-day recurring appointments
- Drag-and-drop rescheduling

### Notes for Engineering
- Time slot chips generated from doctor availability minus existing appointments
- Slot duration based on appointment type or default (30 min)
- Single card/modal with step indicators, not separate pages
- Inspired by TimeTuna booking widget UX

### Dependencies
- Story 5.3 (basic create appointment)
- Epic 6 (Availability — needed to calculate free slots)

---

## Story 5.8 — Suggested Available Slots ("Top 3") (Done)

### User Story
As Staff
I want the system to suggest the nearest available time slots for a selected doctor
So that I can quickly book without manually scanning the schedule.

### Acceptance Criteria
Given I open the appointment creation flow
When I select a doctor
Then the system shows up to 3 nearest available slots across upcoming days

Given I click a suggested slot
When the slot is selected
Then the date and time are pre-filled and I proceed to patient details

Given the doctor has no availability in the next 7 days
When suggestions are calculated
Then a message "No availability in the next 7 days" is shown

### Edge Cases
- Doctor has limited availability (e.g. 1 slot) — show only that one
- Suggested slot gets booked by another user before confirmation — show error, refresh suggestions

### Out of Scope
- AI-powered "best time" optimization
- Patient preference matching

### Notes for Engineering
- Query: next 7 days of doctor availability, subtract booked appointments, return first 3 free slots
- Display as prominent chips/cards at the top of the booking flow
- Real-time availability check before confirming

### Dependencies
- Story 5.7 (smart appointment creation flow)
- Epic 6 (Availability)

