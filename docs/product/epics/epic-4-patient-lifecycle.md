# Epic 4 — Patient Lifecycle

## Story 4.1 — Create Patient

### User Story
As Staff  
I want to create a patient record  
So that I can schedule appointments.

### Acceptance Criteria
Given I am authenticated  
When I enter full_name and phone  
Then patient record is created  

### Edge Cases
- Missing required fields
- Duplicate phone number

### Out of Scope
- Import patients
- Patient self-registration

### Notes for Engineering
- full_name and phone mandatory

---

## Story 4.2 — Edit Patient

### User Story
As Staff  
I want to edit patient information  
So that patient data stays current.

### Acceptance Criteria
Given patient exists  
When I update fields  
Then changes are saved  

### Edge Cases
- Empty full_name
- Invalid email

### Out of Scope
- Field-level history

---

## Story 4.3 — Archive Patient (Blocked)

### User Story
As Staff  
I want to archive patient  
So that inactive patients are removed from workflow.

### Acceptance Criteria
Given patient has future appointments  
When I attempt archive  
Then system blocks action and shows message  

Given patient has no future appointments  
When I archive  
Then archived = true  

### Edge Cases
- Concurrent appointment creation

### Out of Scope
- Auto-cancel appointments

### Notes for Engineering
- Enforce precondition at DB level

---

## Story 4.4 — Restore Patient

### User Story
As Staff  
I want to restore archived patient  
So that they can be scheduled again.

### Acceptance Criteria
Given patient is archived  
When I restore  
Then archived = false  

### Edge Cases
- Restoring with missing required data

---
