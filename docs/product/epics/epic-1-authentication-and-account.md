# Epic 1 — Authentication & Account

## Story 1.0 — System Bootstrap & Staff Access Control

### User Story
As a System Administrator
I want to be the first user in the system with full privileges
So that I can register staff members before anyone else can access the application.

### Acceptance Criteria
Given the system is deployed for the first time
When the seed script runs
Then a default admin account is created with a pre-configured email
And the admin can sign in via Magic Link

Given I am not registered in the staff table
When I enter my email on the login page
Then I see an "Access denied. Contact your administrator." message
And no Magic Link is sent

Given I am registered in the staff table with status "active" or "pending"
When I enter my email on the login page
Then a Magic Link is sent to my email
And I can sign in after clicking the link

Given a new staff member signs in for the first time
When the Supabase auth account is created
Then the system automatically links the auth user ID to the existing staff record by email

### Edge Cases
- Admin email in seed script is invalid or unreachable
- Staff record exists but status is "inactive" — login must be denied
- Two staff records with the same email (must not occur; unique constraint required)
- User clicks Magic Link after staff record was deleted — session created but no data visible (RLS blocks)

### Out of Scope
- Self-registration flow
- Password-based authentication
- Admin account recovery (handled via Supabase Dashboard)

### Notes for Engineering
- Seed script creates one `practice` + one `staff` (role=admin, status=active)
- `is_staff_email()` — public RPC function (security definer), callable by anon role, returns boolean
- `link_staff_on_first_login()` — trigger on `auth.users` INSERT, matches staff by email and updates `staff.id` to `auth.uid()`
- Login form must call `is_staff_email()` before `signInWithOtp()`
- The `staff.email` column must have a unique constraint

### Dependencies
- Database schema (staff table must exist)
- Supabase Auth configured with Magic Link enabled

---

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