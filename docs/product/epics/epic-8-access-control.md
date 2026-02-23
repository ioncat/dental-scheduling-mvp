# Epic 8 — Access Control

## Story 8.1 — Enforce Role-Based Visibility

### User Story
As system  
I want to enforce role-based access  
So that users only see permitted data.

### Acceptance Criteria
Given user role doctor  
Then only own appointments and availability visible  

Given user role clinic_manager  
Then scheduling and patients visible  
But staff and practice hidden  

Given user role admin  
Then full access granted  

### Edge Cases
- Role changed during active session

### Notes for Engineering
- Enforce via RLS

---
