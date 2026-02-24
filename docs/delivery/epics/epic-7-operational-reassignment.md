# Epic 7 — Operational Reassignment

## Story 7.1 — Automatically Unassign Appointments on Doctor Deactivation

### User Story
As the system  
I want to unassign future appointments when a doctor becomes inactive  
So that visits can be reassigned.

### Acceptance Criteria
Given doctor status changes to inactive  
When future appointments exist  
Then doctor_id is set to null  
And status becomes unassigned  

### Edge Cases
- Appointments happening today
- Doctor already inactive

### Out of Scope
- Automatic reassignment

### Notes for Engineering
- Implement as transactional operation

---

## Story 7.2 — Display Unassigned Appointment Alert

### User Story
As Admin or Clinic Manager  
I want to see alert for unassigned appointments  
So that I can take action.

### Acceptance Criteria
Given unassigned appointments exist  
When I open Schedule  
Then persistent alert banner shown  
And appointments highlighted  

### Edge Cases
- Multiple unassigned appointments

---

## Story 7.3 — Clear Alert After Reassignment

### User Story
As Admin or Clinic Manager  
I want alert to disappear after reassignment  
So that Schedule returns to normal.

### Acceptance Criteria
Given all unassigned appointments assigned  
When I refresh Schedule  
Then alert is no longer shown  
