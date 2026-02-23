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

## Story 5.2 — View Weekly Schedule per Doctor

### User Story
As Staff  
I want to view weekly schedule per doctor  
So that I can understand workload.

### Acceptance Criteria
Given doctor selected  
When week changes  
Then schedule updates  

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
