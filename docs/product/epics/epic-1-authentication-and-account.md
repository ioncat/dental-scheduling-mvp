# Epic 1 — Authentication & Account

## Story 1.0 — First Launch Setup & Staff Access Control

### User Story
As the person deploying the system
I want to set up the clinic and become administrator through a web interface
So that no manual database access is required to start using the application.

### Acceptance Criteria
Given the system is deployed with an empty database
When I open the application for the first time
Then I am redirected to the /setup page

Given I am on the /setup page
When I enter the clinic name, my name, and my email
Then the system creates the practice and my admin account
And sends a Magic Link to my email
And after I click the link, I am signed in as administrator

Given the system has been set up (at least one staff record exists)
When anyone tries to access /setup
Then they are redirected to /login

Given I am not registered in the staff table
When I enter my email on the login page
Then I see an "Access denied. Contact your administrator." message
And no Magic Link is sent

Given I am registered in the staff table with status "active" or "pending"
When I enter my email on the login page
Then a Magic Link is sent to my email

Given a new staff member signs in for the first time
When the Supabase auth account is created
Then the system automatically links the auth user ID to the existing staff record by email

### Edge Cases
- Someone tries to access /setup after system is already bootstrapped — redirect to /login
- `bootstrap_practice()` called twice concurrently — second call fails with guard clause
- Admin email is unreachable — account created but magic link undelivered; admin can retry via /login
- Staff record exists but status is "inactive" — login must be denied
- Two staff records with the same email (prevented by unique constraint)

### Out of Scope
- Self-registration flow
- Password-based authentication
- Multi-clinic setup from UI

### Notes for Engineering
- `is_system_bootstrapped()` — RPC, returns true if staff table is non-empty
- `bootstrap_practice(clinic_name, admin_name, admin_email)` — RPC, creates practice + admin, fails if already bootstrapped
- `is_staff_email()` — RPC, returns boolean, called before signInWithOtp
- `link_staff_on_first_login()` — trigger on auth.users INSERT, links staff.id to auth.uid()
- Router: all routes check `is_system_bootstrapped()` and redirect to /setup if false
- The `staff.email` column must have a unique constraint
- No seed.sql required — setup happens entirely through the UI

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