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
