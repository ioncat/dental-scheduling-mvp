# Epic 9 — Notifications

## Story 9.1 — Suppress Notifications for Inactive Staff

### User Story
As system  
I want to suppress notifications for inactive staff  
So that terminated employees receive nothing.

### Acceptance Criteria
Given staff.status = inactive  
When notification triggered  
Then no message sent  

---

## Story 9.2 — Suppress Notifications for Archived Patients

### User Story
As system  
I want to suppress notifications for archived patients  
So that inactive patients receive nothing.

### Acceptance Criteria
Given patient.archived = true  
When notification triggered  
Then no message sent  
