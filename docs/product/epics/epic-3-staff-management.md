# Epic 3 — Staff Management

## Story 3.1 — Invite Staff Member

### User Story
As an Admin  
I want to invite a staff member by email and role  
So that they can join the system.

### Acceptance Criteria
Given I am admin  
When I enter full_name, email, and role  
Then a Staff record is created with status = pending  
And a magic link is sent  

### Edge Cases
- Email already exists
- Invalid email format
- Role not selected

### Out of Scope
- Bulk invites

### Notes for Engineering
- Create Staff row first
- Then trigger Supabase invite

---

## Story 3.2 — Complete Staff Onboarding

### User Story
As an invited staff member  
I want to complete signup  
So that I become an active system user.

### Acceptance Criteria
Given I click magic link  
When signup completes  
Then staff.status becomes active  
And I can access /schedule  

### Edge Cases
- Expired invite link
- Staff deleted before signup

### Out of Scope
- Profile editing during onboarding

### Notes for Engineering
- Sync Supabase Auth user with Staff record

---

## Story 3.3 — Deactivate Staff Member

### User Story
As an Admin  
I want to deactivate a staff member  
So that terminated employees lose system access.

### Acceptance Criteria
Given I am admin  
When I deactivate staff  
Then staff.status becomes inactive  
And login is blocked  
And staff no longer appears in selectors  

Given staff had future appointments  
Then those appointments become unassigned  

### Edge Cases
- Deactivating self
- Deactivating staff with active appointments today

### Notes for Engineering
- Trigger reassignment logic
- Suppress notifications for inactive staff (post-MVP, see Epic 9)

---

## Story 3.5 — Reactivate Staff Member

### User Story
As an Admin
I want to reactivate a previously deactivated staff member
So that they can regain access to the system.

### Acceptance Criteria
Given I am admin
When I click "Activate" on an inactive staff member
Then staff.status becomes active
And they can log in again

### Edge Cases
- Reactivating staff with no remaining appointments
- Reactivated staff needs to sign in again via magic link

### Notes for Engineering
- Simple status update to 'active' via updateStaffStatus()
- No confirmation dialog needed (non-destructive action)

---

## Story 3.4 — Change Staff Role

### User Story
As an Admin  
I want to change staff role  
So that responsibilities can be updated.

### Acceptance Criteria
Given I am admin  
When I change role  
Then new permissions apply immediately  

### Edge Cases
- Downgrading admin
- Removing last admin

### Out of Scope
- Role history tracking

### Notes for Engineering
- Enforce at least one admin exists

---

## Story 3.6 — Edit Staff Profile (Backlog)

### User Story
As an Admin or Clinic Manager
I want to edit a staff member's profile (name, phone, email, messenger)
So that I can keep staff records accurate.

### Acceptance Criteria
Given I am admin or clinic_manager
When I open a staff member's row in the Staff table
Then I can edit full_name, phone_number, email, messenger_type, messenger_id

Given I save changes
Then the staff record is updated
And I see a success confirmation

### Edge Cases
- Changing email to one already in use (unique constraint violation)
- Admin editing their own profile (allowed)
- Clinic Manager editing admin's profile (should be blocked — admin-only)

### Notes for Engineering
- Add edit mode to StaffTable rows or open a modal with staff details
- RLS: admin can update any staff; clinic_manager can update non-admin staff
- Consider reusing the InviteStaffModal layout for edit mode