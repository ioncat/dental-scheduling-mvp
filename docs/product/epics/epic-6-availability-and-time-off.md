# Epic 6 — Availability & Time Off

## Story 6.1 — Define Weekly Availability

### User Story
As Doctor  
I want to define weekly availability  
So that appointments can be booked.

### Acceptance Criteria
Given I am active doctor  
When I add weekday slots  
Then availability saved  

### Edge Cases
- Overlapping slots
- End before start

---

## Story 6.2 — Update Availability

### User Story
As Doctor  
I want to update availability  
So that schedule reflects changes.

### Acceptance Criteria
Given existing slots  
When updated  
Then changes persist  

---

## Story 6.3 — Remove Availability Slot

### User Story
As Doctor  
I want to remove availability slot  
So that unavailable times are excluded.

### Acceptance Criteria
Given slot removed  
Then future booking blocked  

---

## Story 6.4 — Add Time Off

### User Story
As Doctor  
I want to add time off period  
So that system blocks bookings.

### Acceptance Criteria
Given date range  
When saved  
Then period stored  
And overrides availability  

---

## Story 6.5 — Remove Time Off

### User Story
As Doctor  
I want to remove time off  
So that availability returns.

### Acceptance Criteria
Given existing time off  
When removed  
Then bookings allowed again  
