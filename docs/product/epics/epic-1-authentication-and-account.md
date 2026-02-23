# Epic 1 — Authentication & Account

## Story 1.1 — Login via Magic Link

### User Story
As a Staff member  
I want to log in using a magic link sent to my email  
So that I can access the system without managing passwords.

### Acceptance Criteria
Given I am an active staff member  
When I enter my email on the login page  
Then I receive a magic link email  

Given I click a valid magic link  
When the link is verified  
Then I am authenticated and redirected to /schedule  

Given I am inactive staff  
When I attempt to log in  
Then access is denied  

### Edge Cases
- Expired magic link
- Invalid email
- User exists in Auth but Staff record is inactive
- Multiple login requests in short time

### Out of Scope
- Password-based authentication
- Social login providers

### Notes for Engineering
- Supabase Auth magic link flow
- Login allowed only if staff.status = active

---

## Story 1.2 — View Account Profile (Read Only)

### User Story
As a Staff member  
I want to view my account profile  
So that I can confirm my registered information.

### Acceptance Criteria
Given I am authenticated  
When I open Account page  
Then I see full_name, email, phone_number, role  

Given I view my profile  
Then all fields are read-only  

### Edge Cases
- Missing phone_number
- Messenger fields empty

### Out of Scope
- Editing profile fields
- Password management

### Notes for Engineering
- Data sourced from Staff table