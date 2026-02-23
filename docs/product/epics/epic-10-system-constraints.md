# Epic 10 — System Constraints

## Story 10.1 — Enforce UTC Storage of Appointments

### User Story
As system  
I want to store all appointment datetimes in UTC  
So that timezone handling is consistent.

### Acceptance Criteria
Given appointment created  
Then start_time and end_time stored in UTC  

Displayed times use practice timezone.

---

## Story 10.2 — Block Booking Outside Availability

### User Story
As system  
I want to block booking outside availability  
So that scheduling rules are enforced.

### Acceptance Criteria
Given slot outside availability  
When booking attempted  
Then operation rejected  

---

## Story 10.3 — Prevent Overlapping Appointments

### User Story
As system  
I want to prevent overlapping appointments  
So that doctors are not double-booked.

### Acceptance Criteria
Given overlapping slot  
When appointment created  
Then operation rejected  

---

## Story 10.4 — Block Reschedule of Unassigned Appointments

### User Story
As system  
I want to block rescheduling unassigned appointments  
So that doctor assignment happens first.

### Acceptance Criteria
Given appointment status unassigned  
When reschedule attempted  
Then operation rejected  
